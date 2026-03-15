import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') ?? 'magiclink';

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL('/auth/client-callback' + requestUrl.search, requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();

  if (tokenHash) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
    return NextResponse.redirect(new URL('/auth/set-password', requestUrl.origin));
  } 
  
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL('/auth/set-password', requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/auth/error?reason=auth_failed', requestUrl.origin));
}