'use client';

import ActionsBar from '@/components/actions-bar';
import PositionsEditor from '@/components/positions-editor';
import ReportView from '@/components/report-view';
import { computeReport, initialPositions, topAlloc } from '@/lib/report';
import type { Position } from '@/lib/types';
import { usePrices } from '@/lib/use-prices';
import { useMemo, useState } from 'react';

export default function PortfolioPage() {
  const [rows, setRows] = useState<Position[]>(initialPositions);
  const [usdTwd, setUsdTwd] = useState(30.21);
  const [baseCcy, setBaseCcy] = useState<'TWD' | 'USD'>('TWD');

  const symbols = useMemo(() => rows.map((r) => r.symbol), [rows]);
  const { prices, loading: priceLoading } = usePrices(symbols);

  const enriched = useMemo(
    () => computeReport(rows, usdTwd, baseCcy, prices),
    [rows, usdTwd, baseCcy, prices],
  );

  const barData = useMemo(
    () =>
      enriched.rows
        .map((r) => ({ name: r.symbol, pnl: Math.round(r.pnl) }))
        .sort((a, b) => a.pnl - b.pnl),
    [enriched],
  );
  const pieData = useMemo(() => topAlloc(enriched.rows), [enriched]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ...nav 略 */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <PositionsEditor
            rows={rows}
            onChange={setRows}
            usdTwd={usdTwd}
            setUsdTwd={setUsdTwd}
            baseCcy={baseCcy}
            setBaseCcy={setBaseCcy}
          />
          {priceLoading && <div className="mt-2 text-xs text-neutral-500">Fetching prices…</div>}
        </section>

        <section className="flex flex-col gap-4 lg:col-span-7">
          <ReportView baseCcy={baseCcy} enriched={enriched} barData={barData} pieData={pieData} />
          <ActionsBar />
        </section>
      </div>
    </div>
  );
}
