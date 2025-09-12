'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useFx(base: 'USD' | 'TWD' = 'USD', quote: 'USD' | 'TWD' = 'TWD') {
  const [rate, setRate] = useState<number | null>(null); // base->quote
  const [asOf, setAsOf] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/fx?base=${base}&quote=${quote}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setRate(typeof j.rate === 'number' ? j.rate : null);
      setAsOf(j.asOf || '');
    } catch (e: any) {
      setError(e.message || 'fx error');
    } finally {
      setLoading(false);
    }
  }, [base, quote]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30 * 60 * 1000); // 每 30 分鐘刷新
    return () => clearInterval(id);
  }, [load]);

  /** 統一提供 USD->TWD 的數字（computeReport 需要這個方向）。 */
  const usdTwd = useMemo(() => {
    if (rate == null) return undefined;
    if (base === 'USD' && quote === 'TWD') return rate;
    if (base === 'TWD' && quote === 'USD') return 1 / rate;
    return 1; // 同幣別
  }, [rate, base, quote]);

  return { rate, usdTwd, asOf, loading, error, refresh: load };
}
