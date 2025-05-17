import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { parseWebhookEvent } from '@/lib/billing/stripe';
import prisma from '@/lib/db/prisma';
import Stripe from 'stripe';

// Function to send trial will end notification
async function sendTrialEndingEmail(email: string, name: string | null, daysRemaining: number) {
  console.log(`📧 MOCK EMAIL: Trial ending notification to ${email}`);
  console.log(`Subject: Your Trial Period is Ending Soon`);
  console.log(`
    Hello ${name || 'there'},
    
    Your 30-day trial period is ending in ${daysRemaining} days.
    
    To continue using all features, please subscribe to one of our plans.
    
    Visit your account page to manage your subscription.
    
    Best regards,
    The Platform Team
  `);
  
  // In a real app, you would send an actual email here
}

// POST handler for Stripe webhooks
export async function POST(req: NextRequest) {
  // Get the raw request body as a buffer
  const payload = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');
  
  // Verify the webhook signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' }, 
      { status: 500 }
    );
  }
  
  if (!signature) {
    console.error('Stripe signature is missing from the request');
    return NextResponse.json(
      { error: 'Webhook signature missing' }, 
      { status: 400 }
    );
  }
  
  // Parse the webhook event
  const event = parseWebhookEvent(payload, signature, webhookSecret);
  
  if (!event) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' }, 
      { status: 400 }
    );
  }
  
  try {
    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' }, 
      { status: 500 }
    );
  }
}

// Handler for subscription.created event
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find the user associated with this customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });
  
  if (!user) {
    console.error(`No user found for Stripe customer ID: ${customerId}`);
    return;
  }
  
  // Update the user's subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: subscription.status
    }
  });
}

// Handler for subscription.updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find the user associated with this customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });
  
  if (!user) {
    console.error(`No user found for Stripe customer ID: ${customerId}`);
    return;
  }
  
  // Update the user's subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: subscription.status
    }
  });
}

// Handler for subscription.deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find the user associated with this customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });
  
  if (!user) {
    console.error(`No user found for Stripe customer ID: ${customerId}`);
    return;
  }
  
  // Update the user's subscription status to inactive
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'inactive'
    }
  });
}

// Handler for invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only process subscription invoices
  if (invoice.subscription && typeof invoice.customer === 'string') {
    const customerId = invoice.customer;
    
    // Find the user associated with this customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });
    
    if (!user) {
      console.error(`No user found for Stripe customer ID: ${customerId}`);
      return;
    }
    
    // Update the user's subscription status to active
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: 'active'
      }
    });
  }
}

// Handler for invoice.payment_failed event
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Only process subscription invoices
  if (invoice.subscription && typeof invoice.customer === 'string') {
    const customerId = invoice.customer;
    
    // Find the user associated with this customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });
    
    if (!user) {
      console.error(`No user found for Stripe customer ID: ${customerId}`);
      return;
    }
    
    // Update the user's subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: 'past_due'
      }
    });
    
    // Here you would typically send an email to the user about the failed payment
  }
}

// Handler for trial_will_end event
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find the user associated with this customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });
  
  if (!user) {
    console.error(`No user found for Stripe customer ID: ${customerId}`);
    return;
  }
  
  // Calculate days remaining in trial
  const trialEnd = subscription.trial_end;
  if (!trialEnd) return;
  
  const now = Math.floor(Date.now() / 1000);
  const daysRemaining = Math.ceil((trialEnd - now) / (60 * 60 * 24));
  
  // Notify user about trial ending
  if (user.email) {
    await sendTrialEndingEmail(user.email, user.name, daysRemaining);
  }
} 