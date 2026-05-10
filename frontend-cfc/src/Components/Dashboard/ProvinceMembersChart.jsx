import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProvinceColors } from '../../Hooks/useProvinceColors';

const ProvinceMembersChart = ({ data }) => {
  const { getColor } = useProvinceColors();

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Members by Region</h3>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">EB, CR, and GM Distribution</p>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="province" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'black', color: '#0f172a', marginBottom: '8px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="eb" name="Executive Board" stackId="a" radius={[0, 0, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`eb-${index}`} fill={getColor(entry.province)} fillOpacity={1} />
              ))}
            </Bar>
            <Bar dataKey="cr" name="Campus Reps" stackId="a">
              {data.map((entry, index) => (
                <Cell key={`cr-${index}`} fill={getColor(entry.province)} fillOpacity={0.6} />
              ))}
            </Bar>
            <Bar dataKey="gm" name="General Members" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`gm-${index}`} fill={getColor(entry.province)} fillOpacity={0.3} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProvinceMembersChart;
