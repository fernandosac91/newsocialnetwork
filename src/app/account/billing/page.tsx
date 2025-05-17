'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {isExpired 
                  ? 'Your Trial Has Expired' 
                  : 'Manage Your Subscription'}
              </h1>
              
              {isExpired && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your free trial period has ended. To continue using all features, please subscribe below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="mt-2 text-sm text-gray-500">
                This is a temporary page. In a production environment, this would connect to a payment processor like Stripe.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Free Plan</h3>
                  <p className="mt-1 text-gray-500">Basic access to the platform with limited features.</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => router.push('/dashboard')}
                  >
                    Continue with Free Plan
                  </button>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-900">Premium Plan</h3>
                  <p className="mt-1 text-blue-700">Full access to all platform features and premium content.</p>
                  <div className="mt-2 text-xl font-bold text-blue-900">$9.99/month</div>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      // This would normally integrate with Stripe
                      // For now, we'll just redirect to the dashboard
                      router.push('/dashboard');
                    }}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
              
              <div className="mt-10">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 