import { NextRequest, NextResponse } from 'next/server';
import { apiKeyManager, authenticateRequest, requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Only allow admin access for key management
  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const keys = apiKeyManager.getAllKeys();
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Failed to get API keys:', error);
    return NextResponse.json({ error: 'Failed to retrieve API keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, permissions = ['send'] } = body;

    if (!name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    const newKey = apiKeyManager.generateKey(name, permissions);
    
    return NextResponse.json({
      success: true,
      message: 'API key created successfully',
      key: newKey
    });
  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Key ID and action are required' }, { status: 400 });
    }

    let success = false;
    let message = '';

    switch (action) {
      case 'toggle':
        success = apiKeyManager.toggleKey(id);
        message = success ? 'API key status updated' : 'API key not found';
        break;
      case 'delete':
        success = apiKeyManager.deleteKey(id);
        message = success ? 'API key deleted' : 'API key not found';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Failed to update API key:', error);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}
