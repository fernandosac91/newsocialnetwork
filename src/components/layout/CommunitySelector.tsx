'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaBuilding, FaGlobeAmericas } from 'react-icons/fa';
import { useCommunity } from '@/lib/context/CommunityContext';

export default function CommunitySelector() {
  const { communities, selectedCommunity, setSelectedCommunity, loading } = useCommunity();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle community selection
  const handleCommunityChange = (communityId: string) => {
    const community = communities.find(c => c.id === communityId);
    if (community) {
      setSelectedCommunity(community);
    }
    setIsOpen(false);
  };

  // Render all communities option
  const renderAllCommunities = () => (
    <button
      onClick={() => {
        setSelectedCommunity(null);
        setIsOpen(false);
      }}
      className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 ${
        !selectedCommunity ? 'bg-blue-50 text-blue-700' : ''
      }`}
    >
      <FaGlobeAmericas className="mr-2" />
      <span>All Communities</span>
    </button>
  );

  if (loading) {
    return (
      <div className="relative w-48 h-9 px-3 py-2 text-sm bg-gray-100 rounded-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (communities.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {selectedCommunity ? (
            <>
              <FaBuilding className="mr-2 text-gray-500" />
              <span>{selectedCommunity.name}</span>
            </>
          ) : (
            <>
              <FaGlobeAmericas className="mr-2 text-gray-500" />
              <span>All Communities</span>
            </>
          )}
        </div>
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {renderAllCommunities()}
            {communities.map((community) => (
              <button
                key={community.id}
                onClick={() => handleCommunityChange(community.id)}
                className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 ${
                  selectedCommunity?.id === community.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <FaBuilding className="mr-2" />
                <div>
                  <span className="block">{community.name}</span>
                  {community._count && (
                    <span className="block text-xs text-gray-500">
                      {community._count.users} users, {community._count.events} events
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 