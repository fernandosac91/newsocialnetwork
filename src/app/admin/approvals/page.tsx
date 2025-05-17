'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaCheck, FaTimes, FaSpinner, FaUserClock } from 'react-icons/fa';

type PendingUser = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  createdAt: string;
};

export default function ApprovalQueue() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Extra safety check - middleware also handles this
    if (session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }

    fetchPendingUsers();
  }, [session, router]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }
      const data = await response.json();
      setPendingUsers(data.users);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError('Failed to load pending users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      // Remove the approved user from the list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      // Remove the rejected user from the list
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <FaArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">User Approval Queue</h1>
          </div>
          <button 
            onClick={fetchPendingUsers}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading pending approvals...</span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaUserClock className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-2 text-gray-500">All user registration requests have been processed.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                        {user.photo ? (
                          <Image 
                            src={user.photo} 
                            alt={user.name} 
                            width={48} 
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          Registered: {new Date(user.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoading === user.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? (
                          <FaSpinner className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <FaCheck className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading === user.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? (
                          <FaSpinner className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <FaTimes className="h-4 w-4 mr-1" />
                        )}
                        Reject
                      </button>
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