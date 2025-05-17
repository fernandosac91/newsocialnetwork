import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, UserStatus, canModerateUsers } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';

// GET handler for listing users with PENDING status
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission (MODERATOR or ADMIN)
  if (!canModerateUsers(session)) {
    return NextResponse.json(
      { error: 'Unauthorized. Only moderators and administrators can access this resource.' }, 
      { status: 403 }
    );
  }
  
  try {
    // Filter users by community if the logged-in user isn't an ADMIN
    // ADMINs can see all pending users across all communities
    const communityFilter = session?.user?.role !== UserRole.ADMIN && session?.user?.communityId
      ? { communityId: session.user.communityId }
      : {};
    
    // Get all users with PENDING status
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: UserStatus.PENDING,
        ...communityFilter
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        role: true,
        status: true,
        communityId: true,
        createdAt: true,
        community: {
          select: {
            id: true,
            name: true
          }
        },
        profile: {
          select: {
            bio: true,
            workTitle: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending users' },
      { status: 500 }
    );
  }
} 