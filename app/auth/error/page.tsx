'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';

  return (
    <>
      <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
      <p className="text-gray-600 mb-2">Reason: {reason}</p>
      <p className="text-gray-600 mb-6">
        Please request a new invitation link or contact support.
      </p>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded" />}>
          <ErrorContent />
        </Suspense>
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}