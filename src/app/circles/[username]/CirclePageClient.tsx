'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaUsers, FaCalendarAlt, FaComments, FaMapMarkerAlt, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { useCommunity } from '@/lib/context/CommunityContext';

type Member = {
  id: string;
  name: string;
  photo?: string;
  role: string;
};

type Message = {
  id: string;
  content: string;
  sentAt: Date;
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
};

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
  _count: {
    members: number;
  };
};

type CirclePageClientProps = {
  circle: Circle;
  members: Member[];
  totalMembers: number;
  isMember: boolean;
  memberSince: Date | null;
  recentMessages: Message[];
  upcomingEvents: Event[];
};

// Export the component so it can be imported by the page
export default function CirclePageClient({
  circle,
  members,
  totalMembers,
  isMember,
  memberSince,
  recentMessages,
  upcomingEvents,
}: CirclePageClientProps) {
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCommunity } = useCommunity();

  // Check if the circle belongs to the selected community
  const isInSelectedCommunity = !selectedCommunity || selectedCommunity.id === circle.communityId;

  // Handle joining a circle
  const handleJoinCircle = async () => {
    if (joining) return;
    
    try {
      setJoining(true);
      setError(null);
      const response = await fetch(`/api/circles/${circle.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join circle');
      }
      
      // Reload the page to show updated membership status
      window.location.reload();
    } catch (error) {
      console.error('Error joining circle:', error);
      setError(error instanceof Error ? error.message : 'Failed to join this circle. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  // Handle leaving a circle
  const handleLeaveCircle = async () => {
    if (leaving) return;
    
    if (!confirm('Are you sure you want to leave this circle?')) {
      return;
    }
    
    try {
      setLeaving(true);
      setError(null);
      const response = await fetch(`/api/circles/${circle.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave circle');
      }
      
      // Reload the page to show updated membership status
      window.location.reload();
    } catch (error) {
      console.error('Error leaving circle:', error);
      setError(error instanceof Error ? error.message : 'Failed to leave this circle. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  if (!isInSelectedCommunity) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow mt-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-700">
            This circle is not in the selected community
          </h2>
          <p className="mt-2 text-gray-500">
            Please switch to the {circle.community.name} community to view this circle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Circle Header */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{circle.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                <FaUsers className="inline mr-1" /> {totalMembers} members · Created {formatDistanceToNow(new Date(circle.createdAt))} ago
              </p>
              <p className="mt-2 text-gray-600">{circle.description}</p>
              
              {/* Community badge */}
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <span className="mr-1">Community:</span> {circle.community.name}
                </span>
              </div>
            </div>
            
            {/* Join/Leave button */}
            <div>
              {isMember ? (
                <button
                  onClick={handleLeaveCircle}
                  disabled={leaving}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaUserMinus className="mr-2" />
                  {leaving ? 'Leaving...' : 'Leave Circle'}
                </button>
              ) : (
                <button
                  onClick={handleJoinCircle}
                  disabled={joining}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaUserPlus className="mr-2" />
                  {joining ? 'Joining...' : 'Join Circle'}
                </button>
              )}
            </div>
          </div>
          
          {/* Member status */}
          {isMember && memberSince && (
            <div className="mt-3 text-sm text-gray-500">
              You've been a member since {formatDistanceToNow(new Date(memberSince))} ago
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members Section */}
        <div className="col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Members</h2>
            <Link href={`/circles/${circle.username}/members`} className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {members.map((member) => (
                <Link key={member.id} href={`/profile/${member.id}`} className="group">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {member.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {totalMembers > members.length && (
              <div className="mt-4 text-center">
                <Link href={`/circles/${circle.username}/members`} className="text-sm text-blue-600 hover:text-blue-800">
                  +{totalMembers - members.length} more members
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* About */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">About</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Created by</span>
                  <Link href={`/profile/${circle.createdBy.id}`} className="flex items-center mt-1 group">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 mr-2">
                      {circle.createdBy.photo ? (
                        <Image
                          src={circle.createdBy.photo}
                          alt={circle.createdBy.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          {circle.createdBy.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {circle.createdBy.name}
                    </span>
                  </Link>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Created</span>
                  <span className="text-sm text-gray-700">
                    {new Date(circle.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Community</span>
                  <span className="text-sm text-gray-700">
                    {circle.community.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">Upcoming Events</h2>
                <Link href="/events" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="block group">
                      <div className="p-3 rounded-md hover:bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{event.title}</h3>
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <FaCalendarAlt className="mr-1" /> {new Date(event.date).toLocaleDateString()}
                        </div>
                        {event.location && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            <FaMapMarkerAlt className="mr-1" /> {event.location}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Messages Section */}
      {isMember && recentMessages.length > 0 && (
        <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Recent Messages</h2>
            <Link href={`/circles/${circle.username}/messages`} className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {message.sender.photo ? (
                        <Image
                          src={message.sender.photo}
                          alt={message.sender.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Link href={`/profile/${message.sender.id}`} className="font-medium text-gray-800 hover:text-blue-600">
                        {message.sender.name}
                      </Link>
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.sentAt))} ago
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 