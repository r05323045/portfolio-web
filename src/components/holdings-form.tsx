'use client';
import { createHolding } from '@/hooks/useHoldings';
import type { HoldingIn } from '@/types/api';
import { useState } from 'react';

export default function HoldingsForm() {
  const [form, setForm] = useState<HoldingIn>({
    symbol: '',
    market: 'US',
    qty: 0,
    avg_cost: 0,
    ccy: 'USD',
    type: 'Active',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await createHolding(form);
      // 清空或保留都可以
    } catch (e: any) {
      setErr(e.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Symbol"
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value.trim() })}
        />
        <select
          className="select"
          value={form.market}
          onChange={(e) =>
            setForm({
              ...form,
              market: e.target.value as 'US' | 'TW',
              ccy: e.target.value === 'TW' ? 'TWD' : 'USD',
            })
          }
        >
          <option value="US">US</option>
          <option value="TW">TW</option>
        </select>
        <input
          className="input"
          type="number"
          step="any"
          placeholder="Qty"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
        />
        <input
          className="input"
          type="number"
          step="any"
          placeholder="Avg Cost"
          value={form.avg_cost}
          onChange={(e) => setForm({ ...form, avg_cost: Number(e.target.value) })}
        />
        <button className="btn" disabled={busy}>
          {busy ? 'Saving...' : 'Add'}
        </button>
      </div>
      {err && <div className="text-sm text-red-500">{err}</div>}
    </form>
  );
}
