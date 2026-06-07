import React from 'react';
import { ServerIcon, DatabaseIcon, WifiIcon, ShieldCheckIcon } from 'lucide-react';

interface ServiceStatus {
  name: string;
  Icon: React.ElementType;
  status: 'online' | 'warning' | 'error';
  metric: string;
  metricLabel: string;
  progress: number;
  color: string;
}

const defaultServices: ServiceStatus[] = [
  {
    name: `应用服务器`,
    Icon: ServerIcon,
    status: 'online',
    metric: `99.9%`,
    metricLabel: `可用率`,
    progress: 62,
    color: 'var(--primary)',
  },
  {
    name: `数据库集群`,
    Icon: DatabaseIcon,
    status: 'online',
    metric: `23ms`,
    metricLabel: `响应延迟`,
    progress: 45,
    color: 'var(--color-neon-cyan)',
  },
  {
    name: `网络带宽`,
    Icon: WifiIcon,
    status: 'warning',
    metric: `78%`,
    metricLabel: `带宽使用率`,
    progress: 78,
    color: 'var(--color-neon-yellow)',
  },
  {
    name: `安全防护`,
    Icon: ShieldCheckIcon,
    status: 'online',
    metric: `全绿`,
    metricLabel: `威胁检测`,
    progress: 100,
    color: 'var(--color-neon-green)',
  },
];

const statusDot: Record<string, string> = {
  online: 'status-online',
  warning: 'status-warning',
  error: 'status-error',
};

interface SystemStatusProps {
  status?: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
  } | null;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const services: ServiceStatus[] = status
    ? [
        {
          name: `应用服务器`,
          Icon: ServerIcon,
          status: status.cpu < 80 ? 'online' : 'warning',
          metric: `${status.cpu}%`,
          metricLabel: `CPU 使用率`,
          progress: status.cpu,
          color: status.cpu < 80 ? 'var(--primary)' : 'var(--color-neon-yellow)',
        },
        {
          name: `数据库集群`,
          Icon: DatabaseIcon,
          status: status.memory < 80 ? 'online' : 'warning',
          metric: `${status.memory}%`,
          metricLabel: `内存使用率`,
          progress: status.memory,
          color: status.memory < 80 ? 'var(--color-neon-cyan)' : 'var(--color-neon-yellow)',
        },
        {
          name: `网络带宽`,
          Icon: WifiIcon,
          status: status.disk < 80 ? 'online' : 'warning',
          metric: `${status.disk}%`,
          metricLabel: `磁盘使用率`,
          progress: status.disk,
          color: status.disk < 80 ? 'var(--color-neon-green)' : 'var(--color-neon-yellow)',
        },
        {
          name: `运行时间`,
          Icon: ShieldCheckIcon,
          status: 'online',
          metric: status.uptime,
          metricLabel: `系统运行`,
          progress: 100,
          color: 'var(--color-neon-green)',
        },
      ]
    : defaultServices;

  return (
    <div data-cmp="SystemStatus" className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">系统状态</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>基础设施监控</p>
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--color-neon-green)' }}>
          全系统正常
        </div>
      </div>

      <div className="space-y-4">
        {services.map((svc, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <svc.Icon size={14} style={{ color: svc.color }} />
                <span className="text-xs font-medium text-foreground">{svc.name}</span>
                <span className={`status-dot ${statusDot[svc.status]}`} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold" style={{ color: svc.color }}>{svc.metric}</span>
                <span className="text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>{svc.metricLabel}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${svc.progress}%`,
                  background: `linear-gradient(90deg, ${svc.color}, ${svc.color}aa)`,
                  boxShadow: `0 0 8px ${svc.color}60`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
