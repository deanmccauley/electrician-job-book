import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = await createServerSupabaseClient();
    // Exchange code for session - this sets the cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the password setup page
  // The cookies are now set, so the client will be authenticated
  return NextResponse.redirect(new URL('/auth/set-password', requestUrl.origin));
}