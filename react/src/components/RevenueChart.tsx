import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const defaultData = [
  { month: `1月`, revenue: 320, cost: 210, profit: 110 },
  { month: `2月`, revenue: 280, cost: 190, profit: 90 },
  { month: `3月`, revenue: 410, cost: 260, profit: 150 },
  { month: `4月`, revenue: 380, cost: 240, profit: 140 },
  { month: `5月`, revenue: 520, cost: 310, profit: 210 },
  { month: `6月`, revenue: 490, cost: 295, profit: 195 },
  { month: `7月`, revenue: 610, cost: 350, profit: 260 },
  { month: `8月`, revenue: 580, cost: 340, profit: 240 },
  { month: `9月`, revenue: 720, cost: 420, profit: 300 },
  { month: `10月`, revenue: 680, cost: 400, profit: 280 },
  { month: `11月`, revenue: 830, cost: 470, profit: 360 },
  { month: `12月`, revenue: 940, cost: 520, profit: 420 },
];

interface RevenueChartProps {
  data?: { label: string; value: number; value2?: number }[];
  onPeriodChange?: (period: 'month' | 'quarter' | 'year') => void;
}

interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 16px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs" style={{ marginBottom: '2px' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--muted-foreground)' }}>{p.name}:</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 600, fontFamily: 'monospace' }}>
              ¥{p.value}万
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* Recharts SVG 属性使用 CSS 变量实现主题适配 */
const CHART_COLOR_PRIMARY = 'var(--color-primary-400)';
const CHART_COLOR_CYAN = 'var(--color-neon-cyan)';
const CHART_COLOR_GREEN = 'var(--color-neon-green)';

const RevenueChart: React.FC<RevenueChartProps> = ({ data, onPeriodChange }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const periods: { label: string; value: 'month' | 'quarter' | 'year' }[] = [
    { label: `月度`, value: 'month' },
    { label: `季度`, value: 'quarter' },
    { label: `年度`, value: 'year' },
  ];

  const chartData = data && data.length > 0
    ? data.map((d) => ({ month: d.label, revenue: d.value, cost: d.value2 ?? 0 }))
    : defaultData;

  return (
    <div data-cmp="RevenueChart" className="glass-card p-4 flex-1" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">营收趋势</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>2024年全年数据 (万元)</p>
        </div>
        <div className="flex gap-2">
          {periods.map((t, i) => (
            <button
              key={t.value}
              onClick={() => {
                setActiveIdx(i);
                onPeriodChange?.(t.value);
              }}
              className="btn-interactive text-xs px-3 py-1 rounded-lg"
              style={{
                background: i === activeIdx ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                color: i === activeIdx ? 'var(--primary)' : 'var(--muted-foreground)',
                border: `1px solid ${i === activeIdx ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-neon-green)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-neon-green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.08)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(129,140,248,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="营收"
            stroke={CHART_COLOR_PRIMARY}
            strokeWidth={2}
            fill="url(#colorRevenue)"
          />
          <Area
            type="monotone"
            dataKey="cost"
            name="成本"
            stroke={CHART_COLOR_CYAN}
            strokeWidth={2}
            fill="url(#colorCost)"
          />
          {!data && (
            <Area
              type="monotone"
              dataKey="profit"
              name="利润"
              stroke={CHART_COLOR_GREEN}
              strokeWidth={2}
              fill="url(#colorProfit)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
