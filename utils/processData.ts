import { dsvFormat } from 'd3-dsv';
import { eachDayOfInterval, format, isSameDay, min, max, startOfDay, endOfDay } from 'date-fns';
import { RawTransaction, Transaction, DailySnapshot, AssetSummary, CashFlowData } from '../types';

const parseNumber = (val: string | undefined | null) => {
  if (!val) return 0;
  // Handle commas as decimals if relevant, but this CSV looks like standard US format
  return parseFloat(val);
};

export const processTransactions = (csvContent: string): {
  transactions: Transaction[];
  dailySnapshots: DailySnapshot[];
  assetSummaries: AssetSummary[];
  cashFlowData: CashFlowData[];
} => {
  const parser = dsvFormat(',');
  const parsedData = parser.parse(csvContent) as RawTransaction[];

  // 1. Convert Raw Data
  const transactions: Transaction[] = parsedData.map((row, index) => {
    // 2022-01-06 15:13:49.453000
    const dateStr = row['Transaction Time (CET)'];
    // Simple parser assuming ISO-like format YYYY-MM-DD HH:mm:ss
    // Fallback if date is undefined or empty
    if (!dateStr) {
        return null;
    }
    const date = new Date(dateStr.split('.')[0]); 

    return {
      id: `tx-${index}`,
      date: date,
      category: row['Transaction Category'],
      type: row['Transaction Type'],
      transferType: row['Transfer Type'],
      amount: parseNumber(row['Transaction Amount']),
      currency: row['Transaction Currency'],
      cashBalance: row['Cash Balance Amount'] ? parseNumber(row['Cash Balance Amount']) : null,
      assetName: row['Asset Name'] || null,
      assetQuantity: row['Asset Quantity'] ? parseNumber(row['Asset Quantity']) : null,
      assetPrice: row['Asset Price'] ? parseNumber(row['Asset Price']) : null,
      pnl: row['Profit And Loss Amount'] ? parseNumber(row['Profit And Loss Amount']) : 0,
    };
  }).filter(t => t !== null).sort((a, b) => a!.date.getTime() - b!.date.getTime()) as Transaction[];

  // 2. Build Timeline
  if (transactions.length === 0) return { transactions: [], dailySnapshots: [], assetSummaries: [], cashFlowData: [] };

  const startDate = startOfDay(min(transactions.map(t => t.date)));
  const endDate = endOfDay(max(transactions.map(t => t.date)));

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 3. Process Daily States
  let currentCash = 0;
  const currentHoldings: Record<string, { quantity: number; lastPrice: number; name: string }> = {};
  let totalInvested = 0;
  let accumulatedRealizedPnL = 0;
  let accumulatedFees = 0;
  let accumulatedDividends = 0;

  const dailySnapshots: DailySnapshot[] = [];
  const monthlyCashFlow: Record<string, { deposits: number; withdrawals: number; dividends: number }> = {};

  // Initialize monthly map
  allDays.forEach(day => {
    const monthKey = format(day, 'yyyy-MM');
    if (!monthlyCashFlow[monthKey]) {
      monthlyCashFlow[monthKey] = { deposits: 0, withdrawals: 0, dividends: 0 };
    }
  });

  allDays.forEach(day => {
    // Find transactions for this day
    const daysTransactions = transactions.filter(t => isSameDay(t.date, day));

    daysTransactions.forEach(t => {
      // Update Cash from valid source
      if (t.cashBalance !== null) {
        currentCash = t.cashBalance;
      }
      
      // Update Monthly Metrics & Running Totals
      const monthKey = format(t.date, 'yyyy-MM');

      if (t.category === 'deposits') {
        totalInvested += t.amount;
        monthlyCashFlow[monthKey].deposits += t.amount;
      } else if (t.category === 'withdrawals') {
        totalInvested += t.amount; // Withdrawals are negative in CSV
        monthlyCashFlow[monthKey].withdrawals += Math.abs(t.amount);
      } else if (t.category === 'dividends') {
        accumulatedDividends += t.amount;
        monthlyCashFlow[monthKey].dividends += t.amount;
      } else if (t.category === 'fees') {
        accumulatedFees += Math.abs(t.amount); // Track fees positively for total cost
      }

      // Update Realized PnL
      if (t.pnl !== 0) {
        accumulatedRealizedPnL += t.pnl;
      }

      // Update Holdings & Prices
      if (t.assetName) {
        if (!currentHoldings[t.assetName]) {
          currentHoldings[t.assetName] = { quantity: 0, lastPrice: 0, name: t.assetName };
        }

        // Update Price if available
        if (t.assetPrice) {
           currentHoldings[t.assetName].lastPrice = t.assetPrice;
        }

        // Update Quantity
        if (t.transferType === 'ASSET_TRADE_BUY') {
             currentHoldings[t.assetName].quantity += (t.assetQuantity || 0);
        } else if (t.transferType === 'ASSET_TRADE_SELL') {
             currentHoldings[t.assetName].quantity -= (t.assetQuantity || 0);
        }
      }
    });

    // Calculate Assets Value for the day
    let assetsValue = 0;
    Object.values(currentHoldings).forEach(h => {
      // Simple heuristic for demo: assume price is roughly EUR or 1:1 if USD, 
      // as we lack dynamic FX rates in this isolated module.
      assetsValue += h.quantity * h.lastPrice; 
    });

    const totalValue = currentCash + assetsValue;
    // Unrealized = Total Value - NetInvested - Realized
    const totalUnrealizedPnL = totalValue - totalInvested - accumulatedRealizedPnL;

    dailySnapshots.push({
      date: format(day, 'yyyy-MM-dd'),
      timestamp: day.getTime(),
      cashBalance: currentCash,
      assetsValue,
      totalValue,
      totalInvested,
      totalRealizedPnL: accumulatedRealizedPnL,
      totalUnrealizedPnL,
      totalFees: accumulatedFees,
      totalDividends: accumulatedDividends,
      holdings: JSON.parse(JSON.stringify(currentHoldings)), // Deep copy
    });
  });

  // 4. Summaries
  const finalSnapshot = dailySnapshots[dailySnapshots.length - 1];
  
  const assetSummaries: AssetSummary[] = finalSnapshot 
    ? Object.values(finalSnapshot.holdings)
        .filter(h => h.quantity > 0.001) // Filter out sold positions
        .map(h => ({
          name: h.name,
          quantity: h.quantity,
          currentValue: h.quantity * h.lastPrice,
          allocation: 0, // calc below
        }))
    : [];

  const totalAssetVal = assetSummaries.reduce((sum, a) => sum + a.currentValue, 0);
  assetSummaries.forEach(a => a.allocation = totalAssetVal > 0 ? (a.currentValue / totalAssetVal) * 100 : 0);

  const cashFlowData: CashFlowData[] = Object.entries(monthlyCashFlow).map(([month, data]) => ({
    month,
    ...data,
    netFlow: data.deposits - data.withdrawals
  })).sort((a, b) => a.month.localeCompare(b.month));

  return { transactions, dailySnapshots, assetSummaries, cashFlowData };
};