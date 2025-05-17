import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * Middleware to enforce community access restrictions
 * This ensures users can only access events and circles within their own community
 */
export async function enforceCommunityRestrictions(
  req: NextRequest | Request,
  entityType: 'event' | 'circle',
  entityId?: string
) {
  // Get the current user's session
  const session = await getServerSession(authOptions);
  
  // If no authenticated user, deny access
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }
  
  // If no community assigned to user, deny access
  if (!session.user.communityId) {
    return NextResponse.json(
      { error: 'You are not assigned to a community' },
      { status: 403 }
    );
  }
  
  // If entityId is provided, verify the entity belongs to user's community
  if (entityId) {
    try {
      let entity;
      
      if (entityType === 'event') {
        entity = await prisma.event.findUnique({
          where: { id: entityId },
          select: { communityId: true }
        });
      } else if (entityType === 'circle') {
        entity = await prisma.circle.findUnique({
          where: { id: entityId },
          select: { communityId: true }
        });
      }
      
      // If entity doesn't exist or belongs to a different community, deny access
      if (!entity || entity.communityId !== session.user.communityId) {
        return NextResponse.json(
          { error: `The ${entityType} does not exist or you don't have access to it` },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error(`Error verifying ${entityType} community access:`, error);
      return NextResponse.json(
        { error: 'An error occurred while verifying access' },
        { status: 500 }
      );
    }
  }
  
  // If all checks pass, allow the request to proceed
  return null;
}

/**
 * Helper function to validate that a user belongs to the same community
 * Used for adding members to circles or attendees to events
 */
export async function validateSameCommunity(
  userId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: [userId, targetUserId] }
      },
      select: {
        id: true,
        communityId: true
      }
    });
    
    if (users.length !== 2) return false;
    
    const [user1, user2] = users;
    
    // Both users must have a communityId and they must match
    return (
      Boolean(user1.communityId) && 
      Boolean(user2.communityId) && 
      user1.communityId === user2.communityId
    );
  } catch (error) {
    console.error('Error validating users are in same community:', error);
    return false;
  }
} 