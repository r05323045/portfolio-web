'use client';

import { formatCurrency } from "@/lib/utils";
import type { EnrichedRow } from "@/lib/types";

export default function SummaryTable({ baseCcy, rows }:{ baseCcy:"TWD"|"USD"; rows: EnrichedRow[] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
      <h3 className="font-semibold mb-3">Summary Table</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500">
            <th className="py-2">Symbol</th>
            <th>Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Cost</th>
            <th className="text-right">MV</th>
            <th className="text-right">P&L</th>
            <th className="text-right">Ret%</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.symbol}</td>
              <td>{r.qty}</td>
              <td className="text-right">{formatCurrency(r.pxBase, baseCcy)}</td>
              <td className="text-right">{formatCurrency(r.costBase, baseCcy)}</td>
              <td className="text-right">{formatCurrency(r.mv, baseCcy)}</td>
              <td className={`text-right ${r.pnl>=0?"text-emerald-600":"text-red-600"}`}>{formatCurrency(r.pnl, baseCcy)}</td>
              <td className={`text-right ${r.ret>=0?"text-emerald-600":"text-red-600"}`}>{r.ret.toFixed(1)}%</td>
              <td>{r.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
