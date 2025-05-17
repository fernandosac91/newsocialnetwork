import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  isCreator: boolean;
};

type EventsSectionProps = {
  events: Event[];
  totalCount: number;
};

export default function EventsSection({ events, totalCount }: EventsSectionProps) {
  // We'll show a limited number of events in the profile page
  const displayedEvents = events.slice(0, 3);

  // Helper for formatting dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" size={16} />
          <h2 className="text-xl font-bold">Events</h2>
          <span className="text-gray-500 text-sm">({totalCount})</span>
        </div>
        <Link 
          href="/events" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          See All
        </Link>
      </div>

      {displayedEvents.length > 0 ? (
        <div className="space-y-4">
          {displayedEvents.map((event) => (
            <Link 
              href={`/events/${event.id}`} 
              key={event.id} 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{event.title}</h3>
                {event.isCreator && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Organizer
                  </span>
                )}
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" size={12} />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center">
                  <FaClock className="mr-1" size={12} />
                  <span>{formatTime(event.date)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" size={12} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">Not attending any events yet</p>
      )}

      {totalCount > displayedEvents.length && (
        <div className="mt-4 text-center">
          <Link 
            href="/events" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View all {totalCount} events
          </Link>
        </div>
      )}
    </div>
  );
} 