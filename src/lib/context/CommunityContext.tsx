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
    if (parts.length > 1 && parts[1] !== '' && !['api', 'auth', 'admin', 'dashboard', 'profile', 'messages', 'notifications', 'circles', 'events', 'connections'].includes(parts[1])) {
      return parts[1];
    }
    return null;
  };

  // Navigate to the corresponding page in the selected community
  const navigateToCorrespondingPageInCommunity = (community: Community) => {
    const currentPath = pathname;
    
    if (currentPath.includes('/circles/')) {
      router.push(`/${community.name}/circles`);
    } else if (currentPath.includes('/events/')) {
      router.push(`/${community.name}/events`);
    } else if (currentPath.includes('/circles')) {
      router.push(`/${community.name}/circles`);
    } else if (currentPath.includes('/events')) {
      router.push(`/${community.name}/events`);
    } else {
      router.push(`/${community.name}`);
    }
  };

  // Fetch all communities with retry mechanism
  const fetchCommunitiesWithRetry = async (retries = 3, delay = 1000): Promise<Community[]> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/communities', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Failed to fetch communities after multiple retries');
  };

  // Fetch all communities when the component mounts
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        const data = await fetchCommunitiesWithRetry();
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
            setSelectedCommunity(data[0]);
          }
        } else if (data.length > 0) {
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
            setSelectedCommunity(defaultCommunities[0]);
          }
        } else {
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