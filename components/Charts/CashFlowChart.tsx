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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            fontSize={12}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickFormatter={(val) => `€${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
            cursor={{fill: '#334155', opacity: 0.2}}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLine y={0} stroke="#475569" />
          <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withdrawals" name="Withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dividends" name="Dividends" fill="#eab308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;