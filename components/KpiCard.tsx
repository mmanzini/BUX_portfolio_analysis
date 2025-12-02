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
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subValue, trend, trendValue, icon, color = 'blue', onClick }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-200 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{title}</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
          </div>
        </div>
        {icon && <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>{icon}</div>}
      </div>
      
      {(subValue || trendValue) && (
        <div className="flex items-center gap-2 text-sm mt-1">
          {trendValue && (
            <span className={`flex items-center gap-1 font-semibold ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-gray-500'
            }`}>
              {getTrendIcon()}
              {trendValue}
            </span>
          )}
          {subValue && <span className="text-gray-400 font-medium">{subValue}</span>}
        </div>
      )}
    </div>
  );
};

export default KpiCard;