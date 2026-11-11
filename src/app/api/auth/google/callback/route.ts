import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAppBaseUrl,
  getBackendUrl,
  isGoogleOAuthConfigured,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from '@/lib/auth';

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl(request.url);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_cancelled`);
  }

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=google_not_configured`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('lexiai_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=invalid_state`);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    let currentLevel: 'A2' | 'B1' | 'B2' | 'C1' = 'B1';
    let targetBand = 7.5;
    let displayName = googleUser.name || googleUser.email?.split('@')[0] || 'Student';

    // Sync with Python FastAPI backend if reachable
    try {
      const syncRes = await fetch(`${getBackendUrl()}/api/auth/google-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          full_name: displayName,
          avatar_url: googleUser.picture,
          google_id: googleUser.id,
        }),
      });
      if (syncRes.ok) {
        const backendUser = await syncRes.json();
        displayName = backendUser.full_name || displayName;
        currentLevel = backendUser.current_level || currentLevel;
        targetBand = backendUser.target_ielts_band || targetBand;
      }
    } catch {
      // Backend unreachable or spinning up; session cookie still holds Google identity
    }

    const sessionToken = signSessionToken({
      email: googleUser.email,
      name: displayName,
      avatar_url: googleUser.picture,
      auth_provider: 'google',
      current_level: currentLevel,
      target_ielts_band: targetBand,
    });

    const response = NextResponse.redirect(`${baseUrl}/?auth_success=google`);
    response.cookies.delete('lexiai_oauth_state');
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.redirect(`${baseUrl}/?auth_error=oauth_exception`);
  }
}
