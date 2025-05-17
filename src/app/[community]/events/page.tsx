'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaSearch, FaFilter, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';

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

export default function CommunityEventsPage() {
  const params = useParams();
  const communityName = params.community as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Function to fetch events for the current community
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${communityName}/events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [communityName]);
  
  // Filter events based on search term and filter type
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const currentDate = new Date();
    const eventDate = new Date(event.date);
    
    if (filterType === 'upcoming') {
      return matchesSearch && eventDate >= currentDate;
    } else if (filterType === 'past') {
      return matchesSearch && eventDate < currentDate;
    }
    
    return matchesSearch;
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {communityName} Community Events
        </h1>
        <Link 
          href={`/${communityName}/events/create`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
        >
          <FaCalendarAlt className="mr-2" />
          Create New Event
        </Link>
      </div>
      
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try changing your search or filter settings.'
              : 'Be the first to create an event for this community!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link 
              key={event.id} 
              href={`/${communityName}/events/${event.id}`}
              className="block bg-white overflow-hidden rounded-lg shadow transition-shadow hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FaCalendarAlt className="mr-2" />
                  {format(new Date(event.date), 'PPP p')}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {event.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    {event.location && (
                      <div className="flex items-center mr-4">
                        <FaMapMarkerAlt className="mr-1" />
                        <span className="truncate max-w-[120px]">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      <span>{event._count.attendees} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 