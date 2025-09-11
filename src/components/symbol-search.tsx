'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLS, type SymbolItem } from '@/lib/symbols';

function useDebouncedValue<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function SymbolSearch({
  value,
  onSelect,
  onInput,
  placeholder = 'e.g. QQQ / 2330.TW',
  remoteSearchUrl, // 例如 '/api/symbols'；不提供則只用本地清單
}: {
  value: string;
  onSelect: (s: SymbolItem) => void;
  onInput: (v: string) => void;
  placeholder?: string;
  remoteSearchUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const boxRef = useRef<HTMLDivElement>(null);

  const [remote, setRemote] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 250);

  useEffect(() => setQuery(value || ''), [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // 遠端查詢（可選）
  useEffect(() => {
    const abort = new AbortController();
    async function go() {
      if (!remoteSearchUrl) return setRemote([]);
      const q = debounced.trim();
      if (!q) return setRemote([]);
      try {
        setLoading(true);
        const r = await fetch(`${remoteSearchUrl}?q=${encodeURIComponent(q)}`, { signal: abort.signal });
        if (!r.ok) throw new Error('search failed');
        const data = await r.json();
        setRemote((data?.items || []).slice(0, 8));
      } catch {
        // 靜默失敗：會自動 fallback 到本地
        setRemote([]);
      } finally {
        setLoading(false);
      }
    }
    go();
    return () => abort.abort();
  }, [debounced, remoteSearchUrl]);

  // 本地過濾
  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as SymbolItem[];
    return SYMBOLS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const results = remote.length > 0 ? remote : localResults;

  // 鍵盤導航（↑/↓/Enter）
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [results.length]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = results[active];
      if (pick) {
        onSelect(pick);
        setQuery(pick.symbol);
        setOpen(false);
      }
    }
  }

  return (
    <div ref={boxRef} className="relative w-44">
      <input
        className="w-full border rounded px-2 py-1"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="symbol-search-listbox"
      />

      {open && (loading || results.length > 0) && (
        <div
          id="symbol-search-listbox"
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-64 overflow-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-neutral-500">Searching…</div>
          )}
          {!loading &&
            results.map((s, i) => (
              <button
                key={`${s.symbol}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`block w-full text-left px-3 py-2 hover:bg-neutral-100 ${
                  i === active ? 'bg-neutral-100' : ''
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onSelect(s);
                  setQuery(s.symbol);
                  setOpen(false);
                }}
              >
                <div className="font-medium">
                  {s.symbol}
                  <span className="ml-2 text-xs text-neutral-500">{s.market}</span>
                </div>
                <div className="text-xs text-neutral-500">{s.name}</div>
              </button>
            ))}
          {!loading && results.length === 0 && query && (
            <div className="px-3 py-2 text-sm text-neutral-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}