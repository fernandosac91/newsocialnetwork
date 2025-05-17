import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';
import { enforceCommunityRestrictions } from '@/lib/api/community-middleware';

// GET handler for fetching a specific event with details
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to view events
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to view event details.' }, 
      { status: 403 }
    );
  }
  
  // Verify community restrictions
  const restrictionCheck = await enforceCommunityRestrictions(req, 'event', params.eventId);
  if (restrictionCheck) return restrictionCheck;
  
  try {
    // Get event details
    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
            role: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true,
                role: true
              }
            }
          }
        },
        community: {
          select: {
            id: true,
            name: true
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
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
} 