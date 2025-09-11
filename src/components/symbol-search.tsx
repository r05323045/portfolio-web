'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SYMBOLS, type SymbolItem } from '@/lib/symbols';
import { useEffect, useMemo, useState } from 'react';

export default function SymbolSearch({
  value,
  onSelect,
  onInput,
  remoteSearchUrl,
}: {
  value: string;
  onSelect: (s: SymbolItem) => void;
  onInput: (v: string) => void;
  remoteSearchUrl?: string; // e.g. "/api/symbols"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [remote, setRemote] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setQuery(value || ''), [value]);

  // 依需求打遠端
  useEffect(() => {
    let abort = new AbortController();
    async function go() {
      const q = query.trim();
      if (!q || !remoteSearchUrl) {
        setRemote([]);
        return;
      }
      try {
        setLoading(true);
        const r = await fetch(`${remoteSearchUrl}?q=${encodeURIComponent(q)}`, {
          signal: abort.signal,
        });
        if (r.ok) {
          const data = await r.json();
          setRemote((data?.items || []).slice(0, 8));
        } else setRemote([]);
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    const id = setTimeout(go, 250);
    return () => {
      clearTimeout(id);
      abort.abort();
    };
  }, [query, remoteSearchUrl]);

  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as SymbolItem[];
    return SYMBOLS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  const results = remote.length > 0 ? remote : localResults;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onInput(e.target.value);
          }}
          placeholder="e.g. QQQ / 2330.TW"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput
            value={query}
            onValueChange={(v) => {
              setQuery(v);
              onInput(v);
            }}
            placeholder="搜尋代號或名稱…"
          />
          <CommandEmpty>{loading ? 'Searching…' : 'No results'}</CommandEmpty>
          <CommandGroup>
            {results.map((s) => (
              <CommandItem
                key={s.symbol}
                value={`${s.symbol} ${s.name}`}
                onSelect={() => {
                  onSelect(s);
                  setQuery(s.symbol);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {s.symbol} <span className="text-xs text-neutral-500">{s.market}</span>
                  </span>
                  <span className="text-xs text-neutral-500">{s.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
