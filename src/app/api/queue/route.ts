import { NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email';

export async function GET() {
  try {
    const queue = emailQueue.getQueue();
    return NextResponse.json(queue);
  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: 'Failed to get queue' }, { status: 500 });
  }
}
