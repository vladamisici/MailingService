import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Map table names to Prisma models
const modelMap: any = {
  ApiKey: () => prisma.apiKey,
  Domain: () => prisma.domain,
  Webhook: () => prisma.webhook,
  Template: () => prisma.template,
  EmailHistory: () => prisma.emailHistory,
  AnalyticsEvent: () => prisma.analyticsEvent,
};

// Get table data
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
    const tableName = searchParams.get('table') || 'EmailHistory';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    if (!modelMap[tableName]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const model = modelMap[tableName]();
    
    // Build where clause for search
    let where: any = {};
    if (search) {
      // Search in string fields only
      const stringFields = await getStringFields(tableName);
      if (stringFields.length > 0) {
        where = {
          OR: stringFields.map(field => ({
            [field]: { contains: search, mode: 'insensitive' }
          }))
        };
      }
    }

    // Get total count
    const totalRows = await model.count({ where });

    // Get paginated data
    const rows = await model.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Get column names
    let columns: string[] = [];
    if (rows.length > 0) {
      columns = Object.keys(rows[0]);
    } else {
      // Get columns from schema
      columns = getTableColumns(tableName);
    }

    return NextResponse.json({
      tableName,
      columns,
      rows,
      totalRows,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Failed to fetch table data:', error);
    return NextResponse.json({ error: 'Failed to fetch table data' }, { status: 500 });
  }
}

// Create new record
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { table, data } = body;

    if (!modelMap[table]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const model = modelMap[table]();
    
    // Remove readonly fields
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.lastModified;

    const result = await model.create({ data });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Failed to create record:', error);
    return NextResponse.json({ 
      error: 'Failed to create record',
      message: error.message 
    }, { status: 500 });
  }
}

// Update record
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { table, id, data } = body;

    if (!modelMap[table]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const model = modelMap[table]();
    
    // Remove readonly fields
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.lastModified;

    const result = await model.update({
      where: { id },
      data
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Failed to update record:', error);
    return NextResponse.json({ 
      error: 'Failed to update record',
      message: error.message 
    }, { status: 500 });
  }
}

// Delete record
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { table, id } = body;

    if (!modelMap[table]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const model = modelMap[table]();
    
    await model.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error: any) {
    console.error('Failed to delete record:', error);
    return NextResponse.json({ 
      error: 'Failed to delete record',
      message: error.message 
    }, { status: 500 });
  }
}

// Helper function to get string fields for search
async function getStringFields(tableName: string): Promise<string[]> {
  const stringFieldsMap: Record<string, string[]> = {
    ApiKey: ['name', 'permissions'],
    Domain: ['name'],
    Webhook: ['url', 'events'],
    Template: ['name', 'subject', 'content'],
    EmailHistory: ['recipient', 'subject', 'status', 'messageId', 'error'],
    AnalyticsEvent: ['type', 'recipient', 'userAgent', 'ipAddress', 'country', 'city', 'device']
  };
  
  return stringFieldsMap[tableName] || [];
}

// Helper function to get table columns
function getTableColumns(tableName: string): string[] {
  const columnsMap: Record<string, string[]> = {
    ApiKey: ['id', 'name', 'permissions', 'active', 'createdAt', 'lastUsed', 'rateLimit', 'rateLimitWindow'],
    Domain: ['id', 'name', 'verified', 'spf', 'dkim', 'dmarc', 'createdAt'],
    Webhook: ['id', 'url', 'events', 'active', 'secret', 'createdAt', 'failureCount'],
    Template: ['id', 'name', 'subject', 'content', 'type', 'createdAt', 'lastModified'],
    EmailHistory: ['id', 'recipient', 'subject', 'status', 'createdAt', 'sentAt', 'messageId', 'error'],
    AnalyticsEvent: ['id', 'type', 'timestamp', 'recipient', 'userAgent', 'ipAddress', 'country', 'city', 'device', 'emailId']
  };
  
  return columnsMap[tableName] || ['id', 'createdAt'];
}