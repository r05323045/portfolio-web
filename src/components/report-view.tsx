'use client';

import ClientOnly from '@/components/client-only';
import StatCard from '@/components/stat-card';
import SummaryTable from '@/components/summary-table';
import { formatCurrency } from '@/lib/utils';
import AllocationPieCompact from './charts/allocation-pie-compact';
import IndividualPnLChart from './charts/individual-pnl';

type Totals = { value: number; pnl: number; ret_pct: number };

type ApiSummaryRow = {
  symbol: string;
  qty: number;
  avg_cost: number;
  current: number;
  profit_pct: number;
  pnl: number;
  rsi?: number | null;
  vol_pct?: number | null;
  type?: 'Active' | 'Passive';
};

export default function ReportView({
  baseCcy,
  totals,
  barData,
  pieData,
  activeData,
  investmentTypeData,
  summaryRows, // 直接餵 dashboard.summary_table.rows
}: {
  baseCcy: 'TWD' | 'USD';
  totals: Totals; // 從 dashboard.totals 來
  barData: { name: string; pnl: number }[];
  pieData: { name: string; value: number }[];
  activeData: { name: string; value: number }[];
  investmentTypeData: { name: string; value: number }[];
  summaryRows: ApiSummaryRow[];
}) {
  // 將 API rows 轉為表格現用型別（跟原本 EnrichedRow 對齊基本欄位）
  const rowsForTable = (summaryRows ?? []).map((r) => ({
    symbol: r.symbol,
    qty: r.qty,
    avgCost: r.avg_cost,
    current: r.current,
    pnl: r.pnl,
    profitPct: r.profit_pct, // 這就是你的報酬率
    ret: r.profit_pct ?? 0, // 加這一行，保證表格有 ret
    type: r.type ?? 'Active',
  }));

  return (
    <>
      {/* 三個 KPI 卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Value" value={formatCurrency(totals.value, baseCcy)} />
        <StatCard
          title="P&L"
          value={formatCurrency(totals.pnl, baseCcy)}
          positive={totals.pnl >= 0}
        />
        <StatCard
          title="Return"
          value={`${(totals.ret_pct * 100).toFixed(2)}%`}
          positive={totals.ret_pct >= 0}
        />
      </div>

      {/* 圖表（ClientOnly 避免 hydration 問題） */}
      <ClientOnly>
        {/* 注意：以下兩個元件本身已包含卡片外觀，外層不要再包一層 .bg-white */}
        <IndividualPnLChart data={barData} height={400} />

        {/* Top Holdings（元件內已內建標題與卡片樣式） */}
        <AllocationPieCompact data={pieData} height={400} labelThreshold={0.04} />

        {/* Investment Type 分佈 */}
        <AllocationPieCompact
          data={investmentTypeData}
          height={360}
          labelThreshold={0.04}
          title="Investment Type"
        />

        {/* Active 持股分佈 */}
        <AllocationPieCompact
          data={activeData}
          height={360}
          labelThreshold={0.04}
          title="Active Holdings"
        />
      </ClientOnly>

      {/* 明細表：直接吃 rowsForTable */}
      <SummaryTable baseCcy={baseCcy} rows={rowsForTable} />
    </>
  );
}
