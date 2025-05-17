'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserPlus, FaSearch, FaFilter, FaUserFriends, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

type Connection = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'connected' | 'pending' | 'suggested';
  photo?: string;
  mutualConnections?: number;
};

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Sample data - in a real app, you would fetch this from an API
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setConnections([
        {
          id: '1',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'MEMBER',
          status: 'connected',
          photo: 'https://randomuser.me/api/portraits/women/23.jpg',
          mutualConnections: 12,
        },
        {
          id: '2',
          name: 'Robert Johnson',
          email: 'robert.johnson@example.com',
          role: 'MEMBER',
          status: 'connected',
          photo: 'https://randomuser.me/api/portraits/men/41.jpg',
          mutualConnections: 8,
        },
        {
          id: '3',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          role: 'FACILITATOR',
          status: 'pending',
          photo: 'https://randomuser.me/api/portraits/women/45.jpg',
          mutualConnections: 3,
        },
        {
          id: '4',
          name: 'Michael Wilson',
          email: 'michael.wilson@example.com',
          role: 'MEMBER',
          status: 'pending',
          photo: 'https://randomuser.me/api/portraits/men/33.jpg',
          mutualConnections: 5,
        },
        {
          id: '5',
          name: 'Sarah Thompson',
          email: 'sarah.thompson@example.com',
          role: 'MEMBER',
          status: 'suggested',
          photo: 'https://randomuser.me/api/portraits/women/67.jpg',
          mutualConnections: 15,
        },
        {
          id: '6',
          name: 'David Brown',
          email: 'david.brown@example.com',
          role: 'MODERATOR',
          status: 'suggested',
          photo: 'https://randomuser.me/api/portraits/men/85.jpg',
          mutualConnections: 7,
        },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter connections based on search query and filter type
  const filteredConnections = connections
    .filter(connection => 
      connection.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      connection.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(connection => {
      if (filter === 'all') return true;
      if (filter === 'connected' && connection.status === 'connected') return true;
      if (filter === 'pending' && connection.status === 'pending') return true;
      if (filter === 'suggested' && connection.status === 'suggested') return true;
      return false;
    });

  const handleAccept = (id: string) => {
    setConnections(connections.map(connection => 
      connection.id === id ? {...connection, status: 'connected'} : connection
    ));
  };

  const handleReject = (id: string) => {
    setConnections(connections.filter(connection => connection.id !== id));
  };

  const handleConnect = (id: string) => {
    setConnections(connections.map(connection => 
      connection.id === id ? {...connection, status: 'pending'} : connection
    ));
  };

  const renderActionButtons = (connection: Connection) => {
    switch (connection.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(connection.id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
            >
              <FaCheckCircle className="mr-1" /> Accept
            </button>
            <button
              onClick={() => handleReject(connection.id)}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaTimesCircle className="mr-1" /> Reject
            </button>
          </div>
        );
      case 'suggested':
        return (
          <button
            onClick={() => handleConnect(connection.id)}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaUserPlus className="mr-1" /> Connect
          </button>
        );
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-800 bg-green-100">
            <FaCheckCircle className="mr-1" /> Connected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connections</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Connections</option>
                <option value="connected">Connected</option>
                <option value="pending">Pending</option>
                <option value="suggested">Suggested</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <FaUserFriends className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No connections found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredConnections.map((connection) => (
                <li key={connection.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 relative rounded-full overflow-hidden">
                          {connection.photo ? (
                            <Image
                              src={connection.photo}
                              alt={connection.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 48px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUserFriends className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link href={`/profile/${connection.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {connection.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            <span>{connection.email}</span>
                            {connection.role === 'FACILITATOR' && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Facilitator
                              </span>
                            )}
                            {connection.role === 'MODERATOR' && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Moderator
                              </span>
                            )}
                          </div>
                          {connection.mutualConnections && (
                            <div className="text-xs text-gray-500 mt-1">
                              <FaUserFriends className="inline-block mr-1 h-3 w-3" />
                              {connection.mutualConnections} mutual connections
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        {renderActionButtons(connection)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 