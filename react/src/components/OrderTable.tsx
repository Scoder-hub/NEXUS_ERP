import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, ZapIcon, MoreHorizontalIcon, ArrowUpRightIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '../types';

const defaultOrders: Order[] = [
  { id: `ORD-2024-8832`, customer: `北京科技有限公司`, amount: `¥ 128,500`, status: 'completed', date: `2024-12-18`, items: 12 },
  { id: `ORD-2024-8831`, customer: `上海贸易集团`, amount: `¥ 76,200`, status: 'processing', date: `2024-12-17`, items: 8 },
  { id: `ORD-2024-8830`, customer: `广州制造业公司`, amount: `¥ 234,800`, status: 'pending', date: `2024-12-17`, items: 21 },
  { id: `ORD-2024-8829`, customer: `深圳电子科技`, amount: `¥ 45,600`, status: 'completed', date: `2024-12-16`, items: 5 },
  { id: `ORD-2024-8828`, customer: `杭州云计算有限公司`, amount: `¥ 92,300`, status: 'cancelled', date: `2024-12-16`, items: 9 },
  { id: `ORD-2024-8827`, customer: `成都软件开发公司`, amount: `¥ 157,400`, status: 'processing', date: `2024-12-15`, items: 14 },
];

const statusConfig = {
  completed: { label: `已完成`, Icon: CheckCircleIcon, color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  processing: { label: `处理中`, Icon: ZapIcon, color: 'var(--primary)', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
  pending: { label: `待处理`, Icon: ClockIcon, color: 'var(--color-neon-yellow)', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  cancelled: { label: `已取消`, Icon: XCircleIcon, color: 'var(--destructive)', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
};

interface OrderTableProps {
  orders?: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const displayOrders = orders && orders.length > 0 ? orders : defaultOrders;

  return (
    <div data-cmp="OrderTable" className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">最近订单</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>最新 6 条记录</p>
        </div>
        <button
          className="btn-placeholder flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(129,140,248,0.1)',
            color: 'var(--primary)',
            border: '1px solid rgba(129,140,248,0.2)',
          }}
          onClick={() => toast.info('订单列表功能开发中')}
        >
          查看全部
          <ArrowUpRightIcon size={11} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
              {[`订单号`, `客户`, `金额`, `状态`, `日期`, `操作`].map(h => (
                <th key={h} className="pb-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-nav-section-label)' }}>{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayOrders.map(order => {
              const sc = statusConfig[order.status];
              const isHovered = hovered === order.id;
              return (
                <tr
                  key={order.id}
                  onMouseEnter={() => setHovered(order.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderBottom: '1px solid rgba(129,140,248,0.05)',
                    background: isHovered ? 'rgba(129,140,248,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td className="py-3 pr-4">
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{order.id}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="text-xs font-medium text-foreground">{order.customer}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{order.items} 件商品</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-neon-cyan)' }}>{order.amount}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                    >
                      <sc.Icon size={10} />
                      {sc.label}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{order.date}</span>
                  </td>
                  <td className="py-3">
                    <button
                      className="btn-placeholder w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--muted-foreground)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onClick={() => toast.info('订单详情功能开发中')}
                    >
                      <MoreHorizontalIcon size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
