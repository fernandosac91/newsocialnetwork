import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, UserStatus } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';
import { createCheckoutSession, PRICE_IDS } from '@/lib/billing/stripe';

// POST handler for creating a checkout session
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
    
    // Check if user is approved
    if (session.user.status !== UserStatus.APPROVED) {
      return NextResponse.json(
        { error: 'Your account must be approved before subscribing' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { priceId, returnUrl } = await req.json();
    
    // Validate price ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    if (!Object.values(PRICE_IDS).includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }
    
    // Get current user from the database to check stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionStatus: true,
        trialEndsAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: user.stripeCustomerId || undefined,
      priceId,
      userId: user.id
    });
    
    // Return the checkout URL
    return NextResponse.json({
      sessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 