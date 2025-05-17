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