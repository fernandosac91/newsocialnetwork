import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // For development/demo: provide default communities even when not authenticated
      return NextResponse.json([
        {
          id: '1',
          name: 'Bonn',
          description: 'City of Bonn community',
          _count: { users: 25, events: 10, circles: 8 }
        },
        {
          id: '2',
          name: 'Cologne',
          description: 'City of Cologne community',
          _count: { users: 32, events: 15, circles: 10 }
        },
        {
          id: '3',
          name: 'Dusseldorf',
          description: 'City of Dusseldorf community',
          _count: { users: 28, events: 12, circles: 9 }
        }
      ]);
    }
    
    // Get all communities
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            users: true,
            events: true,
            circles: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
} 