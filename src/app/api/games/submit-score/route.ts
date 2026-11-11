import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    try {
      const res = await fetch(`${backendUrl}/api/games/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline — keep local progress intact
    }

    return NextResponse.json({ status: 'ok', offline: true });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 400 });
  }
}
