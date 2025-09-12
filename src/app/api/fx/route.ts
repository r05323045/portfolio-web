import { NextResponse } from 'next/server';

/** Fetch USD/TWD (or any base/quote) from exchangerate.host and cache briefly. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get('base') || 'USD').toUpperCase();
  const quote = (searchParams.get('quote') || 'TWD').toUpperCase();

  try {
    const r = await fetch(
      `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(quote)}`,
      { next: { revalidate: 600 } }, // ISR cache ~10min on Vercel
    );
    if (!r.ok) throw new Error(`fx upstream ${r.status}`);
    const j = await r.json();
    const rate = j?.rates?.[quote];

    if (typeof rate !== 'number') {
      return NextResponse.json({ error: 'No rate' }, { status: 502 });
    }

    return NextResponse.json(
      { base, quote, rate, asOf: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=3600' } },
    );
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch FX' }, { status: 502 });
  }
}
