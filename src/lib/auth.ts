import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'lexiai_session';

export interface SessionPayload {
  email: string;
  name: string;
  avatar_url?: string;
  auth_provider: 'google' | 'local';
  current_level: 'A2' | 'B1' | 'B2' | 'C1';
  target_ielts_band: number;
  exp: number;
}

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'lexiai-ielts-dev-secret-change-in-prod';
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getAppBaseUrl(requestUrl: string, headers?: Headers): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  if (headers) {
    const fwdHost = headers.get('x-forwarded-host') || headers.get('host');
    const fwdProto = headers.get('x-forwarded-proto') || 'https';
    if (fwdHost && !fwdHost.includes('0.0.0.0')) {
      return `${fwdProto.split(',')[0].trim()}://${fwdHost.split(',')[0].trim()}`;
    }
  }
  const parsed = new URL(requestUrl);
  return `${parsed.protocol}//${parsed.host}`;
}

export function getBackendUrl(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '');
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.', 2);
  const expectedSig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encoded)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const parsed: SessionPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(raw);
}
