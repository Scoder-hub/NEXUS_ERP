import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  PlusIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHrStore } from '../stores/hr.store';

const deptColors: Record<string, string> = {
  '研发部': 'var(--primary)',
  '产品部': 'var(--color-neon-cyan)',
  '销售部': 'var(--color-neon-green)',
  '财务部': 'var(--color-neon-yellow)',
  '设计部': 'var(--color-neon-purple)',
  '运维部': 'var(--color-neon-pink)',
};

const statusStyle: Record<string, { color: string; bg: string }> = {
  'active': { color: 'var(--color-neon-green)', bg: 'rgba(52,211,153,0.1)' },
  'business_trip': { color: 'var(--primary)', bg: 'rgba(129,140,248,0.1)' },
  'leave': { color: 'var(--color-neon-yellow)', bg: 'rgba(251,146,60,0.1)' },
};

const statusLabel: Record<string, string> = {
  'active': '在岗',
  'business_trip': '出差',
  'leave': '休假',
};

const avatarGradients = [
  'linear-gradient(135deg, var(--color-primary-500), var(--color-neon-cyan))',
  'linear-gradient(135deg, var(--color-neon-purple), var(--color-neon-pink))',
  'linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-green))',
  'linear-gradient(135deg, var(--color-neon-yellow), var(--destructive))',
  'linear-gradient(135deg, var(--color-primary-400), var(--color-neon-purple))',
  'linear-gradient(135deg, var(--color-neon-green), var(--color-neon-cyan))',
];

const HrPage: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { employees, departments, loading, fetchEmployees, fetchDepartments } = useHrStore();

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  const selectedEmp = selected !== null ? employees.find((e: any) => e.id === selected) : null;

  const deptCounts = departments.length > 0
    ? departments.map((d: any) => ({ name: d.name, count: employees.filter((e: any) => e.dept === d.name).length }))
    : Object.keys(deptColors).map(dept => ({ name: dept, count: employees.filter((e: any) => e.dept === dept).length }));

  return (
    <div data-cmp="HrPage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: `员工总数`, value: `${employees.length} 人`, Icon: UsersIcon, color: 'var(--primary)' },
          { label: `本月入职`, value: `-- 人`, Icon: UserIcon, color: 'var(--color-neon-green)' },
          { label: `本月离职`, value: `-- 人`, Icon: UserIcon, color: 'var(--destructive)' },
          { label: `员工满意度`, value: `--%`, Icon: TrendingUpIcon, color: 'var(--color-neon-cyan)' },
          { label: `在岗率`, value: `--%`, Icon: CalendarIcon, color: 'var(--color-neon-purple)' },
        ].map((s, i) => (
          <div key={i} className="flex-1 glass-card p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
              <s.Icon size={15} style={{ color: s.color }} />
            </div>
            <div className="text-base font-bold font-mono text-foreground">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dept distribution */}
      <div className="flex gap-4">
        {deptCounts.map(({ name, count }, i) => {
          const color = deptColors[name] || 'var(--primary)';
          return (
            <div key={name} className="flex-1 glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-medium text-foreground">{name}</span>
              </div>
              <div className="text-xl font-bold font-mono" style={{ color }}>{count} 人</div>
            </div>
          );
        })}
      </div>

      {/* Employees list + detail */}
      <div className="flex gap-4" style={{ minHeight: '380px' }}>
        {/* List */}
        <div className="flex-1 glass-card p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">员工列表</h3>
            <button className="btn-placeholder liquid-btn flex items-center gap-1.5 text-xs px-3 py-1.5" onClick={() => toast.info('新增员工功能开发中')}>
              <PlusIcon size={11} /> 新增员工
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>加载中...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>暂无员工数据</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {employees.map((emp: any, i: number) => (
                <div
                  key={emp.id}
                  onClick={() => setSelected(emp.id === selected ? null : emp.id)}
                  className="btn-interactive flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  style={{
                    background: selected === emp.id ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected === emp.id ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: avatarGradients[i % avatarGradients.length] }}
                  >
                    {emp.avatar || emp.name?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground">{emp.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{emp.role}</div>
                  </div>
                  {emp.dept && (
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: (deptColors[emp.dept] || 'var(--primary)') + '20',
                        color: deptColors[emp.dept] || 'var(--primary)',
                        border: `1px solid ${(deptColors[emp.dept] || 'var(--primary)')}30`,
                      }}
                    >
                      {emp.dept}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      background: statusStyle[emp.status]?.bg,
                      color: statusStyle[emp.status]?.color,
                      border: `1px solid ${statusStyle[emp.status]?.color}30`,
                    }}
                  >
                    {statusLabel[emp.status] || emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div
          className="glass-card p-4"
          style={{ width: '280px', flexShrink: 0, opacity: selectedEmp ? 1 : 0.4, transition: 'opacity 0.3s' }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">{selectedEmp ? `员工详情` : `选择员工查看详情`}</h3>
          <div className={selectedEmp ? '' : 'hidden'}>
            {selectedEmp && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                    style={{ background: avatarGradients[employees.findIndex((e: any) => e.id === selectedEmp.id) % avatarGradients.length] }}
                  >
                    {selectedEmp.avatar || selectedEmp.name?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{selectedEmp.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selectedEmp.role}</div>
                    {selectedEmp.dept && <span className="text-xs" style={{ color: deptColors[selectedEmp.dept] || 'var(--primary)' }}>{selectedEmp.dept}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { Icon: MailIcon, label: `邮箱`, value: selectedEmp.email },
                    { Icon: PhoneIcon, label: `手机`, value: selectedEmp.phone },
                    { Icon: CalendarIcon, label: `入职`, value: selectedEmp.join_date },
                    { Icon: BriefcaseIcon, label: `薪资`, value: selectedEmp.salary != null ? `¥ ${Number(selectedEmp.salary).toLocaleString()}` : '--' },
                    { Icon: MapPinIcon, label: `状态`, value: statusLabel[selectedEmp.status] || selectedEmp.status },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(129,140,248,0.1)' }}>
                        <f.Icon size={12} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{f.value || '--'}</div>
                        <div className="text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>{f.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className={selectedEmp ? 'hidden' : 'flex items-center justify-center h-48'}>
            <div className="text-center">
              <UserIcon size={32} style={{ color: 'var(--theme-nav-section-label)', margin: '0 auto 8px' }} />
              <p className="text-xs" style={{ color: 'var(--theme-nav-section-label)' }}>点击左侧员工查看详情</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrPage;
