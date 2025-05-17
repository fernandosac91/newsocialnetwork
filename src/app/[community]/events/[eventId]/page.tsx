'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUser, FaClock } from 'react-icons/fa';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
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
    attendees: number;
  };
};

export default function EventDetailPage() {
  const params = useParams();
  const communityName = params.community as string;
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/communities/${communityName}/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [communityName, eventId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !event) {
    // In development mode, show a mock event if none is found
    if (process.env.NODE_ENV === 'development' && !event) {
      const mockEvent: Event = {
        id: eventId,
        title: 'Community Meetup',
        description: 'Monthly gathering to discuss community initiatives and plans. Join us for an evening of idea sharing, networking, and community building. All community members are welcome!',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Community Center, Main Street',
        communityId: '1',
        community: {
          id: '1',
          name: communityName,
        },
        createdBy: {
          id: '1',
          name: 'John Smith',
          photo: undefined,
        },
        _count: {
          attendees: 12
        }
      };
      setEvent(mockEvent);
      setError(null);
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading mock event data...</span>
        </div>
      );
    }
    
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error || 'Event not found'}</p>
      </div>
    );
  }
  
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
          
          <div className="flex flex-wrap gap-y-2 text-sm text-gray-500 mb-6">
            <div className="flex items-center mr-6">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              <span>{format(eventDate, 'PP')}</span>
            </div>
            
            <div className="flex items-center mr-6">
              <FaClock className="mr-2 text-blue-500" />
              <span>{format(eventDate, 'p')}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center mr-6">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                <span>{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              <span>{event._count.attendees} attending</span>
            </div>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <FaUser className="mr-2 text-blue-500" />
              <span>Organized by {event.createdBy.name}</span>
            </div>
            
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isPastEvent 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isPastEvent}
            >
              {isPastEvent ? 'Event has ended' : 'RSVP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 