import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { createBillingPortalSession } from '@/lib/billing/stripe';

// POST handler for creating a billing portal session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }
    
    // Get the return URL from request body
    const { returnUrl } = await req.json();
    
    // Get current user from the database to check Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // User must have a Stripe customer ID to access the billing portal
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'You do not have a billing account yet. Please subscribe first.' },
        { status: 400 }
      );
    }
    
    // Create the billing portal session
    const portalSession = await createBillingPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: returnUrl
    });
    
    // Return the portal URL
    return NextResponse.json({
      url: portalSession.url
    });
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating billing portal session' },
      { status: 500 }
    );
  }
} 