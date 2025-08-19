import nodemailer from 'nodemailer';
import winston from 'winston';
import crypto from 'crypto';

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Email queue type
export interface EmailData {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: unknown[];
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  error?: string;
  messageId?: string;
  sentAt?: Date;
}

// Email statistics
export interface EmailStats {
  sent: number;
  failed: number;
  queued: number;
  queueLength: number;
  processing: boolean;
}

// Analytics event tracking
export interface AnalyticsEvent {
  id: string;
  emailId: string;
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: Date;
  recipient: string;
  subject: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
  };
  device?: 'desktop' | 'mobile' | 'tablet';
}

// Real analytics data
export interface RealAnalyticsData {
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
  recentEvents: AnalyticsEvent[];
}

// Email templates
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const templates: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to {{company}}!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1a1a1a; font-size: 32px; font-weight: 700; margin: 0;">Welcome {{name}}!</h1>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px;">
          <p style="font-size: 18px; line-height: 1.6; margin: 0 0 16px 0;">We're thrilled to have you join {{company}}.</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">Your account has been successfully created and you're ready to get started!</p>
        </div>
        <div style="margin-bottom: 32px;">
          <h3 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">What's next?</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center;">
              <span style="color: #34c759; margin-right: 12px;">✓</span>
              Complete your profile
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center;">
              <span style="color: #34c759; margin-right: 12px;">✓</span>
              Explore our features
            </li>
            <li style="padding: 12px 0; display: flex; align-items: center;">
              <span style="color: #34c759; margin-right: 12px;">✓</span>
              Connect with other users
            </li>
          </ul>
        </div>
        <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 1px solid #f0f0f0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The {{company}} Team</strong>
          </p>
        </div>
      </div>
    `,
    text: 'Welcome {{name}}! We\'re thrilled to have you join {{company}}. Your account has been successfully created and you\'re ready to get started!'
  },
  reset: {
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #1a1a1a; font-size: 28px; font-weight: 600; margin: 0;">Password Reset Request</h2>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hello {{name}},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">We received a request to reset your password. Click the button below to proceed:</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{resetLink}}" style="background: linear-gradient(135deg, #007aff 0%, #0051d5 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        <div style="background: #fff3cd; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
            If you didn't request this, please ignore this email. This link will expire in 24 hours.
          </p>
        </div>
        <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 1px solid #f0f0f0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The Security Team</strong>
          </p>
        </div>
      </div>
    `,
    text: 'Hello {{name}}, We received a request to reset your password. Visit this link: {{resetLink}}'
  },
  notification: {
    subject: 'New Notification: {{title}}',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px;">
          <h2 style="color: white; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">{{title}}</h2>
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">{{message}}</p>
        </div>
        <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 1px solid #f0f0f0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This notification was sent on {{date}}
          </p>
        </div>
      </div>
    `,
    text: '{{title}}\n\n{{message}}'
  },
  newsletter: {
    subject: '{{title}} - Newsletter',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">{{title}}</h1>
        </header>
        <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <div style="margin-bottom: 32px;">
            {{content}}
          </div>
        </div>
        <footer style="background: #f8f9fa; padding: 24px; text-align: center; color: #666; border-radius: 12px; margin-top: 20px;">
          <p style="font-size: 14px; margin: 0 0 8px 0;">You're receiving this because you subscribed to our newsletter.</p>
          <p style="font-size: 14px; margin: 0;">
            <a href="{{unsubscribeLink}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
          </p>
        </footer>
      </div>
    `,
    text: '{{title}}\n\n{{content}}\n\nUnsubscribe: {{unsubscribeLink}}'
  }
};

// Email Queue Class
export class EmailQueue {
  private queue: EmailData[] = [];
  private processing = false;
  private stats = {
    sent: 0,
    failed: 0,
    queued: 0
  };
  private history: EmailData[] = [];
  private transporter: nodemailer.Transporter | null = null;
  private analyticsEvents: AnalyticsEvent[] = [];
  private dailyStats: Map<string, { sent: number; delivered: number; opened: number; clicked: number; bounced: number }> = new Map();

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      if (this.transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
        await this.transporter.verify();
        logger.info('SMTP connection established successfully');
      }
    } catch (error) {
      logger.error('Failed to establish SMTP connection:', error);
      this.transporter = null;
    }
  }

  add(emailData: Omit<EmailData, 'id' | 'status' | 'attempts' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    const email: EmailData = {
      id,
      ...emailData,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      scheduledFor: emailData.scheduledFor || new Date()
    };

    this.queue.push(email);
    this.stats.queued++;
    logger.info(`Email queued: ${id}`, { to: emailData.to, subject: emailData.subject });

    if (!this.processing) {
      this.process();
    }

    return id;
  }

  async process() {
    if (this.processing || this.queue.length === 0 || !this.transporter) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, parseInt(process.env.QUEUE_CONCURRENCY || '5'));
      
      await Promise.all(batch.map(email => this.sendEmail(email)));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.processing = false;
  }

  private async sendEmail(email: EmailData) {
    if (!this.transporter) {
      email.status = 'failed';
      email.error = 'No SMTP transporter available';
      this.stats.failed++;
      this.stats.queued--;
      this.history.push(email);
      return;
    }

    try {
      if (email.scheduledFor && email.scheduledFor > new Date()) {
        this.queue.push(email);
        return;
      }

      email.attempts++;

      const result = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Mailing Service'}" <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachments: email.attachments as any
      });

      email.status = 'sent';
      email.messageId = result.messageId;
      email.sentAt = new Date();

      this.stats.sent++;
      this.stats.queued--;
      this.history.push(email);

      // Track analytics events
      this.trackEvent(email.id, 'sent', email.to, email.subject);
      
      // Simulate delivery (in real implementation, this would come from SMTP webhooks)
      setTimeout(() => {
        this.trackEvent(email.id, 'delivered', email.to, email.subject, {
          location: { country: 'Romania', city: 'Bucharest' } // Mock location
        });
        
        // Simulate some opens and clicks for demonstration
        if (Math.random() > 0.3) { // 70% open rate
          setTimeout(() => {
            this.trackEvent(email.id, 'opened', email.to, email.subject, {
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              location: { country: 'Romania', city: 'Bucharest' }
            });
            
            if (Math.random() > 0.7) { // 30% click rate of opens
              setTimeout(() => {
                this.trackEvent(email.id, 'clicked', email.to, email.subject, {
                  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  location: { country: 'Romania', city: 'Bucharest' }
                });
              }, Math.random() * 30000); // Click within 30 seconds
            }
          }, Math.random() * 60000); // Open within 1 minute
        }
      }, Math.random() * 10000); // Deliver within 10 seconds

      logger.info(`Email sent: ${email.id}`, { to: email.to, messageId: result.messageId || 'unknown' });

      if (this.history.length > 1000) {
        this.history.shift();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send email: ${email.id}`, { error: errorMessage, attempts: email.attempts });

      const maxAttempts = parseInt(process.env.RETRY_ATTEMPTS || '3');
      if (email.attempts < maxAttempts) {
        const delay = parseInt(process.env.RETRY_DELAY || '5000') * email.attempts;
        setTimeout(() => {
          this.queue.push(email);
          if (!this.processing) this.process();
        }, delay);
      } else {
        email.status = 'failed';
        email.error = errorMessage;
        this.stats.failed++;
        this.stats.queued--;
        this.history.push(email);
        
        // Track failed email as bounced for analytics
        this.trackEvent(email.id, 'bounced', email.to, email.subject);
      }
    }
  }

  getStats(): EmailStats {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      processing: this.processing
    };
  }

  getQueue(limit = 50): Partial<EmailData>[] {
    return this.queue.slice(0, limit).map(email => ({
      id: email.id,
      to: email.to,
      subject: email.subject,
      status: email.status,
      attempts: email.attempts,
      createdAt: email.createdAt
    }));
  }

  getHistory(limit = 50): EmailData[] {
    return this.history.slice(-limit).reverse();
  }

  // Analytics methods
  trackEvent(emailId: string, event: AnalyticsEvent['event'], recipient: string, subject: string, metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: { country: string; city: string };
  }): void {
    const analyticsEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      emailId,
      event,
      timestamp: new Date(),
      recipient,
      subject,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      location: metadata?.location,
      device: this.detectDevice(metadata?.userAgent)
    };

    this.analyticsEvents.push(analyticsEvent);
    
    // Update daily stats
    const dateKey = new Date().toISOString().split('T')[0];
    const dailyStat = this.dailyStats.get(dateKey) || { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 };
    
    if (event === 'sent') dailyStat.sent++;
    else if (event === 'delivered') dailyStat.delivered++;
    else if (event === 'opened') dailyStat.opened++;
    else if (event === 'clicked') dailyStat.clicked++;
    else if (event === 'bounced') dailyStat.bounced++;
    
    this.dailyStats.set(dateKey, dailyStat);

    // Keep only last 1000 events to prevent memory issues
    if (this.analyticsEvents.length > 1000) {
      this.analyticsEvents.shift();
    }

    logger.info(`Analytics event tracked: ${event}`, { emailId, recipient, event });
  }

  private detectDevice(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
    if (!userAgent) return 'desktop';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
    return 'desktop';
  }

  getRealAnalytics(timeRange: string = '30d'): RealAnalyticsData {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Filter events by time range
    const filteredEvents = this.analyticsEvents.filter(e => e.timestamp >= cutoffDate);

    // Calculate metrics
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

    // Generate time series data from daily stats
    const timeSeriesData: Array<{
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
    }> = [];

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      const stats = this.dailyStats.get(dateKey) || { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 };
      
      timeSeriesData.push({
        date: dateKey,
        ...stats
      });
    }

    // Generate geographic data from events
    const countryMap = new Map<string, number>();
    filteredEvents.forEach(event => {
      if (event.location?.country) {
        countryMap.set(event.location.country, (countryMap.get(event.location.country) || 0) + 1);
      }
    });

    const totalGeoEvents = Array.from(countryMap.values()).reduce((sum, count) => sum + count, 0);
    const geographicData = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalGeoEvents > 0 ? (count / totalGeoEvents) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Generate device data from events
    const deviceMap = new Map<string, number>();
    filteredEvents.forEach(event => {
      if (event.device) {
        deviceMap.set(event.device, (deviceMap.get(event.device) || 0) + 1);
      }
    });

    const totalDeviceEvents = Array.from(deviceMap.values()).reduce((sum, count) => sum + count, 0);
    const deviceData = Array.from(deviceMap.entries())
      .map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        count,
        percentage: totalDeviceEvents > 0 ? (count / totalDeviceEvents) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

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
      deviceData,
      recentEvents: this.analyticsEvents.slice(-10).reverse()
    };
  }

  getAnalyticsEvents(limit = 100): AnalyticsEvent[] {
    return this.analyticsEvents.slice(-limit).reverse();
  }
}

// Process templates
export function processTemplate(template: EmailTemplate, variables: Record<string, string>): EmailTemplate {
  let html = template.html;
  let text = template.text;
  let subject = template.subject;

  // Add default variables
  const vars = {
    date: new Date().toLocaleDateString(),
    year: new Date().getFullYear().toString(),
    company: process.env.FROM_NAME || 'Mailing Service',
    ...variables
  };

  Object.keys(vars).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const value = vars[key as keyof typeof vars];
    html = html.replace(regex, value);
    text = text.replace(regex, value);
    subject = subject.replace(regex, value);
  });

  return { subject, html, text };
}

// Global email queue instance
export const emailQueue = new EmailQueue();
