import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';
import { enforceCommunityRestrictions } from '@/lib/api/community-middleware';

// GET handler for listing events (scoped to user's community)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to access events
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to view events.' }, 
      { status: 403 }
    );
  }
  
  // Ensure user has a community assigned
  if (!session?.user?.communityId) {
    return NextResponse.json(
      { error: 'You are not assigned to a community' },
      { status: 403 }
    );
  }
  
  try {
    // Get events for the user's community only
    const events = await prisma.event.findMany({
      where: {
        communityId: session.user.communityId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new event
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to create events
  const hasPermission = checkPermission(session, UserRole.FACILITATOR);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be at least a facilitator to create events.' }, 
      { status: 403 }
    );
  }
  
  // Ensure user has a community assigned
  if (!session?.user?.communityId) {
    return NextResponse.json(
      { error: 'You are not assigned to a community' },
      { status: 403 }
    );
  }
  
  try {
    const data = await req.json();
    
    // Create the event in the user's community
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        communityId: session.user.communityId,
        createdById: session.user.id
      }
    });
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 