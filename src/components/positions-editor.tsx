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
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { deleteHolding } from '@/hooks/useHoldings';
import { blankRow, normalize } from '@/lib/report';
import type { Position } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

export default function PositionsEditor({
  rows,
  onChange,
  onPersist, // ★ 新增
}: {
  rows: Position[];
  onChange: (r: Position[]) => void;
  onPersist?: () => void; // ★ 新增
}) {
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirtyRef = useRef(false);

  function update(index: number, patch: Partial<Position>) {
    dirtyRef.current = true;
    onChange(rows.map((r, i) => (i === index ? { ...r, ...normalize(r, patch) } : r)));
    debouncedSave(); // 使用者停止輸入後再送
  }
  async function remove(index: number) {
    const row = rows[index];
    dirtyRef.current = true;
    onChange(rows.filter((_, i) => i !== index));

    dirtyRef.current = true;

    // 有 id 的話打 DELETE（假設你已有 deleteHolding）
    if ((row as any)?.id) {
      setSaving('saving');
      try {
        const { deleteHolding } = await import('@/hooks/useHoldings');
        await deleteHolding((row as any).id);
        setSaving('saved');
        onPersist?.(); // ★ 刪除成功後刷新 dashboard
        setTimeout(() => setSaving('idle'), 800);
      } catch (e) {
        console.error(e);
        setSaving('error');
      }
    }

    debouncedSave();
  }
  function add() {
    const tmpId =
      crypto?.randomUUID?.() ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dirtyRef.current = true;
    onChange([...rows, { ...blankRow(), id: tmpId } as Position]);
    debouncedSave();
  }

  // 失焦即存（避免頻繁打，但確保欄位改了就寫）
  async function saveNow() {
    if (!dirtyRef.current) return;
    setSaving('saving');
    try {
      const items = rows.map(/* 轉 payload */);
      await saveHoldingsBulk(items); // 這裡已經 mutate('/api/holdings') 的話也 OK
      dirtyRef.current = false;
      setSaving('saved');
      onPersist?.(); // ★ 成功後刷新 dashboard
      setTimeout(() => setSaving('idle'), 800);
    } catch (e) {
      console.error(e);
      setSaving('error');
    }
  }
  const debouncedSave = useDebouncedCallback(saveNow, 800);

  // 離開頁面前自動保存（可選）
  useEffect(() => {
    const handler = () => {
      if (dirtyRef.current) navigator.sendBeacon?.('/noop');
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Positions</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">
            {saving === 'saving' && 'Saving…'}
            {saving === 'saved' && 'Saved'}
            {saving === 'error' && 'Save failed'}
          </span>
          <Button variant="outline" onClick={saveNow}>
            Save
          </Button>
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
              <tr key={r.id ?? `tmp-${idx}`} className="border-t">
                <td className="py-2">
                  <SymbolSearch
                    value={r.symbol}
                    onSelect={(s) => update(idx, { symbol: s.symbol, market: s.market as any })}
                    onInput={(v) => {
                      const market = /\.tw$/i.test(v) ? 'TW' : 'US';
                      update(idx, { symbol: v, market });
                    }}
                    onBlur={saveNow} // ★ 失焦即存
                    remoteSearchUrl="/api/symbols"
                  />
                </td>

                <td className="w-[120px]">
                  <Select
                    value={r.market}
                    onValueChange={(v) => {
                      update(idx, { market: v as any });
                    }}
                  >
                    <SelectTrigger onBlur={saveNow}>
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
                    type="number"
                    inputMode="decimal"
                    value={r.qty ?? 0}
                    onChange={(e) => update(idx, { qty: Number(e.target.value) || 0 })}
                    onBlur={saveNow} // ★ 失焦即存
                  />
                </td>

                <td className="text-right">
                  <Input
                    className="w-28 text-right"
                    type="number"
                    inputMode="decimal"
                    value={(r as any).avg_cost ?? (r as any).avgCost ?? 0}
                    onChange={(e) => update(idx, { avg_cost: Number(e.target.value) || 0 })}
                    onBlur={saveNow} // ★ 失焦即存
                  />
                </td>

                <td className="w-[140px]">
                  <Select
                    value={r.type}
                    onValueChange={(v) => {
                      update(idx, { type: v as any });
                    }}
                  >
                    <SelectTrigger onBlur={saveNow}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Passive">Passive</SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                <td className="pl-2">
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => deleteHolding(r.id)}
                  >
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
