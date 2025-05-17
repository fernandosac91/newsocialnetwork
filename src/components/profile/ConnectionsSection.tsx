import { FaUser, FaUsers } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

type Friend = {
  id: string;
  name: string | null;
  photo: string | null;
  role: string;
};

type ConnectionsSectionProps = {
  connections: Friend[];
  totalCount: number;
};

export default function ConnectionsSection({ connections, totalCount }: ConnectionsSectionProps) {
  // We'll show a limited number of connections in the profile page
  const displayedConnections = connections.slice(0, 6);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FaUsers className="text-blue-600" size={18} />
          <h2 className="text-xl font-bold">Connections</h2>
          <span className="text-gray-500 text-sm">({totalCount})</span>
        </div>
        <Link 
          href="/connections" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          See All
        </Link>
      </div>

      {displayedConnections.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayedConnections.map((friend) => (
            <Link 
              href={`/profile/${friend.id}`} 
              key={friend.id} 
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                {friend.photo ? (
                  <Image 
                    src={friend.photo} 
                    alt={`${friend.name || 'User'}'s profile`} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FaUser className="text-gray-400" size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{friend.name || 'Unnamed User'}</p>
                <p className="text-xs text-gray-500">{friend.role}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No connections yet</p>
      )}

      {totalCount > displayedConnections.length && (
        <div className="mt-4 text-center">
          <Link 
            href="/connections" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View all {totalCount} connections
          </Link>
        </div>
      )}
    </div>
  );
} 