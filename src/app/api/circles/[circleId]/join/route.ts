import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function POST(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const { circleId } = params;
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to join a circle' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if the circle exists
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: { community: true }
    });
    
    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
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
      message: 'Successfully joined the circle',
      note: 'This API endpoint is deprecated. Please use the community-based endpoint instead.',
      newEndpoint: `/api/communities/${circle.community.name}/circles/${circle.id}/join`
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    return NextResponse.json(
      { error: 'Failed to join the circle' },
      { status: 500 }
    );
  }
} 