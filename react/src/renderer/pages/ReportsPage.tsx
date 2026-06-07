import React, { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  FileTextIcon,
  DownloadIcon,
  CalendarIcon,
  TrendingUpIcon,
  BarChart2Icon,
  PieChartIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReportsStore } from '../stores/reports.store';

const radarData = [
  { subject: `销售`, A: 88 },
  { subject: `采购`, A: 75 },
  { subject: `库存`, A: 92 },
  { subject: `财务`, A: 81 },
  { subject: `人力`, A: 70 },
  { subject: `运营`, A: 85 },
];

const trendData = [
  { m: `1月`, revenue: 420, profit: 140 },
  { m: `2月`, revenue: 380, profit: 110 },
  { m: `3月`, revenue: 510, profit: 175 },
  { m: `4月`, revenue: 490, profit: 162 },
  { m: `5月`, revenue: 620, profit: 210 },
  { m: `6月`, revenue: 580, profit: 195 },
  { m: `7月`, revenue: 710, profit: 248 },
  { m: `8月`, revenue: 680, profit: 232 },
  { m: `9月`, revenue: 790, profit: 276 },
  { m: `10月`, revenue: 750, profit: 261 },
  { m: `11月`, revenue: 830, profit: 298 },
  { m: `12月`, revenue: 760, profit: 255 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--color-tooltip-bg)', border: '1px solid var(--color-tooltip-border)', borderRadius: '8px', padding: '8px 12px' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--foreground)', fontFamily: 'monospace' }}>{p.name}: ¥{p.value}万</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState(0);
  const { reports, loading, fetchReports, generateReport } = useReportsStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    try {
      await generateReport({ name: `新报告`, type: `综合` });
      toast.success('报告生成中');
    } catch {
      toast.error('生成失败');
    }
  };

  return (
    <div data-cmp="ReportsPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header stats */}
      <div className="flex gap-4">
        {[
          { label: `报告总数`, value: `${reports.length} 份`, Icon: FileTextIcon, color: 'var(--primary)' },
          { label: `本月生成`, value: `-- 份`, Icon: BarChart2Icon, color: 'var(--color-neon-cyan)' },
          { label: `数据覆盖`, value: `6 模块`, Icon: PieChartIcon, color: 'var(--color-neon-purple)' },
          { label: `年度增长`, value: `--%`, Icon: TrendingUpIcon, color: 'var(--color-neon-green)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 glass-card p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
              <s.Icon size={15} style={{ color: s.color }} />
            </div>
            <div className="text-base font-bold font-mono text-foreground">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="flex gap-4">
        {/* Trend */}
        <div className="flex-1 glass-card p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">年度营收与利润趋势</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>2024年全年 (万元)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.08)" />
              <XAxis dataKey="m" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="营收" stroke="var(--color-primary-400)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="利润" stroke="var(--color-neon-green)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass-card p-4" style={{ width: '280px', flexShrink: 0 }}>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">各模块绩效雷达</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>综合评分</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(129,140,248,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
              <Radar
                name="绩效"
                dataKey="A"
                stroke="var(--color-primary-400)"
                fill="var(--color-primary-400)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report list */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">报告库</h3>
          <button className="btn-placeholder liquid-btn flex items-center gap-1.5 text-xs px-3 py-1.5" onClick={handleGenerate}>
            <BarChart2Icon size={11} /> 生成新报告
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>加载中...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>暂无报告</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reports.map((r: any, i: number) => (
              <div
                key={r.id || i}
                onClick={() => setActiveReport(i)}
                className="btn-interactive flex items-center gap-4 p-3 rounded-xl cursor-pointer"
                style={{
                  background: activeReport === i ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeReport === i ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
                  <FileTextIcon size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{r.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.size || '--'}</span>
                    <span className="text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>·</span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <CalendarIcon size={10} />
                      {r.date || r.created_at?.split('T')[0] || '--'}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                  style={{
                    background: 'rgba(129,140,248,0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(129,140,248,0.2)',
                  }}
                >
                  {r.type}
                </span>
                <div
                  className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                  style={{
                    background: r.status === `completed` ? 'rgba(52,211,153,0.1)' : 'rgba(251,146,60,0.1)',
                    color: r.status === `completed` ? 'var(--color-neon-green)' : 'var(--color-neon-yellow)',
                    border: `1px solid ${r.status === `completed` ? 'rgba(52,211,153,0.2)' : 'rgba(251,146,60,0.2)'}`,
                  }}
                >
                  {r.status === 'completed' ? '已生成' : r.status === 'generating' ? '生成中' : r.status}
                </div>
                <button
                  className="btn-interactive w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted-foreground)' }}
                >
                  <DownloadIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
