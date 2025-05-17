'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  
  // Determine where to redirect the user
  const redirectPath = session ? '/dashboard' : '/';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <FaLock className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page. This area is restricted to users with specific privileges.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaHome className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  If you believe you should have access to this page, please contact an administrator
                  or return to an accessible area of the site.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link 
              href={redirectPath}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaArrowLeft className="mr-2 -ml-1 h-4 w-4" />
              Return to safe area
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 