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
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(new Date(str), 'MMM d')}
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `€${(val/1000).toFixed(1)}k`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
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