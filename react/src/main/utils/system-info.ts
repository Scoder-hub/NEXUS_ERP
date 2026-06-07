import os from 'os';

export interface SystemStatusData {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += (cpu.times as Record<string, number>)[type];
    }
    totalIdle += cpu.times.idle;
  }
  const totalUsed = totalTick - totalIdle;
  return Math.round((totalUsed / totalTick) * 100);
}

function getMemoryUsage(): number {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  return Math.round(((totalMem - freeMem) / totalMem) * 100);
}

function getUptime(): string {
  const seconds = Math.floor(os.uptime());
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
}

export function getSystemStatus(): SystemStatusData {
  return {
    cpu: getCpuUsage(),
    memory: getMemoryUsage(),
    disk: 45, // 简化：磁盘使用率需要额外依赖，先用固定值
    uptime: getUptime(),
  };
}
