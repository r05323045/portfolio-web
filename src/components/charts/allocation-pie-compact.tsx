'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Item = { name: string; value: number | string | null | undefined };

const RAD = Math.PI / 180;
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

function makeLabel(threshold: number) {
  return ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
    if ((percent ?? 0) < threshold) return null;
    const r = outerRadius + 18;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const anchor = x > cx ? 'start' : 'end';
    return (
      <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fill="#334155" fontSize={12}>
        {name} {Math.round((percent ?? 0) * 100)}%
      </text>
    );
  };
}

function makeLabelLine(threshold: number, labelOffset = 18) {
  return ({ cx, cy, midAngle, outerRadius, percent, stroke }: any) => {
    if ((percent ?? 0) < threshold) return null;
    const r1 = outerRadius + 6;
    const r2 = outerRadius + labelOffset - 6;
    const x1 = cx + r1 * Math.cos(-midAngle * RAD);
    const y1 = cy + r1 * Math.sin(-midAngle * RAD);
    const x2 = cx + r2 * Math.cos(-midAngle * RAD);
    const y2 = cy + r2 * Math.sin(-midAngle * RAD);
    return <path d={`M${x1},${y1} L${x2},${y2}`} stroke={stroke || '#94a3b8'} fill="none" />;
  };
}

export function AllocationPieCompact({
  data,
  height = 320, // 外層卡片總高度
  legendHeight = 64, // 預留 legend 高度
  labelThreshold = 0.06, // 小片段不顯示標籤
  colors = COLORS,
  title = 'Top Holdings',
}: {
  data: Item[];
  height?: number;
  legendHeight?: number;
  labelThreshold?: number;
  colors?: string[];
  title?: string;
}) {
  // 清理資料
  const cleaned = useMemo(
    () =>
      (data || [])
        .map((d) => ({ name: d.name, value: Number(d.value) }))
        .filter((d) => Number.isFinite(d.value) && d.value > 0),
    [data],
  );
  const total = useMemo(() => cleaned.reduce((a, b) => a + b.value, 0), [cleaned]);

  if (!cleaned.length || total <= 0) {
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

  const renderPieLabel = useMemo(() => makeLabel(labelThreshold), [labelThreshold]);

  // legend data
  const legend = cleaned.map((d, i) => ({
    name: d.name,
    color: colors[i % colors.length],
    value: d.value,
    percent: (d.value / total) * 100,
  }));

  return (
    <div className="rounded-2xl bg-white p-4 shadow" style={{ height }}>
      {/* 標題 */}
      <div className="mb-2 font-semibold">{title}</div>

      {/* 圖表：ResponsiveContainer 控制大小 */}
      <div style={{ height: height - legendHeight - 40 /* 預留標題+legend */ }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cleaned}
              dataKey="value"
              nameKey="name"
              cx="50%" // ★ 相對位置
              cy="50%"
              outerRadius="80%" // ★ 相對大小
              paddingAngle={2}
              minAngle={3}
              label={renderPieLabel}
              labelLine={makeLabelLine(labelThreshold)}
            >
              {cleaned.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => Number(v).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center px-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm leading-5">
          {legend.map((l, idx) => (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: l.color }} />
              <span className="text-neutral-700">{l.name}</span>
              <span className="text-neutral-400">({Math.round(l.percent)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllocationPieCompact;
