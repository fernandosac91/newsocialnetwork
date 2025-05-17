import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { community: string; eventId: string } }
) {
  try {
    const { community: communityName, eventId } = params;
    
    // Get user session
    const session = await getServerSession(authOptions);

    // If not authenticated, return mock data for development
    if (!session?.user) {
      // Generate predictable mock data based on IDs to ensure consistency
      return NextResponse.json({
        id: eventId,
        title: `Event ${eventId}`,
        description: `This is a detailed description for the event in ${communityName}. This is mock data shown because you're not authenticated. In a production environment, you would need to log in to see actual event details.`,
        date: new Date(Date.now() + parseInt(eventId) * 24 * 60 * 60 * 1000).toISOString(),
        location: `${communityName} Community Center`,
        communityId: '1',
        community: {
          id: '1',
          name: communityName,
        },
        createdBy: {
          id: '1',
          name: 'John Doe',
          photo: undefined,
        },
        _count: {
          attendees: 10 + parseInt(eventId)
        }
      });
    }
    
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
    
    // Find the specific event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        communityId: community.id
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            photo: true,
          }
        },
        _count: {
          select: { 
            attendees: true 
          }
        }
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 