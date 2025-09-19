'use client';

import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useCallback, useEffect, useRef, useState } from 'react';

type SymbolOption = {
  symbol: string;
  name?: string;
  market?: 'US' | 'TW';
};

export default function SymbolSearch({
  value,
  onSelect,
  onInput,
  remoteSearchUrl,
  minLength = 2,
  delay = 300,
  placeholder = 'Search symbol…',
}: {
  value: string;
  onSelect: (opt: SymbolOption) => void;
  onInput?: (val: string) => void;
  remoteSearchUrl: string;
  minLength?: number;
  delay?: number;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value ?? '');
  const [options, setOptions] = useState<SymbolOption[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [focused, setFocused] = useState(false); // ★ 只在 focus 時才搜尋/開單

  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // ---- 穩定搜尋實作 ----
  const searchImpl = useCallback(
    async (term: string) => {
      if (!focused || term.trim().length < minLength) {
        // ★ 沒 focus 不搜尋
        setOptions([]);
        setOpen(false);
        setActiveIdx(-1);
        return;
      }

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch(`${remoteSearchUrl}?q=${encodeURIComponent(term)}`, {
          signal: ac.signal,
        });
        if (!res.ok) {
          setOptions([]);
          setOpen(false);
          setActiveIdx(-1);
          return;
        }
        const data = await res.json();
        const items: SymbolOption[] = Array.isArray(data?.items) ? data.items : [];
        setOptions(items);
        setOpen(focused && items.length > 0); // ★ 只在 focus 下才打開
        setActiveIdx(items.length > 0 ? 0 : -1);
      } catch (e: any) {
        if (e?.name !== 'AbortError') console.error('Search failed', e);
        setOptions([]);
        setOpen(false);
        setActiveIdx(-1);
      }
    },
    [remoteSearchUrl, minLength, focused],
  );

  // ---- 防抖包裝 ----
  const doSearch = useDebouncedCallback(searchImpl, delay);

  // ---- 依 query/focused 觸發搜尋 ----
  useEffect(() => {
    doSearch(query);
  }, [query, focused, doSearch]); // ★ 多帶 focused 作為條件

  // ---- Unmount 清理 ----
  useEffect(() => () => abortRef.current?.abort(), []);

  function handleSelect(opt: SymbolOption) {
    setQuery(opt.symbol);
    setOpen(false);
    setActiveIdx(-1);
    onSelect(opt);
  }

  // ---- 外部點擊關閉 ----
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt) handleSelect(opt);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        className="w-full rounded border px-2 py-1 text-sm"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          onInput?.(v);
        }}
        onFocus={() => {
          setFocused(true);
          if (options.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setFocused(false); /* 不強制關，交給外部點擊/選取處理 */
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
      />

      {open && options.length > 0 && (
        <ul
          role="listbox"
          aria-label="Symbol results"
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow"
        >
          {options.map((opt, i) => {
            const active = i === activeIdx;
            return (
              <li
                key={`${opt.symbol}-${i}`}
                role="option"
                aria-selected={active}
                className={`cursor-pointer px-2 py-1 ${active ? 'bg-indigo-50' : 'hover:bg-indigo-50'}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }} // 防止 blur 先關掉
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="font-medium">{opt.symbol}</span>
                {opt.name && <span className="ml-2 text-xs text-neutral-500">{opt.name}</span>}
                {opt.market && (
                  <span className="ml-2 text-xs text-neutral-400">({opt.market})</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
