import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/db';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('id');
    const event = searchParams.get('event') || 'opened';
    const link = searchParams.get('link');

    if (!trackingId) {
      return new NextResponse('Missing tracking ID', { status: 400 });
    }

    // Get user agent and IP for analytics
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    // Detect device type
    const device = detectDevice(userAgent);

    // Track the event
    await analyticsService.trackEvent(
      trackingId,
      event,
      '', // Recipient will be filled from email history
      {
        userAgent,
        ipAddress,
        device
      }
    );

    // If it's a click event with a link, redirect to the link
    if (event === 'clicked' && link) {
      return NextResponse.redirect(link);
    }

    // Return tracking pixel for open events
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': TRACKING_PIXEL.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Still return the pixel even on error
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store'
      }
    });
  }
}

function detectDevice(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  return 'desktop';
}

// Webhook endpoint for email service providers (SendGrid, Mailgun, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    for (const event of events) {
      const eventType = event.event || event.type;
      const messageId = event.message_id || event.messageId || event['smtp-id'];
      const recipient = event.email || event.recipient;
      
      if (eventType && messageId) {
        await analyticsService.trackEvent(
          messageId,
          mapEventType(eventType),
          recipient || '',
          {
            userAgent: event.user_agent,
            ipAddress: event.ip,
            country: event.country,
            city: event.city,
            device: event.device_type
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Map external event types to our internal types
function mapEventType(externalType: string): string {
  const mapping: Record<string, string> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'delivery': 'delivered',
    'open': 'opened',
    'opened': 'opened',
    'click': 'clicked',
    'clicked': 'clicked',
    'bounce': 'bounced',
    'bounced': 'bounced',
    'hard_bounce': 'bounced',
    'soft_bounce': 'bounced',
    'spam': 'complained',
    'spamreport': 'complained',
    'complaint': 'complained',
    'unsubscribe': 'unsubscribed',
    'unsubscribed': 'unsubscribed'
  };
  
  return mapping[externalType.toLowerCase()] || externalType;
}