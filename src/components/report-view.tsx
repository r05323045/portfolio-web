'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency, COLORS } from "@/lib/utils";
import SummaryTable from "@/components/summary-table";
import StatCard from "@/components/stat-card";
import type { EnrichedRow } from "@/lib/types";

export default function ReportView({
  baseCcy, enriched, barData, pieData
}:{
  baseCcy: "TWD"|"USD";
  enriched: { rows: EnrichedRow[]; totals: { value: number; pnl: number; cost: number; retPct: number } };
  barData: {name:string; pnl:number}[];
  pieData: {name:string; value:number}[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Value" value={formatCurrency(enriched.totals.value, baseCcy)} />
        <StatCard title="P&L" value={formatCurrency(enriched.totals.pnl, baseCcy)} positive={enriched.totals.pnl>=0} />
        <StatCard title="Return" value={`${enriched.totals.retPct.toFixed(2)}%`} positive={enriched.totals.retPct>=0} />
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-2">Individual Stock P&L</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: 16, right: 8 }}>
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip formatter={(v)=>formatCurrency(Number(v), baseCcy)} />
              <Bar dataKey="pnl" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-2">Top Holdings by Market Value</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v)=>formatCurrency(Number(v), baseCcy)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SummaryTable baseCcy={baseCcy} rows={enriched.rows} />
    </>
  );
}
