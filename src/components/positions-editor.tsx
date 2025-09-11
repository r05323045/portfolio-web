'use client';

import SymbolSearch from '@/components/symbol-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { blankRow, normalize } from '@/lib/report';
import type { Position } from '@/lib/types';

export default function PositionsEditor({
  rows,
  onChange,
  usdTwd,
  setUsdTwd,
  baseCcy,
  setBaseCcy,
}: {
  rows: Position[];
  onChange: (r: Position[]) => void;
  usdTwd: number;
  setUsdTwd: (n: number) => void;
  baseCcy: 'TWD' | 'USD';
  setBaseCcy: (c: 'TWD' | 'USD') => void;
}) {
  function update(index: number, patch: Partial<Position>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...normalize(r, patch) } : r)));
  }
  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...rows, blankRow()]);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Positions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Base</span>
          <Select value={baseCcy} onValueChange={(v) => setBaseCcy(v as any)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TWD">TWD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-neutral-500">USD/TWD</span>
          <Input
            className="w-24"
            value={usdTwd}
            onChange={(e) => setUsdTwd(Number(e.target.value) || 0)}
          />
          <Button onClick={add}>Add</Button>
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
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">
                  <SymbolSearch
                    value={r.symbol}
                    onSelect={(s) => update(idx, { symbol: s.symbol, market: s.market as any })}
                    onInput={(v) => {
                      const market = /\.tw$/i.test(v) ? 'TW' : 'US';
                      update(idx, { symbol: v, market });
                    }}
                    remoteSearchUrl="/api/symbols"
                  />
                </td>
                <td className="w-[120px]">
                  <Select value={r.market} onValueChange={(v) => update(idx, { market: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US</SelectItem>
                      <SelectItem value="TW">TW</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="text-right">
                  <Input
                    className="w-24 text-right"
                    value={r.qty}
                    onChange={(e) => update(idx, { qty: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="text-right">
                  <Input
                    className="w-28 text-right"
                    value={r.avg_cost}
                    onChange={(e) => update(idx, { avg_cost: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="w-[140px]">
                  <Select value={r.type} onValueChange={(v) => update(idx, { type: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Passive">Passive</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="pl-2">
                  <Button variant="ghost" className="text-red-600" onClick={() => remove(idx)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
