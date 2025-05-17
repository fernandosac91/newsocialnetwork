'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An error occurred during authentication.';
  let errorDescription = 'Please try again or contact support if the problem persists.';

  if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid credentials';
    errorDescription = 'The email or password you entered is incorrect.';
  } else if (error === 'AccessDenied') {
    errorMessage = 'Access denied';
    errorDescription = 'You do not have permission to access this resource.';
  } else if (error === 'AccountNotLinked') {
    errorMessage = 'Account not linked';
    errorDescription = 'This account has not been linked to your profile yet.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{errorMessage}</h1>
        <p className="text-gray-600 mb-6">{errorDescription}</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md text-center transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 