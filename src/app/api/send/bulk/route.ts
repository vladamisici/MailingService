import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';
import { emailRateLimiter } from '@/middleware/rateLimit';
import { sendEmailSchema, sanitizeHtml } from '@/lib/validation';
import { addEmailToQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Check permissions
    if (authResult.apiKey && !requirePermission(authResult.apiKey, 'bulk')) {
      logApiUsage(authResult.apiKey, '/api/send/bulk', false);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check rate limit
    const rateLimitResponse = await emailRateLimiter(req);
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await req.json();
    const { emails } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: emails must be a non-empty array' },
        { status: 400 }
      );
    }

    if (emails.length > 1000) {
      return NextResponse.json(
        { error: 'Batch size limit exceeded. Maximum 1000 emails per batch.' },
        { status: 400 }
      );
    }

    let success = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: string }> = [];
    const jobIds: string[] = [];

    // Process each email
    for (let i = 0; i < emails.length; i++) {
      try {
        const email = emails[i];
        
        // Validate email data
        const validation = sendEmailSchema.safeParse(email);
        if (!validation.success) {
          failed++;
          errors.push({
            index: i,
            error: validation.error.issues[0]?.message || 'Validation failed'
          });
          continue;
        }

        // Sanitize HTML content
        if (validation.data.html) {
          validation.data.html = sanitizeHtml(validation.data.html);
        }

        // Add to queue
        const jobId = await addEmailToQueue({
          ...validation.data,
          metadata: {
            batch: true,
            batchIndex: i,
            apiKeyId: authResult.apiKey?.id,
            apiKeyName: authResult.apiKey?.name,
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
          }
        });

        jobIds.push(jobId as string);
        success++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Failed to process email'
        });
      }
    }

    logApiUsage(authResult.apiKey, '/api/send/bulk', true);

    // Return results
    return NextResponse.json({
      success,
      failed,
      total: emails.length,
      jobIds,
      errors: errors.length > 0 ? errors : undefined,
    }, {
      headers: authResult.rateLimit ? {
        'X-RateLimit-Remaining': authResult.rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(authResult.rateLimit.resetTime).toISOString()
      } : {}
    });
  } catch (error) {
    console.error('Bulk send error:', error);
    logApiUsage(null, '/api/send/bulk', false);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
