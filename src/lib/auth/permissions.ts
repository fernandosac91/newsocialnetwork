import { Session } from 'next-auth';

// Define the role hierarchy (higher roles include permissions of lower roles)
export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  FACILITATOR = 'FACILITATOR',
  MEMBER = 'MEMBER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Role hierarchy - each role includes permissions of all roles below it
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 30,
  [UserRole.MODERATOR]: 20,
  [UserRole.FACILITATOR]: 10,
  [UserRole.MEMBER]: 0,
};

// Check if a user has the required role or higher
export function hasRole(userRole: UserRole | undefined | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Check if a user has the required status
export function hasStatus(userStatus: UserStatus | undefined | null, requiredStatus: UserStatus): boolean {
  if (!userStatus) return false;
  return userStatus === requiredStatus;
}

// Check if a user has a valid subscription
export function hasValidSubscription(
  trialEndsAt: Date | string | undefined | null, 
  subscriptionStatus: string | undefined | null
): boolean {
  // If user has no trial or subscription requirements, return true
  if (!trialEndsAt && !subscriptionStatus) {
    return true;
  }
  
  // Check if trial is still valid
  if (trialEndsAt) {
    const trialEndDate = typeof trialEndsAt === 'string' 
      ? new Date(trialEndsAt) 
      : trialEndsAt;
      
    if (trialEndDate && trialEndDate > new Date()) {
      return true;
    }
  }
  
  // Check if subscription is active
  return subscriptionStatus === 'active';
}

// Permission check for admin actions
export function canModerateUsers(session: Session | null): boolean {
  if (!session?.user?.role) return false;
  return hasRole(session.user.role as UserRole, UserRole.MODERATOR);
}

// Permission check for creating events and circles
export function canCreateContent(session: Session | null): boolean {
  if (!session?.user?.role) return false;
  return hasRole(session.user.role as UserRole, UserRole.FACILITATOR);
}

// Permission check for accessing member content
export function canAccessMemberContent(session: Session | null): boolean {
  if (!session?.user?.role || !session?.user?.status) return false;
  
  return (
    hasRole(session.user.role as UserRole, UserRole.MEMBER) &&
    hasStatus(session.user.status as UserStatus, UserStatus.APPROVED) &&
    hasValidSubscription(session.user.trialEndsAt, session.user.stripeSubscriptionStatus)
  );
}

// Permission check for admin dashboard
export function canAccessAdminDashboard(session: Session | null): boolean {
  if (!session?.user?.role) return false;
  return hasRole(session.user.role as UserRole, UserRole.ADMIN);
}

// A more generic permission checker that can be used for different actions
export function checkPermission(
  session: Session | null,
  requiredRole: UserRole,
  requireApproved: boolean = true,
  requireValidSubscription: boolean = true
): boolean {
  if (!session?.user) return false;
  
  // Check role
  const hasRequiredRole = hasRole(session.user.role as UserRole, requiredRole);
  if (!hasRequiredRole) return false;
  
  // Check approval status if required
  if (requireApproved) {
    const isApproved = hasStatus(session.user.status as UserStatus, UserStatus.APPROVED);
    if (!isApproved) return false;
  }
  
  // Check subscription if required
  if (requireValidSubscription) {
    const validSubscription = hasValidSubscription(
      session.user.trialEndsAt, 
      session.user.stripeSubscriptionStatus
    );
    if (!validSubscription) return false;
  }
  
  return true;
} 