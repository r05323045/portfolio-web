'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type StockPnL = { name: string; pnl: number };

export default function IndividualPnLChart({
  data,
  height = 400, // 卡片總高度（含標題）
  yWidth = 88, // Y 軸寬度（放代號）
  margin = { top: 8, right: 48, left: 48, bottom: 8 },
  title = 'Individual Stock P&L',
}: {
  data: StockPnL[];
  height?: number;
  yWidth?: number;
  margin?: { top: number; right: number; left: number; bottom: number };
  title?: string;
}) {
  // 自動 domain（左右各留 10% 緩衝，且一定包含 0）
  const domain = useMemo<[number, number]>(() => {
    if (!data?.length) return [0, 0];
    let min = Infinity,
      max = -Infinity;
    for (const d of data) {
      const v = Number(d.pnl) || 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (!isFinite(min) || !isFinite(max)) return [0, 0];
    // 留緩衝
    const padMin = min < 0 ? min * 1.1 : min * 0.9;
    const padMax = max > 0 ? max * 1.1 : max * 0.9;
    return [Math.min(0, padMin), Math.max(0, padMax)];
  }, [data]);

  if (!data?.length) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow" style={{ height }}>
        {/* 標題 */}
        <div className="mb-2 font-semibold">{title}</div>
        <div className="flex h-full items-center justify-center text-lg text-neutral-500">
          No data
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow" style={{ height }}>
      {/* 標題固定高度，不參與拉伸 */}
      <h2 className="mb-2 shrink-0 font-semibold">{title}</h2>

      {/* 圖表容器吃剩餘高度：這層一定要有 flex-1 + min-h-0 */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical" // ★ 橫向長條
            margin={margin} // ★ 內邊距避免貼邊或超出
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={domain}
              tickFormatter={(v) => Number(v).toLocaleString()}
            />
            <YAxis type="category" dataKey="name" width={yWidth} />
            <Tooltip formatter={(v: number) => Number(v).toLocaleString()} />
            <ReferenceLine x={0} stroke="#9ca3af" />

            {/* 正負上不同顏色，避免負寬錯誤 */}
            <Bar dataKey="pnl" isAnimationActive={false} radius={4}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
