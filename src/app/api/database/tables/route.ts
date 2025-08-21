import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    // Get all table names from Prisma schema
    const tables = [
      'ApiKey',
      'Domain', 
      'Webhook',
      'Template',
      'EmailHistory',
      'AnalyticsEvent'
    ];

    return NextResponse.json({ 
      tables,
      count: tables.length 
    });
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}