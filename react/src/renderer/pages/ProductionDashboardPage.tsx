import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingDownIcon,
  ActivityIcon,
  ZapIcon,
  PackageIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  TimerIcon,
  CalendarIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { useProductionStore } from '../stores/production.store';

type TimeRange = '今日' | '本周' | '本月';

const CAPACITY_DATA = [
  { name: `已用产能`, value: 74, color: 'var(--color-neon-cyan)' },
  { name: `可用产能`, value: 18, color: 'var(--color-neon-secondary)' },
  { name: `维护停机`, value: 8, color: 'var(--color-neon-secondary)' },
];

const ALERT_CFG = {
  error: { color: 'var(--destructive)', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)', Icon: AlertTriangleIcon },
  warn:  { color: 'var(--color-neon-yellow)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', Icon: AlertTriangleIcon },
  info:  { color: 'var(--color-neon-cyan)', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)', Icon: ActivityIcon },
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{ background: 'var(--color-tooltip-bg)', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--foreground)' }}
    >
      <div className="font-medium mb-1" style={{ color: 'var(--color-neon-cyan)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span style={{ color: 'var(--muted-foreground)' }}>{p.name ?? p.dataKey}:</span>
          <span className="font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const DonutCenter = ({ cx, cy, value }: { cx: number; cy: number; value: number }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--color-neon-cyan)" fontSize={28} fontWeight={700}>{value}%</text>
    <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>产能利用率</text>
  </>
);

const TIME_RANGES: TimeRange[] = ['今日', '本周', '本月'];

const TimeRangeSwitcher: React.FC<{ value: TimeRange; onChange: (v: TimeRange) => void }> = ({
  value = '本周',
  onChange = () => {},
}) => (
  <div
    className="flex items-center gap-1 rounded-xl p-1"
    style={{ background: 'var(--theme-btn-bg)', border: '1px solid var(--theme-btn-border)' }}
  >
    {TIME_RANGES.map(range => (
      <button
        key={range}
        onClick={() => onChange(range)}
        className="btn-interactive px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={{
          background: value === range ? 'rgba(34,211,238,0.12)' : 'transparent',
          color: value === range ? 'var(--color-neon-cyan)' : 'var(--muted-foreground)',
          border: value === range ? '1px solid rgba(34,211,238,0.5)' : '1px solid transparent',
        }}
      >
        {range}
      </button>
    ))}
  </div>
);

const ProductionDashboardPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('今日');

  const { stats, fetchStats } = useProductionStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
    setTimeout(() => setRefreshing(false), 1200);
  }, [fetchStats]);

  // Use stats from store or fallback defaults
  const kpi = stats?.kpi ?? {
    output: '—', oee: '—', avail: '—', quality: '—', achieve: '—',
    outputDelta: '', oeeDelta: '', availDelta: '', qualityDelta: '', achieveDelta: '',
    outputUp: true, oeeUp: true, availUp: true, qualityUp: true, achieveUp: true,
    comparison: '',
  };

  const outputData = stats?.outputData ?? [];
  const uptimeData = stats?.uptimeData ?? [];
  const qualityTrend = stats?.qualityTrend ?? [];
  const alertList = stats?.alerts ?? [];

  return (
    <div
      data-cmp="ProductionDashboardPage"
      className="flex flex-col gap-4 p-4 overflow-y-auto flex-1"
      style={{ background: 'var(--theme-content-bg)' }}
    >

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-foreground">生产数据可视化看板</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>实时数据 · 最后更新 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-interactive flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--color-neon-cyan)' }}
        >
          <RefreshCwIcon size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>刷新</span>
        </button>
      </div>

      {/* Time Range Switcher */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>数据周期</span>
        </div>
        <TimeRangeSwitcher value={timeRange} onChange={setTimeRange} />
      </div>

      {/* KPI row */}
      <div className="flex gap-4 flex-shrink-0">
        {[
          { label: `${timeRange}产量`, val: kpi.output, unit: `件`, delta: kpi.outputDelta, up: kpi.outputUp, color: 'var(--color-neon-cyan)', Icon: PackageIcon },
          { label: `综合效率 OEE`, val: kpi.oee, unit: `%`, delta: kpi.oeeDelta, up: kpi.oeeUp, color: 'var(--color-neon-green)', Icon: ZapIcon },
          { label: `设备稼动率`, val: kpi.avail, unit: `%`, delta: kpi.availDelta, up: kpi.availUp, color: 'var(--color-neon-purple)', Icon: ActivityIcon },
          { label: `产品合格率`, val: kpi.quality, unit: `%`, delta: kpi.qualityDelta, up: kpi.qualityUp, color: 'var(--color-neon-secondary)', Icon: CheckCircleIcon },
          { label: `计划达成率`, val: kpi.achieve, unit: `%`, delta: kpi.achieveDelta, up: kpi.achieveUp, color: 'var(--color-neon-yellow)', Icon: TimerIcon },
        ].map(item => (
          <div
            key={item.label}
            className="flex-1 rounded-2xl px-4 py-3 transition-all"
            style={{ background: 'var(--theme-card-bg)', border: `1px solid ${item.color}25` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: item.color + '20' }}>
                <item.Icon size={13} style={{ color: item.color }} />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold" style={{ color: item.color }}>{item.val}</span>
              <span className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{item.unit}</span>
            </div>
            {item.delta && (
              <div className="flex items-center gap-1 mt-1 text-xs">
                {item.up ? <ArrowUpIcon size={11} style={{ color: 'var(--color-neon-green)' }} /> : <TrendingDownIcon size={11} style={{ color: 'var(--destructive)' }} />}
                <span style={{ color: item.up ? 'var(--color-neon-green)' : 'var(--destructive)' }}>{item.delta}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>{kpi.comparison}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart row 1: Donut + Line */}
      <div className="flex gap-4 flex-shrink-0">

        {/* Capacity Donut */}
        <div
          className="rounded-2xl p-4"
          style={{ width: '320px', flexShrink: 0, background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">产能利用分布</h3>
            <span className="text-xs font-mono" style={{ color: 'var(--color-neon-cyan)' }}>本月</span>
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CAPACITY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CAPACITY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <DonutCenter cx={160} cy={90} value={74} />
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {CAPACITY_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>{d.name}</span>
                </div>
                <span className="font-semibold" style={{ color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Output line chart */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">
              {timeRange === '今日' ? '今日产量趋势（按小时）' : timeRange === '本周' ? '本周日产量趋势' : '本月产量走势'}
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded" style={{ background: 'var(--color-neon-cyan)' }} />
                <span style={{ color: 'var(--muted-foreground)' }}>实际产量</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded" style={{ background: 'rgba(251,191,36,0.6)', borderTop: '2px dashed var(--color-neon-yellow)' }} />
                <span style={{ color: 'var(--muted-foreground)' }}>目标产量</span>
              </div>
            </div>
          </div>
          {outputData.length > 0 ? (
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={outputData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.08)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone" dataKey="target" stroke="var(--color-neon-yellow)" strokeWidth={1.5}
                    strokeDasharray="5 3" dot={false} name={`目标产量`}
                  />
                  <Line
                    type="monotone" dataKey="output" stroke="var(--color-neon-cyan)" strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--color-neon-cyan)', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'var(--color-neon-cyan)', strokeWidth: 2, stroke: 'var(--color-neon-cyan)' }}
                    name={`实际产量`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无数据</div>
          )}
        </div>
      </div>

      {/* Chart row 2: Equipment uptime bar + Alerts */}
      <div className="flex gap-4 flex-shrink-0">

        {/* Equipment uptime bar */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">设备稼动率分析</h3>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{timeRange}平均</span>
          </div>
          {uptimeData.length > 0 ? (
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uptimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="uptime" radius={[4, 4, 0, 0]} name={`稼动率`} unit="%">
                    {uptimeData.map((entry: any, i: number) => (
                      <Cell
                        key={i}
                        fill={entry.uptime >= 90 ? 'var(--color-neon-green)' : entry.uptime >= 75 ? 'var(--color-neon-cyan)' : entry.uptime >= 60 ? 'var(--color-neon-yellow)' : 'var(--destructive)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无数据</div>
          )}
        </div>

        {/* Quality trend small line */}
        <div
          className="rounded-2xl p-4"
          style={{ width: '280px', flexShrink: 0, background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">质量合格率</h3>
            <span className="text-xs font-mono" style={{ color: 'var(--color-neon-green)' }}>{kpi.quality}%</span>
          </div>
          {qualityTrend.length > 0 ? (
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[96, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone" dataKey="rate" stroke="var(--color-neon-green)" strokeWidth={2}
                    dot={{ r: 2.5, fill: 'var(--color-neon-green)', strokeWidth: 0 }}
                    name={`合格率`} unit="%"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无数据</div>
          )}

          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--theme-divider)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>异常预警</div>
            <div className="flex flex-col gap-1.5 overflow-auto" style={{ maxHeight: '120px' }}>
              {alertList.map((a: any) => {
                const cfg = ALERT_CFG[a.level as keyof typeof ALERT_CFG] || ALERT_CFG.info;
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <cfg.Icon size={11} style={{ color: cfg.color, marginTop: '2px', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-tight" style={{ color: cfg.color, fontSize: '10px' }}>{a.msg}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboardPage;
