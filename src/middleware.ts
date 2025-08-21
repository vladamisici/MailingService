import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './middleware/auth';
import { apiRateLimiter } from './middleware/rateLimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // CORS configuration for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.ALLOW_PUBLIC_ACCESS === 'true') {
      // In public mode, allow any origin (not recommended for production)
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    // Define public routes
    const alwaysPublicRoutes = ['/api/health', '/api/server/status', '/api/analytics/track'];
    
    // Setup routes should be public only when setup is not complete
    const setupRoutes = ['/api/setup', '/api/setup/test-smtp'];
    const isSetupRoute = setupRoutes.some(route => pathname.startsWith(route));
    
    // Skip rate limiting for setup routes and health checks
    if (!pathname.includes('/health') && !pathname.includes('/server/status') && !isSetupRoute) {
      const rateLimitResponse = await apiRateLimiter(request);
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }
    }
    
    // Check if setup is complete (but not for setup routes themselves to avoid recursion)
    let setupComplete = false;
    if (!isSetupRoute) {
      // Check if we have a JWT secret configured as a proxy for setup completion
      setupComplete = !!process.env.JWT_SECRET;
    }
    
    // Check if this is a same-origin request (from the web interface itself)
    const requestOrigin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    
    // Same-origin means the request is coming from the web interface itself
    const isSameOrigin = !requestOrigin || // No origin header usually means same-origin
                        requestOrigin.includes(host) ||
                        referer.includes(host);
    
    // Determine if authentication is required
    const isPublicRoute = alwaysPublicRoutes.some(route => pathname.startsWith(route));
    const isSetupPublicRoute = isSetupRoute && !setupComplete;
    
    // Only require auth for external API calls (not same-origin requests from the web interface)
    const requiresAuth = !isPublicRoute && !isSetupPublicRoute && !isSameOrigin;
    
    // Apply authentication to protected API routes only for external requests
    if (requiresAuth) {
      const authResponse = await authMiddleware(request);
      if (authResponse.status === 401 || authResponse.status === 429) {
        return authResponse;
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};