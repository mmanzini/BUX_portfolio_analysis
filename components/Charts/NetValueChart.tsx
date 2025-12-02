import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailySnapshot } from '../../types';
import { format } from 'date-fns';

interface Props {
  data: DailySnapshot[];
}

const NetValueChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            itemStyle={{ color: '#374151', fontWeight: 500 }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Area 
            type="monotone" 
            dataKey="assetsValue" 
            name="Asset Value"
            stackId="1" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fill="url(#colorAssets)" 
          />
          <Area 
            type="monotone" 
            dataKey="cashBalance" 
            name="Cash Balance"
            stackId="1" 
            stroke="#10b981" 
            strokeWidth={2}
            fill="url(#colorCash)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetValueChart;