import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getQueueStats } from '@/lib/queue';
import nodemailer from 'nodemailer';
import os from 'os';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    smtp: CheckResult;
    queue: CheckResult;
    disk: CheckResult;
    memory: CheckResult;
  };
  metrics?: {
    cpu: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface CheckResult {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  latency?: number;
  details?: any;
}

// Simple health check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';
  
  try {
    const healthCheck = await performHealthCheck(detailed);
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

async function performHealthCheck(detailed: boolean): Promise<HealthCheck> {
  const startTime = Date.now();
  const checks = {
    database: await checkDatabase(),
    smtp: await checkSMTP(),
    queue: await checkQueue(),
    disk: await checkDisk(),
    memory: await checkMemory()
  };
  
  // Determine overall status
  const statuses = Object.values(checks).map(check => check.status);
  const status = statuses.includes('down') ? 'unhealthy' :
                 statuses.includes('degraded') ? 'degraded' : 'healthy';
  
  const healthCheck: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    uptime: process.uptime(),
    checks
  };
  
  if (detailed) {
    healthCheck.metrics = await getSystemMetrics();
  }
  
  return healthCheck;
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if we can read/write
    const count = await prisma.emailHistory.count();
    
    return {
      status: 'up',
      latency: Date.now() - start,
      details: { emailCount: count }
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Database connection failed',
      latency: Date.now() - start
    };
  }
}

async function checkSMTP(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.verify();
    
    return {
      status: 'up',
      latency: Date.now() - start,
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      }
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'SMTP connection failed',
      latency: Date.now() - start
    };
  }
}

async function checkQueue(): Promise<CheckResult> {
  try {
    const stats = await getQueueStats();
    const isHealthy = stats.failed < 100 && stats.waiting < 1000;
    
    return {
      status: isHealthy ? 'up' : 'degraded',
      message: isHealthy ? undefined : 'High queue backlog or failures',
      details: stats
    };
  } catch (error) {
    return {
      status: 'down',
      message: 'Queue service unavailable'
    };
  }
}

async function checkDisk(): Promise<CheckResult> {
  try {
    // This is a simple check - in production you'd want to check actual disk usage
    const tempDir = os.tmpdir();
    const freeSpace = 1000000000; // Mock 1GB free space
    const totalSpace = 10000000000; // Mock 10GB total space
    const usagePercentage = ((totalSpace - freeSpace) / totalSpace) * 100;
    
    return {
      status: usagePercentage > 90 ? 'degraded' : 'up',
      message: usagePercentage > 90 ? 'Low disk space' : undefined,
      details: {
        free: freeSpace,
        total: totalSpace,
        percentage: usagePercentage
      }
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: 'Unable to check disk space'
    };
  }
}

async function checkMemory(): Promise<CheckResult> {
  try {
    const used = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    const usagePercentage = ((total - free) / total) * 100;
    
    return {
      status: usagePercentage > 90 ? 'degraded' : 'up',
      message: usagePercentage > 90 ? 'High memory usage' : undefined,
      details: {
        heapUsed: used.heapUsed,
        heapTotal: used.heapTotal,
        external: used.external,
        systemFree: free,
        systemTotal: total,
        percentage: usagePercentage
      }
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: 'Unable to check memory'
    };
  }
}

async function getSystemMetrics() {
  const cpus = os.cpus();
  const memory = {
    used: os.totalmem() - os.freemem(),
    total: os.totalmem(),
    percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
  };
  
  // Calculate CPU usage (simplified)
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total);
  }, 0) / cpus.length * 100;
  
  return {
    cpu: cpuUsage,
    memory,
    disk: {
      used: 9000000000, // Mock 9GB used
      total: 10000000000, // Mock 10GB total
      percentage: 90
    }
  };
}

// Liveness probe - just checks if the service is running
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}