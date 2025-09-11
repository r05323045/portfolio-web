'use client';

export default function StatCard({ title, value, positive = true }:{
  title: string; value: string; positive?: boolean
}) {
  return (
    <div className="rounded-2xl bg-white shadow p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className={`text-2xl font-semibold ${positive?"text-emerald-700":"text-red-600"}`}>{value}</div>
    </div>
  );
}
