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

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tableName = formData.get('table') as string;

    if (!file || !tableName) {
      return NextResponse.json({ error: 'Missing file or table name' }, { status: 400 });
    }

    if (!modelMap[tableName]) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'Invalid CSV file' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const model = modelMap[tableName]();
    
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const data: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Skip empty values
          if (value === '') return;
          
          // Handle boolean values
          if (value === 'true' || value === 'false') {
            data[header] = value === 'true';
          }
          // Handle numeric values
          else if (!isNaN(Number(value)) && value !== '') {
            data[header] = Number(value);
          }
          // Handle dates
          else if (header.includes('At') && value) {
            data[header] = new Date(value);
          }
          // Handle null values
          else if (value === 'null' || value === 'NULL') {
            data[header] = null;
          }
          // Handle string values
          else {
            data[header] = value;
          }
        });
        
        // Remove readonly fields
        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;
        delete data.lastModified;
        
        // Special handling for specific tables
        if (tableName === 'ApiKey' && data.hashedKey) {
          // Skip importing API keys with hashed keys for security
          delete data.hashedKey;
        }
        
        await model.create({ data });
        imported++;
      } catch (error: any) {
        failed++;
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: lines.length - 1,
      errors: errors.slice(0, 10) // Limit error messages
    });
  } catch (error: any) {
    console.error('Failed to import data:', error);
    return NextResponse.json({ 
      error: 'Failed to import data',
      message: error.message 
    }, { status: 500 });
  }
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}