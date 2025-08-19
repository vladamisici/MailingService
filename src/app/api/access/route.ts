import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const isPublic = process.env.ALLOW_PUBLIC_ACCESS === 'true';
    const baseUrl = request.nextUrl.origin;
    
    return NextResponse.json({
      publicAccess: isPublic,
      baseUrl,
      endpoints: [
        {
          method: 'POST',
          path: '/api/send',
          description: 'Send a single email',
          requiresAuth: !isPublic
        },
        {
          method: 'POST',
          path: '/api/send/bulk',
          description: 'Send bulk emails',
          requiresAuth: !isPublic
        },
        {
          method: 'POST',
          path: '/api/send/template',
          description: 'Send email using template',
          requiresAuth: !isPublic
        },
        {
          method: 'GET',
          path: '/api/queue',
          description: 'Get email queue status',
          requiresAuth: !isPublic
        },
        {
          method: 'GET',
          path: '/api/stats',
          description: 'Get email statistics',
          requiresAuth: !isPublic
        },
        {
          method: 'GET',
          path: '/api/server/status',
          description: 'Get server health status',
          requiresAuth: false
        },
        {
          method: 'GET',
          path: '/api/templates',
          description: 'Get available templates',
          requiresAuth: !isPublic
        }
      ],
      examples: {
        sendEmail: {
          curl: isPublic 
            ? `curl -X POST ${baseUrl}/api/send -H "Content-Type: application/json" -d '{"to":"user@example.com","subject":"Test","text":"Hello!"}'`
            : `curl -X POST ${baseUrl}/api/send -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_API_KEY" -d '{"to":"user@example.com","subject":"Test","text":"Hello!"}'`,
          javascript: isPublic
            ? `fetch('${baseUrl}/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Test',
    text: 'Hello!'
  })
})`
            : `fetch('${baseUrl}/api/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Test',
    text: 'Hello!'
  })
})`
        }
      },
      security: {
        message: isPublic 
          ? 'Public access is enabled. No authentication required for API calls.'
          : 'API key authentication is required for all requests.',
        recommendation: isPublic 
          ? 'Consider enabling API key authentication for better security.'
          : 'Generate API keys in the Settings tab for secure access.'
      }
    });
  } catch (error) {
    console.error('Access info error:', error);
    return NextResponse.json({ error: 'Failed to get access information' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enablePublicAccess } = body;
    
    // In a real implementation, this would update server configuration
    // For now, we'll just return the current status
    
    return NextResponse.json({
      success: true,
      message: enablePublicAccess 
        ? 'Public access would be enabled (requires server restart)'
        : 'Public access would be disabled (requires server restart)',
      publicAccess: enablePublicAccess,
      note: 'This is a demo. In production, this would update server configuration and restart the service.'
    });
  } catch (error) {
    console.error('Update access error:', error);
    return NextResponse.json({ error: 'Failed to update access settings' }, { status: 500 });
  }
}
