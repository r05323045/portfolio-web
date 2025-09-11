export type SymbolItem = {
  symbol: string;
  name: string;
  market: 'US' | 'TW';
  currency: 'USD' | 'TWD'
};

export const SYMBOLS: readonly SymbolItem[] = [
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', market: 'US', currency: 'USD' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'US', currency: 'USD' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: 'US', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'US', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', market: 'US', currency: 'USD' },
  { symbol: 'PLTR', name: 'Palantir Technologies', market: 'US', currency: 'USD' },
  { symbol: 'SOFI', name: 'SoFi Technologies', market: 'US', currency: 'USD' },
  { symbol: 'HOOD', name: 'Robinhood Markets', market: 'US', currency: 'USD' },
  { symbol: 'IBIT', name: 'iShares Bitcoin Trust', market: 'US', currency: 'USD' },
  { symbol: 'ETHA', name: 'iShares Ethereum Trust', market: 'US', currency: 'USD' },
  { symbol: 'RKLB', name: 'Rocket Lab USA', market: 'US', currency: 'USD' },
  { symbol: 'OKLO', name: 'Oklo Inc.', market: 'US', currency: 'USD' },
  { symbol: '2330.TW', name: 'Taiwan Semiconductor (TSMC)', market: 'TW', currency: 'TWD' },
  { symbol: '0050.TW', name: 'Yuanta Taiwan Top 50 ETF', market: 'TW', currency: 'TWD' },
];
