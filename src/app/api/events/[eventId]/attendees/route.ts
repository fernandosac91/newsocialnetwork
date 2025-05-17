import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';
import { enforceCommunityRestrictions, validateSameCommunity } from '@/lib/api/community-middleware';

// GET handler for listing event attendees
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to view events
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to view event attendees.' }, 
      { status: 403 }
    );
  }
  
  // Verify community restrictions
  const restrictionCheck = await enforceCommunityRestrictions(req, 'event', params.eventId);
  if (restrictionCheck) return restrictionCheck;
  
  try {
    // Get attendees for the specified event
    const attendees = await prisma.eventAttendee.findMany({
      where: {
        eventId: params.eventId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true
          }
        }
      }
    });
    
    return NextResponse.json(attendees);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}

// POST handler for adding attendees to an event
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to manage events
  // Event creators or facilitators+ can add attendees
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to join events.' }, 
      { status: 403 }
    );
  }
  
  // Verify community restrictions
  const restrictionCheck = await enforceCommunityRestrictions(req, 'event', params.eventId);
  if (restrictionCheck) return restrictionCheck;
  
  try {
    const { userId } = await req.json();
    
    // If adding someone other than yourself, check creator permissions
    if (userId !== session?.user?.id) {
      // Check if user is the event creator or has facilitator+ role
      const event = await prisma.event.findUnique({
        where: { id: params.eventId },
        select: { createdById: true }
      });
      
      const isCreator = event?.createdById === session?.user?.id;
      const isFacilitator = checkPermission(session, UserRole.FACILITATOR);
      
      if (!isCreator && !isFacilitator) {
        return NextResponse.json(
          { error: 'You can only add yourself to this event, not other users.' },
          { status: 403 }
        );
      }
      
      // Verify the user being added is in the same community
      if (session && session.user) {
        const inSameCommunity = await validateSameCommunity(session.user.id, userId);
        
        if (!inSameCommunity) {
          return NextResponse.json(
            { error: 'Cannot add users from different communities to an event.' },
            { status: 403 }
          );
        }
      }
    }
    
    // Add the attendee
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: params.eventId,
        userId: userId
      }
    });
    
    return NextResponse.json(attendee, { status: 201 });
  } catch (error: any) {
    console.error('Error adding attendee to event:', error);
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This user is already an attendee of this event' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add attendee to event' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing attendees from an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  // Check if user has permission
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized access' }, 
      { status: 403 }
    );
  }
  
  // Verify community restrictions
  const restrictionCheck = await enforceCommunityRestrictions(req, 'event', params.eventId);
  if (restrictionCheck) return restrictionCheck;
  
  try {
    // Users can remove themselves, but only facilitators+ or the event creator can remove others
    if (userId !== session?.user?.id) {
      // Check if user is the event creator or has facilitator+ role
      const event = await prisma.event.findUnique({
        where: { id: params.eventId },
        select: { createdById: true }
      });
      
      const isCreator = event?.createdById === session?.user?.id;
      const isFacilitator = checkPermission(session, UserRole.FACILITATOR);
      
      if (!isCreator && !isFacilitator) {
        return NextResponse.json(
          { error: 'You can only remove yourself from this event, not other users.' },
          { status: 403 }
        );
      }
    }
    
    // Remove the attendee
    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: params.eventId,
          userId: userId
        }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing attendee from event:', error);
    return NextResponse.json(
      { error: 'Failed to remove attendee from event' },
      { status: 500 }
    );
  }
} 