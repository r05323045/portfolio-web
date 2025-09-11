'use client';

import { useMemo, useState } from "react";
import PositionsEditor from "@/components/positions-editor";
import ReportView from "@/components/report-view";
import ActionsBar from "@/components/actions-bar";
import { computeReport, topAlloc, initialPositions } from "@/lib/report";
import type { Position } from "@/lib/types";

export default function PortfolioPage() {
  const [rows, setRows] = useState<Position[]>(initialPositions);
  const [usdTwd, setUsdTwd] = useState(30.21);
  const [baseCcy, setBaseCcy] = useState<"TWD" | "USD">("TWD");

  const enriched = useMemo(() => computeReport(rows, usdTwd, baseCcy), [rows, usdTwd, baseCcy]);
  const barData = useMemo(() => enriched.rows.map(r => ({ name: r.symbol, pnl: Math.round(r.pnl) })).sort((a, b) => a.pnl - b.pnl), [enriched]);
  const pieData = useMemo(() => topAlloc(enriched.rows), [enriched]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">MyPortfolio</div>
          <div className="text-sm text-neutral-500">Demo – client-side only</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-5">
          <PositionsEditor
            rows={rows}
            onChange={setRows}
            usdTwd={usdTwd}
            setUsdTwd={setUsdTwd}
            baseCcy={baseCcy}
            setBaseCcy={setBaseCcy}
          />
        </section>

        <section className="lg:col-span-7 flex flex-col gap-4">
          <ReportView baseCcy={baseCcy} enriched={enriched} barData={barData} pieData={pieData} />
          <ActionsBar portfolioId={1} apiBase="" defaultTimezone="Asia/Taipei" />
        </section>
      </div>
    </div>
  );
}
