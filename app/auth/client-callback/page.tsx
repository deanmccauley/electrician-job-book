'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase';

export default function ClientCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleHash = async () => {
      // The hash is available on the client
      const hash = window.location.hash.substring(1); // Remove the '#'
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        // Set the session manually
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        router.push('/auth/set-password');
      } else {
        router.push('/auth/error?reason=missing_token');
      }
    };

    handleHash();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Completing sign in...</p>
    </div>
  );
}