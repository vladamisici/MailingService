import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, subject, text, html, scheduledFor } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({
        error: 'Recipients must be a non-empty array'
      }, { status: 400 });
    }

    if (!subject || (!text && !html)) {
      return NextResponse.json({
        error: 'Missing required fields: subject and either text or html'
      }, { status: 400 });
    }

    const emailIds = recipients.map(to => 
      emailQueue.add({ to, subject, text, html, scheduledFor })
    );

    return NextResponse.json({
      success: true,
      ids: emailIds,
      count: emailIds.length,
      message: `${emailIds.length} emails queued for sending`
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    return NextResponse.json({ error: 'Failed to queue bulk emails' }, { status: 500 });
  }
}
