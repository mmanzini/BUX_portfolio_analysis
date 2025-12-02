import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailySnapshot } from '../../types';
import { format } from 'date-fns';

interface Props {
  data: DailySnapshot[];
}

const PerformanceChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            tickFormatter={(val) => `€${(val/1000).toFixed(1)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="stepAfter" 
            dataKey="totalInvested" 
            name="Net Invested Capital"
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="totalValue" 
            name="Portfolio Total Value"
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;