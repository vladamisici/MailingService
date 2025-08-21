import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/db';

const modelMap: any = {
  ApiKey: () => prisma.apiKey,
  Domain: () => prisma.domain,
  Webhook: () => prisma.webhook,
  Template: () => prisma.template,
  EmailHistory: () => prisma.emailHistory,
  AnalyticsEvent: () => prisma.analyticsEvent,
};

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName || !modelMap[tableName]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const model = modelMap[tableName]();
    const data = await model.findMany();

    // Convert to CSV
    if (data.length === 0) {
      return new NextResponse('No data to export', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${tableName}_export.csv"`
        }
      });
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map(header => {
          const value = row[header];
          if (value === null) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${tableName}_export.csv"`
      }
    });
  } catch (error) {
    console.error('Failed to export data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}