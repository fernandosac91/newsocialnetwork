import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { circleId } = params;
    
    // First try by ID
    let circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        community: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
    
    // If not found, try by username
    if (!circle) {
      circle = await prisma.circle.findUnique({
        where: { username: circleId },
        include: {
          community: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
          _count: {
            select: { members: true },
          },
        },
      });
    }
    
    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      );
    }
    
    // Get the current session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Check if the current user is a member of this circle
    let isCurrentUserMember = false;
    let memberSince = null;

    if (currentUserId) {
      const membership = await prisma.circleMember.findUnique({
        where: {
          circleId_userId: {
            circleId: circle.id,
            userId: currentUserId,
          },
        },
      });

      isCurrentUserMember = !!membership;
      memberSince = membership?.createdAt || null;
    }
    
    // Return circle information with a note about deprecation
    return NextResponse.json({ 
      ...circle,
      isCurrentUserMember,
      memberSince,
      note: 'This API endpoint is deprecated. Please use the community-based endpoint instead.',
      newEndpoint: `/api/communities/${circle.community.name}/circles/${circle.id}`
    });
  } catch (error) {
    console.error('Error fetching circle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the circle' },
      { status: 500 }
    );
  }
} 