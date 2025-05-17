import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';

type CirclePageProps = {
  params: {
    username: string;
  };
};

export default async function CirclePage({ params }: CirclePageProps) {
  // Get the username from params
  const { username } = params;

  try {
    // Find the circle by username
    const circle = await prisma.circle.findUnique({
      where: { username },
      include: {
        community: true,
      },
    });

    if (!circle) {
      // Circle not found
      return redirect('/circles'); // Redirect to circles index
    }

    // Get the community name
    const communityName = circle.community.name;

    // Redirect to the new URL pattern
    return redirect(`/${communityName}/circles/${username}`);
  } catch (error) {
    console.error('Error in circle page redirect:', error);
    return redirect('/circles'); // Redirect to circles index on error
  }
} 