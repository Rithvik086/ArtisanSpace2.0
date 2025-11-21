import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import { cn } from '../../styles/theme';

interface GraphCardProps {
  title: string;
  data: any[];
  dataKey: string;
  xKey: string;
  icon: React.ElementType;
  unit?: string;
}

export default function GraphCard({ title, data, dataKey, xKey, icon, unit }: GraphCardProps): React.ReactElement {
  const IconComponent = icon;
  return (
    <div className={cn('p-6 shadow-lg border border-amber-200', 'bg-white rounded-md')}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <IconComponent className="text-amber-700" size={24} />
        </div>
        <h3 className="text-xl font-semibold text-amber-900 font-serif">{title}</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8dc" />
            <XAxis dataKey={xKey} stroke="#92400e" fontSize={12} />
            <YAxis
              stroke="#92400e"
              fontSize={12}
              tickFormatter={(value: number) => (unit ? `${unit}${value/1000}k` : value.toString())}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fef7ed', 
                borderRadius: '12px', 
                borderColor: '#f59e0b',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => (unit ? `${unit}${value.toLocaleString()}` : value)}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#d97518" 
              strokeWidth={3} 
              dot={{ r: 5, fill: "#ef8b1f" }} 
              activeDot={{ r: 7, fill: "#d97518" }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
