'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommunity } from '@/lib/context/CommunityContext';

export default function CirclesIndexPage() {
  const router = useRouter();
  const { selectedCommunity, loading } = useCommunity();

  useEffect(() => {
    // Wait for the community context to load
    if (!loading && selectedCommunity) {
      // Redirect to the selected community's circles page
      router.push(`/${selectedCommunity.name}/circles`);
    }
  }, [selectedCommunity, loading, router]);

  // Show a loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p className="mt-4 text-gray-600">Redirecting to your community circles...</p>
    </div>
  );
} 