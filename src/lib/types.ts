export type Market = 'US' | 'TW';
export type Currency = 'USD' | 'TWD';
export type InvestType = 'Active' | 'Passive';

export interface Position {
  id: string;
  symbol: string;
  market: Market; // ← 用它推得幣別
  qty: number;
  avg_cost: number;
  type: InvestType;
}

export interface EnrichedRow extends Position {
  pxBase: number;
  costBase: number;
  mv: number;
  pnl: number;
  ret: number;
}
