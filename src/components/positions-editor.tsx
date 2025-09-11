'use client';

import SymbolSearch from "@/components/symbol-search";
import type { Position } from "@/lib/types";
import { blankRow, normalize } from "@/lib/report";

export default function PositionsEditor({
  rows, onChange, usdTwd, setUsdTwd, baseCcy, setBaseCcy,
}:{
  rows: Position[];
  onChange: (r: Position[]) => void;
  usdTwd: number; setUsdTwd: (n:number)=>void;
  baseCcy: "TWD"|"USD"; setBaseCcy: (c:"TWD"|"USD")=>void;
}) {
  function update(index: number, patch: Partial<Position>) {
    onChange(rows.map((r,i)=> i===index ? { ...r, ...normalize(r, patch) } : r));
  }
  function remove(index: number) { onChange(rows.filter((_,i)=> i!==index)); }
  function add() { onChange([...rows, blankRow()]); }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Positions</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-500">Base</label>
          <select value={baseCcy} onChange={e=>setBaseCcy(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="TWD">TWD</option>
            <option value="USD">USD</option>
          </select>
          <label className="text-sm text-neutral-500">USD/TWD</label>
          <input value={usdTwd} onChange={e=>setUsdTwd(Number(e.target.value)||0)} className="w-20 border rounded px-2 py-1 text-sm" />
          <button onClick={add} className="rounded-lg bg-black text-white text-sm px-3 py-1">Add</button>
        </div>
      </header>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2">Symbol</th>
              <th>Market</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Avg Cost</th>
              <th>CCY</th>
              <th>Type</th>
              <th className="text-right">Current</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">
                  <SymbolSearch
                    value={r.symbol}
                    onSelect={(s)=>{ update(idx, { symbol: s.symbol, market: s.market as any, currency: s.currency as any }); }}
                    onInput={(v)=>update(idx,{symbol:v})}
                    remoteSearchUrl="/api/symbols"   // ★ 新增這行
                  />
                </td>
                <td>
                  <select className="border rounded px-2 py-1" value={r.market} onChange={e=>update(idx,{market:e.target.value as any})}>
                    <option>US</option><option>TW</option>
                  </select>
                </td>
                <td className="text-right"><input className="w-20 border rounded px-2 py-1 text-right" value={r.qty} onChange={e=>update(idx,{qty:Number(e.target.value)||0})}/></td>
                <td className="text-right"><input className="w-24 border rounded px-2 py-1 text-right" value={r.avg_cost} onChange={e=>update(idx,{avg_cost:Number(e.target.value)||0})}/></td>
                <td>
                  <select className="border rounded px-2 py-1" value={r.currency} onChange={e=>update(idx,{currency:e.target.value as any})}>
                    <option>USD</option><option>TWD</option>
                  </select>
                </td>
                <td>
                  <select className="border rounded px-2 py-1" value={r.type} onChange={e=>update(idx,{type:e.target.value as any})}>
                    <option>Active</option><option>Passive</option>
                  </select>
                </td>
                <td className="text-right"><input className="w-24 border rounded px-2 py-1 text-right" value={r.current_price} onChange={e=>update(idx,{current_price:Number(e.target.value)||0})}/></td>
                <td className="pl-2"><button onClick={()=>remove(idx)} className="text-red-600 text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
