import React, { useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  CircleDollarSignIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFinanceStore } from '../stores/finance.store';

const cashData = [
  { d: `12/1`, inflow: 280, outflow: 160 },
  { d: `12/5`, inflow: 340, outflow: 220 },
  { d: `12/8`, inflow: 190, outflow: 280 },
  { d: `12/10`, inflow: 420, outflow: 180 },
  { d: `12/12`, inflow: 380, outflow: 250 },
  { d: `12/15`, inflow: 510, outflow: 190 },
  { d: `12/18`, inflow: 460, outflow: 310 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--color-tooltip-bg)', border: '1px solid var(--color-tooltip-border)', borderRadius: '8px', padding: '8px 12px' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--foreground)', fontFamily: 'monospace' }}>¥{p.value}万</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const FinancePage: React.FC = () => {
  const { transactions, stats, loading, fetchTransactions, fetchStats } = useFinanceStore();

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  const kpiCards = [
    { label: `现金余额`, value: stats?.cashBalance != null ? `¥ ${stats.cashBalance.toLocaleString()}` : '--', Icon: WalletIcon, color: 'var(--primary)', change: `--`, up: true },
    { label: `本月收入`, value: stats?.monthIncome != null ? `¥ ${stats.monthIncome.toLocaleString()}` : '--', Icon: ArrowUpRightIcon, color: 'var(--color-neon-green)', change: `--`, up: true },
    { label: `本月支出`, value: stats?.monthExpense != null ? `¥ ${stats.monthExpense.toLocaleString()}` : '--', Icon: ArrowDownLeftIcon, color: 'var(--color-neon-yellow)', change: `--`, up: false },
    { label: `净利润`, value: stats?.netProfit != null ? `¥ ${stats.netProfit.toLocaleString()}` : '--', Icon: CircleDollarSignIcon, color: 'var(--color-neon-cyan)', change: `--`, up: true },
    { label: `应收账款`, value: stats?.receivable != null ? `¥ ${stats.receivable.toLocaleString()}` : '--', Icon: CreditCardIcon, color: 'var(--color-neon-purple)', change: `--`, up: false },
  ];

  return (
    <div data-cmp="FinancePage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* KPI cards */}
      <div className="flex gap-4 flex-wrap">
        {kpiCards.map((k, i) => (
          <div key={i} className="flex-1 glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${k.color}20` }}
              >
                <k.Icon size={15} style={{ color: k.color }} />
              </div>
              <div
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: k.up ? 'var(--color-neon-green)' : 'var(--color-neon-yellow)' }}
              >
                {k.up ? <TrendingUpIcon size={10} /> : <TrendingDownIcon size={10} />}
                {k.change}
              </div>
            </div>
            <div className="text-base font-bold font-mono text-foreground">{k.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Cash flow chart */}
      <div className="flex gap-4">
        <div className="flex-1 glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">现金流量</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>本月收支趋势 (万元)</p>
            </div>
            <div className="flex gap-3 text-xs">
              {[{ label: `收入`, color: 'var(--color-neon-green)' }, { label: `支出`, color: 'var(--destructive)' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-neon-green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-neon-green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(129,140,248,0.08)" />
              <XAxis dataKey="d" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="inflow" name="收入" stroke="var(--color-neon-green)" strokeWidth={2} fill="url(#gInflow)" />
              <Area type="monotone" dataKey="outflow" name="支出" stroke="var(--destructive)" strokeWidth={2} fill="url(#gOutflow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget gauge */}
        <div className="glass-card p-4" style={{ width: '240px', flexShrink: 0 }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">预算执行率</h3>
          <div className="space-y-4">
            {[
              { label: `研发费用`, pct: 67, color: 'var(--primary)' },
              { label: `营销推广`, pct: 84, color: 'var(--color-neon-cyan)' },
              { label: `运营成本`, pct: 52, color: 'var(--color-neon-green)' },
              { label: `人力成本`, pct: 91, color: 'var(--color-neon-yellow)' },
              { label: `采购预算`, pct: 73, color: 'var(--color-neon-purple)' },
            ].map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--muted-foreground)' }}>{b.label}</span>
                  <span style={{ color: b.pct > 85 ? 'var(--destructive)' : b.color, fontFamily: 'monospace', fontWeight: 600 }}>{b.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${b.pct}%`,
                      background: b.pct > 85 ? 'var(--destructive)' : b.color,
                      boxShadow: `0 0 6px ${b.pct > 85 ? 'var(--destructive)' : b.color}50`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">近期流水</h3>
          <button className="btn-placeholder text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.2)' }}
            onClick={() => toast.info('导出报表功能开发中')}>
            导出报表
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>加载中...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>暂无流水记录</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
                  {[`流水号`, `描述`, `金额`, `类型`, `日期`, `方式`].map(h => (
                  <th key={h} className="pb-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-nav-section-label)' }}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn: any) => (
                <tr key={txn.id} style={{ borderBottom: '1px solid rgba(129,140,248,0.05)' }}>
                  <td className="py-3 pr-4"><span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>TXN-{String(txn.id).padStart(4, '0')}</span></td>
                  <td className="py-3 pr-4"><span className="text-xs text-foreground">{txn.description}</span></td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-mono font-bold" style={{ color: txn.type === 'income' ? 'var(--color-neon-green)' : 'var(--destructive)' }}>
                      {txn.type === 'income' ? '+' : '-'}¥ {txn.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg"
                      style={{
                        background: txn.type === 'income' ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
                        color: txn.type === 'income' ? 'var(--color-neon-green)' : 'var(--destructive)',
                        border: `1px solid ${txn.type === 'income' ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)'}`,
                      }}>
                      {txn.type === 'income' ? <ArrowUpRightIcon size={9} /> : <ArrowDownLeftIcon size={9} />}
                      {txn.type === 'income' ? '收入' : '支出'}
                    </div>
                  </td>
                  <td className="py-3 pr-4"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{txn.created_at?.split('T')[0] || txn.created_at}</span></td>
                  <td className="py-3"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{txn.method || '--'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
