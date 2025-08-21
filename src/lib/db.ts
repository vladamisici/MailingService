import { PrismaClient } from '@prisma/client';
import { EmailData, AnalyticsEvent } from './email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Global Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// API Key management
export const apiKeyService = {
  async create(name: string, permissions: string[] = ['send']) {
    const rawKey = 'sk_live_' + crypto.randomBytes(16).toString('hex');
    const hashedKey = await bcrypt.hash(rawKey, 10);
    
    const apiKey = await prisma.apiKey.create({
      data: {
        hashedKey,
        name,
        permissions: permissions.join(','),
        rateLimit: 100,
        rateLimitWindow: 60,
      },
    });
    
    return { ...apiKey, key: rawKey };
  },

  async validate(key: string) {
    const apiKeys = await prisma.apiKey.findMany({
      where: { active: true },
    });
    
    for (const apiKey of apiKeys) {
      const isValid = await bcrypt.compare(key, apiKey.hashedKey);
      if (isValid) {
        await prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() },
        });
        return apiKey;
      }
    }
    
    return null;
  },

  async getAll() {
    return prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsed: true,
        active: true,
        permissions: true,
        rateLimit: true,
        rateLimitWindow: true,
      },
    });
  },

  async toggle(id: string) {
    const apiKey = await prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) return false;
    
    await prisma.apiKey.update({
      where: { id },
      data: { active: !apiKey.active },
    });
    
    return true;
  },

  async delete(id: string) {
    try {
      await prisma.apiKey.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};

// Email history management
export const emailHistoryService = {
  async create(emailData: Partial<EmailData>) {
    return prisma.emailHistory.create({
      data: {
        recipient: emailData.to!,
        subject: emailData.subject!,
        status: 'queued',
        messageId: emailData.messageId,
      },
    });
  },

  async updateStatus(id: string, status: string, error?: string) {
    return prisma.emailHistory.update({
      where: { id },
      data: {
        status,
        error,
        sentAt: status === 'sent' ? new Date() : undefined,
      },
    });
  },

  async getRecent(limit: number = 50) {
    return prisma.emailHistory.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });
  },

  async getStats() {
    const [sent, failed, queued] = await Promise.all([
      prisma.emailHistory.count({ where: { status: 'sent' } }),
      prisma.emailHistory.count({ where: { status: 'failed' } }),
      prisma.emailHistory.count({ where: { status: 'queued' } }),
    ]);
    
    return { sent, failed, queued };
  },
};

// Analytics event tracking
export const analyticsService = {
  async trackEvent(
    emailId: string,
    type: string,
    recipient: string,
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      country?: string;
      city?: string;
      device?: string;
    }
  ) {
    return prisma.analyticsEvent.create({
      data: {
        emailId,
        type,
        recipient,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        country: metadata?.country,
        city: metadata?.city,
        device: metadata?.device,
      },
    });
  },

  async getEvents(emailId?: string, limit: number = 100) {
    const where = emailId ? { emailId } : {};
    return prisma.analyticsEvent.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        email: {
          select: {
            subject: true,
            recipient: true,
          },
        },
      },
    });
  },

  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: { gte: cutoffDate },
      },
    });

    // Calculate metrics
    const metrics = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get geographic data
    const geoData = events
      .filter(e => e.country)
      .reduce((acc, event) => {
        const key = event.country!;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Get device data
    const deviceData = events
      .filter(e => e.device)
      .reduce((acc, event) => {
        const key = event.device!;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      metrics,
      geoData,
      deviceData,
      totalEvents: events.length,
    };
  },
};

// Template management
export const templateService = {
  async create(name: string, subject: string, content: string, type: 'html' | 'text' = 'html') {
    return prisma.template.create({
      data: { name, subject, content, type },
    });
  },

  async update(id: string, data: { subject?: string; content?: string; type?: string }) {
    return prisma.template.update({
      where: { id },
      data,
    });
  },

  async getAll() {
    return prisma.template.findMany({
      orderBy: { lastModified: 'desc' },
    });
  },

  async getByName(name: string) {
    return prisma.template.findUnique({
      where: { name },
    });
  },

  async delete(id: string) {
    try {
      await prisma.template.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};

// Webhook management
export const webhookService = {
  async create(url: string, events: string[], secret?: string) {
    return prisma.webhook.create({
      data: {
        url,
        events: events.join(','),
        secret: secret || 'whsec_' + crypto.randomBytes(16).toString('hex'),
      },
    });
  },

  async getAll() {
    return prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async getActive() {
    return prisma.webhook.findMany({
      where: { active: true },
    });
  },

  async update(id: string, data: { url?: string; events?: string[]; active?: boolean }) {
    const updateData: any = { ...data };
    if (data.events) {
      updateData.events = data.events.join(',');
    }
    
    return prisma.webhook.update({
      where: { id },
      data: updateData,
    });
  },

  async incrementFailure(id: string) {
    return prisma.webhook.update({
      where: { id },
      data: {
        failureCount: { increment: 1 },
      },
    });
  },

  async resetFailure(id: string) {
    return prisma.webhook.update({
      where: { id },
      data: {
        failureCount: 0,
      },
    });
  },

  async delete(id: string) {
    try {
      await prisma.webhook.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};

// Domain verification
export const domainService = {
  async create(name: string) {
    return prisma.domain.create({
      data: { name },
    });
  },

  async getAll() {
    return prisma.domain.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async verify(id: string, checks: { spf?: boolean; dkim?: boolean; dmarc?: boolean }) {
    return prisma.domain.update({
      where: { id },
      data: {
        verified: Boolean(checks.spf && checks.dkim && checks.dmarc),
        ...checks,
      },
    });
  },

  async delete(id: string) {
    try {
      await prisma.domain.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};

// Rate limiting with database
export const rateLimitService = {
  async checkRateLimit(apiKeyId: string, window: number) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - window * 1000);
    
    // In a real implementation, you'd track API calls in a separate table
    // For now, we'll use the lastUsed field as a simple check
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });
    
    if (!apiKey) return { allowed: false, remaining: 0 };
    
    // This is a simplified version - in production, you'd track actual requests
    return {
      allowed: true,
      remaining: apiKey.rateLimit,
    };
  },
};

// Cleanup old data
export async function cleanupOldData(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const [deletedEvents, deletedEmails] = await Promise.all([
    prisma.analyticsEvent.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    }),
    prisma.emailHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['sent', 'failed'] },
      },
    }),
  ]);
  
  return {
    deletedEvents: deletedEvents.count,
    deletedEmails: deletedEmails.count,
  };
}