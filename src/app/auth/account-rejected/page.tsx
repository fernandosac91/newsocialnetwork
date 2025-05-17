'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaTimesCircle, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

export default function AccountRejectedPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <FaTimesCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Account Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but your account registration has been rejected by our administrators.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  If you believe this is an error or would like to appeal this decision, 
                  please contact our support team at{' '}
                  <a href="mailto:support@yoursocialnetwork.com" className="font-medium text-blue-600 hover:text-blue-500">
                    support@yoursocialnetwork.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Return to home page
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="mr-2 -ml-1 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 