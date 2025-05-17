import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';
import { enforceCommunityRestrictions } from '@/lib/api/community-middleware';

// POST handler for joining an event
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to join events (MEMBER or higher)
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission || !session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to join events.' }, 
      { status: 403 }
    );
  }
  
  // Verify community restrictions
  const restrictionCheck = await enforceCommunityRestrictions(req, 'event', params.eventId);
  if (restrictionCheck) return restrictionCheck;
  
  try {
    const userId = session.user.id;
    
    // Check if user is already attending this event
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: params.eventId,
          userId: userId
        }
      }
    });
    
    if (existingAttendee) {
      return NextResponse.json(
        { message: 'You are already attending this event' },
        { status: 200 }
      );
    }
    
    // Add user as an attendee
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: params.eventId,
        userId: userId
      }
    });
    
    // Create notification for event creator (optional)
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { createdById: true, title: true }
    });
    
    if (event && event.createdById !== userId) {
      await prisma.notification.create({
        data: {
          userId: event.createdById,
          type: 'EVENT_INVITE',
          referenceId: params.eventId,
          read: false
        }
      });
    }
    
    return NextResponse.json(
      { message: `Successfully joined event` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
} 