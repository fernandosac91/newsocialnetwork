import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function POST(
  request: NextRequest,
  { params }: { params: { community: string; circleId: string } }
) {
  try {
    const { community: communityName, circleId } = params;
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to join a circle' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Find the community by name
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
    
    // Check if the circle exists and belongs to the specified community
    const circle = await prisma.circle.findFirst({
      where: { 
        id: circleId,
        communityId: community.id
      }
    });
    
    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found in this community' },
        { status: 404 }
      );
    }
    
    // Check if the user is already a member
    const existingMembership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId,
        },
      },
    });
    
    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this circle' },
        { status: 400 }
      );
    }
    
    // Add the user to the circle
    await prisma.circleMember.create({
      data: {
        circleId,
        userId,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the circle'
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    return NextResponse.json(
      { error: 'Failed to join the circle' },
      { status: 500 }
    );
  }
} 