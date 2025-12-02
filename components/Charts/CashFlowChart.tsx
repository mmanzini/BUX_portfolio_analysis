import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { CashFlowData } from '../../types';

interface Props {
  data: CashFlowData[];
}

const CashFlowChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `€${val}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
            cursor={{fill: '#f1f5f9'}}
            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
          <Bar dataKey="withdrawals" name="Withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
          <Bar dataKey="dividends" name="Dividends" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;