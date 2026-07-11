import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const ranges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1wk' },
  { label: '1M', value: '1mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'ALL', value: 'max' }
];

export default function StockChart({ ticker }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1y');

  useEffect(() => {
    if (!ticker) return;

    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/chart/${ticker}?range=${selectedRange}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Format dates for display
        const formattedData = data.map(item => {
          const dateObj = new Date(item.date);
          let dateStr = '';
          if (selectedRange === '1d' || selectedRange === '1wk') {
            dateStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (selectedRange === '1mo' || selectedRange === '1y') {
            dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
          } else {
            dateStr = dateObj.toLocaleDateString([], { year: 'numeric', month: 'short' });
          }
          return {
            ...item,
            formattedDate: dateStr,
            fullDate: dateObj.toLocaleString()
          };
        });
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
      setLoading(false);
    };

    fetchChartData();
  }, [ticker, selectedRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] p-3 rounded-lg shadow-lg">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-[var(--color-text-main)] font-semibold text-lg">
            ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-[var(--color-text-main)]">Historical Price</h3>
        <div className="flex space-x-1 bg-[var(--color-bg-main)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg-main)]/50 backdrop-blur-sm rounded-xl">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                tickFormatter={(val) => `₹${val}`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : !loading && (
          <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
            No chart data available.
          </div>
        )}
      </div>
    </div>
  );
}
