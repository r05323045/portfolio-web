import { NextResponse } from 'next/server';

const PRICE_BOOK: Record<string, { price: number; currency: 'USD' | 'TWD' }> = {
  VOO: { price: 599.68, currency: 'USD' },
  QQQ: { price: 580.7, currency: 'USD' },
  PLTR: { price: 166.74, currency: 'USD' },
  '2330.TW': { price: 1255, currency: 'TWD' },
  // …需要可自行擴充
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const list = (searchParams.get('symbols') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const items = list.map((sym) => ({ symbol: sym, ...(PRICE_BOOK[sym] || {}) }));
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}
