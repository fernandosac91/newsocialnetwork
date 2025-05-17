import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
// In development, we'll create a mock if the key isn't available
const createStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
    // Return a mock object for development
    console.warn('STRIPE_SECRET_KEY not found. Using mock Stripe client for development.');
    return {
      // Add mock methods as needed
      checkout: { sessions: { create: async () => ({ url: '#mock-checkout' }) } },
      customers: { create: async () => ({ id: 'mock_customer_id' }) },
      subscriptions: { 
        create: async () => ({ id: 'mock_subscription_id' }),
        retrieve: async () => ({ status: 'active' })
      }
    } as unknown as Stripe;
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
  });
};

export const stripe = createStripeClient();

// Default trial period in days
export const DEFAULT_TRIAL_PERIOD_DAYS = 30;

// Define your price IDs here (get these from your Stripe Dashboard)
export const PRICE_IDS = {
  MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY || '',
  YEARLY: process.env.STRIPE_PRICE_ID_YEARLY || '',
};

// Get the absolute URL for the application
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in .env
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000/';
  
  // Make sure to include `https://` when not localhost
  url = url.includes('http') ? url : `https://${url}`;
  
  // Make sure to include trailing `/`
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  return url;
}

// Calculate the trial end date from the current date
export function calculateTrialEndDate(): Date {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + DEFAULT_TRIAL_PERIOD_DAYS);
  return trialEnd;
}

// Create a checkout session for subscription
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  mode = 'subscription'
}: {
  customerId?: string;
  priceId: string;
  userId: string;
  mode?: 'subscription' | 'payment';
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: mode,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: userId
    },
    success_url: `${getURL()}account/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getURL()}account/billing?canceled=true`,
  };

  // For existing customers, use their ID
  if (customerId) {
    params.customer = customerId;
  } else {
    // For new customers, let Stripe create a new customer
    params.customer_creation = 'always';
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);
  return checkoutSession;
}

// Create a billing portal session for managing subscription
export async function createBillingPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string;
  returnUrl?: string;
}) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${getURL()}account/billing`,
  });
  
  return portalSession;
}

// Webhook signature verification
export function verifyStripeSignature(
  payload: string | Buffer,
  signature: string | string[] | undefined,
  webhookSecret: string
): boolean {
  try {
    stripe.webhooks.constructEvent(payload, signature || '', webhookSecret);
    return true;
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return false;
  }
}

// Helper for parsing the webhook event after verification
export function parseWebhookEvent(
  payload: string | Buffer,
  signature: string | string[] | undefined,
  webhookSecret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(payload, signature || '', webhookSecret);
  } catch (err) {
    console.error('Stripe webhook parsing failed:', err);
    return null;
  }
} 