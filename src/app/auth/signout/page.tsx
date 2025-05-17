'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    // Sign out and redirect to the callback URL or home
    signOut({ redirect: false }).then(() => {
      router.replace(callbackUrl);
    });
  }, [router, callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Signing out...</p>
    </div>
  );
} 