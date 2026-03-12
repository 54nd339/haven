import { NextRequest, NextResponse } from 'next/server';

const KLIPY_API_KEY = process.env.KLIPY_API_KEY;
const KLIPY_BASE = 'https://api.klipy.com/v2';

export async function GET(req: NextRequest) {
  if (!KLIPY_API_KEY) {
    return NextResponse.json({ results: [] }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const endpoint = q ? 'search' : 'featured';

  const params = new URLSearchParams({
    key: KLIPY_API_KEY,
    client_key: 'haven',
    media_filter: 'gif,tinygif',
    limit: '20',
  });

  if (q) params.set('q', q);

  const res = await fetch(`${KLIPY_BASE}/${endpoint}?${params.toString()}`);
  if (!res.ok) return NextResponse.json({ results: [] });

  const data = await res.json();

  const results = (data.results ?? []).map(
    (r: {
      id: string;
      title: string;
      media_formats: Record<string, { url: string; dims: number[] }>;
    }) => ({
      id: r.id,
      title: r.title,
      url: r.media_formats?.gif?.url ?? r.media_formats?.tinygif?.url ?? '',
      previewUrl: r.media_formats?.tinygif?.url ?? '',
      width: r.media_formats?.gif?.dims?.[0] ?? 200,
      height: r.media_formats?.gif?.dims?.[1] ?? 200,
    }),
  );

  return NextResponse.json({ results });
}
