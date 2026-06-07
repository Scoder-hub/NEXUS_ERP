import React, { useState, useEffect, useCallback } from 'react';
import {
  PackageIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  SearchIcon,
  BoxIcon,
  WarehouseIcon,
  BarChart2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useInventoryStore } from '../stores/inventory.store';

const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { items, warehouses, loading, fetchItems, fetchWarehouses, stockIn, stockOut } = useInventoryStore();

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
  }, [fetchItems, fetchWarehouses]);

  const filtered = items.filter(
    (it: any) =>
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStockIn = useCallback(async () => {
    try {
      await stockIn({});
      toast.success('入库成功');
    } catch (e: any) {
      toast.error(e.message || '入库失败');
    }
  }, [stockIn]);

  const handleStockOut = useCallback(async () => {
    try {
      await stockOut({});
      toast.success('出库成功');
    } catch (e: any) {
      toast.error(e.message || '出库失败');
    }
  }, [stockOut]);

  const handleSearch = useCallback(() => {
    fetchItems({ keyword: search || undefined });
  }, [fetchItems, search]);

  // Compute stats from items
  const lowStockCount = items.filter((it: any) => it.stock < it.min).length;

  return (
    <div data-cmp="InventoryPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: `库存品类`, value: `${items.length}`, Icon: PackageIcon, color: 'var(--primary)' },
          { label: `库存预警`, value: `${lowStockCount}`, Icon: AlertTriangleIcon, color: 'var(--color-neon-yellow)' },
          { label: `入库`, value: `—`, Icon: ArrowDownIcon, color: 'var(--color-neon-green)' },
          { label: `出库`, value: `—`, Icon: ArrowUpIcon, color: 'var(--color-neon-cyan)' },
          { label: `仓库数量`, value: `${warehouses.length} 个`, Icon: WarehouseIcon, color: 'var(--color-neon-purple)' },
          { label: `库存总值`, value: `—`, Icon: BarChart2Icon, color: 'var(--color-neon-pink)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 glass-card p-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}
            >
              <s.Icon size={15} style={{ color: s.color }} />
            </div>
            <div className="text-base font-bold font-mono text-foreground">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Warehouse visual */}
      <div className="flex gap-4">
        {warehouses.map((wh: any, i: number) => {
          const used = wh.used ?? wh.usage ?? 0;
          const whColor = i === 0 ? 'var(--primary)' : i === 1 ? 'var(--color-neon-cyan)' : 'var(--color-neon-yellow)';
          return (
            <div key={i} className="flex-1 glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{wh.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{wh.total ?? ''} · {wh.items ?? 0} 品类</div>
                </div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: used > 85 ? 'var(--color-neon-yellow)' : whColor }}
                >
                  {used}%
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${used}%`,
                    background: used > 85
                      ? 'linear-gradient(90deg, var(--color-neon-yellow), var(--destructive))'
                      : `linear-gradient(90deg, ${whColor}, ${whColor}cc)`,
                    boxShadow: `0 0 10px ${whColor}50`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>
                <span>已使用 {used}%</span>
                <span>剩余 {100 - used}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Action buttons */}
      <div className="flex gap-3">
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(129,140,248,0.15)' }}
        >
          <SearchIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={`搜索产品名称或 SKU...`}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <button
          className="btn-placeholder liquid-btn flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
          onClick={handleStockIn}
        >
          <ArrowDownIcon size={14} />
          入库
        </button>
        <button
          className="btn-placeholder flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={handleStockOut}
        >
          <ArrowUpIcon size={14} />
          出库
        </button>
      </div>

      {/* Table */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>暂无库存数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
                  {[`SKU`, `产品名称`, `库存`, `最低库存`, `单价`, `类别`, `仓库`, `状态`].map(h => (
                  <th key={h} className="pb-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-nav-section-label)' }}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => {
                const isLow = item.stock < item.min;
                const pct = Math.min((item.stock / item.min) * 100, 100);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(129,140,248,0.05)' }}>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{item.sku}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <BoxIcon size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold" style={{ color: isLow ? 'var(--destructive)' : 'var(--color-neon-green)' }}>
                          {item.stock}
                        </span>
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: isLow ? 'var(--destructive)' : 'var(--color-neon-green)',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{item.min}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-neon-cyan)' }}>{item.price}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.2)' }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.warehouse}</span>
                    </td>
                    <td className="py-3">
                      {isLow ? (
                        <div className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--destructive)', border: '1px solid rgba(244,63,94,0.2)' }}>
                          <AlertTriangleIcon size={9} />
                          库存不足
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.2)' }}>
                          正常
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

export default InventoryPage;
