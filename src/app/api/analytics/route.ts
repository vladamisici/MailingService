import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';
import { emailQueue } from '@/lib/email';

interface EmailEvent {
  id: string;
  emailId: string;
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: string;
  recipient: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
  };
  device?: 'desktop' | 'mobile' | 'tablet';
}

interface AnalyticsData {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  timeSeriesData: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  }>;
  geographicData: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

// Mock analytics data (replace with real database queries in production)
const mockEvents: EmailEvent[] = [
  {
    id: '1',
    emailId: 'email_001',
    event: 'sent',
    timestamp: '2024-01-20T10:00:00Z',
    recipient: 'user@example.com'
  },
  {
    id: '2',
    emailId: 'email_001',
    event: 'delivered',
    timestamp: '2024-01-20T10:01:00Z',
    recipient: 'user@example.com',
    location: { country: 'United States', city: 'New York' }
  },
  {
    id: '3',
    emailId: 'email_001',
    event: 'opened',
    timestamp: '2024-01-20T10:30:00Z',
    recipient: 'user@example.com',
    userAgent: 'Mozilla/5.0...',
    device: 'desktop',
    location: { country: 'United States', city: 'New York' }
  }
];

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'analytics')) {
    logApiUsage(auth.apiKey, '/api/analytics', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get real analytics data from email queue
    const analytics = emailQueue.getRealAnalytics(timeRange);
    
    logApiUsage(auth.apiKey, '/api/analytics', true);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    logApiUsage(auth.apiKey, '/api/analytics', false);
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'analytics')) {
    logApiUsage(auth.apiKey, '/api/analytics', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { emailId, event, recipient, userAgent, ipAddress } = body;

    if (!emailId || !event || !recipient) {
      return NextResponse.json({ 
        error: 'Missing required fields: emailId, event, recipient' 
      }, { status: 400 });
    }

    // Create new analytics event
    const analyticsEvent: EmailEvent = {
      id: Date.now().toString(),
      emailId,
      event,
      recipient,
      timestamp: new Date().toISOString(),
      userAgent,
      ipAddress,
      device: detectDevice(userAgent),
      location: await getLocationFromIP(ipAddress)
    };

    // Track the event in the email queue system
    emailQueue.trackEvent(emailId, event, recipient, 'Manual Event', {
      userAgent,
      ipAddress,
      location: await getLocationFromIP(ipAddress)
    });
    
    logApiUsage(auth.apiKey, '/api/analytics', true);

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded'
    });
  } catch (error) {
    console.error('Failed to record analytics event:', error);
    logApiUsage(auth.apiKey, '/api/analytics', false);
    return NextResponse.json({ error: 'Failed to record analytics event' }, { status: 500 });
  }
}

function calculateAnalytics(events: EmailEvent[], timeRange: string, startDate?: string | null, endDate?: string | null): AnalyticsData {
  // Filter events by date range
  let filteredEvents = events;
  
  if (startDate && endDate) {
    filteredEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });
  } else {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    filteredEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);
  }

  // Calculate basic metrics
  const totalSent = filteredEvents.filter(e => e.event === 'sent').length;
  const delivered = filteredEvents.filter(e => e.event === 'delivered').length;
  const opened = filteredEvents.filter(e => e.event === 'opened').length;
  const clicked = filteredEvents.filter(e => e.event === 'clicked').length;
  const bounced = filteredEvents.filter(e => e.event === 'bounced').length;
  const complained = filteredEvents.filter(e => e.event === 'complained').length;
  const unsubscribed = filteredEvents.filter(e => e.event === 'unsubscribed').length;

  // Calculate rates
  const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
  const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;
  const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;

  // Generate time series data (mock)
  const timeSeriesData = generateTimeSeriesData(filteredEvents);

  // Generate geographic data
  const geographicData = generateGeographicData(filteredEvents);

  // Generate device data
  const deviceData = generateDeviceData(filteredEvents);

  return {
    totalSent,
    delivered,
    opened,
    clicked,
    bounced,
    complained,
    unsubscribed,
    deliveryRate: Math.round(deliveryRate * 10) / 10,
    openRate: Math.round(openRate * 10) / 10,
    clickRate: Math.round(clickRate * 10) / 10,
    bounceRate: Math.round(bounceRate * 10) / 10,
    timeSeriesData,
    geographicData,
    deviceData
  };
}

function generateTimeSeriesData(events: EmailEvent[]) {
  // Mock time series data - in production, this would aggregate by day
  return [
    { date: '2024-01-15', sent: 1200, delivered: 1180, opened: 850, clicked: 230, bounced: 20 },
    { date: '2024-01-16', sent: 980, delivered: 960, opened: 720, clicked: 180, bounced: 20 },
    { date: '2024-01-17', sent: 1450, delivered: 1420, opened: 980, clicked: 290, bounced: 30 },
    { date: '2024-01-18', sent: 1100, delivered: 1080, opened: 760, clicked: 210, bounced: 20 },
    { date: '2024-01-19', sent: 1350, delivered: 1320, opened: 920, clicked: 260, bounced: 30 },
    { date: '2024-01-20', sent: 890, delivered: 870, opened: 610, clicked: 150, bounced: 20 }
  ];
}

function generateGeographicData(events: EmailEvent[]) {
  // Mock geographic data - in production, this would aggregate location data
  return [
    { country: 'United States', count: 4521, percentage: 36.2 },
    { country: 'United Kingdom', count: 2134, percentage: 17.1 },
    { country: 'Canada', count: 1876, percentage: 15.0 },
    { country: 'Australia', count: 1234, percentage: 9.9 },
    { country: 'Germany', count: 987, percentage: 7.9 },
    { country: 'Others', count: 1746, percentage: 13.9 }
  ];
}

function generateDeviceData(events: EmailEvent[]) {
  // Mock device data - in production, this would aggregate device information
  return [
    { device: 'Desktop', count: 5432, percentage: 43.3 },
    { device: 'Mobile', count: 4321, percentage: 34.4 },
    { device: 'Tablet', count: 2790, percentage: 22.3 }
  ];
}

function detectDevice(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  return 'desktop';
}

async function getLocationFromIP(ipAddress?: string) {
  // Mock location detection - in production, use a real IP geolocation service
  if (!ipAddress) return undefined;
  
  // Mock implementation
  return {
    country: 'United States',
    city: 'New York'
  };
}
