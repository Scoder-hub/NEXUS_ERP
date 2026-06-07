import React, { useState } from 'react';
import {
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  HardDriveIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  PlayIcon,
  TrashIcon,
  CalendarIcon,
  Loader2Icon,
  ZapIcon,
  ArchiveIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BackupRecord, BackupStatus } from '../../types';

const BACKUP_RECORDS: BackupRecord[] = [
  { id: 'B001', name: `full_backup_20241220_030000`, size: `2.3 GB`, time: `2024-12-20 03:00:00`, type: 'full', status: 'completed', modules: [`全部模块`] },
  { id: 'B002', name: `incr_backup_20241219_030000`, size: `128 MB`, time: `2024-12-19 03:00:00`, type: 'incremental', status: 'completed', modules: [`采购管理`, `销售管理`, `库存管理`] },
  { id: 'B003', name: `diff_backup_20241218_030000`, size: `340 MB`, time: `2024-12-18 03:00:00`, type: 'differential', status: 'completed', modules: [`财务管理`, `生产管理`] },
  { id: 'B004', name: `full_backup_20241215_030000`, size: `2.1 GB`, time: `2024-12-15 03:00:00`, type: 'full', status: 'completed', modules: [`全部模块`] },
  { id: 'B005', name: `incr_backup_20241214_030000`, size: `95 MB`, time: `2024-12-14 03:00:00`, type: 'incremental', status: 'failed', modules: [`人力资源`, `系统设置`] },
  { id: 'B006', name: `scheduled_backup_20241225`, size: `—`, time: `2024-12-25 03:00:00`, type: 'full', status: 'scheduled', modules: [`全部模块`] },
];

const statusConfig: Record<BackupStatus, { label: string; color: string; Icon: React.ElementType }> = {
  completed:  { label: `已完成`, color: 'var(--color-neon-green)', Icon: CheckCircleIcon },
  running:    { label: `进行中`, color: 'var(--primary)', Icon: Loader2Icon },
  failed:     { label: `失败`, color: 'var(--destructive)', Icon: XCircleIcon },
  scheduled:  { label: `已计划`, color: 'var(--color-neon-yellow)', Icon: CalendarIcon },
};

const typeConfig = {
  full:          { label: `全量备份`, color: 'var(--primary)' },
  incremental:   { label: `增量备份`, color: 'var(--color-neon-cyan)' },
  differential:  { label: `差异备份`, color: 'var(--color-neon-green)' },
};

const MODULES = [`采购管理`, `销售管理`, `库存管理`, `财务管理`, `生产管理`, `人力资源`, `系统设置`, `操作日志`];

const BackupRestorePage: React.FC = () => {
  const [records, setRecords] = useState<BackupRecord[]>(BACKUP_RECORDS);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential'>('full');
  const [selectedModules, setSelectedModules] = useState<string[]>(MODULES);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'records' | 'backup' | 'restore' | 'schedule'>('records');

  const handleStartBackup = () => {
    if (selectedModules.length === 0) {
      toast.error(`请至少选择一个备份模块`);
      return;
    }
    setIsBackingUp(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          const newRecord: BackupRecord = {
            id: `B${Date.now()}`,
            name: `manual_backup_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`,
            size: backupType === 'full' ? `2.4 GB` : `156 MB`,
            time: new Date().toLocaleString('zh-CN'),
            type: backupType,
            status: 'completed',
            modules: backupType === 'full' ? [`全部模块`] : selectedModules,
          };
          setRecords(prev => [newRecord, ...prev]);
          toast.success(`备份任务完成！`);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 400);
  };

  const handleRestore = (id: string) => {
    setRestoreTarget(null);
    toast.success(`数据恢复任务已启动，请稍后查看进度`);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast.success(`备份记录已删除`);
  };

  const toggleModule = (mod: string) => {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const totalSize = `12.8 GB`;
  const completedCount = records.filter(r => r.status === 'completed').length;

  return (
    <div data-cmp="BackupRestorePage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <DatabaseIcon size={20} style={{ color: 'var(--primary)' }} />
            数据备份与恢复
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            管理系统数据备份策略与恢复点
          </p>
        </div>
        <button onClick={() => setActiveTab('backup')} className="liquid-btn flex items-center gap-2 px-4 py-2 text-sm">
          <DownloadIcon size={14} />立即备份
        </button>
      </div>

      {/* Summary cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          { label: `备份总数`, value: `${records.length}`, Icon: ArchiveIcon, color: 'var(--primary)' },
          { label: `已完成`, value: `${completedCount}`, Icon: CheckCircleIcon, color: 'var(--color-neon-green)' },
          { label: `存储用量`, value: totalSize, Icon: HardDriveIcon, color: 'var(--color-neon-cyan)' },
          { label: `最近备份`, value: `今天 03:00`, Icon: ClockIcon, color: 'var(--color-neon-yellow)' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="glass-card flex-1 min-w-32 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{value}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--muted)', width: 'fit-content' }}>
        {[
          { id: 'records' as const, label: `备份记录`, Icon: ArchiveIcon },
          { id: 'backup' as const, label: `立即备份`, Icon: DownloadIcon },
          { id: 'restore' as const, label: `数据恢复`, Icon: UploadIcon },
          { id: 'schedule' as const, label: `定时计划`, Icon: CalendarIcon },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: activeTab === id ? 'var(--primary)' : 'transparent',
              color: activeTab === id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Records tab */}
      <div style={{ display: activeTab === 'records' ? 'block' : 'none' }}>
        <div className="glass-card overflow-hidden">
          <div className="flex items-center px-5 py-3 text-xs font-semibold"
            style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            <div style={{ flex: '0 0 48px' }}>类型</div>
            <div style={{ flex: 1 }}>备份名称</div>
            <div style={{ flex: '0 0 120px' }}>包含模块</div>
            <div style={{ flex: '0 0 80px' }}>大小</div>
            <div style={{ flex: '0 0 90px' }}>状态</div>
            <div style={{ flex: '0 0 160px' }}>时间</div>
            <div style={{ flex: '0 0 100px' }}>操作</div>
          </div>
          {records.map((r, idx) => {
            const sc = statusConfig[r.status];
            const tc = typeConfig[r.type];
            const StatusIcon = sc.Icon;
            return (
              <div key={r.id} className="flex items-center px-5 py-3.5"
                style={{ borderBottom: idx < records.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: '0 0 48px' }}>
                  <span className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ background: `${tc.color}18`, color: tc.color }}>
                    {r.type === 'full' ? `全量` : r.type === 'incremental' ? `增量` : `差异`}
                  </span>
                </div>
                <div style={{ flex: 1 }} className="pr-4">
                  <div className="text-xs font-mono text-foreground truncate">{r.name}</div>
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    {r.modules.join(', ')}
                  </div>
                </div>
                <div style={{ flex: '0 0 80px' }} className="text-xs text-foreground font-semibold">{r.size}</div>
                <div style={{ flex: '0 0 90px' }}>
                  <span className="flex items-center gap-1 text-xs w-fit px-2 py-0.5 rounded-full"
                    style={{ background: `${sc.color}18`, color: sc.color, border: `1px solid ${sc.color}25` }}>
                    <StatusIcon size={10} />{sc.label}
                  </span>
                </div>
                <div style={{ flex: '0 0 160px' }} className="text-xs">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{r.time}</span>
                </div>
                <div style={{ flex: '0 0 100px' }} className="flex items-center gap-1">
                  <button
                    onClick={() => setRestoreTarget(r.id)}
                    className="btn-interactive text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(34,211,238,0.25)' }}>
                    <UploadIcon size={10} />恢复
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="btn-interactive text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--destructive)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    <TrashIcon size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup tab */}
      <div style={{ display: activeTab === 'backup' ? 'block' : 'none' }}>
        <div className="flex gap-4 flex-wrap">
          <div className="glass-card flex-1 min-w-64 p-4">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <ZapIcon size={15} style={{ color: 'var(--primary)' }} />备份配置
            </h3>
            <div className="mb-5">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--muted-foreground)' }}>备份类型</label>
              <div className="flex gap-2">
                {(['full', 'incremental', 'differential'] as const).map(t => (
                  <button key={t} onClick={() => setBackupType(t)}
                    className="btn-interactive flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: backupType === t ? 'var(--primary)' : 'var(--muted)',
                      color: backupType === t ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      border: '1px solid var(--border)',
                    }}>
                    {typeConfig[t].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--muted-foreground)' }}>
                选择备份模块 <span style={{ color: 'var(--primary)' }}>({selectedModules.length}/{MODULES.length})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MODULES.map(mod => (
                  <button key={mod} onClick={() => toggleModule(mod)}
                    className="btn-interactive text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: selectedModules.includes(mod) ? 'rgba(99,102,241,0.15)' : 'var(--muted)',
                      color: selectedModules.includes(mod) ? 'var(--primary)' : 'var(--muted-foreground)',
                      border: selectedModules.includes(mod) ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
                    }}>
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {isBackingUp && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--muted-foreground)' }}>备份进度</span>
                  <span className="font-semibold text-foreground">{Math.min(100, Math.round(progress))}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progress)}%`, background: `linear-gradient(90deg, var(--color-primary-500), #06b6d4)` }} />
                </div>
                <div className="text-xs mt-1.5 animate-pulse" style={{ color: 'var(--primary)' }}>正在备份中，请勿关闭页面...</div>
              </div>
            )}

            <button onClick={handleStartBackup} disabled={isBackingUp}
              className="w-full liquid-btn flex items-center justify-center gap-2 py-3 font-semibold"
              style={{ opacity: isBackingUp ? 0.7 : 1 }}>
              {isBackingUp ? <RefreshCwIcon size={15} className="animate-spin" /> : <PlayIcon size={15} />}
              {isBackingUp ? `备份中...` : `开始备份`}
            </button>
          </div>

          <div className="glass-card flex-1 min-w-64 p-4">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheckIcon size={15} style={{ color: 'var(--color-neon-green)' }} />备份策略说明
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { title: `全量备份`, desc: `备份所有选中模块的完整数据。耗时较长，恢复最可靠，建议每周一次。`, color: 'var(--primary)' },
                { title: `增量备份`, desc: `仅备份上次备份后的变更数据。速度快、占用空间小，建议每日执行。`, color: 'var(--color-neon-cyan)' },
                { title: `差异备份`, desc: `备份自上次全量备份以来的所有变更。兼顾速度与恢复效率。`, color: 'var(--color-neon-green)' },
              ].map(({ title, desc, color }) => (
                <div key={title} className="p-3 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ color }}>{title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</div>
                </div>
              ))}
              <div className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                <AlertTriangleIcon size={14} style={{ color: 'var(--color-neon-yellow)', marginTop: 1, flexShrink: 0 }} />
                <div className="text-xs leading-relaxed" style={{ color: 'var(--color-neon-yellow)' }}>
                  备份期间系统性能可能略有下降，建议在业务低峰期执行
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restore tab */}
      <div style={{ display: activeTab === 'restore' ? 'block' : 'none' }}>
        <div className="glass-card p-4">
          <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <AlertTriangleIcon size={18} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>数据恢复风险提示</div>
              <div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                恢复操作将覆盖当前数据库中对应模块的所有数据，此操作不可逆。建议在执行恢复前先对当前数据进行备份，并确保所有用户已退出系统。
              </div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-3">选择恢复点</h3>
          <div className="flex flex-col gap-2">
            {records.filter(r => r.status === 'completed').map(r => {
              const tc = typeConfig[r.type];
              return (
                <div key={r.id}
                  className="btn-interactive flex items-center gap-4 p-4 rounded-xl cursor-pointer"
                  style={{
                    background: restoreTarget === r.id ? 'rgba(34,211,238,0.08)' : 'var(--muted)',
                    border: restoreTarget === r.id ? '1px solid rgba(34,211,238,0.3)' : '1px solid var(--border)',
                  }}
                  onClick={() => setRestoreTarget(r.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${tc.color}18`, border: `1px solid ${tc.color}30` }}>
                    <DatabaseIcon size={16} style={{ color: tc.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground font-mono">{r.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {r.time} · {r.size} · {r.modules.join(', ')}
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: restoreTarget === r.id ? 'var(--color-neon-cyan)' : 'var(--border)',
                      background: restoreTarget === r.id ? 'var(--color-neon-cyan)' : 'transparent',
                    }}>
                    {restoreTarget === r.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => restoreTarget && handleRestore(restoreTarget)}
            disabled={!restoreTarget}
            className="btn-interactive mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
            style={{
              background: restoreTarget ? 'rgba(244,63,94,0.15)' : 'var(--muted)',
              color: restoreTarget ? 'var(--destructive)' : 'var(--muted-foreground)',
              border: restoreTarget ? '1px solid rgba(244,63,94,0.35)' : '1px solid var(--border)',
              cursor: restoreTarget ? 'pointer' : 'not-allowed',
            }}>
            <UploadIcon size={15} />执行数据恢复
          </button>
        </div>
      </div>

      {/* Schedule tab */}
      <div style={{ display: activeTab === 'schedule' ? 'block' : 'none' }}>
        <div className="glass-card p-4">
          <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
            <CalendarIcon size={15} style={{ color: 'var(--primary)' }} />自动备份计划
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { name: `每日增量备份`, time: `每天 03:00`, type: `增量备份`, status: true, nextRun: `明天 03:00`, color: 'var(--color-neon-cyan)' },
              { name: `每周全量备份`, time: `每周日 02:00`, type: `全量备份`, status: true, nextRun: `2024-12-22 02:00`, color: 'var(--primary)' },
              { name: `月度全量归档`, time: `每月1日 01:00`, type: `全量备份`, status: false, nextRun: `2025-01-01 01:00`, color: 'var(--color-neon-green)' },
            ].map(({ name, time, type, status, nextRun, color }) => (
              <div key={name} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <CalendarIcon size={16} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {time} · {type} · 下次执行：{nextRun}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: status ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)', color: status ? 'var(--color-neon-green)' : '#64748b' }}>
                    {status ? `已启用` : `已禁用`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;
