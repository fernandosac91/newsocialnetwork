import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';
import dynamic from 'next/dynamic';

// Import the CirclePageClient component directly with proper path
import CirclePageClient from './CirclePageClient';

type CirclePageProps = {
  params: {
    community: string;
    username: string;
  };
};

type Member = {
  id: string;
  name: string;
  photo?: string;
  role: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    photo?: string;
  };
};

type Event = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
}

type Circle = {
  id: string;
  name: string;
  username: string;
  description?: string;
  createdAt: Date;
  communityId: string;
  community: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    photo?: string;
  };
};

export default async function CirclePage({ params }: CirclePageProps) {
  try {
    const { community: communityName, username } = params;

    // First get the community
    const community = await prisma.community.findFirst({
      where: { name: { equals: communityName, mode: 'insensitive' } }
    });
    
    if (!community) {
      return notFound();
    }

    // Get circle by username in the specified community
    const circle = await prisma.circle.findFirst({
      where: { 
        username: username,
        communityId: community.id
      },
      include: {
        community: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    if (!circle) {
      return notFound();
    }

    // Get the current session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Check if the current user is a member of this circle
    let isCurrentUserMember = false;
    let memberSince = null;

    if (currentUserId) {
      const membership = await prisma.circleMember.findUnique({
        where: {
          circleId_userId: {
            circleId: circle.id,
            userId: currentUserId,
          },
        },
      });

      isCurrentUserMember = !!membership;
      memberSince = membership?.createdAt || null;
    }

    // Get circle members
    const members = await prisma.circleMember.findMany({
      where: { circleId: circle.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photo: true,
            role: true,
          },
        },
      },
      take: 5, // Limit to 5 members for display
    });

    const totalMembers = await prisma.circleMember.count({
      where: { circleId: circle.id },
    });

    // Get recent messages
    const recentMessages = await prisma.circleMessage.findMany({
      where: { circleId: circle.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        circleId: circle.id,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 3,
    });

    return (
      <CirclePageClient 
        circle={circle as Circle}
        members={members.map(m => m.user as Member)}
        totalMembers={totalMembers}
        isCurrentUserMember={isCurrentUserMember}
        currentUserId={currentUserId || null}
        memberSince={memberSince}
        recentMessages={recentMessages as unknown as Message[]}
        upcomingEvents={upcomingEvents as Event[]}
      />
    );
  } catch (error) {
    console.error('Error loading circle:', error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2 text-gray-600">
          We encountered a problem loading this circle. Please try again later.
        </p>
      </div>
    );
  }
} 