import { NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email';

export async function GET() {
  try {
    const stats = emailQueue.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
