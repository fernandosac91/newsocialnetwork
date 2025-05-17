import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Fetch user statistics
    const [
      totalUsers,
      pendingApprovals,
      activeUsers,
      totalEvents,
      totalCircles
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count(),
      prisma.circle.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      pendingApprovals,
      activeUsers,
      totalEvents,
      totalCircles
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 