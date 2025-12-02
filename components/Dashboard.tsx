import React, { useMemo, useState } from 'react';
import { processTransactions } from '../utils/processData';
import KpiCard from './KpiCard';
import NetValueChart from './Charts/NetValueChart';
import PerformanceChart from './Charts/PerformanceChart';
import CashFlowChart from './Charts/CashFlowChart';
import PnLChart from './Charts/PnLChart';
import { Wallet, TrendingUp, DollarSign, Receipt, Filter, ArrowLeft, CalendarRange, X } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  csvData: string;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ csvData, onReset }) => {
  // Process data only when csvData changes
  const { dailySnapshots, cashFlowData, assetSummaries } = useMemo(() => processTransactions(csvData), [csvData]);
  
  // Dynamic Year Extraction
  const availableYears = useMemo(() => {
    const years = new Set(dailySnapshots.map(s => s.date.substring(0, 4)));
    return Array.from(years).sort();
  }, [dailySnapshots]);

  // Filters State
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);

  // Filter Logic
  const filteredSnapshots = useMemo(() => {
    return dailySnapshots.filter(s => {
      const year = s.date.substring(0, 4);
      
      if (selectedYear !== 'All' && year !== selectedYear) return false;
      
      return true;
    });
  }, [dailySnapshots, selectedYear]);

  const latest = filteredSnapshots[filteredSnapshots.length - 1] || dailySnapshots[dailySnapshots.length - 1];
  
  // Safety check if no data after processing
  if (!latest) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-4">
      <p>No data found in the uploaded file.</p>
      <button onClick={onReset} className="text-blue-600 hover:underline font-medium">Upload another file</button>
    </div>
  );

  // Total Return (Cumulative)
  const totalReturn = latest.totalRealizedPnL + latest.totalUnrealizedPnL + latest.totalDividends - latest.totalFees;
  const returnPercent = latest.totalInvested !== 0 ? (totalReturn / latest.totalInvested) * 100 : 0;

  // Period Return (Selected Timeframe Only)
  const firstFiltered = filteredSnapshots[0];
  const allIndex = dailySnapshots.findIndex(s => s.date === firstFiltered?.date);
  
  // Baseline is the snapshot immediately before the selected period.
  // If we are at the very beginning (allIndex === 0), baseline is zeroed out.
  const baseline = allIndex > 0 ? dailySnapshots[allIndex - 1] : {
    totalRealizedPnL: 0,
    totalUnrealizedPnL: 0,
    totalDividends: 0,
    totalFees: 0,
    totalValue: 0,
    totalInvested: 0,
    date: 'Inception',
    cashBalance: 0,
    assetsValue: 0,
  };

  const periodReturn = 
    (latest.totalRealizedPnL - baseline.totalRealizedPnL) +
    (latest.totalUnrealizedPnL - baseline.totalUnrealizedPnL) +
    (latest.totalDividends - baseline.totalDividends) -
    (latest.totalFees - baseline.totalFees);

  // Calculate Period Percent: Period Return / (Start Equity + Net New Capital)
  const netInflows = latest.totalInvested - baseline.totalInvested;
  const periodInvestedCapital = (baseline.totalValue || 0) + netInflows;
  
  const periodPercent = periodInvestedCapital !== 0 
    ? (periodReturn / periodInvestedCapital) * 100 
    : 0;

  // Filter Cashflow for the charts
  const filteredCashFlow = useMemo(() => {
    return cashFlowData.filter(d => {
       const year = d.month.substring(0, 4);

       if (selectedYear !== 'All' && year !== selectedYear) return false;
       return true;
    });
  }, [cashFlowData, selectedYear]);

  // Modal Content Logic
  const renderKpiDetails = () => {
    if (!selectedKpi) return null;

    let content = null;
    let title = '';

    const formatCurrency = (val: number) => `€${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDiff = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${formatCurrency(val)}`;
    };

    if (selectedKpi === 'portfolio-value') {
      title = 'Net Portfolio Value Breakdown';
      content = (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
             <span className="text-gray-600">Cash Balance</span>
             <span className="font-bold text-gray-900">{formatCurrency(latest.cashBalance)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
             <span className="text-gray-600">Asset Value</span>
             <span className="font-bold text-gray-900">{formatCurrency(latest.assetsValue)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
             <span className="font-bold text-gray-900">Total Value</span>
             <span className="font-bold text-violet-600 text-lg">{formatCurrency(latest.totalValue)}</span>
          </div>
        </div>
      );
    } else if (selectedKpi === 'total-return') {
      title = 'Total Net Return Breakdown';
      content = (
        <div className="space-y-3">
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Realized P&L (Trades)</span>
             <span className={`font-medium ${latest.totalRealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(latest.totalRealizedPnL)}
             </span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Unrealized P&L</span>
             <span className={`font-medium ${latest.totalUnrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(latest.totalUnrealizedPnL)}
             </span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Dividends Collected</span>
             <span className="font-medium text-emerald-600">{formatCurrency(latest.totalDividends)}</span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Fees Paid</span>
             <span className="font-medium text-rose-600">-{formatCurrency(latest.totalFees)}</span>
           </div>
           <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center">
             <span className="font-bold text-gray-900">Total Net Return</span>
             <span className={`font-bold text-lg ${totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(totalReturn)}
             </span>
           </div>
        </div>
      );
    } else if (selectedKpi === 'period-return') {
        const startValue = baseline.totalValue;
        const endValue = latest.totalValue;
        const inflow = latest.totalInvested - baseline.totalInvested;
        
        title = `Return Analysis (${selectedYear === 'All' ? 'All Time' : selectedYear})`;
        content = (
            <div className="space-y-4">
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                    {/* Start */}
                    <div className="relative">
                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="flex justify-between items-baseline">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Start Value</p>
                                <p className="text-xs text-gray-400">{baseline.date !== 'Inception' ? format(new Date(baseline.date), 'MMM d, yyyy') : 'Inception'}</p>
                            </div>
                            <span className="font-mono font-medium text-gray-900">{formatCurrency(startValue)}</span>
                        </div>
                    </div>

                    {/* Flows */}
                    <div className="relative">
                         <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-blue-200 border-2 border-white"></div>
                         <div className="flex justify-between items-baseline">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Net Capital Flows</p>
                                <p className="text-xs text-gray-400">Deposits - Withdrawals</p>
                            </div>
                            <span className="font-mono font-medium text-blue-600">{formatDiff(inflow)}</span>
                         </div>
                    </div>

                    {/* Return */}
                    <div className="relative">
                         <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-indigo-200 border-2 border-white"></div>
                         <div className="flex justify-between items-baseline">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Period Return</p>
                                <p className="text-xs text-gray-400">Market Performance</p>
                            </div>
                            <span className={`font-mono font-bold ${periodReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatDiff(periodReturn)}
                            </span>
                         </div>
                    </div>

                    {/* End */}
                    <div className="relative">
                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-gray-900 border-2 border-white"></div>
                         <div className="flex justify-between items-baseline">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">End Value</p>
                                <p className="text-xs text-gray-400">{format(new Date(latest.date), 'MMM d, yyyy')}</p>
                            </div>
                            <span className="font-mono font-bold text-gray-900">{formatCurrency(endValue)}</span>
                         </div>
                    </div>
                </div>
            </div>
        );
    } else if (selectedKpi === 'realized-pnl') {
        const netRealizedReturn = latest.totalRealizedPnL + latest.totalDividends - latest.totalFees;
        title = 'Realized P&L Details (Cumulative)';
        content = (
            <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Breakdown of all realized gains and income accumulated over time.</p>
                <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-gray-700 font-medium">Trading P&L</span>
                        </div>
                        <span className={`font-bold ${latest.totalRealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(latest.totalRealizedPnL)}
                        </span>
                     </div>
                     
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-700 font-medium">Dividends</span>
                        </div>
                        <span className="font-bold text-emerald-600">
                            +{formatCurrency(latest.totalDividends)}
                        </span>
                     </div>
                     
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            <span className="text-gray-700 font-medium">Fees Paid</span>
                        </div>
                        <span className="font-bold text-rose-600">
                            -{formatCurrency(latest.totalFees)}
                        </span>
                     </div>
                     
                     <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900">Net Realized Result</span>
                        <span className={`font-bold text-lg ${netRealizedReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(netRealizedReturn)}
                        </span>
                     </div>
                </div>
            </div>
        );
    } else if (selectedKpi === 'unrealized-pnl') {
        const netRealizedReturn = latest.totalRealizedPnL + latest.totalDividends - latest.totalFees;
        title = 'Unrealized P&L Calculation';
        content = (
            <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Derived from current portfolio value minus cost basis.</p>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Portfolio Total Value</span>
                        <span className="font-bold text-gray-900">{formatCurrency(latest.totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-2">
                             <span className="text-rose-400 font-bold">-</span> Net Invested Capital
                        </span>
                        <span className="text-gray-600">{formatCurrency(latest.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                         <span className="text-gray-500 flex items-center gap-2">
                             <span className="text-rose-400 font-bold">-</span> Net Realized Result
                             <span className="text-xs text-gray-400">(Trades + Divs - Fees)</span>
                        </span>
                        <span className="text-gray-600">{formatCurrency(netRealizedReturn)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-gray-900">Unrealized P&L</span>
                        <span className={`font-bold text-lg ${latest.totalUnrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(latest.totalUnrealizedPnL)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-bold text-gray-900">{title}</h3>
               <button onClick={() => setSelectedKpi(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                  <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-6">
               {content}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-8 font-sans text-gray-900">
      {renderKpiDetails()}
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onReset}
          className="p-2.5 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 rounded-full transition-all group"
          title="Upload new file"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Portfolio Analysis</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Performance overview 
            {selectedYear !== 'All' && ` for ${selectedYear}`}
          </p>
        </div>
      </div>
        
      {/* Filters Toolbar - Full Width */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            
            {/* Icon Section */}
            <div className="flex items-center gap-3 min-w-fit pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <Filter className="w-5 h-5" />
                </div>
                <div>
                    <span className="block text-sm font-bold text-gray-900">Timeframe</span>
                    <span className="block text-xs text-gray-500 font-medium">Customize your view</span>
                </div>
            </div>

            {/* Filter Groups */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                
                {/* Year Group */}
                <div className="flex-grow">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block px-1">Year</label>
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto">
                        <button
                          onClick={() => setSelectedYear('All')}
                          className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            selectedYear === 'All' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                          }`}
                        >
                          All Time
                        </button>
                        {availableYears.map(year => (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                              selectedYear === year ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <KpiCard 
          title="Net Portfolio Value" 
          value={`€${latest.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue="Cash + Assets"
          icon={<Wallet />}
          color="violet"
          onClick={() => setSelectedKpi('portfolio-value')}
        />
        <KpiCard 
          title="Total Net Return" 
          value={`€${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          trendValue={`${returnPercent.toFixed(2)}%`}
          trend={returnPercent >= 0 ? 'up' : 'down'}
          subValue="Cumulative All Time"
          icon={<TrendingUp />}
          color="emerald"
          onClick={() => setSelectedKpi('total-return')}
        />
        <KpiCard 
          title="Period Net Return" 
          value={`€${periodReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          trendValue={`${periodPercent.toFixed(2)}%`}
          trend={periodReturn >= 0 ? 'up' : 'down'}
          subValue="Selected Timeframe"
          icon={<CalendarRange />}
          color="rose"
          onClick={() => setSelectedKpi('period-return')}
        />
        <KpiCard 
          title="Realized P&L" 
          value={`€${latest.totalRealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue={`Divs: €${latest.totalDividends.toFixed(2)}`}
          icon={<DollarSign />}
          color="blue"
          onClick={() => setSelectedKpi('realized-pnl')}
        />
        <KpiCard 
          title="Unrealized P&L" 
          value={`€${latest.totalUnrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue="Paper Gains/Losses"
          trend={latest.totalUnrealizedPnL >= 0 ? 'up' : 'down'}
          icon={<Receipt />}
          color="amber"
          onClick={() => setSelectedKpi('unrealized-pnl')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Net Value Development */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Net Value Development</h2>
          {filteredSnapshots.length > 0 ? (
            <NetValueChart data={filteredSnapshots} />
          ) : (
             <div className="h-[350px] flex items-center justify-center text-gray-400">No data for selected period</div>
          )}
        </div>

        {/* Performance vs Invested */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Performance vs. Invested Capital</h2>
          {filteredSnapshots.length > 0 ? (
             <PerformanceChart data={filteredSnapshots} />
          ) : (
             <div className="h-[350px] flex items-center justify-center text-gray-400">No data for selected period</div>
          )}
        </div>

        {/* Realised vs Unrealised Stack */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Result Breakdown (Cumulative)</h2>
          {filteredSnapshots.length > 0 ? (
            <PnLChart data={filteredSnapshots} />
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-400">No data for selected period</div>
          )}
        </div>

        {/* Monthly Cash Flow */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Monthly Cash Flow</h2>
          {filteredCashFlow.length > 0 ? (
             <CashFlowChart data={filteredCashFlow} />
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-400">No cash flow data for selected period</div>
          )}
        </div>
      </div>

      {/* Assets Table (End of selected period) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-lg font-bold text-gray-900">
             Current Asset Allocation 
             <span className="ml-2 text-sm font-normal text-gray-400">(End of Selected Period)</span>
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-right">Est. Value (EUR)</th>
                <th className="px-6 py-4 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {latest.holdings && Object.values(latest.holdings).filter((h: any) => h.quantity > 0.001).length > 0 ? (
                 Object.values(latest.holdings)
                 .filter((h: any) => h.quantity > 0.001)
                 .map((h: any) => {
                   const val = h.quantity * h.lastPrice;
                   const total = Object.values(latest.holdings).reduce((sum: number, item: any) => sum + (item.quantity * item.lastPrice), 0);
                   return { ...h, val, allocation: (val/ (total as number)) * 100 };
                 })
                 .sort((a: any, b: any) => b.allocation - a.allocation)
                 .map((asset: any) => (
                    <tr key={asset.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 text-right tabular-nums">{asset.quantity.toFixed(4)}</td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium">€{asset.val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-semibold tabular-nums">{asset.allocation.toFixed(1)}%</td>
                    </tr>
                 ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No active assets held at the end of this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;