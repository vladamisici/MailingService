import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SetupData {
  database: {
    type: string;
    url: string;
    host?: string;
    port?: number;
    name?: string;
    user?: string;
    password?: string;
  };
  redis: {
    enabled: boolean;
    url?: string;
    host?: string;
    port?: number;
    password?: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  email: {
    fromEmail: string;
    fromName: string;
  };
  security: {
    jwtSecret: string;
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    emailsPerDay: number;
  };
  admin: {
    email: string;
    password: string;
  };
  publicAccess: boolean;
}

function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function createDatabaseUrl(database: SetupData['database']): Promise<string> {
  if (database.type === 'sqlite') {
    return database.url || 'file:./dev.db';
  }
  
  const { host, port, name, user, password } = database;
  if (!host || !name || !user) {
    throw new Error('Database host, name, and user are required');
  }

  const auth = password ? `${user}:${password}` : user;
  const portStr = port ? `:${port}` : '';
  
  return `${database.type}://${auth}@${host}${portStr}/${name}`;
}

async function createRedisUrl(redis: SetupData['redis']): Promise<string | null> {
  if (!redis.enabled) return null;
  
  if (redis.url) return redis.url;
  
  const { host = 'localhost', port = 6379, password } = redis;
  const auth = password ? `:${password}@` : '';
  
  return `redis://${auth}${host}:${port}`;
}

async function writeEnvFile(setupData: SetupData, apiKeys: { admin: string; public: string }) {
  const databaseUrl = await createDatabaseUrl(setupData.database);
  const redisUrl = await createRedisUrl(setupData.redis);
  
  const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Redis Configuration (optional)
${redisUrl ? `REDIS_URL="${redisUrl}"` : '# REDIS_URL=redis://localhost:6379 # Uncomment to enable Redis'}

# SMTP Configuration
SMTP_HOST="${setupData.smtp.host}"
SMTP_PORT="${setupData.smtp.port}"
SMTP_SECURE="${setupData.smtp.secure}"
SMTP_USER="${setupData.smtp.user}"
SMTP_PASS="${setupData.smtp.pass}"

# Email Settings
EMAIL_FROM="${setupData.email.fromEmail}"
EMAIL_FROM_NAME="${setupData.email.fromName}"

# Security Settings
JWT_SECRET="${setupData.security.jwtSecret}"
RATE_LIMIT_PER_MINUTE="${setupData.security.rateLimitPerMinute}"
RATE_LIMIT_PER_HOUR="${setupData.security.rateLimitPerHour}"
EMAILS_PER_DAY="${setupData.security.emailsPerDay}"

# API Keys (Generated)
ADMIN_API_KEY="${apiKeys.admin}"
PUBLIC_API_KEY="${apiKeys.public}"

# Public Access
PUBLIC_API_ACCESS="${setupData.publicAccess}"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

  const envPath = path.join(process.cwd(), '.env.local');
  await fs.writeFile(envPath, envContent, 'utf8');
}

async function initializeDatabase(databaseUrl: string) {
  try {
    // Update DATABASE_URL for Prisma
    process.env.DATABASE_URL = databaseUrl;
    
    // Run Prisma migrations
    await execAsync('npx prisma migrate deploy');
    
    // Generate Prisma client
    await execAsync('npx prisma generate');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database. Please ensure the database server is running.');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if setup is already complete
    try {
      const existingUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Setup already completed' },
          { status: 400 }
        );
      }
    } catch (error) {
      // Database might not be initialized yet, continue with setup
    }

    const setupData: SetupData = await request.json();

    // Validate required fields
    if (!setupData.smtp?.host || !setupData.smtp?.user || !setupData.smtp?.pass) {
      return NextResponse.json(
        { error: 'SMTP configuration is required' },
        { status: 400 }
      );
    }

    if (!setupData.email?.fromEmail || !setupData.email?.fromName) {
      return NextResponse.json(
        { error: 'Email settings are required' },
        { status: 400 }
      );
    }

    if (!setupData.admin?.email || !setupData.admin?.password) {
      return NextResponse.json(
        { error: 'Admin account details are required' },
        { status: 400 }
      );
    }

    if (!setupData.security?.jwtSecret || setupData.security.jwtSecret.length < 32) {
      return NextResponse.json(
        { error: 'JWT secret must be at least 32 characters' },
        { status: 400 }
      );
    }

    // Generate API keys
    const apiKeys = {
      admin: generateApiKey(),
      public: generateApiKey()
    };

    // Write .env.local file
    await writeEnvFile(setupData, apiKeys);

    // Initialize database
    const databaseUrl = await createDatabaseUrl(setupData.database);
    await initializeDatabase(databaseUrl);

    // Create admin user
    const hashedPassword = await bcrypt.hash(setupData.admin.password, 10);
    await prisma.user.create({
      data: {
        email: setupData.admin.email,
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN'
      }
    });

    // Create API keys in database with hashed keys
    const hashedAdminKey = await bcrypt.hash(apiKeys.admin, 10);
    const hashedPublicKey = await bcrypt.hash(apiKeys.public, 10);
    
    await prisma.apiKey.createMany({
      data: [
        {
          hashedKey: hashedAdminKey,
          name: 'Admin API Key',
          permissions: 'SEND,TEMPLATES,DOMAINS,ANALYTICS',
          role: 'ADMIN'
        },
        {
          hashedKey: hashedPublicKey,
          name: 'Public API Key',
          permissions: 'SEND',
          role: 'PUBLIC',
          active: setupData.publicAccess
        }
      ]
    });

    return NextResponse.json({
      message: 'Setup completed successfully',
      apiKeys: {
        admin: apiKeys.admin,
        public: apiKeys.public
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if setup is complete
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    return NextResponse.json({
      setupComplete: !!adminUser
    });
  } catch (error) {
    // If database is not initialized, setup is not complete
    return NextResponse.json({
      setupComplete: false
    });
  }
}