import { NextRequest } from 'next/server';
import crypto from 'crypto';

// In-memory storage for API keys (replace with database in production)
interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    emailsPerDay: number;
  };
}

// Default API keys (for demo - replace with database)
const defaultApiKeys: ApiKey[] = [
  {
    id: '1',
    key: 'sk_live_1234567890abcdef',
    name: 'Production Key',
    active: true,
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date('2024-01-20'),
    permissions: ['send', 'bulk', 'templates', 'stats'],
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      emailsPerDay: 10000
    }
  },
  {
    id: '2',
    key: 'sk_test_9876543210fedcba',
    name: 'Development Key',
    active: true,
    createdAt: new Date('2024-01-10'),
    permissions: ['send', 'templates', 'stats'],
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      emailsPerDay: 1000
    }
  }
];

class ApiKeyManager {
  private keys: ApiKey[] = [...defaultApiKeys];
  private usage: Map<string, { requests: number; emails: number; resetTime: number }> = new Map();

  generateKey(name: string, permissions: string[] = ['send']): ApiKey {
    const key: ApiKey = {
      id: crypto.randomUUID(),
      key: 'sk_live_' + crypto.randomBytes(16).toString('hex'),
      name,
      active: true,
      createdAt: new Date(),
      permissions,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        emailsPerDay: 10000
      }
    };
    
    this.keys.push(key);
    return key;
  }

  validateKey(key: string): ApiKey | null {
    const apiKey = this.keys.find(k => k.key === key && k.active);
    if (apiKey) {
      apiKey.lastUsed = new Date();
    }
    return apiKey || null;
  }

  checkRateLimit(apiKey: ApiKey): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const usage = this.usage.get(apiKey.id) || { requests: 0, emails: 0, resetTime: now + 60000 };
    
    // Reset counters every minute
    if (now > usage.resetTime) {
      usage.requests = 0;
      usage.resetTime = now + 60000;
    }
    
    const limit = apiKey.rateLimit?.requestsPerMinute || 60;
    const allowed = usage.requests < limit;
    
    if (allowed) {
      usage.requests++;
      this.usage.set(apiKey.id, usage);
    }
    
    return {
      allowed,
      remaining: Math.max(0, limit - usage.requests),
      resetTime: usage.resetTime
    };
  }

  getAllKeys(): ApiKey[] {
    return this.keys.map(key => ({ ...key, key: key.key.substring(0, 20) + '...' }));
  }

  toggleKey(id: string): boolean {
    const key = this.keys.find(k => k.id === id);
    if (key) {
      key.active = !key.active;
      return true;
    }
    return false;
  }

  deleteKey(id: string): boolean {
    const index = this.keys.findIndex(k => k.id === id);
    if (index > -1) {
      this.keys.splice(index, 1);
      this.usage.delete(id);
      return true;
    }
    return false;
  }
}

export const apiKeyManager = new ApiKeyManager();

export interface AuthResult {
  success: boolean;
  apiKey?: ApiKey;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

export function authenticateRequest(request: NextRequest): AuthResult {
  // Check if public access is enabled
  const allowPublicAccess = process.env.ALLOW_PUBLIC_ACCESS === 'true';
  
  // Get API key from Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    if (allowPublicAccess) {
      return { success: true };
    }
    return { success: false, error: 'Missing Authorization header' };
  }

  // Extract Bearer token
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { success: false, error: 'Invalid Authorization format. Use: Bearer <api_key>' };
  }

  // Validate API key
  const apiKey = apiKeyManager.validateKey(token);
  if (!apiKey) {
    return { success: false, error: 'Invalid or inactive API key' };
  }

  // Check rate limits
  const rateLimitResult = apiKeyManager.checkRateLimit(apiKey);
  if (!rateLimitResult.allowed) {
    return { 
      success: false, 
      error: 'Rate limit exceeded',
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    };
  }

  return { 
    success: true, 
    apiKey,
    rateLimit: {
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    }
  };
}

export function requirePermission(apiKey: ApiKey | undefined, permission: string): boolean {
  if (!apiKey) return false;
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*');
}

// Rate limiting for different actions
export function checkEmailQuota(apiKey: ApiKey): boolean {
  // This would check daily email quota in a real implementation
  return true;
}

export function logApiUsage(apiKey: ApiKey | undefined, endpoint: string, success: boolean) {
  // This would log API usage to database/analytics system
  console.log(`API Usage: ${apiKey?.name || 'Public'} - ${endpoint} - ${success ? 'Success' : 'Failed'}`);
}
