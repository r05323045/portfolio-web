'use client';

import ClientOnly from '@/components/client-only';
import StatCard from '@/components/stat-card';
import SummaryTable from '@/components/summary-table';
import type { EnrichedRow } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import AllocationPieCompact from './charts/allocation-pie-compact';
import IndividualPnLChart from './charts/individual-pnl';

export default function ReportView({
  baseCcy,
  enriched,
  barData,
  pieData,
  activeData,
  investmentTypeData,
}: {
  baseCcy: 'TWD' | 'USD';
  enriched: {
    rows: EnrichedRow[];
    totals: { value: number; pnl: number; cost: number; retPct: number };
  };
  barData: { name: string; pnl: number }[];
  pieData: { name: string; value: number }[];
  activeData: { name: string; value: number }[];
  investmentTypeData: { name: string; value: number }[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Value" value={formatCurrency(enriched.totals.value, baseCcy)} />
        <StatCard
          title="P&L"
          value={formatCurrency(enriched.totals.pnl, baseCcy)}
          positive={enriched.totals.pnl >= 0}
        />
        <StatCard
          title="Return"
          value={`${enriched.totals.retPct.toFixed(2)}%`}
          positive={enriched.totals.retPct >= 0}
        />
      </div>

      {/* ⬇️ 圖表僅在 client mount 後渲染，避免 hydration mismatch */}
      <ClientOnly>
        <div className="rounded-2xl bg-white p-4 shadow">
          <IndividualPnLChart data={barData} height={400} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <AllocationPieCompact
            data={pieData} // [{ name, value }]
            height={400} // 可改 220~320
            labelThreshold={0} // 想多顯示一點就改 0.04
          />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <AllocationPieCompact
            data={investmentTypeData}
            height={400}
            labelThreshold={0}
            title="Investment Type"
          />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <AllocationPieCompact
            data={activeData}
            height={400}
            labelThreshold={0}
            title="Active Holdings"
          />
        </div>
      </ClientOnly>

      <SummaryTable baseCcy={baseCcy} rows={enriched.rows} />
    </>
  );
}
