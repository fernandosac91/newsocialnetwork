import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { community: string } }
) {
  try {
    // Get community name from path parameter
    const communityName = params.community;

    // Get session to check authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      // For development/demo purposes, return mock circles if not authenticated
      return NextResponse.json([
        {
          id: '1',
          name: 'Book Club',
          username: 'book-club',
          description: 'A circle for book lovers to discuss and share their favorite reads.',
          communityId: '1',
          community: { id: '1', name: communityName },
          createdBy: { id: '1', name: 'Jane Doe' },
          _count: { members: 24 }
        },
        {
          id: '2',
          name: 'Hiking Enthusiasts',
          username: 'hiking-enthusiasts',
          description: 'Explore nature trails and share hiking experiences in and around the area.',
          communityId: '1',
          community: { id: '1', name: communityName },
          createdBy: { id: '2', name: 'John Smith' },
          _count: { members: 18 }
        },
        {
          id: '3',
          name: 'Gardening Club',
          username: 'gardening-club',
          description: 'Share tips, tricks, and experiences about gardening.',
          communityId: '1',
          community: { id: '1', name: communityName },
          createdBy: { id: '3', name: 'Maria Garcia' },
          _count: { members: 15 }
        },
        {
          id: '4',
          name: 'Tech Meetup',
          username: 'tech-meetup',
          description: 'A group for tech enthusiasts to discuss latest trends and innovations.',
          communityId: '1',
          community: { id: '1', name: communityName },
          createdBy: { id: '4', name: 'Alex Chen' },
          _count: { members: 30 }
        }
      ]);
    }

    // Find the community by name (case insensitive)
    const community = await prisma.community.findFirst({
      where: {
        name: {
          equals: communityName,
          mode: 'insensitive',
        },
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: `Community '${communityName}' not found` },
        { status: 404 }
      );
    }

    // Fetch circles that belong to this community
    const circles = await prisma.circle.findMany({
      where: {
        communityId: community.id,
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(circles);
  } catch (error) {
    console.error('Error fetching community circles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circles for this community' },
      { status: 500 }
    );
  }
} 