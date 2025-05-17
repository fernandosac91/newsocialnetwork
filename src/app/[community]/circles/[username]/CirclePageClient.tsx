'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaUsers, FaCalendarAlt, FaComments, FaMapMarkerAlt, FaUserPlus, FaUserMinus } from 'react-icons/fa';

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
  isCurrentUserMember: boolean;
  currentUserId: string | null;
  memberSince: Date | null;
  recentMessages: Message[];
  upcomingEvents: Event[];
};

// Export the component so it can be imported by the page
export default function CirclePageClient({
  circle,
  members,
  totalMembers,
  isCurrentUserMember,
  currentUserId,
  memberSince,
  recentMessages,
  upcomingEvents,
}: CirclePageClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(isCurrentUserMember);

  const handleJoinLeave = async () => {
    if (!currentUserId) {
      setError('You must be logged in to join or leave circles');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isMember
        ? `/api/communities/${circle.community.name}/circles/${circle.username}/leave`
        : `/api/communities/${circle.community.name}/circles/${circle.username}/join`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process your request');
      }
      
      setIsMember(!isMember);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
                  onClick={handleJoinLeave}
                  disabled={loading}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaUserMinus className="mr-2" />
                  {loading ? 'Processing...' : 'Leave Circle'}
                </button>
              ) : (
                <button
                  onClick={handleJoinLeave}
                  disabled={loading}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaUserPlus className="mr-2" />
                  {loading ? 'Processing...' : 'Join Circle'}
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
            <Link href={`/${circle.community.name}/circles/${circle.username}/members`} className="text-sm text-blue-600 hover:text-blue-800">
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
                    <div className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center">
                      {member.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="col-span-1 space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Upcoming Events</h2>
            </div>
            <div className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      href={`/${circle.community.name}/events/${event.id}`}
                      className="block hover:bg-gray-50 p-3 rounded-md transition"
                    >
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <FaCalendarAlt className="inline mr-1" /> 
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.location && (
                        <div className="text-sm text-gray-500 mt-1">
                          <FaMapMarkerAlt className="inline mr-1" /> {event.location}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No upcoming events</div>
              )}
            </div>
          </div>
          
          {/* Recent Messages */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Recent Messages</h2>
            </div>
            <div className="p-6">
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          {message.sender.photo ? (
                            <Image
                              src={message.sender.photo}
                              alt={message.sender.name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              {message.sender.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {message.sender.name}
                          <span className="ml-2 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.sentAt))} ago
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No messages yet</div>
              )}
              
              <div className="mt-4 text-center">
                <Link
                  href={`/${circle.community.name}/circles/${circle.username}/chat`}
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  <FaComments className="mr-1" /> Go to chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 