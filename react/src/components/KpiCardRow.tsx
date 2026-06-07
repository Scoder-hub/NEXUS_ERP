import React from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  UsersIcon,
  PackageIcon,
} from 'lucide-react';

interface KpiItem {
  title: string;
  value: string;
  change: number;
  sub: string;
  Icon: React.ElementType;
  gradient: string;
  glow: string;
}

const defaultKpis: KpiItem[] = [
  {
    title: `总营收`,
    value: `¥ 4,827,350`,
    change: 12.4,
    sub: `vs 上月`,
    Icon: DollarSignIcon,
    gradient: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
    glow: 'rgba(99,102,241,0.35)',
  },
  {
    title: `销售订单`,
    value: `1,284`,
    change: 8.7,
    sub: `本月订单量`,
    Icon: ShoppingBagIcon,
    gradient: 'linear-gradient(135deg, #06b6d4, var(--color-neon-cyan))',
    glow: 'rgba(6,182,212,0.35)',
  },
  {
    title: `活跃客户`,
    value: `3,621`,
    change: 5.2,
    sub: `注册用户总数`,
    Icon: UsersIcon,
    gradient: 'linear-gradient(135deg, #8b5cf6, var(--color-neon-purple))',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    title: `库存预警`,
    value: `17`,
    change: -3.1,
    sub: `低库存品类`,
    Icon: PackageIcon,
    gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    glow: 'rgba(245,158,11,0.35)',
  },
];

interface KpiCardRowProps {
  kpiData?: {
    totalRevenue: number;
    revenueChange: number;
    orderCount: number;
    orderChange: number;
    activeCustomers: number;
    customerChange: number;
    inventoryAlerts: number;
    productionRate: number;
  } | null;
}

const formatRevenue = (v: number) => {
  if (v >= 10000) return `¥ ${(v / 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}万`;
  return `¥ ${v.toLocaleString()}`;
};

const KpiCardRow: React.FC<KpiCardRowProps> = ({ kpiData }) => {
  const kpis: KpiItem[] = kpiData
    ? [
        {
          title: `总营收`,
          value: formatRevenue(kpiData.totalRevenue),
          change: kpiData.revenueChange,
          sub: `vs 上月`,
          Icon: DollarSignIcon,
          gradient: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
          glow: 'rgba(99,102,241,0.35)',
        },
        {
          title: `销售订单`,
          value: kpiData.orderCount.toLocaleString(),
          change: kpiData.orderChange,
          sub: `本月订单量`,
          Icon: ShoppingBagIcon,
          gradient: 'linear-gradient(135deg, #06b6d4, var(--color-neon-cyan))',
          glow: 'rgba(6,182,212,0.35)',
        },
        {
          title: `活跃客户`,
          value: kpiData.activeCustomers.toLocaleString(),
          change: kpiData.customerChange,
          sub: `注册用户总数`,
          Icon: UsersIcon,
          gradient: 'linear-gradient(135deg, #8b5cf6, var(--color-neon-purple))',
          glow: 'rgba(139,92,246,0.35)',
        },
        {
          title: `库存预警`,
          value: kpiData.inventoryAlerts.toString(),
          change: -kpiData.productionRate,
          sub: `低库存品类`,
          Icon: PackageIcon,
          gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)',
          glow: 'rgba(245,158,11,0.35)',
        },
      ]
    : defaultKpis;

  return (
    <div data-cmp="KpiCardRow" className="flex gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="flex-1 glass-card glass-card-hover p-4 relative"
          style={{ minWidth: 0 }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: kpi.gradient,
                boxShadow: `0 0 20px ${kpi.glow}`,
              }}
            >
              <kpi.Icon size={18} style={{ color: 'white' }} />
            </div>
            <div
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: kpi.change >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
                color: kpi.change >= 0 ? 'var(--color-neon-green)' : 'var(--destructive)',
                border: `1px solid ${kpi.change >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)'}`,
              }}
            >
              {kpi.change >= 0
                ? <TrendingUpIcon size={11} />
                : <TrendingDownIcon size={11} />}
              {kpi.change >= 0 ? '+' : ''}{kpi.change}%
            </div>
          </div>

          {/* Value */}
          <div className="text-xl font-bold text-foreground font-mono mb-1">{kpi.value}</div>

          {/* Title & sub */}
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{kpi.title}</div>
          <div className="text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>{kpi.sub}</div>

          {/* Bottom glow line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${kpi.glow}, transparent)` }}
          />
        </div>
      ))}
    </div>
  );
};

export default KpiCardRow;
