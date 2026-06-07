import React, { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CheckIcon,
  FilterIcon,
  SearchIcon,
  Trash2Icon,
  AlertTriangleIcon,
  InfoIcon,
  CircleCheckIcon,
  MessageSquareIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ApprovalItem, NotificationMessage, ApprovalStatus } from '../../types';

const APPROVAL_DATA: ApprovalItem[] = [
  { id: 'AP001', title: `采购申请 — 原材料采购`, submitter: `李明`, dept: `采购部`, amount: `¥ 128,500`, type: `采购审批`, status: 'pending', time: `10分钟前`, description: `采购Q4生产所需原材料，包含铝合金板材500吨，钢材200吨`, priority: 'high' },
  { id: 'AP002', title: `出差申请 — 上海客户拜访`, submitter: `王芳`, dept: `销售部`, amount: `¥ 3,200`, type: `差旅审批`, status: 'pending', time: `1小时前`, description: `前往上海拜访华东区重要客户，预计2天行程`, priority: 'medium' },
  { id: 'AP003', title: `设备采购 — 数控加工中心`, submitter: `张磊`, dept: `生产部`, amount: `¥ 580,000`, type: `固定资产`, status: 'pending', time: `3小时前`, description: `购置大型数控加工中心一台，提升生产精度与效率`, priority: 'high' },
  { id: 'AP004', title: `人员增编申请 — 研发工程师`, submitter: `陈志远`, dept: `研发部`, amount: undefined, type: `人事审批`, status: 'approved', time: `昨天 14:30`, description: `研发团队扩充2名高级工程师名额`, priority: 'medium' },
  { id: 'AP005', title: `预算调整申请 — 市场推广`, submitter: `刘晓燕`, dept: `市场部`, amount: `¥ 45,000`, type: `预算审批`, status: 'rejected', time: `昨天 10:15`, description: `Q4市场推广预算增补，用于线下展会及数字广告投放`, priority: 'low' },
  { id: 'AP006', title: `年假申请 — 7天`, submitter: `赵磊`, dept: `技术部`, amount: undefined, type: `假期审批`, status: 'approved', time: `2天前`, description: `申请元旦假期延长，12月30日至1月5日`, priority: 'low' },
];

const NOTIFICATIONS: NotificationMessage[] = [
  { id: 'N001', type: 'approval', title: `新审批请求待处理`, content: `李明提交了采购申请，金额 ¥128,500，请尽快审批。`, time: `10分钟前`, read: false, sender: `采购系统` },
  { id: 'N002', type: 'warning', title: `库存预警`, content: `原材料-铝合金板材库存低于安全线，当前库存 12.5吨，建议及时补货。`, time: `32分钟前`, read: false, sender: `库存管理` },
  { id: 'N003', type: 'success', title: `生产工单完成`, content: `工单 #WO-2024-0456 已完成，产量 1200 件，良品率 99.2%。`, time: `1小时前`, read: false, sender: `生产系统` },
  { id: 'N004', type: 'error', title: `设备异常告警`, content: `3号车间数控机床温度异常，当前温度 85°C，已超过安全阈值。`, time: `2小时前`, read: true, sender: `设备监控` },
  { id: 'N005', type: 'info', title: `月度报表已生成`, content: `11月销售月度报表已自动生成，点击查看详情。`, time: `昨天 17:00`, read: true, sender: `报表系统` },
  { id: 'N006', type: 'success', title: `系统更新成功`, content: `NEXUS ERP v3.2.1 已成功部署，新增功能详见更新日志。`, time: `昨天 09:00`, read: true, sender: `系统运维` },
];

const statusConfig: Record<ApprovalStatus, { label: string; color: string; Icon: React.ElementType }> = {
  pending:  { label: `待审批`, color: 'var(--color-neon-yellow)', Icon: ClockIcon },
  approved: { label: `已通过`, color: 'var(--color-neon-green)', Icon: CheckCircleIcon },
  rejected: { label: `已拒绝`, color: 'var(--destructive)', Icon: XCircleIcon },
};

const priorityConfig = {
  high:   { label: `紧急`, color: 'var(--destructive)' },
  medium: { label: `普通`, color: 'var(--color-neon-yellow)' },
  low:    { label: `一般`, color: 'var(--muted-foreground)' },
};

const notifTypeConfig = {
  info:     { color: 'var(--primary)', Icon: InfoIcon },
  warning:  { color: 'var(--color-neon-yellow)', Icon: AlertTriangleIcon },
  success:  { color: 'var(--color-neon-green)', Icon: CircleCheckIcon },
  error:    { color: 'var(--destructive)', Icon: XCircleIcon },
  approval: { color: 'var(--color-neon-cyan)', Icon: CheckCircleIcon },
};

const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<'approval' | 'messages'>('approval');
  const [approvals, setApprovals] = useState<ApprovalItem[]>(APPROVAL_DATA);
  const [notifications, setNotifications] = useState<NotificationMessage[]>(NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | ApprovalStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    setSelectedId(null);
    toast.success(`审批已通过`);
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    setSelectedId(null);
    toast.error(`审批已拒绝`);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(`已全部标为已读`);
  };

  const filteredApprovals = approvals.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search || a.title.includes(search) || a.submitter.includes(search);
    return matchFilter && matchSearch;
  });

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const unreadCount = notifications.filter(n => !n.read).length;

  const selected = approvals.find(a => a.id === selectedId);

  return (
    <div data-cmp="NotificationsPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BellIcon size={20} style={{ color: 'var(--primary)' }} />
            通知审批中心
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {pendingCount} 条待处理审批 · {unreadCount} 条未读消息
          </p>
        </div>
        <button onClick={handleMarkAllRead} className="btn-interactive flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
          <CheckIcon size={14} />全部已读
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--muted)', width: 'fit-content' }}>
        <button onClick={() => setTab('approval')}
          className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: tab === 'approval' ? 'var(--primary)' : 'transparent', color: tab === 'approval' ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
          <CheckCircleIcon size={14} />审批事项
          <span className="text-xs px-1.5 rounded-full" style={{ background: tab === 'approval' ? 'rgba(255,255,255,0.25)' : 'rgba(251,146,60,0.2)', color: tab === 'approval' ? 'white' : '#fb923c' }}>
            {pendingCount}
          </span>
        </button>
        <button onClick={() => setTab('messages')}
          className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: tab === 'messages' ? 'var(--primary)' : 'transparent', color: tab === 'messages' ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
          <MessageSquareIcon size={14} />系统消息
          <span className="text-xs px-1.5 rounded-full" style={{ background: tab === 'messages' ? 'rgba(255,255,255,0.25)' : 'rgba(244,63,94,0.2)', color: tab === 'messages' ? 'white' : 'var(--destructive)' }}>
            {unreadCount}
          </span>
        </button>
      </div>

      {/* Approval tab */}
      <div style={{ display: tab === 'approval' ? 'flex' : 'none', gap: '20px' }}>
        {/* Left: list */}
        <div className="flex flex-col" style={{ flex: '0 0 400px' }}>
          {/* Search + filter */}
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg"
              style={{ background: 'var(--input)', border: '1px solid var(--border)' }}>
              <SearchIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`搜索标题或提交人...`}
                className="flex-1 bg-transparent text-xs outline-none text-foreground" />
            </div>
            <div className="flex gap-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="btn-interactive px-2 py-1 rounded-lg text-xs"
                  style={{
                    background: filter === f ? 'var(--primary)' : 'var(--muted)',
                    color: filter === f ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}>
                  {f === 'all' ? `全部` : statusConfig[f].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {filteredApprovals.map(item => {
              const sc = statusConfig[item.status];
              const pc = priorityConfig[item.priority];
              const StatusIcon = sc.Icon;
              return (
                <button key={item.id} onClick={() => setSelectedId(item.id)}
                  className="btn-interactive glass-card text-left p-4"
                  style={{
                    border: selectedId === item.id
                      ? '1px solid var(--primary)'
                      : '1px solid var(--theme-card-border)',
                    background: selectedId === item.id
                      ? 'rgba(129,140,248,0.08)'
                      : 'var(--theme-card-bg)',
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground leading-tight flex-1">{item.title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                      style={{ background: `${sc.color}18`, color: sc.color, border: `1px solid ${sc.color}30` }}>
                      <StatusIcon size={10} />{sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{item.submitter} · {item.dept}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: `${pc.color}18`, color: pc.color }}>{pc.label}</span>
                    {item.amount && <span className="ml-auto font-semibold" style={{ color: 'var(--color-neon-cyan)' }}>{item.amount}</span>}
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{item.time}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div className="flex-1">
          {selected ? (
            <div className="glass-card p-4">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md mb-2 inline-block"
                    style={{ background: 'rgba(129,140,248,0.15)', color: 'var(--primary)' }}>
                    {selected.type}
                  </span>
                  <h2 className="text-lg font-bold text-foreground mt-1">{selected.title}</h2>
                </div>
                <span className="text-sm px-3 py-1 rounded-full flex items-center gap-1.5"
                  style={{
                    background: `${statusConfig[selected.status].color}18`,
                    color: statusConfig[selected.status].color,
                    border: `1px solid ${statusConfig[selected.status].color}30`,
                  }}>
                  {React.createElement(statusConfig[selected.status].Icon, { size: 14 })}
                  {statusConfig[selected.status].label}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { label: `提交人`, value: selected.submitter },
                  { label: `所属部门`, value: selected.dept },
                  { label: `提交时间`, value: selected.time },
                  { label: `优先级`, value: priorityConfig[selected.priority].label },
                  ...(selected.amount ? [{ label: `金额`, value: selected.amount }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex-1 min-w-32">
                    <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                    <div className="text-sm font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>申请说明</div>
                <div className="text-sm text-foreground p-4 rounded-xl leading-relaxed"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  {selected.description}
                </div>
              </div>

              <div style={{ display: selected.status === 'pending' ? 'flex' : 'none', gap: '12px' }}>
                <button onClick={() => handleApprove(selected.id)}
                  className="btn-interactive flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                  style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <CheckCircleIcon size={16} />批准通过
                </button>
                <button onClick={() => handleReject(selected.id)}
                  className="btn-interactive flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                  style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--destructive)', border: '1px solid rgba(244,63,94,0.3)' }}>
                  <XCircleIcon size={16} />拒绝申请
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center h-64">
              <CheckCircleIcon size={40} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
              <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>请从左侧选择一条审批记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages tab */}
      <div style={{ display: tab === 'messages' ? 'flex' : 'none', flexDirection: 'column', gap: '8px' }}>
        {notifications.map(n => {
          const cfg = notifTypeConfig[n.type];
          const NIcon = cfg.Icon;
          return (
            <div key={n.id}
              className="btn-interactive glass-card p-4 flex items-start gap-4 cursor-pointer"
              onClick={() => handleMarkRead(n.id)}
              style={{ opacity: n.read ? 0.7 : 1, border: n.read ? '1px solid var(--theme-card-border)' : `1px solid ${cfg.color}40` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                <NIcon size={18} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">{n.title}</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {n.sender}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full ml-auto flex-shrink-0" style={{ background: cfg.color }} />
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.content}</p>
                <div className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}
                className="btn-interactive flex-shrink-0 p-1 rounded-lg"
                style={{ color: 'var(--muted-foreground)' }}>
                <Trash2Icon size={14} />
              </button>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <BellIcon size={40} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
            <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>暂无系统消息</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
