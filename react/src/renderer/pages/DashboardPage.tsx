import React, { useEffect, useState } from 'react';
import KpiCardRow from '../../components/KpiCardRow';
import RevenueChart from '../../components/RevenueChart';
import MiniDonutChart from '../../components/MiniDonutChart';
import OrderTable from '../../components/OrderTable';
import ActivityFeed from '../../components/ActivityFeed';
import SystemStatus from '../../components/SystemStatus';
import { useDashboardStore } from '../stores/dashboard.store';
import { Loader2Icon } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const kpiData = useDashboardStore((s) => s.kpiData);
  const revenueData = useDashboardStore((s) => s.revenueData);
  const recentOrders = useDashboardStore((s) => s.recentOrders);
  const activities = useDashboardStore((s) => s.activities);
  const systemStatus = useDashboardStore((s) => s.systemStatus);
  const loading = useDashboardStore((s) => s.loading);
  const refreshAll = useDashboardStore((s) => s.refreshAll);
  const fetchRevenueChart = useDashboardStore((s) => s.fetchRevenueChart);

  const [chartPeriod, setChartPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handlePeriodChange = (period: 'month' | 'quarter' | 'year') => {
    setChartPeriod(period);
    fetchRevenueChart(period);
  };

  if (loading && !kpiData) {
    return (
      <div className="flex items-center justify-center flex-1" data-cmp="DashboardPage">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div data-cmp="DashboardPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* KPI row */}
      <KpiCardRow kpiData={kpiData} />

      {/* Middle row: chart + donut */}
      <div className="flex gap-4">
        <RevenueChart data={revenueData} onPeriodChange={handlePeriodChange} />
        <MiniDonutChart />
      </div>

      {/* Bottom row: orders + activity + system */}
      <div className="flex gap-4">
        <div className="flex-1" style={{ minWidth: 0 }}>
          <OrderTable orders={recentOrders} />
        </div>
        <div className="flex flex-col gap-3" style={{ width: '280px', flexShrink: 0 }}>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* System status full row */}
      <SystemStatus status={systemStatus} />
    </div>
  );
};

export default DashboardPage;
