import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Authenticate request
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { 
      status: auth.error?.includes('Rate limit') ? 429 : 401,
      headers: auth.rateLimit ? {
        'X-RateLimit-Remaining': auth.rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(auth.rateLimit.resetTime).toISOString()
      } : {}
    });
  }

  // Check permissions
  if (auth.apiKey && !requirePermission(auth.apiKey, 'send')) {
    logApiUsage(auth.apiKey, '/api/send', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to, cc, bcc, subject, text, html, attachments, priority, scheduledFor } = body;

    if (!to || !subject || (!text && !html)) {
      logApiUsage(auth.apiKey, '/api/send', false);
      return NextResponse.json({
        error: 'Missing required fields: to, subject, and either text or html'
      }, { status: 400 });
    }

    const emailId = emailQueue.add({
      to, cc, bcc, subject, text, html, attachments, priority, scheduledFor
    });

    logApiUsage(auth.apiKey, '/api/send', true);

    return NextResponse.json({
      success: true,
      id: emailId,
      message: 'Email queued for sending'
    }, {
      headers: auth.rateLimit ? {
        'X-RateLimit-Remaining': auth.rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(auth.rateLimit.resetTime).toISOString()
      } : {}
    });
  } catch (error) {
    console.error('Send email error:', error);
    logApiUsage(auth.apiKey, '/api/send', false);
    return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 });
  }
}
