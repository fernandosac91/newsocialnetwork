'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define the Community type
export type Community = {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  logo?: string;
};

// Define the context value type
type CommunityContextType = {
  communities: Community[];
  selectedCommunity: Community | null;
  setSelectedCommunity: (community: Community) => void;
  loading: boolean;
  error: string | null;
};

// Create the context with default values
const CommunityContext = createContext<CommunityContextType>({
  communities: [],
  selectedCommunity: null,
  setSelectedCommunity: () => {},
  loading: true,
  error: null,
});

// Create a provider component
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Extract community name from the URL path if available
  const getCommunityFromPath = (): string | null => {
    const parts = pathname.split('/');
    // First part will be empty because pathname starts with /
    if (parts.length > 1 && parts[1] !== '' && !['api', 'auth', 'admin', 'dashboard', 'profile', 'messages', 'notifications', 'circles', 'events', 'connections'].includes(parts[1])) {
      return parts[1];
    }
    return null;
  };

  // Navigate to the corresponding page in the selected community
  const navigateToCorrespondingPageInCommunity = (community: Community) => {
    // If we're in a feature page like circles, events, etc.
    const currentPath = pathname;
    
    if (currentPath.includes('/circles/')) {
      // Currently on a specific circle page - redirect to community circles
      router.push(`/${community.name}/circles`);
    } else if (currentPath.includes('/events/')) {
      // Currently on a specific event page - redirect to community events
      router.push(`/${community.name}/events`);
    } else if (currentPath.includes('/circles')) {
      router.push(`/${community.name}/circles`);
    } else if (currentPath.includes('/events')) {
      router.push(`/${community.name}/events`);
    } else {
      // If we're not in a feature page, just redirect to the community home
      router.push(`/${community.name}`);
    }
  };

  // Fetch all communities when the component mounts
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/communities');
        
        // If API fails or returns error, use default communities
        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }
        
        const data = await response.json();
        setCommunities(data);
        
        // Check if we have a community in the URL
        const communityName = getCommunityFromPath();
        if (communityName) {
          const communityFromUrl = data.find(
            (c: Community) => c.name.toLowerCase() === communityName.toLowerCase()
          );
          
          if (communityFromUrl) {
            setSelectedCommunity(communityFromUrl);
          } else if (data.length > 0) {
            // If community from URL not found, but we have communities, select the first one
            setSelectedCommunity(data[0]);
          }
        } else if (data.length > 0) {
          // If no community in URL, select the first one
          setSelectedCommunity(data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching communities:', err);
        
        // Provide default communities so the app can still function
        const defaultCommunities = [
          { id: '1', name: 'Bonn', description: 'City of Bonn community' },
          { id: '2', name: 'Cologne', description: 'City of Cologne community' },
          { id: '3', name: 'Dusseldorf', description: 'City of Dusseldorf community' }
        ];
        
        setCommunities(defaultCommunities);
        
        // Check if we have a community in the URL
        const communityName = getCommunityFromPath();
        if (communityName) {
          const communityFromUrl = defaultCommunities.find(
            (c: Community) => c.name.toLowerCase() === communityName.toLowerCase()
          );
          
          if (communityFromUrl) {
            setSelectedCommunity(communityFromUrl);
          } else {
            // If community from URL not found, select the first default one
            setSelectedCommunity(defaultCommunities[0]);
          }
        } else {
          // If no community in URL, select the first default one
          setSelectedCommunity(defaultCommunities[0]);
        }
        
        setError('Failed to load communities from server, using default values');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCommunities();
    } else {
      // Even when not logged in, provide default communities
      fetchCommunities();
    }
  }, [session, pathname]);

  // When the community selection changes, update the URL if needed
  const handleCommunityChange = (community: Community) => {
    setSelectedCommunity(community);
    navigateToCorrespondingPageInCommunity(community);
  };

  // Provide the context value
  const contextValue: CommunityContextType = {
    communities,
    selectedCommunity,
    setSelectedCommunity: handleCommunityChange,
    loading,
    error,
  };

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
}

// Create a hook to use the context
export const useCommunity = () => useContext(CommunityContext); 