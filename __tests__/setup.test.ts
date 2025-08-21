import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/setup/route';
import { prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    apiKey: {
      createMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock fs
jest.mock('fs/promises');

describe('/api/setup', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should reject setup if already completed', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1 });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Setup already completed',
    });
  });

  it('should create admin user and generate API keys', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: 'admin@test.com',
      role: 'ADMIN',
    });
    (prisma.apiKey.createMany as jest.Mock).mockResolvedValueOnce({ count: 2 });
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    const setupData = {
      database: {
        type: 'sqlite',
        url: 'file:./test.db',
      },
      redis: {
        enabled: false,
      },
      smtp: {
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        user: 'test@test.com',
        pass: 'password',
      },
      email: {
        fromEmail: 'noreply@test.com',
        fromName: 'Test Service',
      },
      security: {
        jwtSecret: 'test-secret-key-32-characters-long!!',
        rateLimitPerMinute: 60,
        rateLimitPerHour: 1000,
        emailsPerDay: 10000,
      },
      admin: {
        email: 'admin@test.com',
        password: 'password123',
      },
      publicAccess: true,
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: setupData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('apiKeys');
    expect(responseData.apiKeys).toHaveProperty('admin');
    expect(responseData.apiKeys).toHaveProperty('public');
    expect(responseData.message).toBe('Setup completed successfully');
  });

  it('should validate required fields', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const invalidData = {
      smtp: {
        host: '',
        port: 587,
      },
      admin: {
        email: 'invalid-email',
        password: '',
      },
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: invalidData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should write .env.local file with correct values', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: 'admin@test.com',
      role: 'ADMIN',
    });
    (prisma.apiKey.createMany as jest.Mock).mockResolvedValueOnce({ count: 2 });

    let envContent = '';
    (fs.writeFile as jest.Mock).mockImplementationOnce((path, content) => {
      envContent = content;
      return Promise.resolve();
    });

    const setupData = {
      database: {
        type: 'postgresql',
        url: 'postgresql://user:pass@localhost:5432/maildb',
      },
      redis: {
        enabled: true,
        url: 'redis://localhost:6379',
      },
      smtp: {
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        user: 'test@test.com',
        pass: 'password',
      },
      email: {
        fromEmail: 'noreply@test.com',
        fromName: 'Test Service',
      },
      security: {
        jwtSecret: 'test-secret-key-32-characters-long!!',
        rateLimitPerMinute: 60,
        rateLimitPerHour: 1000,
        emailsPerDay: 10000,
      },
      admin: {
        email: 'admin@test.com',
        password: 'password123',
      },
      publicAccess: true,
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: setupData,
    });

    await handler(req, res);

    expect(fs.writeFile).toHaveBeenCalled();
    expect(envContent).toContain('DATABASE_URL=postgresql://user:pass@localhost:5432/maildb');
    expect(envContent).toContain('REDIS_URL=redis://localhost:6379');
    expect(envContent).toContain('SMTP_HOST=smtp.test.com');
    expect(envContent).toContain('JWT_SECRET=test-secret-key-32-characters-long!!');
    expect(envContent).toContain('RATE_LIMIT_PER_MINUTE=60');
    expect(envContent).toContain('PUBLIC_API_ACCESS=true');
  });
});