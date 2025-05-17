import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();
    const { bio, workTitle, location, interests } = data;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare the interests data
    const interestsJson = interests ? JSON.stringify(interests) : null;

    // Update or create the profile
    if (user.profile) {
      // Update existing profile
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          bio,
          workTitle,
          location,
          interests: interestsJson,
        },
      });
    } else {
      // Create new profile
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio,
          workTitle,
          location,
          interests: interestsJson,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 