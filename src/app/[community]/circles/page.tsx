'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaUsers, FaSearch, FaFilter } from 'react-icons/fa';

type Circle = {
  id: string;
  name: string;
  username: string;
  description: string;
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

export default function CommunityCirclesPage() {
  const params = useParams();
  const communityName = params.community as string;
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchCircles() {
      try {
        setLoading(true);
        setError(null);
        
        // Get circles that belong to this community
        const response = await fetch(`/api/communities/${communityName}/circles`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch circles: ${response.status}`);
        }
        
        const data = await response.json();
        setCircles(data);
      } catch (err) {
        console.error('Error fetching circles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load circles');
        
        // Create mock data for development
        setCircles([
          {
            id: '1',
            name: 'Book Club',
            username: 'book-club',
            description: 'A circle for book lovers to discuss and share their favorite reads.',
            communityId: '1',
            community: { id: '1', name: communityName },
            createdBy: { id: '1', name: 'Jane Doe' },
            _count: { members: 24 }
          },
          {
            id: '2',
            name: 'Hiking Enthusiasts',
            username: 'hiking-enthusiasts',
            description: 'Explore nature trails and share hiking experiences in and around the area.',
            communityId: '1',
            community: { id: '1', name: communityName },
            createdBy: { id: '2', name: 'John Smith' },
            _count: { members: 18 }
          },
          {
            id: '3',
            name: 'Gardening Club',
            username: 'gardening-club',
            description: 'Share tips, tricks, and experiences about gardening.',
            communityId: '1',
            community: { id: '1', name: communityName },
            createdBy: { id: '3', name: 'Maria Garcia' },
            _count: { members: 15 }
          },
          {
            id: '4',
            name: 'Tech Meetup',
            username: 'tech-meetup',
            description: 'A group for tech enthusiasts to discuss latest trends and innovations.',
            communityId: '1',
            community: { id: '1', name: communityName },
            createdBy: { id: '4', name: 'Alex Chen' },
            _count: { members: 30 }
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCircles();
  }, [communityName]);

  // Filter circles based on search term
  const filteredCircles = circles.filter(circle => 
    circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Circles in {communityName}</h1>
        
        <Link
          href={`/${communityName}/circles/create`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
        >
          Create Circle
        </Link>
      </div>
      
      {/* Search and filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circles..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FaFilter className="mr-2" />
            Filter
          </button>
          
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Most Members
                </button>
                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Recently Created
                </button>
                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Alphabetical
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading circles...</p>
        </div>
      ) : filteredCircles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCircles.map(circle => (
            <Link 
              key={circle.id} 
              href={`/${communityName}/circles/${circle.username}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{circle.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{circle.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-1" />
                    <span>{circle._count.members} members</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
                      {circle.createdBy.photo ? (
                        <Image
                          src={circle.createdBy.photo}
                          alt={circle.createdBy.name}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                          {circle.createdBy.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Created by {circle.createdBy.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No circles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 
              `No circles match "${searchTerm}". Try a different search term.` : 
              `There are no circles in ${communityName} yet. Be the first to create one!`}
          </p>
          <div className="mt-6">
            <Link
              href={`/${communityName}/circles/create`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create a circle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 