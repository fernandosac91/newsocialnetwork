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

    // Fetch users with PENDING status
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users: pendingUsers,
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending users' },
      { status: 500 }
    );
  }
} 