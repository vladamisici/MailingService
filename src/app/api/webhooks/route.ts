import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, logApiUsage } from '@/lib/auth';
import crypto from 'crypto';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  created: string;
  lastTriggered?: string;
  failureCount: number;
}

// In-memory webhook storage (replace with database in production)
const webhooks: Webhook[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/email',
    events: ['delivered', 'bounced', 'opened', 'clicked'],
    active: true,
    secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
    created: '2024-01-15',
    lastTriggered: '2024-01-20',
    failureCount: 0
  }
];

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'webhooks')) {
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    logApiUsage(auth.apiKey, '/api/webhooks', true);
    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Failed to get webhooks:', error);
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Failed to retrieve webhooks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'webhooks')) {
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { url, events = ['delivered', 'bounced'] } = body;

    if (!url) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }

    // Validate events
    const validEvents = ['sent', 'delivered', 'bounced', 'opened', 'clicked', 'unsubscribed', 'complained'];
    const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
    
    if (invalidEvents.length > 0) {
      return NextResponse.json({ 
        error: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${validEvents.join(', ')}` 
      }, { status: 400 });
    }

    const webhook: Webhook = {
      id: crypto.randomUUID(),
      url,
      events,
      active: true,
      secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      created: new Date().toISOString().split('T')[0],
      failureCount: 0
    };

    webhooks.push(webhook);
    logApiUsage(auth.apiKey, '/api/webhooks', true);

    return NextResponse.json({
      success: true,
      message: 'Webhook created successfully',
      webhook
    });
  } catch (error) {
    console.error('Failed to create webhook:', error);
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'webhooks')) {
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action, url, events, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    if (action === 'toggle') {
      webhook.active = !webhook.active;
    } else if (action === 'update') {
      if (url) webhook.url = url;
      if (events) webhook.events = events;
      if (typeof active === 'boolean') webhook.active = active;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    logApiUsage(auth.apiKey, '/api/webhooks', true);

    return NextResponse.json({
      success: true,
      message: 'Webhook updated successfully',
      webhook
    });
  } catch (error) {
    console.error('Failed to update webhook:', error);
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (auth.apiKey && !requirePermission(auth.apiKey, 'webhooks')) {
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const webhookIndex = webhooks.findIndex(w => w.id === id);
    if (webhookIndex === -1) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    webhooks.splice(webhookIndex, 1);
    logApiUsage(auth.apiKey, '/api/webhooks', true);

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    logApiUsage(auth.apiKey, '/api/webhooks', false);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}

// Webhook delivery function (to be called when events occur)
export async function deliverWebhook(event: string, data: any) {
  const relevantWebhooks = webhooks.filter(w => w.active && w.events.includes(event));
  
  for (const webhook of relevantWebhooks) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID()
      };

      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': event,
          'User-Agent': 'Mail-API-Server/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        webhook.lastTriggered = new Date().toISOString().split('T')[0];
        webhook.failureCount = 0;
      } else {
        webhook.failureCount++;
        console.error(`Webhook delivery failed for ${webhook.url}: ${response.status}`);
      }
    } catch (error) {
      webhook.failureCount++;
      console.error(`Webhook delivery error for ${webhook.url}:`, error);
    }
  }
}
