import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/auth';

export async function GET() {
  const backendUrl = getBackendUrl();
  try {
    const res = await fetch(`${backendUrl}/api/leaderboard`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ entries: Array.isArray(data.entries) ? data.entries : [] });
    }
  } catch {
    // Fallback gracefully when backend is unreachable
  }
  return NextResponse.json({ entries: [] });
}
