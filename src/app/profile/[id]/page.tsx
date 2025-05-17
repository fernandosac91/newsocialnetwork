import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AboutSection from '@/components/profile/AboutSection';
import ConnectionsSection from '@/components/profile/ConnectionsSection';
import CirclesSection from '@/components/profile/CirclesSection';
import EventsSection from '@/components/profile/EventsSection';
import ProfilePageClient from './ProfilePageClient';

type ProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params;

  try {
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        community: true,
      },
    });

    if (!user) {
      return notFound();
    }

    // Get the current session to check if this is the current user's profile
    const session = await getServerSession();
    const isOwnProfile = session?.user?.email === user.email;

    // Get friends/connections
    const acceptedFriendships = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: id, status: 'ACCEPTED' },
          { addresseeId: id, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            photo: true,
            role: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            photo: true,
            role: true,
          },
        },
      },
    });

    // Process friend data to get a clean array of connection profiles
    const connections = acceptedFriendships.map((friendship) => 
      friendship.requesterId === id 
        ? friendship.addressee 
        : friendship.requester
    );

    // Get circles the user is a member of
    const circleMemberships = await prisma.circleMember.findMany({
      where: { userId: id },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    const circles = circleMemberships.map((membership) => ({
      id: membership.circle.id,
      name: membership.circle.name,
      description: membership.circle.description,
      memberCount: membership.circle._count.members,
    }));

    // Get events the user is attending or has created
    const attendingEvents = await prisma.eventAttendee.findMany({
      where: { userId: id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            location: true,
            createdById: true,
          },
        },
      },
    });

    const events = attendingEvents.map((attendance) => ({
      id: attendance.event.id,
      title: attendance.event.title,
      description: attendance.event.description,
      date: attendance.event.date,
      location: attendance.event.location,
      isCreator: attendance.event.createdById === id,
    }));

    // Pass all data to the client component
    return (
      <ProfilePageClient 
        user={user}
        isOwnProfile={isOwnProfile}
        connections={connections}
        circles={circles}
        events={events}
      />
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    return notFound();
  }
} 