import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { community: string } }
) {
  try {
    const { community: communityName } = params;
    
    // Get user session
    const session = await getServerSession(authOptions);

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
      if (!session?.user) {
        // For development/demo purposes, return mock data if not authenticated
        return NextResponse.json([
          {
            id: '1',
            title: 'Community Meetup',
            description: 'Monthly gathering to discuss community initiatives and plans.',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Community Center, Main Street',
            communityId: '1',
            community: {
              id: '1',
              name: communityName,
            },
            createdBy: {
              id: '1',
              name: 'John Smith',
              photo: null,
            },
            _count: {
              attendees: 12
            }
          },
          {
            id: '2',
            title: 'Volunteer Day',
            description: 'Help clean up the local park and plant new trees.',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'City Park',
            communityId: '1',
            community: {
              id: '1',
              name: communityName,
            },
            createdBy: {
              id: '2',
              name: 'Sarah Johnson',
              photo: null,
            },
            _count: {
              attendees: 8
            }
          },
          {
            id: '3',
            title: 'Workshop: Urban Gardening',
            description: 'Learn how to grow your own food in small urban spaces.',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Community Garden',
            communityId: '1',
            community: {
              id: '1',
              name: communityName,
            },
            createdBy: {
              id: '3',
              name: 'Maria Rodriguez',
              photo: null,
            },
            _count: {
              attendees: 15
            }
          }
        ]);
      }
      
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Get all events for this community
    const events = await prisma.event.findMany({
      where: {
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
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching community events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { community: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create an event' },
        { status: 401 }
      );
    }
    
    const { community: communityName } = params;
    
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
    
    // Parse request body
    const body = await request.json();
    const { title, description, date, location } = body;
    
    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: 'Title, description, and date are required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, if we're in development mode without real auth
    let userId = session.user.id;
    if (!userId && process.env.NODE_ENV === 'development') {
      // Create a mock user for development
      userId = 'mock-user-id';
    }
    
    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        community: {
          connect: { id: community.id }
        },
        createdBy: {
          connect: { id: userId }
        },
        // Automatically make the creator an attendee
        attendees: {
          create: [
            { userId }
          ]
        }
      }
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 