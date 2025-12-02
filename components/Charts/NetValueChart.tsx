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
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
            tickFormatter={(val) => `€${(val/1000).toFixed(1)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="assetsValue" 
            name="Asset Value"
            stackId="1" 
            stroke="#8b5cf6" 
            fill="url(#colorAssets)" 
          />
          <Area 
            type="monotone" 
            dataKey="cashBalance" 
            name="Cash Balance"
            stackId="1" 
            stroke="#10b981" 
            fill="url(#colorCash)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetValueChart;