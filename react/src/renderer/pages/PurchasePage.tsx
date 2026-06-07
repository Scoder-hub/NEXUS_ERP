import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  ArrowUpRightIcon,
  BuildingIcon,
  StarIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePurchaseStore } from '../stores/purchase.store';

const statusMap: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  received: { label: `已到货`, color: 'var(--color-neon-green)', Icon: CheckCircleIcon },
  transit: { label: `运输中`, color: 'var(--primary)', Icon: TruckIcon },
  pending: { label: `待审批`, color: 'var(--color-neon-yellow)', Icon: ClockIcon },
  approved: { label: `已批准`, color: 'var(--color-neon-cyan)', Icon: CheckCircleIcon },
};

const PurchasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { orders, suppliers, loading, fetchOrders, fetchSuppliers, createOrder, createSupplier } = usePurchaseStore();

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [fetchOrders, fetchSuppliers]);

  const handleSearch = useCallback(() => {
    fetchOrders({ keyword: searchKeyword, status: filterStatus || undefined });
  }, [fetchOrders, searchKeyword, filterStatus]);

  const handleStatusFilter = useCallback((status: string) => {
    setFilterStatus(status);
    fetchOrders({ status: status || undefined, keyword: searchKeyword || undefined });
  }, [fetchOrders, searchKeyword]);

  const handleCreateOrder = useCallback(async () => {
    try {
      await createOrder({});
      toast.success('采购单创建成功');
    } catch (e: any) {
      toast.error(e.message || '创建失败');
    }
  }, [createOrder]);

  const handleCreateSupplier = useCallback(async () => {
    try {
      await createSupplier({});
      toast.success('供应商创建成功');
    } catch (e: any) {
      toast.error(e.message || '创建失败');
    }
  }, [createSupplier]);

  // Compute stats from orders
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const transitCount = orders.filter(o => o.status === 'transit').length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div data-cmp="PurchasePage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {[
            { k: `orders`, v: `采购订单` },
            { k: `suppliers`, v: `供应商管理` },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k as 'orders' | 'suppliers')}
              className="btn-interactive text-sm font-semibold px-4 py-2 rounded-xl"
              style={{
                background: activeTab === t.k ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: activeTab === t.k ? 'var(--primary)' : 'var(--muted-foreground)',
                border: `1px solid ${activeTab === t.k ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
              }}
            >
              {t.v}
            </button>
          ))}
        </div>
        <button
          className="btn-placeholder liquid-btn flex items-center gap-2 text-sm px-4 py-2"
          onClick={activeTab === 'orders' ? handleCreateOrder : handleCreateSupplier}
        >
          <PlusIcon size={14} />
          {activeTab === 'orders' ? '新建采购单' : '新建供应商'}
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: `本月采购额`, value: `¥ ${totalAmount.toLocaleString()}`, color: 'var(--primary)', glow: 'rgba(129,140,248,0.3)' },
          { label: `待审批`, value: `${pendingCount} 单`, color: 'var(--color-neon-yellow)', glow: 'rgba(251,146,60,0.3)' },
          { label: `运输中`, value: `${transitCount} 单`, color: 'var(--color-neon-cyan)', glow: 'rgba(34,211,238,0.3)' },
          { label: `供应商数量`, value: `${suppliers.length} 家`, color: 'var(--color-neon-green)', glow: 'rgba(52,211,153,0.3)' },
        ].map((s, i) => (
          <div
            key={i}
            className="flex-1 glass-card p-4 text-center"
            style={{ border: `1px solid ${s.color}25` }}
          >
            <div className="text-lg font-bold font-mono" style={{ color: s.color, textShadow: `0 0 15px ${s.glow}` }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(129,140,248,0.15)' }}
        >
          <SearchIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={activeTab === 'orders' ? `搜索采购单号、供应商...` : `搜索供应商名称、类别...`}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <button
          className="btn-placeholder flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={handleSearch}
        >
          <FilterIcon size={14} />
          筛选
        </button>
      </div>

      {/* Status filter tabs for orders */}
      {activeTab === 'orders' && (
        <div className="flex gap-2">
          {['', 'pending', 'transit', 'approved', 'received'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className="btn-interactive text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: filterStatus === status ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: filterStatus === status ? 'var(--primary)' : 'var(--muted-foreground)',
                border: `1px solid ${filterStatus === status ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
              }}
            >
              {status === '' ? '全部' : statusMap[status]?.label ?? status}
            </button>
          ))}
        </div>
      )}

      {/* Orders table */}
      <div className={activeTab === 'orders' ? '' : 'hidden'}>
        <div className="glass-card p-4">
          {loading ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>加载中...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无采购订单</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
                    {[`采购单号`, `供应商`, `金额`, `商品数`, `状态`, `创建日期`, `预计到货`].map(h => (
                    <th key={h} className="pb-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-nav-section-label)' }}>{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(po => {
                  const sc = statusMap[po.status];
                  return (
                    <tr key={po.id} style={{ borderBottom: '1px solid rgba(129,140,248,0.05)' }}>
                      <td className="py-3 pr-4">
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{po.id}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs font-medium text-foreground">{po.supplier}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-neon-cyan)' }}>{typeof po.amount === 'number' ? `¥ ${po.amount.toLocaleString()}` : po.amount}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{po.items} 件</span>
                      </td>
                      <td className="py-3 pr-4">
                        {sc && (
                          <div
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.color}25` }}
                          >
                            <sc.Icon size={10} />
                            {sc.label}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{po.date}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{po.eta}</span>
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

      {/* Suppliers */}
      <div className={activeTab === 'suppliers' ? '' : 'hidden'}>
        <div className="flex flex-col gap-3">
          {suppliers.map(sup => (
            <div key={sup.id} className="glass-card glass-card-hover p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}
              >
                <BuildingIcon size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{sup.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(34,211,238,0.2)' }}
                  >
                    {sup.category}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>联系人: {sup.contact}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarIcon size={12} style={{ color: 'var(--color-neon-yellow)' }} />
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-neon-yellow)' }}>{sup.rating}</span>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono font-bold text-foreground">{sup.orders}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>历史订单</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono font-bold" style={{ color: 'var(--color-neon-cyan)' }}>{sup.amount}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>累计金额</div>
              </div>
              <div
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: sup.status === `活跃` ? 'rgba(52,211,153,0.1)' : 'rgba(251,146,60,0.1)',
                  color: sup.status === `活跃` ? 'var(--color-neon-green)' : 'var(--color-neon-yellow)',
                  border: `1px solid ${sup.status === `活跃` ? 'rgba(52,211,153,0.2)' : 'rgba(251,146,60,0.2)'}`,
                }}
              >
                {sup.status}
              </div>
              <button style={{ color: 'var(--muted-foreground)' }} className="btn-placeholder" onClick={() => toast.info('供应商详情功能开发中')}>
                <ArrowUpRightIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
