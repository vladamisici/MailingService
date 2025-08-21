import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission } from '@/lib/auth';
import { apiKeyService } from '@/lib/db';
import { createApiKeySchema } from '@/lib/validation';

// Get all API keys
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Check permissions
    if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all API keys
    const keys = await apiKeyService.getAll();
    
    // Don't expose the hashed keys
    const sanitizedKeys = keys.map(key => ({
      id: key.id,
      name: key.name,
      key: 'sk_live_' + '*'.repeat(28), // Masked key
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed?.toISOString() || null,
      permissions: key.permissions.split(','),
      active: key.active,
      rateLimit: key.rateLimit,
      rateLimitWindow: key.rateLimitWindow,
    }));

    return NextResponse.json({ keys: sanitizedKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json({ error: 'Failed to get API keys' }, { status: 500 });
  }
}

// Create new API key
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Check permissions
    if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validate input
    const body = await request.json();
    const validation = createApiKeySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        errors: validation.error.issues 
      }, { status: 400 });
    }

    // Create API key
    const apiKey = await apiKeyService.create(
      validation.data.name,
      validation.data.permissions || ['send']
    );

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // This is the raw key, only shown once
      createdAt: apiKey.createdAt.toISOString(),
      permissions: apiKey.permissions.split(','),
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
