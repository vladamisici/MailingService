import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { apiKeyService, rateLimitService } from './db';

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export interface AuthResult {
  success: boolean;
  apiKey?: any;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  permissions: string[];
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Authenticate request with API key or JWT
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Check if public access is enabled
  const allowPublicAccess = process.env.ALLOW_PUBLIC_ACCESS === 'true';
  
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    if (allowPublicAccess) {
      return { success: true };
    }
    return { success: false, error: 'Missing Authorization header' };
  }

  // Check if it's a Bearer token
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { success: false, error: 'Invalid Authorization format. Use: Bearer <token>' };
  }

  // Check if it's an API key (starts with sk_)
  if (token.startsWith('sk_')) {
    // Validate API key
    const apiKey = await apiKeyService.validate(token);
    if (!apiKey) {
      return { success: false, error: 'Invalid or inactive API key' };
    }

    // Check rate limits
    const rateLimitResult = await rateLimitService.checkRateLimit(apiKey.id, apiKey.rateLimitWindow);
    if (!rateLimitResult.allowed) {
      return { 
        success: false, 
        error: 'Rate limit exceeded',
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: Date.now() + (apiKey.rateLimitWindow * 1000)
        }
      };
    }

    return { 
      success: true, 
      apiKey,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: Date.now() + (apiKey.rateLimitWindow * 1000)
      }
    };
  } else {
    // Try to verify as JWT
    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' };
    }

    return { 
      success: true,
      apiKey: {
        permissions: payload.permissions.join(',')
      }
    };
  }
}

export function requirePermission(apiKey: any, permission: string): boolean {
  if (!apiKey || !apiKey.permissions) return false;
  const permissions = typeof apiKey.permissions === 'string' 
    ? apiKey.permissions.split(',') 
    : apiKey.permissions;
  return permissions.includes(permission) || permissions.includes('*');
}

export function checkEmailQuota(apiKey: any): boolean {
  // This would check daily email quota in a real implementation
  return true;
}

export function logApiUsage(apiKey: any, endpoint: string, success: boolean) {
  // This would log API usage to database/analytics system
  console.log(`API Usage: ${apiKey?.name || 'Public'} - ${endpoint} - ${success ? 'Success' : 'Failed'}`);
}
