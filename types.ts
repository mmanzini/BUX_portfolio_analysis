export interface RawTransaction {
  'Transaction Time (CET)': string;
  'Transaction Category': string;
  'Transaction Type': string;
  'Transfer Type': string;
  'Transaction Amount': string;
  'Transaction Currency': string;
  'Cash Balance Amount': string;
  'Asset Id': string;
  'Asset Name': string;
  'Asset Quantity': string;
  'Asset Price': string;
  'Asset Currency': string;
  'Profit And Loss Amount': string;
}

export interface Transaction {
  id: string;
  date: Date;
  category: string; // deposits, trades, fees, dividends, withdrawals
  type: string; // Buy Trade, Sell Trade, etc.
  transferType: string; // CASH_CREDIT, CASH_DEBIT, ASSET_TRADE_BUY, ASSET_TRADE_SELL
  amount: number;
  currency: string;
  cashBalance: number | null;
  assetName: string | null;
  assetQuantity: number | null;
  assetPrice: number | null;
  pnl: number;
}

export interface DailySnapshot {
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  cashBalance: number;
  assetsValue: number;
  totalValue: number;
  totalInvested: number; // Cumulative Deposits - Withdrawals
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalFees: number;
  totalDividends: number;
  holdings: Record<string, { quantity: number; lastPrice: number; name: string }>;
}

export interface AssetSummary {
  name: string;
  quantity: number;
  currentValue: number;
  allocation: number; // percentage
}

export interface CashFlowData {
  month: string;
  deposits: number;
  withdrawals: number;
  dividends: number;
  netFlow: number;
}