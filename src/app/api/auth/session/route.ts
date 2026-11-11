import { NextResponse } from 'next/server';
import {
  getBackendUrl,
  getSessionFromCookies,
  isGoogleOAuthConfigured,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from '@/lib/auth';

export async function GET() {
  const session = await getSessionFromCookies();
  return NextResponse.json({
    user: session,
    googleEnabled: isGoogleOAuthConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_profile') {
      const existing = await getSessionFromCookies();
      const email = existing?.email || body.email;
      if (!email) {
        return NextResponse.json({ error: 'Avval tizimga kiring.' }, { status: 401 });
      }

      const name = body.full_name?.trim() || existing?.name || 'Student';
      const current_level = body.current_level || existing?.current_level || 'B2';
      const target_ielts_band = Number(body.target_ielts_band || existing?.target_ielts_band || 7.5);

      try {
        await fetch(`${getBackendUrl()}/api/auth/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, full_name: name, current_level, target_ielts_band }),
        });
      } catch {
        // Fallback cleanly to cookie update
      }

      const updatedPayload = {
        email,
        name,
        avatar_url: existing?.avatar_url,
        auth_provider: existing?.auth_provider || ('local' as const),
        current_level,
        target_ielts_band,
      };
      const token = signSessionToken(updatedPayload);
      const res = NextResponse.json({ user: updatedPayload });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (action === 'register' || action === 'login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const full_name = String(body.full_name || email.split('@')[0] || 'Student').trim();
      const current_level = body.current_level || 'B1';
      const target_ielts_band = Number(body.target_ielts_band || 7.5);

      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: "To'g'ri email manzil kiriting." }, { status: 400 });
      }
      if (password.length < 4) {
        return NextResponse.json({ error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak." }, { status: 400 });
      }

      let resolvedName = full_name;
      let resolvedLevel = current_level;
      let resolvedBand = target_ielts_band;
      let resolvedAvatar: string | undefined;

      try {
        const endpoint = action === 'register' ? '/api/auth/register' : '/api/auth/login';
        const backendRes = await fetch(`${getBackendUrl()}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            action === 'register'
              ? { full_name, email, password, current_level, target_ielts_band }
              : { email, password }
          ),
        });

        if (backendRes.status === 400 || backendRes.status === 401) {
          const errData = await backendRes.json();
          return NextResponse.json({ error: errData.detail || 'Xatolik yuz berdi.' }, { status: backendRes.status });
        }

        if (backendRes.ok) {
          const data = await backendRes.json();
          resolvedName = data.full_name || resolvedName;
          resolvedLevel = data.current_level || resolvedLevel;
          resolvedBand = data.target_ielts_band || resolvedBand;
          resolvedAvatar = data.avatar_url || undefined;
        }
      } catch {
        // Backend not reachable: allow local session creation
      }

      const payload = {
        email,
        name: resolvedName,
        avatar_url: resolvedAvatar,
        auth_provider: 'local' as const,
        current_level: resolvedLevel,
        target_ielts_band: resolvedBand,
      };
      const token = signSessionToken(payload);
      const res = NextResponse.json({ user: payload });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    return NextResponse.json({ error: "Noto'g'ri amal." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
