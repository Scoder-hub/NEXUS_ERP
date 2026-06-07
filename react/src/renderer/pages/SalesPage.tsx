import React, { useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUpIcon,
  UserIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SearchIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSalesStore } from '../stores/sales.store';

const statusMap: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  completed: { label: `已完成`, color: 'var(--color-neon-green)', Icon: CheckCircleIcon },
  processing: { label: `处理中`, color: 'var(--primary)', Icon: ClockIcon },
  pending: { label: `待处理`, color: 'var(--color-neon-yellow)', Icon: ClockIcon },
  cancelled: { label: `已取消`, color: 'var(--destructive)', Icon: XCircleIcon },
};

const tierColor: Record<string, string> = {
  '钻石': 'var(--color-neon-cyan)',
  '白金': 'var(--primary)',
  '黄金': 'var(--color-neon-yellow)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--color-tooltip-bg)', border: '1px solid var(--color-tooltip-border)', borderRadius: '8px', padding: '8px 12px' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{label}</p>
        <p style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}>{payload[0].value} 单</p>
      </div>
    );
  }
  return null;
};

const SalesPage: React.FC = () => {
  const { orders, customers, loading, fetchOrders, fetchCustomers, createOrder } = useSalesStore();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [fetchOrders, fetchCustomers]);

  const handleCreateOrder = useCallback(async () => {
    try {
      await createOrder({});
      toast.success('销售订单创建成功');
    } catch (e: any) {
      toast.error(e.message || '创建失败');
    }
  }, [createOrder]);

  // Compute stats from orders
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const orderCount = orders.length;
  const newCustomers = customers.filter(c => c.isNew).length;

  // Monthly chart data from orders
  const monthData = orders.reduce((acc: { m: string; sales: number }[], o) => {
    const month = o.date ? o.date.substring(0, 7) : '';
    const existing = acc.find(a => a.m === month);
    if (existing) {
      existing.sales += 1;
    } else if (month) {
      acc.push({ m: month, sales: 1 });
    }
    return acc;
  }, []);

  return (
    <div data-cmp="SalesPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* KPI */}
      <div className="flex gap-4">
        {[
          { label: `本月销售额`, value: `¥ ${totalRevenue.toLocaleString()}`, Icon: DollarSignIcon, color: 'var(--primary)', change: '' },
          { label: `订单总数`, value: `${orderCount}`, Icon: ShoppingBagIcon, color: 'var(--color-neon-cyan)', change: '' },
          { label: `新客户`, value: `${newCustomers}`, Icon: UserIcon, color: 'var(--color-neon-purple)', change: '' },
          { label: `转化率`, value: `—`, Icon: TrendingUpIcon, color: 'var(--color-neon-green)', change: '' },
        ].map((k, i) => (
          <div key={i} className="flex-1 glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${k.color}20`, border: `1px solid ${k.color}30` }}
              >
                <k.Icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-foreground">{k.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Top customers */}
      <div className="flex gap-4">
        {/* Bar chart */}
        <div className="flex-1 glass-card p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">月度销售量</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>订单数量趋势</p>
          </div>
          {monthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.08)" />
                <XAxis dataKey="m" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(129,140,248,0.05)' }} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {monthData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === monthData.length - 1 ? 'var(--primary)' : 'rgba(129,140,248,0.5)'}
                      style={{ filter: i === monthData.length - 1 ? 'drop-shadow(0 0 8px rgba(129,140,248,0.6))' : 'none' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无数据</div>
          )}
        </div>

        {/* Top customers */}
        <div className="glass-card p-4" style={{ width: '320px', flexShrink: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">TOP 客户</h3>
            <button className="btn-placeholder text-xs" style={{ color: 'var(--primary)' }} onClick={() => toast.info('客户列表功能开发中')}>查看全部</button>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, var(--color-primary-500), #06b6d4)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{c.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.orders ?? 0} 订单</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: 'var(--color-neon-cyan)' }}>{c.amount}</div>
                  {c.tier && (
                    <div
                      className="text-xs text-right"
                      style={{ color: tierColor[c.tier] }}
                    >
                      {c.tier}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">最近销售订单</h3>
          <div className="flex items-center gap-2">
            <button className="btn-placeholder text-xs" style={{ color: 'var(--primary)' }} onClick={() => toast.info('销售订单列表功能开发中')}>查看全部</button>
            <button className="btn-placeholder flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.2)' }} onClick={handleCreateOrder}>
              新建订单 <ArrowUpRightIcon size={11} />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无销售订单</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
                  {[`订单号`, `客户`, `产品`, `金额`, `状态`].map(h => (
                  <th key={h} className="pb-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-nav-section-label)' }}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(s => {
                const sc = statusMap[s.status];
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(129,140,248,0.05)' }}>
                    <td className="py-3 pr-4"><span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{s.id}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs text-foreground">{s.customer}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.product}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-mono font-bold" style={{ color: 'var(--color-neon-cyan)' }}>{typeof s.amount === 'number' ? `¥ ${s.amount.toLocaleString()}` : s.amount}</span></td>
                    <td className="py-3">
                      {sc && (
                        <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.color}25` }}>
                          <sc.Icon size={10} />
                          {sc.label}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
