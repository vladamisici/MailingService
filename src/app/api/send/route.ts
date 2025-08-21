import { NextRequest, NextResponse } from 'next/server';
import { addEmailToQueue } from '@/lib/queue';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';
import { validateRequest, sendEmailSchema, sanitizeHtml } from '@/lib/validation';
import { emailHistoryService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
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

    // Validate and sanitize input
    const body = await request.json();
    const data = validateRequest(sendEmailSchema, body);
    
    // Sanitize HTML content
    if (data.html) {
      data.html = sanitizeHtml(data.html);
    }

    // Add to queue
    const jobId = await addEmailToQueue({
      ...data,
      metadata: {
        apiKeyId: auth.apiKey?.id,
        apiKeyName: auth.apiKey?.name,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    logApiUsage(auth.apiKey, '/api/send', true);

    return NextResponse.json({
      success: true,
      id: jobId,
      message: 'Email queued for sending',
      status: 'queued'
    }, {
      headers: auth.rateLimit ? {
        'X-RateLimit-Remaining': auth.rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(auth.rateLimit.resetTime).toISOString()
      } : {}
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    logApiUsage(null, '/api/send', false);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation failed', 
        errors: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to queue email',
      message: error.message 
    }, { status: 500 });
  }
}

// Get email status
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('id');
    
    if (!emailId) {
      // Return recent emails
      const emails = await emailHistoryService.getRecent(20);
      return NextResponse.json(emails);
    }

    // Get specific email status
    const email = await emailHistoryService.getRecent(1);
    if (!email || email.length === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json(email[0]);
  } catch (error) {
    console.error('Get email status error:', error);
    return NextResponse.json({ error: 'Failed to get email status' }, { status: 500 });
  }
}
