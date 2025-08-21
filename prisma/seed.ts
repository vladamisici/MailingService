import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default API keys
  console.log('Creating API keys...');
  const apiKeys = [
    {
      name: 'Production API Key',
      permissions: 'send,bulk,templates,stats,webhooks',
      rateLimit: 100,
      rateLimitWindow: 60,
    },
    {
      name: 'Development API Key',
      permissions: 'send,templates,stats',
      rateLimit: 50,
      rateLimitWindow: 60,
    },
    {
      name: 'Admin API Key',
      permissions: '*',
      rateLimit: 1000,
      rateLimitWindow: 60,
    },
  ];

  for (const keyData of apiKeys) {
    const rawKey = 'sk_' + (keyData.name.includes('Production') ? 'live' : 'test') + '_' + crypto.randomBytes(16).toString('hex');
    const hashedKey = await bcrypt.hash(rawKey, 10);
    
    const apiKey = await prisma.apiKey.create({
      data: {
        ...keyData,
        hashedKey,
      },
    });
    
    console.log(`✅ Created API key: ${keyData.name} (Key: ${rawKey})`);
  }

  // Create default email templates
  console.log('\nCreating email templates...');
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to {{company}}!',
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 32px;">Welcome {{name}}!</h1>
          <p style="font-size: 18px; line-height: 1.6;">We're thrilled to have you join {{company}}.</p>
          <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully created and you're ready to get started!</p>
          <a href="{{loginLink}}" style="background: #007aff; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Get Started</a>
        </div>
      `,
      type: 'html',
    },
    {
      name: 'password-reset',
      subject: 'Password Reset Request',
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-size: 28px;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.6;">Hello {{name}},</p>
          <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to proceed:</p>
          <a href="{{resetLink}}" style="background: #007aff; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email. This link will expire in 24 hours.</p>
        </div>
      `,
      type: 'html',
    },
    {
      name: 'notification',
      subject: 'New Notification: {{title}}',
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-size: 24px;">{{title}}</h2>
          <p style="font-size: 16px; line-height: 1.6;">{{message}}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This notification was sent on {{date}}</p>
        </div>
      `,
      type: 'html',
    },
    {
      name: 'invoice',
      subject: 'Invoice #{{invoiceNumber}} from {{company}}',
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 32px;">Invoice</h1>
          <div style="border-top: 2px solid #007aff; margin: 20px 0; padding-top: 20px;">
            <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
          </div>
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; margin: 0;"><strong>Total Due:</strong> {{totalAmount}}</p>
          </div>
          <a href="{{paymentLink}}" style="background: #34c759; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">Pay Now</a>
        </div>
      `,
      type: 'html',
    },
  ];

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
    console.log(`✅ Created template: ${template.name}`);
  }

  // Create sample domains
  console.log('\nCreating sample domains...');
  const domains = [
    { name: 'example.com', verified: true, spf: true, dkim: true, dmarc: true },
    { name: 'test.example.com', verified: true, spf: true, dkim: false, dmarc: false },
    { name: 'staging.example.com', verified: false, spf: false, dkim: false, dmarc: false },
  ];

  for (const domain of domains) {
    await prisma.domain.create({
      data: domain,
    });
    console.log(`✅ Created domain: ${domain.name} (Verified: ${domain.verified})`);
  }

  // Create sample webhooks
  console.log('\nCreating sample webhooks...');
  const webhooks = [
    {
      url: 'https://example.com/webhooks/email-events',
      events: 'delivered,bounced,opened,clicked',
      secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      active: true,
    },
    {
      url: 'https://analytics.example.com/events',
      events: 'opened,clicked',
      secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      active: true,
    },
  ];

  for (const webhook of webhooks) {
    await prisma.webhook.create({
      data: webhook,
    });
    console.log(`✅ Created webhook: ${webhook.url}`);
  }

  // Create sample email history and analytics data
  console.log('\nCreating sample email history...');
  const recipients = [
    'john.doe@example.com',
    'jane.smith@example.com',
    'bob.wilson@example.com',
    'alice.johnson@example.com',
    'charlie.brown@example.com',
  ];

  const subjects = [
    'Welcome to our service!',
    'Your monthly newsletter',
    'Password reset request',
    'Order confirmation #12345',
    'Important account update',
  ];

  const statuses = ['sent', 'sent', 'sent', 'delivered', 'failed'];

  for (let i = 0; i < 20; i++) {
    const recipient = recipients[Math.floor(Math.random() * recipients.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const email = await prisma.emailHistory.create({
      data: {
        recipient,
        subject,
        status,
        messageId: crypto.randomUUID(),
        sentAt: status === 'sent' || status === 'delivered' ? new Date() : null,
      },
    });

    // Add analytics events for sent emails
    if (status === 'sent' || status === 'delivered') {
      // Sent event
      await prisma.analyticsEvent.create({
        data: {
          emailId: email.id,
          type: 'sent',
          recipient,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        },
      });

      // Random chance of delivery
      if (Math.random() > 0.1) {
        await prisma.analyticsEvent.create({
          data: {
            emailId: email.id,
            type: 'delivered',
            recipient,
            timestamp: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000),
            country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
            city: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
          },
        });

        // Random chance of open
        if (Math.random() > 0.3) {
          await prisma.analyticsEvent.create({
            data: {
              emailId: email.id,
              type: 'opened',
              recipient,
              timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
              country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
              city: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
            },
          });

          // Random chance of click
          if (Math.random() > 0.7) {
            await prisma.analyticsEvent.create({
              data: {
                emailId: email.id,
                type: 'clicked',
                recipient,
                timestamp: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000),
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
                country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
                city: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
              },
            });
          }
        }
      }
    }
  }

  console.log('✅ Created sample email history and analytics data');

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });