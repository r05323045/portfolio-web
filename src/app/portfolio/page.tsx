'use client';

import ActionsBar from '@/components/actions-bar';
import PositionsEditor from '@/components/positions-editor';
import ReportView from '@/components/report-view';
import { computeReport, initialPositions, topAlloc } from '@/lib/report';
import type { Position } from '@/lib/types';
import { useFx } from '@/lib/use-fx';
import { usePrices } from '@/lib/use-prices';
import { useMemo, useState } from 'react';

export default function PortfolioPage() {
  const [rows, setRows] = useState<Position[]>(initialPositions);
  const [baseCcy, setBaseCcy] = useState<'TWD' | 'USD'>('TWD');

  const symbols = useMemo(() => rows.map((r) => r.symbol), [rows]);
  const { prices, loading: priceLoading } = usePrices(symbols);

  // ★ 自動抓 USD/TWD 匯率
  const { usdTwd, loading: fxLoading, error: fxError, refresh: refreshFx } = useFx('USD', 'TWD');
  const effectiveUsdTwd = usdTwd ?? 30; // 還沒抓到先用 30 當暫代

  const enriched = useMemo(
    () => computeReport(rows, effectiveUsdTwd, baseCcy, prices),
    [rows, effectiveUsdTwd, baseCcy, prices],
  );

  const barData = useMemo(
    () =>
      enriched.rows
        .map((r) => ({ name: r.symbol, pnl: Math.round(r.pnl) }))
        .sort((a, b) => b.pnl - a.pnl),
    [enriched],
  );
  const pieData = useMemo(() => topAlloc(enriched.rows), [enriched]);

  const activeData = useMemo(
    () => topAlloc(enriched.rows.filter((r) => r.type === 'Active')),
    [enriched],
  );

  const investmentTypeData = useMemo(() => {
    const investmentTypes = Array.from(new Set(enriched.rows.map((r) => r.type)));
    return investmentTypes.reduce(
      (acc, type) => {
        const total = enriched.rows
          .filter((r) => r.type === type)
          .reduce((sum, r) => sum + r.mv, 0);
        acc.push({ name: type, value: total });
        return acc;
      },
      [] as { name: string; value: number }[],
    );
  }, [enriched]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="font-semibold">MyPortfolio</div>
          <div className="text-sm text-neutral-500">Demo – client-side only</div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <PositionsEditor rows={rows} onChange={setRows} />
          {(priceLoading || fxLoading) && (
            <div className="mt-2 text-xs text-neutral-500">Fetching data…</div>
          )}
        </section>

        <section className="flex flex-col gap-4 lg:col-span-7">
          <ReportView
            baseCcy={baseCcy}
            enriched={enriched}
            barData={barData}
            pieData={pieData}
            activeData={activeData}
            investmentTypeData={investmentTypeData}
          />
          <ActionsBar />
        </section>
      </div>
    </div>
  );
}
