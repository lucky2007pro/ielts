import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAppBaseUrl, isGoogleOAuthConfigured } from '@/lib/auth';

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl(request.url);

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_not_configured`);
  }

  const state = crypto.randomBytes(24).toString('hex');
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const response = NextResponse.redirect(googleAuthUrl);

  response.cookies.set('lexiai_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  return response;
}
