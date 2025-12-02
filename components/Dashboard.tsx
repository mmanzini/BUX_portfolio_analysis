import React, { useMemo, useState } from 'react';
import { processTransactions } from '../utils/processData';
import KpiCard from './KpiCard';
import NetValueChart from './Charts/NetValueChart';
import PerformanceChart from './Charts/PerformanceChart';
import CashFlowChart from './Charts/CashFlowChart';
import PnLChart from './Charts/PnLChart';
import { Wallet, TrendingUp, DollarSign, Receipt, Filter, ArrowLeft } from 'lucide-react';

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
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');

  // Filter Logic
  const filteredSnapshots = useMemo(() => {
    return dailySnapshots.filter(s => {
      const year = s.date.substring(0, 4);
      const month = parseInt(s.date.substring(5, 7));
      
      if (selectedYear !== 'All' && year !== selectedYear) return false;
      
      if (selectedQuarter !== 'All') {
        const q = Math.ceil(month / 3);
        if (`Q${q}` !== selectedQuarter) return false;
      }
      return true;
    });
  }, [dailySnapshots, selectedYear, selectedQuarter]);

  const latest = filteredSnapshots[filteredSnapshots.length - 1] || dailySnapshots[dailySnapshots.length - 1];
  
  // Safety check if no data after processing
  if (!latest) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-4">
      <p>No data found in the uploaded file.</p>
      <button onClick={onReset} className="text-blue-400 hover:underline">Upload another file</button>
    </div>
  );

  const totalReturn = latest.totalRealizedPnL + latest.totalUnrealizedPnL + latest.totalDividends - latest.totalFees;
  const returnPercent = latest.totalInvested !== 0 ? (totalReturn / latest.totalInvested) * 100 : 0;

  // Filter Cashflow for the charts
  const filteredCashFlow = useMemo(() => {
    return cashFlowData.filter(d => {
       const year = d.month.substring(0, 4);
       const month = parseInt(d.month.substring(5, 7));

       if (selectedYear !== 'All' && year !== selectedYear) return false;
       if (selectedQuarter !== 'All') {
         const q = Math.ceil(month / 3);
         if (`Q${q}` !== selectedQuarter) return false;
       }
       return true;
    });
  }, [cashFlowData, selectedYear, selectedQuarter]);

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-8 space-y-8 font-sans text-slate-200">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
            title="Upload new file"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Portfolio Analysis</h1>
            <p className="text-slate-400 mt-1">
              Performance overview 
              {selectedYear !== 'All' && ` for ${selectedYear}`}
              {selectedQuarter !== 'All' && ` ${selectedQuarter}`}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-slate-800 p-1.5 rounded-xl flex flex-wrap gap-2 items-center shadow-lg border border-slate-700/50">
          <div className="flex items-center px-3 text-slate-400 gap-2 text-sm font-medium border-r border-slate-700 mr-1">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>
          
          {/* Year Filter */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setSelectedYear('All')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedYear === 'All' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedYear === year ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Quarter Filter */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setSelectedQuarter('All')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedQuarter === 'All' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Qtrs
            </button>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedQuarter === q ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Net Portfolio Value" 
          value={`€${latest.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue="Cash + Assets"
          icon={<Wallet />}
          color="violet"
        />
        <KpiCard 
          title="Total Net Return" 
          value={`€${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          trendValue={`${returnPercent.toFixed(2)}%`}
          trend={returnPercent >= 0 ? 'up' : 'down'}
          subValue="Cumulative (Unrealized + Realized)"
          icon={<TrendingUp />}
          color="emerald"
        />
        <KpiCard 
          title="Realized P&L" 
          value={`€${latest.totalRealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue={`Divs: €${latest.totalDividends.toFixed(2)}`}
          icon={<DollarSign />}
          color="blue"
        />
        <KpiCard 
          title="Unrealized P&L" 
          value={`€${latest.totalUnrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue="Paper Gains/Losses"
          trend={latest.totalUnrealizedPnL >= 0 ? 'up' : 'down'}
          icon={<Receipt />}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Net Value Development */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">Net Value Development</h2>
          {filteredSnapshots.length > 0 ? (
            <NetValueChart data={filteredSnapshots} />
          ) : (
             <div className="h-[350px] flex items-center justify-center text-slate-500">No data for selected period</div>
          )}
        </div>

        {/* Performance vs Invested */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">Performance vs. Invested Capital</h2>
          {filteredSnapshots.length > 0 ? (
             <PerformanceChart data={filteredSnapshots} />
          ) : (
             <div className="h-[350px] flex items-center justify-center text-slate-500">No data for selected period</div>
          )}
        </div>

        {/* Realised vs Unrealised Stack */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">Result Breakdown (Cumulative)</h2>
          {filteredSnapshots.length > 0 ? (
            <PnLChart data={filteredSnapshots} />
          ) : (
             <div className="h-[300px] flex items-center justify-center text-slate-500">No data for selected period</div>
          )}
        </div>

        {/* Monthly Cash Flow */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">Monthly Cash Flow</h2>
          {filteredCashFlow.length > 0 ? (
             <CashFlowChart data={filteredCashFlow} />
          ) : (
             <div className="h-[300px] flex items-center justify-center text-slate-500">No cash flow data for selected period</div>
          )}
        </div>
      </div>

      {/* Assets Table (End of selected period) */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
           <h2 className="text-lg font-semibold text-white">
             Current Asset Allocation 
             <span className="ml-2 text-sm font-normal text-slate-400">(End of Selected Period)</span>
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-right">Est. Value (EUR)</th>
                <th className="px-6 py-4 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {/* Note: In a real app we might want to recalculate asset allocation exactly for the specific filtered end date. 
                  Currently, useMemo only processes once initially. For dynamic end-of-period holdings, we would need to 
                  snapshot the holdings at 'latest.timestamp'. 
                  'latest.holdings' exists in the snapshot! Let's use it. 
               */}
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
                    <tr key={asset.name} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{asset.name}</td>
                      <td className="px-6 py-4 text-right">{asset.quantity.toFixed(4)}</td>
                      <td className="px-6 py-4 text-right">€{asset.val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-emerald-400">{asset.allocation.toFixed(1)}%</td>
                    </tr>
                 ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No active assets held at the end of this period.</td>
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