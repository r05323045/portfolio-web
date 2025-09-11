'use client';

import ClientOnly from '@/components/client-only';
import StatCard from '@/components/stat-card';
import SummaryTable from '@/components/summary-table';
import type { EnrichedRow } from '@/lib/types';
import { COLORS, formatCurrency } from '@/lib/utils';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function ReportView({
  baseCcy,
  enriched,
  barData,
  pieData,
}: {
  baseCcy: 'TWD' | 'USD';
  enriched: {
    rows: EnrichedRow[];
    totals: { value: number; pnl: number; cost: number; retPct: number };
  };
  barData: { name: string; pnl: number }[];
  pieData: { name: string; value: number }[];
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
          <h3 className="mb-2 font-semibold">Individual Stock P&L</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: 16, right: 8 }}>
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v), baseCcy)} />
                <Bar dataKey="pnl" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">Top Holdings by Market Value</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatCurrency(Number(v), baseCcy)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ClientOnly>

      <SummaryTable baseCcy={baseCcy} rows={enriched.rows} />
    </>
  );
}
