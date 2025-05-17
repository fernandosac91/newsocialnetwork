import prisma from '@/lib/db/prisma';
import { calculateTrialEndDate, DEFAULT_TRIAL_PERIOD_DAYS } from './stripe';

/**
 * Initialize a new user's trial period
 * This should be called when a new user registers
 */
export async function initializeUserTrial(userId: string): Promise<void> {
  try {
    // Calculate trial end date (30 days from now)
    const trialEndDate = calculateTrialEndDate();
    
    // Update user with trial end date
    await prisma.user.update({
      where: { id: userId },
      data: {
        trialEndsAt: trialEndDate
      }
    });
    
    console.log(`Trial period initialized for user ${userId}, ends on ${trialEndDate.toISOString()}`);
  } catch (error) {
    console.error('Error initializing user trial:', error);
    throw error;
  }
}

/**
 * Check if a user's trial is still valid
 */
export function isTrialValid(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  
  const now = new Date();
  return trialEndsAt > now;
}

/**
 * Calculate remaining trial days
 * @returns Number of days remaining, or 0 if trial has expired
 */
export function getRemainingTrialDays(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  
  const now = new Date();
  
  // If trial has already ended, return 0
  if (trialEndsAt <= now) return 0;
  
  // Calculate days difference
  const diffTime = trialEndsAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get trial status information for a user
 */
export async function getUserTrialInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trialEndsAt: true,
      stripeSubscriptionStatus: true
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isOnTrial = isTrialValid(user.trialEndsAt);
  const trialDaysRemaining = getRemainingTrialDays(user.trialEndsAt);
  const hasActiveSubscription = user.stripeSubscriptionStatus === 'active';
  
  return {
    isOnTrial,
    trialDaysRemaining,
    trialEndsAt: user.trialEndsAt,
    hasActiveSubscription,
    subscriptionStatus: user.stripeSubscriptionStatus
  };
} 