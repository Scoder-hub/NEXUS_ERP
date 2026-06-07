import React, { useState, useEffect, useCallback } from 'react';
import {
  HardHatIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PauseCircleIcon,
  WrenchIcon,
  ThermometerIcon,
  ZapIcon,
  ClockIcon,
  SendIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkStation, ProcessCard, ReportRecord } from '../../types';
import { useProductionStore } from '../stores/production.store';

const WS_STATUS_CONFIG = {
  running:     { label: `运行中`, color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.12)', Icon: ActivityIcon, pulse: true },
  idle:        { label: `空闲`,   color: 'var(--muted-foreground)', bg: 'rgba(148,163,184,0.12)', Icon: PauseCircleIcon, pulse: false },
  maintenance: { label: `维护中`, color: 'var(--color-neon-purple)', bg: 'rgba(167,139,250,0.12)', Icon: WrenchIcon, pulse: false },
  warning:     { label: `异常`,   color: 'var(--destructive)', bg: 'rgba(244,63,94,0.12)', Icon: AlertTriangleIcon, pulse: true },
};

const PROC_STATUS = {
  completed:   { label: `完成`, color: 'var(--color-neon-green)', lineColor: 'var(--color-neon-green)' },
  'in-progress': { label: `进行`, color: 'var(--color-neon-cyan)', lineColor: 'var(--color-neon-cyan)' },
  pending:     { label: `待处理`, color: 'var(--muted-foreground)', lineColor: 'var(--theme-divider)' },
};

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function nudge(val: number, delta: number, min: number, max: number) {
  return clamp(val + Math.round((Math.random() * 2 - 1) * delta), min, max);
}

function formatTimestamp(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

const WorkshopExecPage: React.FC = () => {
  const [reportForm, setReportForm] = useState({ workOrder: '', station: '', qty: '', defect: '0', note: '' });
  const [submitted, setSubmitted] = useState(false);

  const {
    workStations, processCards, reportRecords, loading,
    fetchWorkStations, fetchProcessCards, submitReport,
  } = useProductionStore();

  // Local station state for simulated real-time updates
  const [stations, setStations] = useState<WorkStation[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(formatTimestamp(new Date()));
  const [refreshSpin, setRefreshSpin] = useState(false);

  useEffect(() => {
    fetchWorkStations();
    fetchProcessCards('WO-2024-004');
  }, [fetchWorkStations, fetchProcessCards]);

  // Sync store data to local state
  useEffect(() => {
    if (workStations.length > 0) {
      setStations(workStations);
    }
  }, [workStations]);

  // Simulate real-time data refresh every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStations(prev => prev.map(ws => {
        if (ws.status === 'idle' || ws.status === 'maintenance') return ws;
        return {
          ...ws,
          efficiency: nudge(ws.efficiency, 3, 40, 100),
          temp: nudge(ws.temp, 2, 30, 105),
          load: nudge(ws.load, 4, 20, 100),
        };
      }));
      setLastUpdated(formatTimestamp(new Date()));
      setRefreshSpin(true);
      setTimeout(() => setRefreshSpin(false), 800);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReport({
        workOrderId: reportForm.workOrder,
        station: reportForm.station,
        qty: parseInt(reportForm.qty) || 0,
        defect: parseInt(reportForm.defect) || 0,
        note: reportForm.note,
      });
      setSubmitted(true);
      toast.success('报工提交成功');
      setTimeout(() => setSubmitted(false), 2500);
      setReportForm({ workOrder: '', station: '', qty: '', defect: '0', note: '' });
    } catch (err: any) {
      toast.error(err.message || '报工提交失败');
    }
  }, [submitReport, reportForm]);

  const handleRefresh = useCallback(() => {
    fetchWorkStations();
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 800);
  }, [fetchWorkStations]);

  const running = stations.filter(w => w.status === 'running').length;
  const warning = stations.filter(w => w.status === 'warning').length;
  const maintenance = stations.filter(w => w.status === 'maintenance').length;

  return (
    <div data-cmp="WorkshopExecPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1" style={{ background: 'var(--theme-content-bg)' }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-foreground">车间执行管理</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>实时监控 · 当前班次 08:00 – 20:00</p>
        </div>
        <button
          className="btn-placeholder flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--color-neon-green)' }}
          onClick={handleRefresh}
        >
          <RefreshCwIcon size={13} />
          <span>刷新</span>
        </button>
      </div>

      {/* Summary KPI row */}
      <div className="flex gap-4 flex-shrink-0">
        {[
          { label: `总工位`, val: stations.length, color: 'var(--color-neon-cyan)', icon: HardHatIcon },
          { label: `运行中`, val: running, color: 'var(--color-neon-green)', icon: ActivityIcon },
          { label: `异常`, val: warning, color: 'var(--destructive)', icon: AlertTriangleIcon },
          { label: `维护中`, val: maintenance, color: 'var(--color-neon-purple)', icon: WrenchIcon },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.color + '20' }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.val}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Workstation grid + Process flow */}
        <div className="flex flex-col gap-4" style={{ flex: '1 1 0', minWidth: 0 }}>

          {/* Workstation cards */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">工位状态总览</h3>
              <div className="flex items-center gap-2">
                <RefreshCwIcon
                  size={12}
                  style={{
                    color: 'var(--color-neon-cyan)',
                    animation: refreshSpin ? 'spin 0.7s linear' : 'none',
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  更新于 <span style={{ color: 'var(--color-neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>{lastUpdated}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {stations.map(ws => {
                const cfg = WS_STATUS_CONFIG[ws.status as keyof typeof WS_STATUS_CONFIG] || WS_STATUS_CONFIG.idle;
                return (
                  <div
                    key={ws.id}
                    className="btn-interactive rounded-xl p-3 cursor-pointer"
                    style={{
                      width: 'calc(33.333% - 8px)',
                      background: 'rgba(15,23,42,0.6)',
                      border: `1px solid ${cfg.color}30`,
                      backdropFilter: 'blur(8px)',
                      position: 'relative',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = cfg.color + '80')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = cfg.color + '30')}
                  >
                    <div
                      className="absolute flex items-center gap-1"
                      style={{ top: '8px', right: '10px' }}
                    >
                      <RefreshCwIcon
                        size={10}
                        style={{
                          color: cfg.color,
                          opacity: 0.7,
                          animation: refreshSpin ? 'spin 0.7s linear' : 'none',
                        }}
                      />
                      <span style={{ fontSize: '9px', color: cfg.color, opacity: 0.65, fontVariantNumeric: 'tabular-nums' }}>
                        {lastUpdated}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2" style={{ paddingRight: '80px' }}>
                      <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{ws.id}</span>
                      <span
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.pulse && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                          />
                        )}
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>{ws.name}</div>
                    <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{ws.type}</div>

                    <div
                      className="text-xs px-2 py-1 rounded-lg mb-2 truncate"
                      style={{ background: 'rgba(34,211,238,0.08)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(34,211,238,0.15)' }}
                    >
                      {ws.currentJob}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <ZapIcon size={10} style={{ color: cfg.color }} />
                        <span style={{ color: cfg.color, fontVariantNumeric: 'tabular-nums', minWidth: '28px', display: 'inline-block' }}>{ws.efficiency}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <ThermometerIcon size={10} />
                        <span style={{ color: ws.temp > 80 ? 'var(--destructive)' : 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', minWidth: '36px', display: 'inline-block' }}>{ws.temp}°C</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>负载: </span>
                        <span style={{ color: ws.load > 90 ? 'var(--destructive)' : 'var(--color-neon-cyan)', fontVariantNumeric: 'tabular-nums' }}>{ws.load}%</span>
                      </div>
                    </div>

                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ws.load}%`,
                          background: ws.load > 90 ? 'var(--destructive)' : ws.load > 70 ? 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-secondary))' : 'var(--color-neon-green)',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <HardHatIcon size={10} />
                      <span>{ws.operator}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Process flow */}
          <div
            className="rounded-2xl p-4 flex-1"
            style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">工序流程追踪</h3>
              <span className="text-xs font-mono" style={{ color: 'var(--color-neon-cyan)' }}>WO-2024-004 · 传动轴 D-260</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {processCards.map((proc, idx) => {
                const cfg = PROC_STATUS[proc.status as keyof typeof PROC_STATUS] || PROC_STATUS.pending;
                const isLast = idx === processCards.length - 1;
                return (
                  <React.Fragment key={proc.id}>
                    <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '90px' }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs font-bold mb-2 transition-all"
                        style={{
                          borderColor: cfg.color,
                          background: proc.status === 'pending' ? 'transparent' : cfg.color + '20',
                          color: cfg.color,
                          boxShadow: proc.status === 'in-progress' ? `0 0 12px ${cfg.color}60` : 'none',
                        }}
                      >
                        {proc.status === 'completed' ? <CheckCircleIcon size={16} /> : proc.seq}
                      </div>
                      <div className="text-xs font-semibold text-center" style={{ color: cfg.color }}>{proc.name}</div>
                      <div className="text-xs text-center mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{proc.station}</div>
                      <div className="text-xs text-center mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                        {proc.status === 'completed' ? `${proc.actualDuration}min` : proc.status === 'in-progress' ? `${proc.actualDuration}/${proc.duration}min` : `计划${proc.duration}min`}
                      </div>
                      <div
                        className="mt-1 text-xs px-1.5 py-0.5 rounded text-center"
                        style={{ background: cfg.color + '15', color: cfg.color, fontSize: '10px' }}
                      >
                        {cfg.label}
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        className="flex-1 h-0.5 rounded-full flex-shrink-0"
                        style={{
                          minWidth: '20px',
                          background: proc.status === 'completed' ? 'var(--color-neon-green)' : proc.status === 'in-progress' ? 'linear-gradient(90deg, var(--color-neon-green), var(--theme-divider))' : 'var(--theme-divider)',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Report form + recent reports */}
        <div className="flex flex-col gap-4" style={{ width: '320px', flexShrink: 0 }}>

          {/* Report form */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--theme-card-bg)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                <SendIcon size={13} style={{ color: 'var(--color-neon-green)' }} />
              </div>
              <h3 className="text-sm font-bold text-foreground">生产报工</h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {[
                { label: `工单编号`, key: 'workOrder', type: 'text' },
                { label: `工位`, key: 'station', type: 'text' },
                { label: `完成数量`, key: 'qty', type: 'number' },
                { label: `不良品数`, key: 'defect', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={reportForm[field.key as keyof typeof reportForm]}
                    onChange={e => setReportForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--theme-input-bg)',
                      border: '1px solid var(--theme-input-border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(52,211,153,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--theme-input-border)')}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>备注</label>
                <textarea
                  value={reportForm.note}
                  onChange={e => setReportForm(prev => ({ ...prev, note: e.target.value }))}
                  rows={2}
                  placeholder={`异常情况说明...`}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{
                    background: 'var(--theme-input-bg)',
                    border: '1px solid var(--theme-input-border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(52,211,153,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--theme-input-border)')}
                />
              </div>
              <button
                type="submit"
                className="btn-interactive w-full py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: submitted ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg, var(--color-neon-green), var(--color-neon-green))',
                  color: submitted ? 'var(--color-neon-green)' : 'var(--foreground)',
                  boxShadow: submitted ? 'none' : '0 4px 14px rgba(52,211,153,0.3)',
                }}
              >
                {submitted ? `✓ 报工成功` : `提交报工`}
              </button>
            </form>
          </div>

          {/* Recent reports */}
          <div
            className="rounded-2xl p-4 flex-1"
            style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">最近报工记录</h3>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>今日</span>
            </div>
            <div className="flex flex-col gap-2">
              {reportRecords.map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(34,211,238,0.1)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-neon-cyan)' }}>{r.workOrderId}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <ClockIcon size={10} className="inline mr-1" />{r.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-foreground font-medium">{r.station}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{r.operator}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span style={{ color: 'var(--color-neon-green)' }}>完成 <strong>{r.qty}</strong> 件</span>
                    {r.defect > 0 && (
                      <span style={{ color: 'var(--destructive)' }}>不良 <strong>{r.defect}</strong> 件</span>
                    )}
                  </div>
                  {r.note && (
                    <div className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkshopExecPage;
