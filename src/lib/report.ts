import type { EnrichedRow, Position } from '@/lib/types';

export const initialPositions: Position[] = [
  {
    id: 'row-voo',
    symbol: 'VOO',
    market: 'US',
    qty: 130,
    avg_cost: 546.6,
    currency: 'USD',
    type: 'Passive',
    current_price: 599.68,
  },
  {
    id: 'row-qqq',
    symbol: 'QQQ',
    market: 'US',
    qty: 130,
    avg_cost: 507.52,
    currency: 'USD',
    type: 'Passive',
    current_price: 580.7,
  },
  {
    id: 'row-2330',
    symbol: '2330.TW',
    market: 'TW',
    qty: 20,
    avg_cost: 1140,
    currency: 'TWD',
    type: 'Active',
    current_price: 1255,
  },
  {
    id: 'row-pltr',
    symbol: 'PLTR',
    market: 'US',
    qty: 40,
    avg_cost: 110.01,
    currency: 'USD',
    type: 'Active',
    current_price: 166.74,
  },
];

export function blankRow(): Position {
  return {
    id: `row-${Date.now().toString(36)}`,
    symbol: '',
    market: 'US',
    qty: 0,
    avg_cost: 0,
    currency: 'USD',
    type: 'Active',
    current_price: 0,
  };
}

export function normalize(orig: Position, patch: Partial<Position>): Partial<Position> {
  const out: any = { ...patch };
  ['qty', 'avg_cost', 'current_price'].forEach((k) => {
    if (k in out) out[k] = Number(out[k]) || 0;
  });
  return out;
}

export function computeReport(rows: Position[], usdTwd: number, baseCcy: 'TWD' | 'USD') {
  const map: EnrichedRow[] = rows.map((r) => {
    const px = r.current_price;
    const pxBase =
      r.currency === 'USD' && baseCcy === 'TWD'
        ? px * usdTwd
        : r.currency === 'TWD' && baseCcy === 'USD'
          ? px / usdTwd
          : px;
    const costBase =
      r.currency === 'USD' && baseCcy === 'TWD'
        ? r.avg_cost * usdTwd
        : r.currency === 'TWD' && baseCcy === 'USD'
          ? r.avg_cost / usdTwd
          : r.avg_cost;
    const mv = pxBase * r.qty;
    const pnl = (pxBase - costBase) * r.qty;
    const ret = costBase > 0 ? (pxBase / costBase - 1) * 100 : 0;
    return { ...r, pxBase, costBase, mv, pnl, ret };
  });
  const totals = map.reduce(
    (acc, r) => {
      acc.value += r.mv;
      acc.cost += r.costBase * r.qty;
      acc.pnl += r.pnl;
      return acc;
    },
    { value: 0, cost: 0, pnl: 0 },
  );
  const retPct = totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0;
  return { rows: map, totals: { ...totals, retPct } };
}

export function topAlloc(rows: EnrichedRow[]) {
  const bySymbol = new Map<string, number>();
  rows.forEach((r) => bySymbol.set(r.symbol, (bySymbol.get(r.symbol) || 0) + r.mv));
  return Array.from(bySymbol, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
