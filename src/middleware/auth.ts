import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function authMiddleware(request: NextRequest) {
  // Skip auth for health check and public endpoints
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/api/server/status', '/api/health'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const auth = await authenticateRequest(request);
  
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { 
        status: auth.error?.includes('Rate limit') ? 429 : 401,
        headers: auth.rateLimit ? {
          'X-RateLimit-Remaining': auth.rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(auth.rateLimit.resetTime).toISOString()
        } : {}
      }
    );
  }

  // Add auth info to request headers for downstream use
  const response = NextResponse.next();
  
  // Set rate limit headers
  if (auth.rateLimit) {
    response.headers.set('X-RateLimit-Remaining', auth.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(auth.rateLimit.resetTime).toISOString());
  }

  // Pass API key info to the request
  if (auth.apiKey) {
    response.headers.set('X-API-Key-Id', auth.apiKey.id || '');
    response.headers.set('X-API-Key-Permissions', auth.apiKey.permissions || '');
  }

  return response;
}