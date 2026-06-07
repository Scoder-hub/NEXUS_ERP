import React, { useState } from 'react';
import {
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  UserIcon,
  ClockIcon,
  GlobeIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ZapIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { OperationLog, LogLevel } from '../../types';

const LOG_DATA: OperationLog[] = [
  { id: 'L001', user: `张磊`, action: `审批通过采购订单`, module: `采购管理`, detail: `订单号 PO-2024-0892，金额 ¥128,500，供应商：华东钢材`, ip: `192.168.1.101`, time: `2024-12-20 09:42:15`, level: 'success', duration: 320 },
  { id: 'L002', user: `李明`, action: `新增采购申请`, module: `采购管理`, detail: `申请原材料采购，铝合金板材500吨，钢材200吨`, ip: `192.168.1.105`, time: `2024-12-20 09:30:00`, level: 'info', duration: 180 },
  { id: 'L003', user: `系统`, action: `库存预警触发`, module: `库存管理`, detail: `铝合金板材库存12.5吨低于安全线20吨，触发自动预警`, ip: `127.0.0.1`, time: `2024-12-20 09:15:22`, level: 'warning', duration: 45 },
  { id: 'L004', user: `王芳`, action: `更新销售合同`, module: `销售管理`, detail: `合同编号 HT-2024-1102，修改付款条款，延长账期30天`, ip: `192.168.1.108`, time: `2024-12-20 09:00:05`, level: 'info', duration: 210 },
  { id: 'L005', user: `系统`, action: `数据库连接超时`, module: `系统运维`, detail: `主数据库连接池超时，自动切换备用节点，服务中断0.3秒`, ip: `127.0.0.1`, time: `2024-12-20 08:45:33`, level: 'error', duration: 3200 },
  { id: 'L006', user: `陈晓`, action: `导出财务报表`, module: `财务管理`, detail: `导出2024年11月财务汇总报表，共156页`, ip: `192.168.1.112`, time: `2024-12-20 08:30:00`, level: 'info', duration: 1580 },
  { id: 'L007', user: `张磊`, action: `修改系统配置`, module: `系统设置`, detail: `修改会话超时时间：60分钟→30分钟，修改密码强度要求`, ip: `192.168.1.101`, time: `2024-12-19 17:20:10`, level: 'warning', duration: 95 },
  { id: 'L008', user: `张伟`, action: `创建生产工单`, module: `生产管理`, detail: `工单 WO-2024-0889，产品型号 A2-PRO，计划产量2000件`, ip: `192.168.1.120`, time: `2024-12-19 16:45:00`, level: 'success', duration: 260 },
  { id: 'L009', user: `刘洋`, action: `添加新员工`, module: `人力资源`, detail: `新增员工赵小鹏，部门：研发部，职位：高级工程师`, ip: `192.168.1.115`, time: `2024-12-19 15:30:22`, level: 'success', duration: 415 },
  { id: 'L010', user: `李明`, action: `删除草稿申请`, module: `采购管理`, detail: `删除未提交的草稿采购申请 Draft-0091`, ip: `192.168.1.105`, time: `2024-12-19 14:10:05`, level: 'info', duration: 90 },
  { id: 'L011', user: `系统`, action: `自动备份完成`, module: `数据备份`, detail: `全量备份成功，大小 2.3GB，存储至 backup-server-01`, ip: `127.0.0.1`, time: `2024-12-19 03:00:00`, level: 'success', duration: 180000 },
  { id: 'L012', user: `赵磊`, action: `部署接口更新`, module: `研发管理`, detail: `v3.2.1 API接口更新部署至生产环境，新增5个端点`, ip: `192.168.1.130`, time: `2024-12-18 22:15:40`, level: 'success', duration: 8500 },
];

const levelConfig: Record<LogLevel, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  info:    { label: `信息`, color: 'var(--primary)', bg: 'rgba(129,140,248,0.12)', Icon: InfoIcon },
  success: { label: `成功`, color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.12)', Icon: CheckCircleIcon },
  warning: { label: `警告`, color: 'var(--color-neon-yellow)', bg: 'rgba(251,146,60,0.12)', Icon: AlertTriangleIcon },
  error:   { label: `错误`, color: 'var(--destructive)', bg: 'rgba(244,63,94,0.12)', Icon: AlertCircleIcon },
};

const modules = [`全部模块`, `采购管理`, `销售管理`, `库存管理`, `财务管理`, `生产管理`, `人力资源`, `系统设置`, `系统运维`, `数据备份`, `研发管理`];

const OperationLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');
  const [moduleFilter, setModuleFilter] = useState(`全部模块`);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = LOG_DATA.filter(l => {
    const matchLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchModule = moduleFilter === `全部模块` || l.module === moduleFilter;
    const matchSearch = !search || l.user.includes(search) || l.action.includes(search) || l.module.includes(search);
    return matchLevel && matchModule && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const levelCounts: Record<string, number> = { info: 0, success: 0, warning: 0, error: 0 };
  LOG_DATA.forEach(l => levelCounts[l.level]++);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div data-cmp="OperationLogPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ActivityIcon size={20} style={{ color: 'var(--primary)' }} />
            操作日志
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            共 {LOG_DATA.length} 条记录 · 最近更新 5 分钟前
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-placeholder flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            onClick={() => toast.info('刷新功能开发中')}>
            <RefreshCwIcon size={13} />刷新
          </button>
          <button className="btn-placeholder liquid-btn flex items-center gap-2 px-4 py-2 text-sm" onClick={() => toast.info('导出日志功能开发中')}>
            <DownloadIcon size={13} />导出日志
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {(Object.keys(levelConfig) as LogLevel[]).map(level => {
          const { label, color, bg, Icon } = levelConfig[level];
          return (
            <button key={level}
              onClick={() => setLevelFilter(levelFilter === level ? 'all' : level)}
              className="btn-interactive glass-card flex-1 min-w-28 px-4 py-3 flex items-center gap-3"
              style={{ border: levelFilter === level ? `1px solid ${color}50` : '1px solid var(--theme-card-border)', background: levelFilter === level ? bg : 'var(--theme-card-bg)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: bg, border: `1px solid ${color}30` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{levelCounts[level]}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
          style={{ background: 'var(--input)', border: '1px solid var(--border)' }}>
          <SearchIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={`搜索用户、操作、模块...`}
            className="flex-1 bg-transparent text-xs outline-none text-foreground" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FilterIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1); }}
            className="text-xs px-3 py-2 rounded-lg outline-none cursor-pointer"
            style={{ background: 'var(--input)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-5 py-3 text-xs font-semibold"
          style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
          <div style={{ flex: '0 0 80px' }}>级别</div>
          <div style={{ flex: '0 0 100px' }}>操作用户</div>
          <div style={{ flex: 1 }}>操作内容</div>
          <div style={{ flex: '0 0 100px' }}>所属模块</div>
          <div style={{ flex: '0 0 100px' }}>来源 IP</div>
          <div style={{ flex: '0 0 80px' }}>耗时</div>
          <div style={{ flex: '0 0 150px' }}>操作时间</div>
          <div style={{ flex: '0 0 48px' }} />
        </div>

        {paged.map((log, idx) => {
          const { color, bg, Icon } = levelConfig[log.level];
          const isExpanded = expandedId === log.id;
          return (
            <div key={log.id}
              className="btn-interactive"
              style={{ borderBottom: idx < paged.length - 1 ? '1px solid var(--border)' : 'none', background: isExpanded ? 'rgba(129,140,248,0.04)' : 'transparent' }}>
              <div className="flex items-center px-5 py-3.5">
                <div style={{ flex: '0 0 80px' }}>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit"
                    style={{ background: bg, color, border: `1px solid ${color}25` }}>
                    <Icon size={10} />{levelConfig[log.level].label}
                  </span>
                </div>
                <div style={{ flex: '0 0 100px' }}>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--primary)' }}>
                      {log.user[0]}
                    </div>
                    <span className="text-foreground font-medium">{log.user}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }} className="text-sm text-foreground truncate pr-4">{log.action}</div>
                <div style={{ flex: '0 0 100px' }}>
                  <span className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    {log.module}
                  </span>
                </div>
                <div style={{ flex: '0 0 100px' }} className="text-xs font-mono">
                  <span style={{ color: 'var(--muted-foreground)', fontFamily: 'monospace', fontSize: '11px' }}>{log.ip}</span>
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <span className="flex items-center gap-0.5 text-xs" style={{ color: log.duration > 2000 ? '#fb923c' : 'var(--muted-foreground)' }}>
                    <ZapIcon size={10} />{formatDuration(log.duration)}
                  </span>
                </div>
                <div style={{ flex: '0 0 150px' }} className="text-xs">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{log.time}</span>
                </div>
                <div style={{ flex: '0 0 48px' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="icon-btn w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    {isExpanded ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
                  </button>
                </div>
              </div>
              {/* Expanded detail */}
              <div style={{ display: isExpanded ? 'block' : 'none' }}>
                <div className="px-5 pb-4">
                  <div className="p-3 rounded-xl text-sm"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                    <span className="font-semibold text-foreground mr-2">操作详情：</span>{log.detail}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ActivityIcon size={36} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
            <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>没有找到匹配的日志记录</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--muted)' }}>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              第 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} 条，共 {filtered.length} 条
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="btn-interactive w-7 h-7 rounded-lg text-xs font-medium"
                  style={{
                    background: p === page ? 'var(--primary)' : 'var(--theme-card-bg)',
                    color: p === page ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    border: '1px solid var(--border)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationLogPage;
