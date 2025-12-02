import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailySnapshot } from '../../types';
import { format } from 'date-fns';

interface Props {
  data: DailySnapshot[];
}

const PnLChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUnrealized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRealized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(new Date(str), 'MMM d')}
            stroke="#94a3b8" 
            fontSize={12}
            minTickGap={30}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area type="monotone" dataKey="totalRealizedPnL" name="Realized P&L" stackId="1" stroke="#6366f1" fill="url(#colorRealized)" />
          <Area type="monotone" dataKey="totalUnrealizedPnL" name="Unrealized P&L" stackId="1" stroke="#0ea5e9" fill="url(#colorUnrealized)" />
          <Area type="monotone" dataKey="totalDividends" name="Dividends" stackId="1" stroke="#eab308" fill="url(#colorDividends)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PnLChart;