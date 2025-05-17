'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUserClock, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

export default function PendingApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to home if user is already approved (ACTIVE status)
  if (session?.user?.status === 'ACTIVE') {
    router.push('/dashboard');
    return null;
  }

  // Redirect to rejected page if user is rejected
  if (session?.user?.status === 'REJECTED') {
    router.push('/auth/account-rejected');
    return null;
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <FaUserClock className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Your Account is Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thanks for registering! Your account is currently being reviewed by our administrators.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You'll receive an email notification once your account has been approved.
                  This process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600 text-center">
              {session?.user?.email && (
                <>
                  Registered email: <strong>{session.user.email}</strong>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Return to home page
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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