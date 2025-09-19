'use client';

import { formatCurrency } from '@/lib/utils';
import { useMemo, useState } from 'react';

type ApiSummaryRow = {
  symbol: string;
  qty: number;
  avg_cost: number;
  current: number;
  profit_pct: number; // 報酬率（小數，例 0.123 = 12.3%）
  pnl: number; // 損益（報表幣別）
  rsi?: number | null;
  vol_pct?: number | null;
  type?: 'Active' | 'Passive';
};

export default function SummaryTable({
  baseCcy,
  rows,
}: {
  baseCcy: 'TWD' | 'USD';
  rows: ApiSummaryRow[];
}) {
  // 簡單排序（預設依 P&L 降序）
  const [sortKey, setSortKey] = useState<
    'symbol' | 'qty' | 'avg_cost' | 'current' | 'pnl' | 'profit_pct'
  >('pnl');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const data = useMemo(() => {
    const copy = [...(rows ?? [])];
    copy.sort((a, b) => {
      const av = (a as any)[sortKey] ?? 0;
      const bv = (b as any)[sortKey] ?? 0;
      const mul = sortDir === 'asc' ? 1 : -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return mul * av.localeCompare(bv);
      }
      return mul * (Number(av) - Number(bv));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const thClass =
    'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 cursor-pointer select-none';
  const tdClass = 'px-3 py-2 text-sm text-neutral-800';

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-neutral-50/70 backdrop-blur">
            <tr>
              <th className={thClass} onClick={() => toggleSort('symbol')}>
                Symbol
              </th>
              <th className={`${thClass} text-right`} onClick={() => toggleSort('qty')}>
                Qty
              </th>
              <th className={`${thClass} text-right`} onClick={() => toggleSort('avg_cost')}>
                Avg Cost
              </th>
              <th className={`${thClass} text-right`} onClick={() => toggleSort('current')}>
                Current
              </th>
              <th className={`${thClass} text-right`} onClick={() => toggleSort('pnl')}>
                P&amp;L
              </th>
              <th className={`${thClass} text-right`} onClick={() => toggleSort('profit_pct')}>
                Return
              </th>
              <th className={thClass}>Type</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => {
              const ret = r.profit_pct ?? 0; // 小數，例如 0.125 = 12.5%
              const pnlPos = (r.pnl ?? 0) >= 0;
              const retPos = ret >= 0;
              return (
                <tr key={`${r.symbol}-${i}`} className="odd:bg-white even:bg-neutral-50/40">
                  <td className={`${tdClass} font-medium`}>{r.symbol}</td>

                  <td className={`${tdClass} text-right tabular-nums`}>
                    {(r.qty ?? 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </td>

                  <td className={`${tdClass} text-right tabular-nums`}>
                    {formatCurrency(r.avg_cost ?? 0, baseCcy)}
                  </td>

                  <td className={`${tdClass} text-right tabular-nums`}>
                    {formatCurrency(r.current ?? 0, baseCcy)}
                  </td>

                  <td
                    className={`${tdClass} text-right tabular-nums ${
                      pnlPos ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(r.pnl ?? 0, baseCcy)}
                  </td>

                  <td
                    className={`${tdClass} text-right tabular-nums ${
                      retPos ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {/* 將小數轉百分比顯示，防止 undefined.toFixed */}
                    {r.profit_pct != null ? `${(r.profit_pct * 100).toFixed(1)}%` : '-'}
                  </td>

                  <td className={tdClass}>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-neutral-700">
                      {r.type ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}

            {!data.length && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-lg text-neutral-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
