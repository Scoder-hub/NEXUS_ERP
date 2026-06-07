import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  CalendarIcon,
  ClipboardListIcon,
  PlusIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CircleIcon,
  AlertCircleIcon,
  DownloadIcon,
  MoveHorizontalIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkOrder, WorkOrderStatus } from '../../types';
import { useProductionStore } from '../stores/production.store';

const DAYS = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
const DAY_LABELS = ['周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TOTAL_COLS = DAYS.length;
const GANTT_START_DAY = 20;

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  'pending':     { label: `待生产`, color: 'var(--color-neon-yellow)', bg: 'rgba(251,191,36,0.12)', Icon: CircleIcon },
  'in-progress': { label: `生产中`, color: 'var(--color-neon-cyan)', bg: 'rgba(34,211,238,0.12)', Icon: PlayCircleIcon },
  'completed':   { label: `已完成`, color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.12)', Icon: CheckCircleIcon },
};

const PRIORITY_CONFIG = {
  high:   { label: `高`, color: 'var(--destructive)' },
  medium: { label: `中`, color: 'var(--color-neon-yellow)' },
  low:    { label: `低`, color: 'var(--color-neon-green)' },
};

const GANTT_COLORS: Record<WorkOrderStatus, { bar: string; text: string }> = {
  'pending':     { bar: 'linear-gradient(90deg, var(--color-neon-yellow), var(--color-neon-yellow))', text: 'var(--color-neon-yellow)' },
  'in-progress': { bar: 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-secondary))', text: 'var(--color-neon-cyan)' },
  'completed':   { bar: 'linear-gradient(90deg, var(--color-neon-green), var(--color-neon-green))', text: 'var(--color-neon-green)' },
};

function dayNumFromDate(dateStr: string): number {
  return parseInt(dateStr.split('-')[1]);
}

function getGanttBar(startDate: string, endDate: string) {
  const start = dayNumFromDate(startDate);
  const end = dayNumFromDate(endDate);
  const left = Math.max(0, start - GANTT_START_DAY);
  const width = Math.max(1, end - start + 1);
  return { left: (left / TOTAL_COLS) * 100, width: (width / TOTAL_COLS) * 100 };
}

function formatDate(monthDay: string, dayOffset: number): string {
  const parts = monthDay.split('-');
  const month = parts[0];
  const day = parseInt(parts[1]) + dayOffset;
  return `${month}-${String(day).padStart(2, '0')}`;
}

interface DragState {
  orderId: string;
  startX: number;
  containerWidth: number;
  originalStartDay: number;
  originalEndDay: number;
  currentDayOffset: number;
}

const ProductionPlanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'gantt'>('list');
  const [filterStatus, setFilterStatus] = useState<WorkOrderStatus | 'all'>('all');
  const [searchVal, setSearchVal] = useState('');
  const [localOrders, setLocalOrders] = useState<WorkOrder[]>([]);

  const { workOrders, loading, fetchWorkOrders, createWorkOrder, updateWorkOrder } = useProductionStore();

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Sync store data to local state for drag operations
  useEffect(() => {
    setLocalOrders(workOrders);
  }, [workOrders]);

  const dragRef = useRef<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ orderId: string; dayOffset: number } | null>(null);
  const ganttAreaRef = useRef<HTMLDivElement>(null);

  const filtered = localOrders.filter(wo => {
    const matchStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchSearch = wo.name.includes(searchVal) || wo.id.includes(searchVal) || wo.product.includes(searchVal);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: localOrders.length,
    pending: localOrders.filter(w => w.status === 'pending').length,
    'in-progress': localOrders.filter(w => w.status === 'in-progress').length,
    completed: localOrders.filter(w => w.status === 'completed').length,
  };

  const handleStatusFilter = useCallback((status: WorkOrderStatus | 'all') => {
    setFilterStatus(status);
    if (status !== 'all') {
      fetchWorkOrders({ status });
    } else {
      fetchWorkOrders();
    }
  }, [fetchWorkOrders]);

  const handleCreateWorkOrder = useCallback(async () => {
    try {
      await createWorkOrder({});
      toast.success('工单创建成功');
    } catch (e: any) {
      toast.error(e.message || '创建工单失败');
    }
  }, [createWorkOrder]);

  const handleBarMouseDown = useCallback((e: React.MouseEvent, order: WorkOrder) => {
    e.preventDefault();
    e.stopPropagation();
    const container = ganttAreaRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    dragRef.current = {
      orderId: order.id,
      startX: e.clientX,
      containerWidth: rect.width,
      originalStartDay: dayNumFromDate(order.startDate),
      originalEndDay: dayNumFromDate(order.endDate),
      currentDayOffset: 0,
    };
    setDragPreview({ orderId: order.id, dayOffset: 0 });
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dayWidth = drag.containerWidth / TOTAL_COLS;
      const rawOffset = Math.round(dx / dayWidth);
      const minOffset = GANTT_START_DAY - drag.originalStartDay;
      const maxOffset = 30 - drag.originalEndDay;
      const dayOffset = Math.min(maxOffset, Math.max(minOffset, rawOffset));
      if (dayOffset !== drag.currentDayOffset) {
        drag.currentDayOffset = dayOffset;
        setDragPreview({ orderId: drag.orderId, dayOffset });
      }
    }

    function onMouseUp() {
      const drag = dragRef.current;
      if (!drag) return;
      const { orderId, originalStartDay, originalEndDay, currentDayOffset } = drag;
      if (currentDayOffset !== 0) {
        setLocalOrders(prev => prev.map(wo => {
          if (wo.id !== orderId) return wo;
          const newStartDay = originalStartDay + currentDayOffset;
          const newEndDay = originalEndDay + currentDayOffset;
          const month = wo.startDate.split('-')[0];
          const updated = {
            ...wo,
            startDate: `${month}-${String(newStartDay).padStart(2, '0')}`,
            endDate: `${month}-${String(newEndDay).padStart(2, '0')}`,
          };
          // Persist to backend
          updateWorkOrder(parseInt(orderId.replace(/\D/g, '')) || 0, {
            startDate: updated.startDate,
            endDate: updated.endDate,
          });
          return updated;
        }));
      }
      dragRef.current = null;
      setDragPreview(null);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateWorkOrder]);

  return (
    <div data-cmp="ProductionPlanPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1" style={{ background: 'var(--theme-content-bg)' }}>

      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-foreground">生产计划排程</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>6月排产计划 · 共 {localOrders.length} 张工单</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-placeholder flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--theme-btn-bg)', border: '1px solid var(--theme-btn-border)', color: 'var(--muted-foreground)' }}
            onClick={() => toast.info('导出功能开发中')}
          >
            <DownloadIcon size={14} />
            <span>导出</span>
          </button>
          <button
            className="btn-placeholder flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-secondary))', color: 'white', boxShadow: '0 4px 14px rgba(34,211,238,0.35)' }}
            onClick={handleCreateWorkOrder}
          >
            <PlusIcon size={14} />
            <span>新建工单</span>
          </button>
        </div>
      </div>

      {/* Status filter tags */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {([['all', '全部'], ['pending', '待生产'], ['in-progress', '生产中'], ['completed', '已完成']] as [WorkOrderStatus | 'all', string][]).map(([key, label]) => {
          const isActive = filterStatus === key;
          const cfg = key !== 'all' ? STATUS_CONFIG[key as WorkOrderStatus] : null;
          return (
            <button
              key={key}
              onClick={() => handleStatusFilter(key)}
              className="btn-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: isActive ? (cfg?.bg ?? 'rgba(129,140,248,0.15)') : 'var(--theme-btn-bg)',
                border: isActive ? `1px solid ${cfg?.color ?? 'var(--primary)'}50` : '1px solid var(--theme-btn-border)',
                color: isActive ? (cfg?.color ?? 'var(--primary)') : 'var(--muted-foreground)',
              }}
            >
              {key !== 'all' && cfg && <cfg.Icon size={12} />}
              <span>{label}</span>
              <span
                className="px-1.5 py-0 rounded-full text-xs"
                style={{ background: isActive ? (cfg?.color ?? 'var(--primary)') + '30' : 'var(--muted)', color: isActive ? (cfg?.color ?? 'var(--primary)') : 'var(--muted-foreground)' }}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-input-border)', minWidth: '200px' }}
        >
          <SearchIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder={`搜索工单/产品...`}
            className="bg-transparent text-xs outline-none text-foreground flex-1"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--theme-btn-border)' }}
        >
          {(['list', 'gantt'] as const).map(v => (
            <button
              key={v}
              onClick={() => setActiveTab(v)}
              className="btn-interactive flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
              style={{
                background: activeTab === v ? 'rgba(34,211,238,0.15)' : 'var(--theme-btn-bg)',
                color: activeTab === v ? 'var(--color-neon-cyan)' : 'var(--muted-foreground)',
              }}
            >
              {v === 'list' ? <ClipboardListIcon size={13} /> : <CalendarIcon size={13} />}
              <span>{v === 'list' ? '列表' : '甘特图'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      <div
        className="flex-1 overflow-auto rounded-2xl"
        style={{
          display: activeTab === 'list' ? 'block' : 'none',
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-card-border)',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-3 sticky top-0 z-10 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'var(--theme-card-bg)', borderBottom: '1px solid var(--theme-divider)', color: 'var(--muted-foreground)' }}
        >
          <div style={{ width: '130px', flexShrink: 0 }}>工单编号</div>
          <div className="flex-1 min-w-0">工单名称</div>
          <div style={{ width: '120px', flexShrink: 0 }}>产品型号</div>
          <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>计划数量</div>
          <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>优先级</div>
          <div style={{ width: '100px', flexShrink: 0, textAlign: 'center' }}>状态</div>
          <div style={{ width: '140px', flexShrink: 0 }}>计划时间</div>
          <div style={{ width: '140px', flexShrink: 0 }}>完成进度</div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无工单</div>
        ) : (
          filtered.map((wo, idx) => {
            const status = STATUS_CONFIG[wo.status];
            const priority = PRIORITY_CONFIG[wo.priority];
            return (
              <div
                key={wo.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-all cursor-pointer"
                style={{
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--theme-divider)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,211,238,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '130px', flexShrink: 0 }}>
                  <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-neon-cyan)' }}>{wo.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{wo.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{wo.workshop}</div>
                </div>
                <div style={{ width: '120px', flexShrink: 0 }}>
                  <span className="text-xs text-foreground">{wo.product}</span>
                </div>
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
                  <span className="text-sm font-semibold text-foreground">{wo.qty}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>{wo.unit}</span>
                </div>
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: priority.color, background: priority.color + '20', border: `1px solid ${priority.color}40` }}
                  >
                    {priority.label}
                  </span>
                </div>
                <div style={{ width: '100px', flexShrink: 0, textAlign: 'center' }}>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ color: status.color, background: status.bg }}
                  >
                    <status.Icon size={11} />
                    {status.label}
                  </span>
                </div>
                <div style={{ width: '140px', flexShrink: 0 }}>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <ClockIcon size={11} />
                    <span>{wo.startDate} → {wo.endDate}</span>
                  </div>
                </div>
                <div style={{ width: '140px', flexShrink: 0 }}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${wo.progress}%`,
                          background: wo.status === 'completed' ? 'var(--color-neon-green)' : wo.status === 'in-progress' ? 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-secondary))' : 'var(--color-neon-yellow)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: status.color, minWidth: '32px' }}>{wo.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gantt View */}
      <div
        className="flex-1 overflow-auto rounded-2xl"
        style={{
          display: activeTab === 'gantt' ? 'flex' : 'none',
          flexDirection: 'column',
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-card-border)',
        }}
      >
        {/* Gantt header */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--theme-divider)' }}>
          <div
            className="flex-shrink-0 flex items-center px-4 py-3"
            style={{ width: '260px', borderRight: '1px solid var(--theme-divider)' }}
          >
            <div className="flex items-center gap-2">
              <button className="btn-interactive p-1 rounded" style={{ color: 'var(--muted-foreground)' }}><ChevronLeftIcon size={14} /></button>
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>6月 2024</span>
              <button className="btn-interactive p-1 rounded" style={{ color: 'var(--muted-foreground)' }}><ChevronRightIcon size={14} /></button>
            </div>
          </div>
          <div className="flex flex-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="flex-1 flex flex-col items-center py-2 text-xs"
                style={{
                  borderRight: i < DAYS.length - 1 ? '1px solid var(--theme-divider)' : 'none',
                  background: d === '22' || d === '23' ? 'rgba(34,211,238,0.04)' : 'transparent',
                }}
              >
                <span style={{ color: 'var(--muted-foreground)' }}>{DAY_LABELS[i]}</span>
                <span
                  className="font-bold mt-0.5"
                  style={{ color: d === String(new Date().getDate()) ? 'var(--color-neon-cyan)' : 'var(--foreground)' }}
                >
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Drag hint */}
        <div className="flex items-center gap-1.5 px-4 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--theme-divider)', background: 'rgba(34,211,238,0.03)' }}>
          <MoveHorizontalIcon size={11} style={{ color: 'var(--color-neon-cyan)' }} />
          <span className="text-xs" style={{ color: 'var(--color-neon-cyan)', opacity: 0.7 }}>拖拽条形块可调整工单起止日期</span>
        </div>

        {/* Gantt rows */}
        {filtered.map((wo, idx) => {
          const isDragging = dragPreview?.orderId === wo.id;
          const dayOffset = isDragging ? dragPreview!.dayOffset : 0;
          const displayStart = isDragging
            ? formatDate(wo.startDate, dayOffset)
            : wo.startDate;
          const displayEnd = isDragging
            ? formatDate(wo.endDate, dayOffset)
            : wo.endDate;
          const bar = getGanttBar(displayStart, displayEnd);
          const originalBar = getGanttBar(wo.startDate, wo.endDate);
          const ganttColor = GANTT_COLORS[wo.status];
          const status = STATUS_CONFIG[wo.status];

          return (
            <div
              key={wo.id}
              className="flex items-center flex-shrink-0"
              style={{
                height: '52px',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--theme-divider)' : 'none',
              }}
            >
              {/* Left info */}
              <div
                className="flex-shrink-0 flex items-center gap-2 px-4"
                style={{ width: '260px', borderRight: '1px solid var(--theme-divider)', height: '100%' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground truncate">{wo.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{wo.id}</div>
                </div>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: status.color, background: status.bg, fontSize: '10px' }}
                >
                  {status.label}
                </span>
              </div>

              {/* Gantt bar area */}
              <div
                ref={idx === 0 ? ganttAreaRef : undefined}
                className="flex-1 relative"
                style={{ height: '100%', userSelect: 'none' }}
              >
                {/* Background grid */}
                <div className="flex h-full absolute inset-0">
                  {DAYS.map((d, i) => (
                    <div
                      key={d}
                      className="flex-1"
                      style={{
                        borderRight: i < DAYS.length - 1 ? '1px solid var(--theme-divider)' : 'none',
                        background: d === '22' || d === '23' ? 'rgba(34,211,238,0.03)' : 'transparent',
                      }}
                    />
                  ))}
                </div>

                {/* Today marker */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${((new Date().getDate() - 20) / TOTAL_COLS) * 100}%`,
                    width: '2px',
                    background: 'rgba(248,113,113,0.6)',
                    zIndex: 5,
                  }}
                />

                {/* Ghost bar */}
                <div
                  className="absolute top-1/2 rounded-lg"
                  style={{
                    left: `${originalBar.left}%`,
                    width: `${originalBar.width}%`,
                    height: '26px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(34,211,238,0.12)',
                    border: '1px dashed rgba(34,211,238,0.4)',
                    zIndex: 8,
                    opacity: isDragging ? 1 : 0,
                    transition: 'opacity 0.1s',
                    pointerEvents: 'none',
                  }}
                />

                {/* Gantt bar */}
                <div
                  className="absolute top-1/2 rounded-lg flex items-center px-2 overflow-hidden transition-shadow"
                  style={{
                    left: `${bar.left}%`,
                    width: `${bar.width}%`,
                    height: '26px',
                    transform: 'translateY(-50%)',
                    background: ganttColor.bar,
                    opacity: isDragging ? 0.72 : 1,
                    zIndex: isDragging ? 20 : 10,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    boxShadow: isDragging
                      ? '0 4px 20px rgba(34,211,238,0.55)'
                      : wo.status === 'in-progress' ? '0 2px 10px rgba(34,211,238,0.4)' : 'none',
                    transition: isDragging ? 'none' : 'left 0.15s, width 0.15s, box-shadow 0.2s',
                    scale: isDragging ? '1 1.08' : '1 1',
                  }}
                  onMouseDown={e => handleBarMouseDown(e, wo)}
                >
                  <div
                    className="absolute inset-0 left-0 rounded-lg opacity-20"
                    style={{ width: `${wo.progress}%`, background: 'rgba(255,255,255,0.4)' }}
                  />
                  <span className="text-xs font-medium relative z-10 truncate select-none" style={{ color: ganttColor.text, fontSize: '10px' }}>
                    {wo.name} · {wo.progress}%
                  </span>
                </div>

                {/* Date tooltip while dragging */}
                <div
                  className="absolute top-1/2 rounded-lg px-2 py-0.5 pointer-events-none"
                  style={{
                    left: `${bar.left}%`,
                    transform: 'translateY(-220%)',
                    background: 'var(--color-tooltip-bg)',
                    border: '1px solid rgba(34,211,238,0.4)',
                    color: 'var(--color-neon-cyan)',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    zIndex: 30,
                    opacity: isDragging ? 1 : 0,
                    transition: 'opacity 0.1s',
                  }}
                >
                  {displayStart} → {displayEnd}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionPlanPage;
