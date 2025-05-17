import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { validateSubscription } from '@/lib/billing/subscription-middleware';

// Paths that do not require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/signin',
  '/auth/register',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/pending-approval', // For users awaiting approval
];

// Additional public API endpoints (like webhooks)
const publicApiPaths = [
  '/api/webhooks',
  '/api/auth/register',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
  '/api/auth/_log'
];

// Routes that require specific roles
const routePermissions: Record<string, string[]> = {
  // Admin routes
  '/admin': ['ADMIN'],
  '/api/admin': ['ADMIN'],
  
  // Moderator routes (moderators and admins can access)
  '/moderator': ['ADMIN', 'MODERATOR'],
  '/api/users/approve': ['ADMIN', 'MODERATOR'],
  '/api/users/reject': ['ADMIN', 'MODERATOR'],
  '/api/content/moderate': ['ADMIN', 'MODERATOR'],
  
  // Facilitator routes (facilitators, moderators, and admins can access)
  '/events/create': ['ADMIN', 'MODERATOR', 'FACILITATOR'],
  '/circles/create': ['ADMIN', 'MODERATOR', 'FACILITATOR'],
  '/api/events': ['ADMIN', 'MODERATOR', 'FACILITATOR'],
  '/api/circles': ['ADMIN', 'MODERATOR', 'FACILITATOR'],
  
  // Member routes (all approved users can access)
  '/events': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
  '/circles': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
  '/profile': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
  '/chat': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
  '/friends': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
  '/notifications': ['ADMIN', 'MODERATOR', 'FACILITATOR', 'MEMBER'],
};

// Check if a path matches a pattern
const isPublicPath = (path: string): boolean => {
  // Check if it's an auth API path that should be public
  if (path.startsWith('/api/auth/')) {
    return true;
  }
  
  return publicPaths.some(publicPath => {
    if (publicPath === '/') {
      return path === '/';
    }
    return path.startsWith(publicPath);
  }) || publicApiPaths.some(apiPath => path.startsWith(apiPath));
};

// Check if a path is a static asset
const isStaticAsset = (path: string): boolean => {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/robots.txt') ||
    path.startsWith('/public')
  );
};

// Check if user has required role for a path
const hasRequiredRole = (
  path: string, 
  userRole: string | undefined
): boolean => {
  if (!userRole) return false;
  
  // Find the most specific matching route
  const matchingRoutes = Object.keys(routePermissions)
    .filter(route => path === route || path.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length); // Sort by length descending to get most specific first
  
  if (matchingRoutes.length === 0) {
    // If no specific permissions defined, default to allowing all authenticated users
    return true;
  }
  
  const mostSpecificRoute = matchingRoutes[0];
  const allowedRoles = routePermissions[mostSpecificRoute];
  
  return allowedRoles.includes(userRole);
};

// Check if user's subscription is valid
const hasValidSubscription = (
  user: any
): boolean => {
  // If user has no trial or subscription requirements, return true
  if (!user.trialEndsAt && !user.stripeSubscriptionStatus) {
    return true;
  }
  
  // Check if trial is still valid
  if (user.trialEndsAt) {
    const trialEndsAt = new Date(user.trialEndsAt);
    if (trialEndsAt > new Date()) {
      return true;
    }
  }
  
  // Check if subscription is active
  return user.stripeSubscriptionStatus === 'active';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow access to public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For API routes, return a proper JSON response instead of redirecting
  if (pathname.startsWith('/api/')) {
    if (!request.headers.get('Authorization')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Get JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to login
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Extract user details from token
  const user = {
    id: token.sub,
    role: token.role as string,
    status: token.status as string,
    trialEndsAt: token.trialEndsAt as string | undefined,
    stripeSubscriptionStatus: token.stripeSubscriptionStatus as string | undefined,
  };

  // If user is not approved, redirect to pending page
  if (user.status === 'PENDING') {
    // Allow access to the pending approval page
    if (pathname === '/auth/pending-approval') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(
      new URL('/auth/pending-approval', request.url)
    );
  }
  
  // If user is rejected, redirect to rejection page
  if (user.status === 'REJECTED') {
    return NextResponse.redirect(
      new URL('/auth/account-rejected', request.url)
    );
  }
  
  // Validate subscription status - redirect to payment page if needed
  // Skip validation for specific billing-related paths
  if (!pathname.startsWith('/account/billing') && 
      !pathname.startsWith('/api/billing') && 
      !pathname.startsWith('/api/webhooks')) {
    
    // Check subscription status
    const subscriptionCheck = await validateSubscription(request);
    if (subscriptionCheck) {
      return subscriptionCheck;
    }
  }

  // Check if user has the required role for the requested path
  if (!hasRequiredRole(pathname, user.role)) {
    return NextResponse.redirect(
      new URL('/unauthorized', request.url)
    );
  }

  // If all checks pass, proceed
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /_next (for Next.js static files)
     * 2. /favicon.ico, /robots.txt (basic files)
     * 3. /public (public assets)
     */
    '/((?!_next|favicon.ico|robots.txt|public).*)',
  ],
}; 