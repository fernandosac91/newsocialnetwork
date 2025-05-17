'use client';

import { useSession } from 'next-auth/react';
import { UserRole, canAccessAdminDashboard, canCreateContent, canModerateUsers } from '@/lib/auth/permissions';

export default function PermissionExample() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Please sign in to access this content</div>;
  }
  
  // Get user status and role
  const userRole = session?.user?.role as UserRole;
  const userStatus = session?.user?.status;
  
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Permission-Based UI Example</h2>
      
      <div>
        <h3 className="font-semibold">Your User Info:</h3>
        <p>Name: {session?.user?.name || 'N/A'}</p>
        <p>Email: {session?.user?.email}</p>
        <p>Role: {userRole}</p>
        <p>Status: {userStatus}</p>
      </div>
      
      <div className="space-y-4">
        {/* Admin-only section */}
        {canAccessAdminDashboard(session) && (
          <div className="bg-purple-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Admin Dashboard</h3>
            <p>This section is only visible to administrators.</p>
            <button 
              className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => console.log('Admin action performed')}
            >
              Perform Admin Action
            </button>
          </div>
        )}
        
        {/* Moderator section */}
        {canModerateUsers(session) && (
          <div className="bg-blue-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Moderation Panel</h3>
            <p>This section is visible to moderators and administrators.</p>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => console.log('Moderation action performed')}
            >
              Moderate Content
            </button>
          </div>
        )}
        
        {/* Facilitator section */}
        {canCreateContent(session) && (
          <div className="bg-green-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Content Creation</h3>
            <p>This section is visible to facilitators, moderators, and administrators.</p>
            <div className="flex space-x-3 mt-2">
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => console.log('Create event')}
              >
                Create Event
              </button>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => console.log('Create circle')}
              >
                Create Circle
              </button>
            </div>
          </div>
        )}
        
        {/* Member section - always shown to authenticated users in this example */}
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="text-lg font-semibold">Member Content</h3>
          <p>This section is visible to all authenticated users in this example.</p>
          <button 
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => console.log('Member action performed')}
          >
            View Events
          </button>
        </div>
      </div>
    </div>
  );
} 