export type HoldingIn = {
  symbol: string;
  market: 'US' | 'TW';
  qty: number;
  avg_cost: number;
  ccy: 'USD' | 'TWD';
  type?: 'Active' | 'Passive';
};

export type HoldingOut = HoldingIn & {
  id: string;
  updated_at: string;
};

export type Dashboard = {
  as_of: string;
  base_ccy: 'USD' | 'TWD';
  totals: { value: number; pnl: number; ret_pct: number };
  allocation_pie: { data: { name: string; value: number }[] };
  pnl_bars: { name: string; pnl: number }[];
  top10_market_value: { name: string; value: number }[];
  rsi_extremes: { name: string; value: number }[];
  volatility: { name: string; value: number }[];
  monthly_performers: {
    best: { name: string; ret_pct: number }[];
    worst: { name: string; ret_pct: number }[];
  };
  summary_table: {
    rows: {
      symbol: string;
      qty: number;
      avg_cost: number;
      current: number;
      profit_pct: number;
      pnl: number;
      rsi?: number | null;
      vol_pct?: number | null;
      type?: 'Active' | 'Passive';
    }[];
  };
  window?: string;
};

export type HoldingsList = { items: HoldingOut[] };
