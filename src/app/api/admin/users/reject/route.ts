import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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

    // Parse the request body
    const { userId } = await request.json();

    // Validate the request
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user exists and is pending
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'User is not in pending status' },
        { status: 400 }
      );
    }

    // Update the user status to REJECTED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'REJECTED',
      },
    });

    // TODO: Send an email notification to the user about rejection

    return NextResponse.json({
      message: 'User rejected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    );
  }
} 