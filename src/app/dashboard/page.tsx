'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaCircle, FaUserFriends, FaBell } from 'react-icons/fa';

type Activity = {
  id: string;
  type: 'friend_request' | 'event_invite' | 'circle_join' | 'system';
  title: string;
  description: string;
  date: Date;
  read: boolean;
};

type UpcomingEvent = {
  id: string;
  title: string;
  date: Date;
  location: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load mock data for the dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      // Mock activities data
      setActivities([
        {
          id: '1',
          type: 'friend_request',
          title: 'New Connection Request',
          description: 'Jane Doe wants to connect with you.',
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
        },
        {
          id: '2',
          type: 'event_invite',
          title: 'Event Invitation',
          description: 'You have been invited to Community Meetup.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
        },
        {
          id: '3',
          type: 'circle_join',
          title: 'Welcome to Tech Enthusiasts',
          description: 'You have been added to the Tech Enthusiasts circle.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
        },
        {
          id: '4',
          type: 'system',
          title: 'Profile Approved',
          description: 'Your profile has been approved by moderators.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: true,
        },
      ]);

      // Mock upcoming events
      setUpcomingEvents([
        {
          id: '1',
          title: 'Community Meetup',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          location: 'Community Center',
        },
        {
          id: '2',
          title: 'Tech Workshop',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          location: 'Virtual (Zoom)',
        },
        {
          id: '3',
          title: 'Networking Event',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
          location: 'Downtown Conference Center',
        },
      ]);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // This will redirect in the useEffect
  }

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) {
      return 'Just now';
    } else if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <FaUserFriends className="h-5 w-5 text-blue-500" />;
      case 'event_invite':
        return <FaCalendarAlt className="h-5 w-5 text-green-500" />;
      case 'circle_join':
        return <FaCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <FaBell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md mt-6 p-6">
        <div className="flex items-center">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={session.user?.photo || '/images/default-avatar.png'}
              alt={session.user?.name || 'User'}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">Welcome back, {session.user?.name || 'User'}</h2>
            <p className="text-blue-100">
              {session.user?.status === 'APPROVED' 
                ? 'Your profile is approved and visible to the community.' 
                : 'Your profile is pending approval.'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`px-6 py-4 ${!activity.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      {!activity.read && (
                        <span className="ml-3 flex-shrink-0 h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-6 py-4 text-gray-500 italic">No recent activity</p>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link 
                href="/notifications" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all activities
              </Link>
            </div>
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <div className="mt-1 text-xs text-gray-500">
                          <p>{formatEventDate(event.date)}</p>
                          <p className="mt-1">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-6 py-4 text-gray-500 italic">No upcoming events</p>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link 
                href="/events" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all events
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <Link 
                  href={`/profile/${session.user?.id}`}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <span className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>My Profile</span>
                </Link>
                <Link 
                  href="/connections"
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <span className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaUserFriends className="h-5 w-5 text-blue-600" />
                  </span>
                  <span>Connections</span>
                </Link>
                <Link 
                  href="/circles"
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <span className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaCircle className="h-5 w-5 text-blue-600" />
                  </span>
                  <span>My Circles</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 