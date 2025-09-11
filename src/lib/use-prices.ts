'use client';
import { useEffect, useMemo, useState } from 'react';

export type PriceMap = Record<string, { price?: number; currency?: 'USD' | 'TWD' }>;

export function usePrices(symbols: string[]) {
  const uniq = useMemo(() => Array.from(new Set(symbols.filter(Boolean))).sort(), [symbols]);
  const [data, setData] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uniq.length === 0) {
      setData({});
      return;
    }
    let abort = new AbortController();
    async function go() {
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(`/api/quotes?symbols=${encodeURIComponent(uniq.join(','))}`, {
          signal: abort.signal,
        });
        if (!r.ok) throw new Error('failed to load quotes');
        const j = await r.json();
        const map: PriceMap = {};
        for (const it of j.items || []) map[it.symbol] = { price: it.price, currency: it.currency };
        setData(map);
      } catch (e: any) {
        if (!abort.signal.aborted) setError(e.message || 'error');
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    go();
    return () => abort.abort();
  }, [uniq.join(',')]);

  return { prices: data, loading, error, refresh: () => setData({}) };
}
