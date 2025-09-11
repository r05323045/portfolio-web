import type { Currency, EnrichedRow, Position } from '@/lib/types';
import type { PriceMap } from '@/lib/use-prices';

export const initialPositions: Position[] = [
  { id: 'row-voo', symbol: 'VOO', market: 'US', qty: 130, avg_cost: 546.6, type: 'Passive' },
  { id: 'row-qqq', symbol: 'QQQ', market: 'US', qty: 130, avg_cost: 507.52, type: 'Passive' },
  { id: 'row-2330', symbol: '2330.TW', market: 'TW', qty: 20, avg_cost: 1140, type: 'Active' },
  { id: 'row-pltr', symbol: 'PLTR', market: 'US', qty: 40, avg_cost: 110.01, type: 'Active' },
];

export function blankRow(): Position {
  return {
    id: `row-${Date.now().toString(36)}`,
    symbol: '',
    market: 'US',
    qty: 0,
    avg_cost: 0,
    type: 'Active',
  };
}

export function normalize(orig: Position, patch: Partial<Position>): Partial<Position> {
  const out: any = { ...patch };
  ['qty', 'avg_cost'].forEach((k) => {
    if (k in out) out[k] = Number(out[k]) || 0;
  });
  return out;
}

// helpers
export const currencyFromMarket = (m: 'US' | 'TW'): Currency => (m === 'US' ? 'USD' : 'TWD');
const convert = (val: number, from: Currency, to: Currency, usdTwd: number) =>
  from === to ? val : from === 'USD' && to === 'TWD' ? val * usdTwd : val / usdTwd;

export function computeReport(
  rows: Position[],
  usdTwd: number,
  baseCcy: Currency,
  prices: PriceMap,
) {
  const map: EnrichedRow[] = rows.map((r) => {
    const ccy = currencyFromMarket(r.market);
    const quote = prices[r.symbol]?.price;
    const pxRaw = typeof quote === 'number' ? quote : r.avg_cost; // 抓不到價就用成本暫代

    const pxBase = convert(pxRaw, ccy, baseCcy, usdTwd);
    const costBase = convert(r.avg_cost, ccy, baseCcy, usdTwd);

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
