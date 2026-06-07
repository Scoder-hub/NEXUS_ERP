import React from 'react';
import {
  ShoppingCartIcon,
  PackageIcon,
  UserPlusIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  TrendingUpIcon,
} from 'lucide-react';

interface ActivityItem {
  id: number;
  Icon: React.ElementType;
  color: string;
  title: string;
  desc: string;
  time: string;
  type: 'order' | 'inventory' | 'user' | 'alert' | 'success' | 'trend';
}

const defaultActivities: ActivityItem[] = [
  {
    id: 1, Icon: ShoppingCartIcon, color: 'var(--primary)',
    title: `新订单 #ORD-8833`,
    desc: `杭州云计算 提交了新订单，金额 ¥88,200`,
    time: `2分钟前`, type: 'order',
  },
  {
    id: 2, Icon: AlertTriangleIcon, color: 'var(--color-neon-yellow)',
    title: `库存预警`,
    desc: `产品「工业传感器A型」库存低于最低阈值`,
    time: `15分钟前`, type: 'alert',
  },
  {
    id: 3, Icon: CheckCircleIcon, color: 'var(--color-neon-green)',
    title: `订单已完成`,
    desc: `ORD-8829 已发货并确认签收`,
    time: `1小时前`, type: 'success',
  },
  {
    id: 4, Icon: UserPlusIcon, color: 'var(--color-neon-cyan)',
    title: `新客户注册`,
    desc: `武汉智能制造有限公司 完成企业认证`,
    time: `2小时前`, type: 'user',
  },
  {
    id: 5, Icon: TrendingUpIcon, color: 'var(--color-neon-purple)',
    title: `月度报表生成`,
    desc: `11月财务报表已自动生成，利润增长 18.3%`,
    time: `3小时前`, type: 'trend',
  },
  {
    id: 6, Icon: PackageIcon, color: 'var(--color-neon-yellow)',
    title: `入库操作`,
    desc: `仓库 B 区接收 350 件原材料`,
    time: `5小时前`, type: 'inventory',
  },
];

const typeIconMap: Record<string, { Icon: React.ElementType; color: string }> = {
  order: { Icon: ShoppingCartIcon, color: 'var(--primary)' },
  inventory: { Icon: PackageIcon, color: 'var(--color-neon-yellow)' },
  user: { Icon: UserPlusIcon, color: 'var(--color-neon-cyan)' },
  alert: { Icon: AlertTriangleIcon, color: 'var(--color-neon-yellow)' },
  success: { Icon: CheckCircleIcon, color: 'var(--color-neon-green)' },
  trend: { Icon: TrendingUpIcon, color: 'var(--color-neon-purple)' },
};

interface ExternalActivity {
  id?: number;
  title: string;
  desc?: string;
  description?: string;
  time: string;
  type?: 'order' | 'inventory' | 'user' | 'alert' | 'success' | 'trend';
  color?: string;
}

interface ActivityFeedProps {
  activities?: ExternalActivity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const displayActivities: ActivityItem[] = activities && activities.length > 0
    ? activities.map((act, i: number) => {
        const mapped = typeIconMap[act.type] || typeIconMap.order;
        return {
          id: act.id ?? i,
          Icon: mapped.Icon,
          color: act.color || mapped.color,
          title: act.title,
          desc: act.desc || act.description || '',
          time: act.time,
          type: act.type || 'order',
        };
      })
    : defaultActivities;

  return (
    <div data-cmp="ActivityFeed" className="glass-card p-4" style={{ minWidth: '260px' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">实时动态</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>最新系统活动</p>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
          style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.2)' }}
        >
          <div className="status-dot status-online" />
          实时
        </div>
      </div>

      <div className="space-y-4">
        {displayActivities.map((act, i) => (
          <div key={act.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${act.color}15`,
                  border: `1px solid ${act.color}30`,
                }}
              >
                <act.Icon size={14} style={{ color: act.color }} />
              </div>
              {i < displayActivities.length - 1 && (
                <div
                  className="w-px flex-1 mt-2"
                  style={{ background: 'rgba(129,140,248,0.1)', minHeight: '12px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-foreground leading-tight">{act.title}</span>
                <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: 'var(--theme-nav-section-label)' }}>{act.time}</span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{act.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
