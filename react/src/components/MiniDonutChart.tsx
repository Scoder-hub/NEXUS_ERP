import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/* Recharts SVG 属性使用 CSS 变量实现主题适配 */
const salesData = [
  { name: `华东区`, value: 38, color: 'var(--color-primary-400)' },
  { name: `华南区`, value: 27, color: 'var(--color-neon-cyan)' },
  { name: `华北区`, value: 20, color: 'var(--color-neon-purple)' },
  { name: `其他`, value: 15, color: '#fb923c' },
];

const CustomLabel = ({ cx, cy }: any) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
    <tspan x={cx} dy="-8" style={{ fill: 'var(--foreground)', fontSize: '18px', fontWeight: 700, fontFamily: 'monospace' }}>
      100%
    </tspan>
    <tspan x={cx} dy="20" style={{ fill: 'var(--muted-foreground)', fontSize: '10px' }}>
      覆盖率
    </tspan>
  </text>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ color: payload[0].payload.color, fontWeight: 600 }}>{payload[0].name}</div>
        <div style={{ color: 'var(--foreground)', fontFamily: 'monospace' }}>{payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

const MiniDonutChart: React.FC = () => {
  return (
    <div data-cmp="MiniDonutChart" className="glass-card p-4" style={{ minWidth: '220px' }}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">销售区域分布</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>本月销售占比</p>
      </div>

      {/* Recharts SVG 属性使用 CSS 变量实现主题适配 */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={salesData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={<CustomLabel />}
          >
            {salesData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-2">
        {salesData.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.name}</span>
            </div>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniDonutChart;
