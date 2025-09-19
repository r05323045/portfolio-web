'use client';

import ActionsBar from '@/components/actions-bar';
import PositionsEditor from '@/components/positions-editor';
import ReportView from '@/components/report-view';
import { useHoldings } from '@/hooks/useHoldings';
import { saveHoldingsBulk } from '@/lib/api';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Position } from '@/lib/types';
import type { HoldingIn } from '@/types/api';

import { useDashboard } from '@/hooks/useDashboard';
import { mutate } from 'swr';

export default function PortfolioPage() {
  const [baseCcy, setBaseCcy] = useState<'TWD' | 'USD'>('TWD');

  // 1) 從 API 拿 holdings
  const { holdings, isLoading: holdingsLoading, error: holdingsError } = useHoldings();

  const apiRows: Position[] = useMemo(
    () =>
      holdings.map((h) => ({
        id: (h as any).id, // 若 Position 有 id 就補上
        symbol: h.symbol,
        qty: h.qty,
        avg_cost: h.avg_cost, // 改成跟 editor 一致的命名，避免混淆
        ccy: h.ccy,
        type: h.type ?? 'Active',
        market: h.market,
      })),
    [holdings],
  );

  // 2) 本地可編輯 rows
  const [rows, setRows] = useState<Position[]>(apiRows);

  // 只在 holdings「真正變了」時覆蓋本地 rows（初載或重新抓到不同資料）
  const prevApiJsonRef = useRef<string>('');
  useEffect(() => {
    const nextJson = JSON.stringify(apiRows);
    if (nextJson !== prevApiJsonRef.current) {
      prevApiJsonRef.current = nextJson;
      setRows(apiRows);
      // 注意：這裡不算使用者修改，不觸發 autosave
    }
  }, [apiRows]);

  // 3) 使用者修改旗標 + debounce autosave
  const userTouchedRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  function onRowsChange(newRows: Position[]) {
    userTouchedRef.current = true; // ★ 使用者觸發
    setRows(newRows);
  }

  useEffect(() => {
    if (!userTouchedRef.current) return; // ★ 初次載入或非使用者變動不送
    if (!rows || rows.length === 0) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const items: HoldingIn[] = rows.map((r) => ({
        symbol: r.symbol.trim(),
        market: r.market === 'TW' ? 'TW' : 'US',
        qty: Number(r.qty) || 0,
        avg_cost: Number((r as any).avg_cost ?? (r as any).avgCost) || 0,
        ccy: r.market === 'TW' ? 'TWD' : 'USD',
        type: (r as any).type ?? 'Active',
      }));
      try {
        await saveHoldingsBulk(items); // ★ 一次送出
        userTouchedRef.current = false; // 存成功後復位
      } catch (e) {
        console.error('Bulk save failed', e);
        // 可在 UI 顯示錯誤
      }
    }, 800);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [rows]);

  // 4) 從後端抓 dashboard
  const {
    dashboard,
    isLoading: dashLoading,
    error: dashError,
    key: dashKey,
  } = useDashboard(baseCcy, '1M');

  // 傳給子元件：每次「真的寫入」成功後，刷新 holdings + dashboard
  const refreshAfterPersist = async () => {
    await Promise.all([
      mutate('/api/holdings', undefined, { revalidate: true }),
      mutate(dashKey, undefined, { revalidate: true }),
    ]);
  };

  // 5) 數據整理
  const barData = useMemo(
    () => (dashboard?.pnl_bars ?? []).map((d) => ({ name: d.name, pnl: Math.round(d.pnl) })),
    [dashboard?.pnl_bars],
  );

  const pieData = useMemo(
    () => dashboard?.allocation_pie?.data ?? [],
    [dashboard?.allocation_pie?.data],
  );

  const activeData = useMemo(() => {
    const rows = dashboard?.summary_table?.rows ?? [];
    const actives = rows.filter((r) => r.type === 'Active');
    const total = actives.reduce((s, r) => s + r.current * r.qty, 0);
    if (!total) return [];
    return actives
      .map((r) => ({ name: r.symbol, value: r.current * r.qty }))
      .sort((a, b) => b.value - a.value);
  }, [dashboard?.summary_table?.rows]);

  const investmentTypeData = useMemo(() => {
    const rows = dashboard?.summary_table?.rows ?? [];
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const key = r.type ?? 'Unknown';
      const mv = r.current * r.qty;
      map.set(key, (map.get(key) ?? 0) + mv);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [dashboard?.summary_table?.rows]);

  // 6) 載入與錯誤
  if (holdingsLoading || dashLoading) return <div className="p-6">Loading…</div>;
  if (holdingsError || dashError || !dashboard)
    return <div className="p-6 text-red-500">載入失敗，請確認後端 API 是否啟動</div>;

  return (
    <div className="space-y-6 p-6">
      <ActionsBar baseCcy={baseCcy} onBaseCcyChange={setBaseCcy} asOf={dashboard.as_of} />

      {/* 把 setRows 換成 onRowsChange（會標記使用者修改） */}
      <PositionsEditor
        rows={rows}
        onChange={onRowsChange}
        onPersist={refreshAfterPersist} // ★ 新增這個 prop
      />

      <ReportView
        baseCcy={dashboard.base_ccy}
        totals={dashboard.totals}
        barData={barData}
        pieData={pieData}
        activeData={activeData}
        investmentTypeData={investmentTypeData}
        summaryRows={dashboard.summary_table.rows}
      />
    </div>
  );
}
