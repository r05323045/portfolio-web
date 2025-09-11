export type Market = 'US' | 'TW';
export type Currency = 'USD' | 'TWD';
export type InvestType = 'Active' | 'Passive';

export interface Position {
  id: string;
  symbol: string;
  market: Market;
  qty: number;
  avg_cost: number;
  currency: Currency;
  type: InvestType;
  current_price: number;
}

export interface EnrichedRow extends Position {
  pxBase: number;
  costBase: number;
  mv: number;
  pnl: number;
  ret: number;
}
