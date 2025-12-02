import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subValue, trend, trendValue, icon, color = 'blue' }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    violet: 'border-violet-500/20 bg-violet-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    rose: 'border-rose-500/20 bg-rose-500/5',
  };

  return (
    <div className={`rounded-xl border p-6 backdrop-blur-sm ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">{value}</span>
          </div>
        </div>
        {icon && <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>{icon}</div>}
      </div>
      
      {(subValue || trendValue) && (
        <div className="flex items-center gap-2 text-sm">
          {trendValue && (
            <span className={`flex items-center gap-1 font-medium ${
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {getTrendIcon()}
              {trendValue}
            </span>
          )}
          {subValue && <span className="text-slate-500">{subValue}</span>}
        </div>
      )}
    </div>
  );
};

export default KpiCard;