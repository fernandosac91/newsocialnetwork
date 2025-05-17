import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// This would be replaced with your actual image upload service
// like AWS S3, Cloudinary, etc.
async function uploadImageToStorage(file: File): Promise<string> {
  // In a real implementation, this would upload to a cloud storage service
  // For now, we're just mocking this with a random URL
  const randomId = Math.random().toString(36).substring(2, 15);
  return `https://example.com/uploads/${randomId}/${file.name}`;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to upload images' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageType = formData.get('type') as string;
    const image = formData.get('image') as File;

    if (!image || !imageType) {
      return NextResponse.json(
        { error: 'Image and type are required' },
        { status: 400 }
      );
    }

    if (imageType !== 'profile' && imageType !== 'cover') {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      );
    }

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

    // Upload the image
    const imageUrl = await uploadImageToStorage(image);

    // Update the user's profile
    if (imageType === 'profile') {
      await prisma.user.update({
        where: { id: user.id },
        data: { photo: imageUrl },
      });
    } else {
      // Create profile if it doesn't exist
      if (!user.profile) {
        await prisma.userProfile.create({
          data: {
            userId: user.id,
            coverImage: imageUrl,
          },
        });
      } else {
        await prisma.userProfile.update({
          where: { userId: user.id },
          data: { coverImage: imageUrl },
        });
      }
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 