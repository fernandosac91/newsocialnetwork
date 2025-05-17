import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { community: string; circleId: string } }
) {
  try {
    const { community: communityName, circleId } = params;
    
    // Find the community first
    const community = await prisma.community.findFirst({
      where: {
        name: {
          equals: communityName,
          mode: 'insensitive'
        }
      }
    });
    
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Try to find circle by ID
    let circle = await prisma.circle.findFirst({
      where: { 
        id: circleId,
        communityId: community.id
      },
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
    
    // If not found by ID, try by username
    if (!circle) {
      circle = await prisma.circle.findFirst({
        where: { 
          username: circleId,
          communityId: community.id
        },
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
        { error: 'Circle not found in this community' },
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
    
    // Return circle information
    return NextResponse.json({ 
      ...circle,
      isCurrentUserMember,
      memberSince
    });
  } catch (error) {
    console.error('Error fetching circle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the circle' },
      { status: 500 }
    );
  }
} 