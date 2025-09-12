'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';

type Item = { name: string; value: number | string | null | undefined };

const RAD = Math.PI / 180;
function makeLabel(threshold: number) {
  return ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
    if ((percent ?? 0) < threshold) return null;
    const r = outerRadius + 18;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const anchor = x > cx ? 'start' : 'end';
    return (
      <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fill="#334155" fontSize={12}>
        {name} {Math.round(percent * 100)}%
      </text>
    );
  };
}

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f43f5e',
  '#eab308',
  '#06b6d4',
  '#a78bfa',
  '#f97316',
  '#84cc16',
];

export function AllocationPieCompact({
  data,
  height = 240,
  labelThreshold = 0.06,
  colors = COLORS,
}: {
  data: Item[];
  height?: number;
  labelThreshold?: number;
  colors?: string[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  // 量容器寬度（避免 ResponsiveContainer 高度=0 的老問題）
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    setWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 清理資料：把字串轉數字、過濾無效/<=0
  const cleaned = useMemo(() => {
    return (data || [])
      .map((d) => ({ name: d.name, value: Number(d.value) }))
      .filter((d) => Number.isFinite(d.value) && d.value > 0);
  }, [data]);

  const total = useMemo(() => cleaned.reduce((a, b) => a + b.value, 0), [cleaned]);

  const innerH = Math.max(140, height - 56); // 扣掉標題/內距，留最小高度
  const chartW = Math.max(260, width); // 至少 260 寬
  const outerRadius = Math.min(110, Math.floor(Math.min(chartW, innerH) / 2) - 8);
  const renderPieLabel = useMemo(() => makeLabel(labelThreshold), [labelThreshold]);

  // 無資料時顯示佔位
  if (!cleaned.length || total <= 0) {
    return (
      <div
        ref={ref}
        className="flex items-center justify-center rounded-2xl bg-white p-4 shadow"
        style={{ height }}
      >
        <div className="text-sm text-neutral-500">No data</div>
      </div>
    );
  }

  return (
    <div ref={ref} className="rounded-2xl bg-white p-4 shadow" style={{ height }}>
      <div className="mb-2 font-semibold">Top Holdings</div>
      {/* 不用 ResponsiveContainer，直接給寬高 */}
      <PieChart width={chartW} height={innerH}>
        <Pie
          data={cleaned}
          dataKey="value"
          nameKey="name"
          cx={chartW / 2}
          cy={innerH / 2}
          outerRadius={outerRadius}
          paddingAngle={2}
          minAngle={3}
          label={renderPieLabel}
          labelLine
        >
          {cleaned.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => Number(v).toLocaleString()} />
        <Legend />
      </PieChart>
    </div>
  );
}

// 同時輸出 default，避免動態載入用法不小心寫成 default 失敗
export default AllocationPieCompact;
