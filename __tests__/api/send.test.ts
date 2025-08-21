import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST as sendHandler } from '@/app/api/send/route';
import { prisma } from '@/lib/db';
import { getQueue } from '@/lib/queue';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    apiKey: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    emailHistory: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/queue', () => ({
  getQueue: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
  })),
}));

describe('/api/send', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should reject requests without API key', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'API key required',
    });
  });

  it('should reject requests with invalid API key', async () => {
    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'invalid-key',
      },
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid API key',
    });
  });

  it('should send email with valid API key', async () => {
    const mockApiKey = {
      id: '1',
      key: 'valid-key',
      name: 'Test Key',
      isActive: true,
      permissions: 'SEND',
      lastUsed: null,
    };

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.apiKey.update as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.emailHistory.create as jest.Mock).mockResolvedValueOnce({
      id: 'email-1',
      recipient: 'test@example.com',
      subject: 'Test Email',
      status: 'queued',
      createdAt: new Date(),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'valid-key',
      },
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('status', 'queued');
    expect(responseData).toHaveProperty('message', 'Email queued for delivery');
  });

  it('should validate email fields', async () => {
    const mockApiKey = {
      id: '1',
      key: 'valid-key',
      name: 'Test Key',
      isActive: true,
      permissions: 'SEND',
      lastUsed: null,
    };

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValueOnce(mockApiKey);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'valid-key',
      },
      body: {
        to: 'invalid-email',
        subject: '',
        text: '',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error');
  });

  it('should support multiple recipients', async () => {
    const mockApiKey = {
      id: '1',
      key: 'valid-key',
      name: 'Test Key',
      isActive: true,
      permissions: 'SEND',
      lastUsed: null,
    };

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.apiKey.update as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.emailHistory.create as jest.Mock).mockResolvedValue({
      id: 'email-1',
      status: 'queued',
      createdAt: new Date(),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'valid-key',
      },
      body: {
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Email',
        text: 'Test content',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(prisma.emailHistory.create).toHaveBeenCalledTimes(2);
  });

  it('should support HTML content', async () => {
    const mockApiKey = {
      id: '1',
      key: 'valid-key',
      name: 'Test Key',
      isActive: true,
      permissions: 'SEND',
      lastUsed: null,
    };

    (prisma.apiKey.findUnique as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.apiKey.update as jest.Mock).mockResolvedValueOnce(mockApiKey);
    (prisma.emailHistory.create as jest.Mock).mockResolvedValueOnce({
      id: 'email-1',
      status: 'queued',
      createdAt: new Date(),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'valid-key',
      },
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test HTML</h1>',
      },
    });

    await sendHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(getQueue).toHaveBeenCalled();
    const queueInstance = (getQueue as jest.Mock).mock.results[0].value;
    expect(queueInstance.add).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        html: '<h1>Test HTML</h1>',
      })
    );
  });
});