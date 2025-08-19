import { NextRequest, NextResponse } from 'next/server';
import { emailQueue, templates, processTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template: templateName, variables = {} } = body;

    if (!to || !templateName) {
      return NextResponse.json({
        error: 'Missing required fields: to and template'
      }, { status: 400 });
    }

    const template = templates[templateName];
    if (!template) {
      return NextResponse.json({
        error: `Template '${templateName}' not found`
      }, { status: 400 });
    }

    const processed = processTemplate(template, variables);

    const emailId = emailQueue.add({
      to,
      subject: processed.subject,
      text: processed.text,
      html: processed.html
    });

    return NextResponse.json({
      success: true,
      id: emailId,
      message: 'Template email queued for sending'
    });
  } catch (error) {
    console.error('Template email error:', error);
    return NextResponse.json({ error: 'Failed to send template email' }, { status: 500 });
  }
}
