import Queue from 'bull';
import nodemailer from 'nodemailer';
import { emailHistoryService, analyticsService, webhookService } from './db';
import { processTemplate } from './email';
import crypto from 'crypto';
import winston from 'winston';

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
    }),
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/mail-service.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Redis connection for Bull
const redisConfig = process.env.REDIS_URL ? {
  redis: process.env.REDIS_URL
} : {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
};

// Email queue configuration
export const emailQueue = new Queue('email-queue', redisConfig);

// SMTP transporter
let transporter: nodemailer.Transporter | null = null;

async function initializeTransporter() {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    if (transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.verify();
      logger.info('SMTP connection established successfully');
    }
  } catch (error) {
    logger.error('Failed to establish SMTP connection:', error);
    transporter = null;
  }
}

// Initialize transporter
initializeTransporter();

// Email job interface
export interface EmailJob {
  id?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  template?: {
    name: string;
    variables: Record<string, string>;
  };
  attachments?: any[];
  trackingId?: string;
  metadata?: Record<string, any>;
}

// Process email jobs
emailQueue.process(parseInt(process.env.QUEUE_CONCURRENCY || '5'), async (job) => {
  const emailData = job.data as EmailJob;
  
  if (!transporter) {
    throw new Error('SMTP transporter not available');
  }

  try {
    // Create tracking ID if not provided
    const trackingId = emailData.trackingId || crypto.randomUUID();
    
    // Create email history record
    const emailRecord = await emailHistoryService.create({
      to: emailData.to,
      subject: emailData.subject,
      messageId: trackingId
    });

    // Process template if provided
    let html = emailData.html;
    let text = emailData.text;
    let subject = emailData.subject;
    
    if (emailData.template) {
      // In production, fetch template from database
      const template = {
        subject: emailData.subject,
        html: emailData.html || '',
        text: emailData.text || ''
      };
      
      const processed = processTemplate(template, emailData.template.variables);
      html = processed.html;
      text = processed.text;
      subject = processed.subject;
    }

    // Add tracking pixel for open tracking
    if (html && process.env.ENABLE_ANALYTICS === 'true') {
      const trackingPixel = `<img src="${process.env.BASE_URL || 'http://localhost:3000'}/api/analytics/track?id=${trackingId}&event=opened" width="1" height="1" style="display:none;" />`;
      html = html.replace('</body>', `${trackingPixel}</body>`);
    }

    // Send email
    const result = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Mailing Service'}" <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject,
      text,
      html,
      attachments: emailData.attachments,
      headers: {
        'X-Tracking-ID': trackingId,
        'X-Entity-Ref-ID': trackingId
      }
    });

    // Update email status
    await emailHistoryService.updateStatus(emailRecord.id, 'sent');
    
    // Track sent event
    await analyticsService.trackEvent(
      emailRecord.id,
      'sent',
      emailData.to,
      {
        userAgent: 'Mail Service',
        ipAddress: '127.0.0.1'
      }
    );

    // Trigger webhooks
    await triggerWebhooks('sent', {
      id: trackingId,
      to: emailData.to,
      subject,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Email sent successfully: ${trackingId}`, { 
      to: emailData.to, 
      subject,
      messageId: result.messageId 
    });

    return {
      success: true,
      trackingId,
      messageId: result.messageId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to send email: ${job.id}`, { 
      error: errorMessage,
      to: emailData.to,
      subject: emailData.subject
    });

    // Update email status
    if (emailData.trackingId) {
      const emailRecord = await emailHistoryService.getRecent(1);
      if (emailRecord.length > 0) {
        await emailHistoryService.updateStatus(emailRecord[0].id, 'failed', errorMessage);
        
        // Track bounce event
        await analyticsService.trackEvent(
          emailRecord[0].id,
          'bounced',
          emailData.to
        );
      }
    }

    // Trigger webhook for failure
    await triggerWebhooks('bounced', {
      id: emailData.trackingId || job.id?.toString() || '',
      to: emailData.to,
      subject: emailData.subject,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    throw new Error(errorMessage);
  }
});

// Webhook delivery
async function triggerWebhooks(event: string, data: any) {
  try {
    const webhooks = await webhookService.getActive();
    const relevantWebhooks = webhooks.filter(w => 
      w.events.split(',').includes(event)
    );
    
    for (const webhook of relevantWebhooks) {
      try {
        const payload = {
          event,
          data,
          timestamp: new Date().toISOString(),
          id: crypto.randomUUID()
        };

        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Event': event,
            'User-Agent': 'Mail-API-Server/2.0'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          await webhookService.resetFailure(webhook.id);
        } else {
          await webhookService.incrementFailure(webhook.id);
          logger.error(`Webhook delivery failed for ${webhook.url}: ${response.status}`);
        }
      } catch (error) {
        await webhookService.incrementFailure(webhook.id);
        logger.error(`Webhook delivery error for ${webhook.url}:`, error);
      }
    }
  } catch (error) {
    logger.error('Failed to trigger webhooks:', error);
  }
}

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job completed: ${job.id}`, result);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job failed: ${job.id}`, err);
});

emailQueue.on('stalled', (job) => {
  logger.warn(`Email job stalled: ${job.id}`);
});

// Queue management functions
export async function addEmailToQueue(emailData: EmailJob, options?: any) {
  const job = await emailQueue.add(emailData, {
    attempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.RETRY_DELAY || '5000')
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options
  });
  
  return job.id;
}

export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
    emailQueue.getPausedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + delayed + paused
  };
}

export async function getQueueJobs(status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused', limit = 50) {
  const jobs = await emailQueue.getJobs([status], 0, limit);
  
  return jobs.map(job => ({
    id: job.id,
    data: job.data,
    status: job.opts,
    progress: job.progress(),
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
  }));
}

export async function retryFailedJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);
  if (job && job.failedReason) {
    await job.retry();
    return true;
  }
  return false;
}

export async function removeJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);
  if (job) {
    await job.remove();
    return true;
  }
  return false;
}

// Clean up old jobs
export async function cleanOldJobs(gracePeriod = 7 * 24 * 60 * 60 * 1000) { // 7 days
  await emailQueue.clean(gracePeriod, 'completed');
  await emailQueue.clean(gracePeriod, 'failed');
}

// Graceful shutdown
export async function closeQueue() {
  await emailQueue.close();
  if (transporter) {
    transporter.close();
  }
}