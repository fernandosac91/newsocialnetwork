'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaChartBar, 
  FaBell, 
  FaCog 
} from 'react-icons/fa';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalCircles: 0
  });

  useEffect(() => {
    // Only admins should access this page - middleware handles this, but extra check for safety
    if (session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }

    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUsers className="h-10 w-10 text-blue-500" />
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Total Users</h2>
                <p className="text-3xl font-bold text-gray-700">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUserCheck className="h-10 w-10 text-green-500" />
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
                <p className="text-3xl font-bold text-gray-700">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUserTimes className="h-10 w-10 text-red-500" />
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Active Users</h2>
                <p className="text-3xl font-bold text-gray-700">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Actions */}
          <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition duration-150">
            <div className="flex items-center">
              <FaUsers className="h-6 w-6 text-blue-500" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">View, edit, and manage all users</p>
          </Link>
          
          <Link href="/admin/approvals" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition duration-150">
            <div className="flex items-center">
              <FaUserCheck className="h-6 w-6 text-green-500" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Approval Queue</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">Approve or reject new user registrations</p>
          </Link>
          
          <Link href="/admin/settings" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition duration-150">
            <div className="flex items-center">
              <FaCog className="h-6 w-6 text-gray-500" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Settings</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">Configure system settings and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 