import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission } from '@/lib/auth';
import { apiKeyService } from '@/lib/db';

// Delete API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete API key
    const success = await apiKeyService.delete(params.id);
    
    if (!success) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}

// Toggle API key active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Toggle API key
    const success = await apiKeyService.toggle(params.id);
    
    if (!success) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle API key error:', error);
    return NextResponse.json({ error: 'Failed to toggle API key' }, { status: 500 });
  }
}