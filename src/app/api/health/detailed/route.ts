import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiKeyService } from '@/lib/db';

export async function GET(request: NextRequest) {
  const checks = {
    database: { healthy: false, message: '' },
    redis: { healthy: false, message: '' },
    smtp: { healthy: false, message: '' },
    apiKeys: { count: 0, healthy: false }
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.healthy = true;
    checks.database.message = 'Connected';
  } catch (error) {
    checks.database.message = 'Failed to connect';
  }

  // Check Redis (simplified check)
  try {
    if (process.env.REDIS_URL) {
      // In a real implementation, you would test the Redis connection
      // For now, we'll just check if it's configured
      checks.redis.healthy = true;
      checks.redis.message = 'Configured';
    } else {
      checks.redis.message = 'Using in-memory queue';
      checks.redis.healthy = true;
    }
  } catch (error) {
    checks.redis.message = 'Failed to connect';
  }

  // Check SMTP config
  checks.smtp.healthy = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
  checks.smtp.message = checks.smtp.healthy ? 'Configured' : 'Not configured';

  // Check API keys
  try {
    const keys = await apiKeyService.getAll();
    checks.apiKeys.count = keys.length;
    checks.apiKeys.healthy = keys.length > 0;
  } catch (error) {
    checks.apiKeys.healthy = false;
  }

  return NextResponse.json({
    status: 'operational',
    checks,
    timestamp: new Date().toISOString()
  });
}