import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isTrialValid } from './trial-service';

/**
 * Middleware to validate subscription status
 * This ensures users have either a valid trial or active subscription
 */
export async function validateSubscription(req: NextRequest) {
  // Get JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null; // If no token, let the auth middleware handle it
  }

  // Get user role, trial and subscription status from token
  const userRole = token.role as string;
  const trialEndsAt = token.trialEndsAt as Date | undefined;
  const subscriptionStatus = token.stripeSubscriptionStatus as string | undefined;
  
  // Bypass subscription check for ADMIN users
  if (userRole === 'ADMIN') {
    return null; // Admins don't need subscription
  }
  
  // Convert trialEndsAt string to Date if it exists
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
  
  // Check if trial is valid
  const hasValidTrial = trialEndDate ? isTrialValid(trialEndDate) : false;
  
  // Check if subscription is active
  const hasActiveSubscription = subscriptionStatus === 'active';
  
  // If neither trial is valid nor subscription is active, redirect to subscription page
  if (!hasValidTrial && !hasActiveSubscription) {
    // Make exceptions for the subscription page itself and public routes
    if (
      req.nextUrl.pathname.startsWith('/account/billing') ||
      req.nextUrl.pathname.startsWith('/api/billing')
    ) {
      return null;
    }
    
    // Redirect to subscription page
    return NextResponse.redirect(
      new URL('/account/billing?expired=true', req.url)
    );
  }
  
  // If all checks pass, proceed
  return null;
}

/**
 * Client-side hook to check if user has access
 * This can be used to conditionally render components
 */
export function hasSubscriptionAccess(
  trialEndsAt: Date | string | null, 
  subscriptionStatus: string | null
): boolean {
  // If no trial or subscription requirements, return true
  if (!trialEndsAt && !subscriptionStatus) {
    return true;
  }
  
  // Check if trial is valid
  if (trialEndsAt) {
    const trialEndDate = typeof trialEndsAt === 'string' 
      ? new Date(trialEndsAt) 
      : trialEndsAt;
      
    if (trialEndDate && isTrialValid(trialEndDate)) {
      return true;
    }
  }
  
  // Check if subscription is active
  return subscriptionStatus === 'active';
} 