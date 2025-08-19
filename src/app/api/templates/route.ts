import { NextRequest, NextResponse } from 'next/server';
import { templates } from '@/lib/email';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';

// In-memory template storage (replace with database in production)
interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'html' | 'text';
  created: string;
  lastModified: string;
  usageCount: number;
}

const customTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}, {{first_name}}!',
    content: `<html><body><h1>Welcome {{first_name}}!</h1><p>Thank you for joining {{company_name}}.</p></body></html>`,
    variables: ['first_name', 'company_name'],
    type: 'html',
    created: '2024-01-15',
    lastModified: '2024-01-20',
    usageCount: 142
  }
];

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'templates')) {
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    // Combine built-in and custom templates
    const builtInTemplates = Object.keys(templates).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      subject: templates[key].subject,
      content: templates[key].html,
      variables: extractVariables(templates[key].subject + templates[key].html),
      type: 'html' as const,
      created: '2024-01-01',
      lastModified: '2024-01-01',
      usageCount: 0
    }));
    
    const allTemplates = [...builtInTemplates, ...customTemplates];
    logApiUsage(auth.apiKey, '/api/templates', true);
    
    return NextResponse.json(allTemplates);
  } catch (error) {
    console.error('Templates error:', error);
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Failed to get templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'templates')) {
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, subject, content, type = 'html' } = body;

    if (!name || !subject || !content) {
      logApiUsage(auth.apiKey, '/api/templates', false);
      return NextResponse.json({ 
        error: 'Missing required fields: name, subject, content' 
      }, { status: 400 });
    }

    const template: Template = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      variables: extractVariables(subject + content),
      type,
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    customTemplates.push(template);
    logApiUsage(auth.apiKey, '/api/templates', true);

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'templates')) {
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, subject, content, type } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const templateIndex = customTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = customTemplates[templateIndex];
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.content = content || template.content;
    template.type = type || template.type;
    template.variables = extractVariables((template.subject + template.content));
    template.lastModified = new Date().toISOString().split('T')[0];

    logApiUsage(auth.apiKey, '/api/templates', true);

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'templates')) {
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const templateIndex = customTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    customTemplates.splice(templateIndex, 1);
    logApiUsage(auth.apiKey, '/api/templates', true);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    logApiUsage(auth.apiKey, '/api/templates', false);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}

function extractVariables(text: string): string[] {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variableRegex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}
