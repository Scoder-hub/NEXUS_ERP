import React, { useState } from 'react';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  MonitorIcon,
  DatabaseIcon,
  GlobeIcon,
  ChevronRightIcon,
  CheckIcon,
  KeyIcon,
  MailIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'profile' | 'notifications' | 'security' | 'system';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    order: true,
    finance: true,
    hr: false,
  });

  const toggle = (k: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [k]: !prev[k] }));

  const tabs: { k: Tab; label: string; Icon: React.ElementType }[] = [
    { k: 'profile', label: `个人资料`, Icon: UserIcon },
    { k: 'notifications', label: `通知设置`, Icon: BellIcon },
    { k: 'security', label: `安全中心`, Icon: ShieldIcon },
    { k: 'system', label: `系统配置`, Icon: MonitorIcon },
  ];

  return (
    <div data-cmp="SettingsPage" className="flex gap-4 p-4 overflow-y-auto flex-1">
      {/* Sidebar nav */}
      <div className="glass-card p-3 flex flex-col gap-1" style={{ width: '200px', flexShrink: 0, height: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k)}
            className="btn-interactive flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium"
            style={{
              background: activeTab === t.k ? 'rgba(129,140,248,0.15)' : 'transparent',
              color: activeTab === t.k ? 'var(--primary)' : 'var(--muted-foreground)',
              border: `1px solid ${activeTab === t.k ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
            }}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Profile tab */}
        <div className={activeTab === 'profile' ? 'flex flex-col gap-4' : 'hidden'}>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">基本信息</h3>
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-500), #06b6d4)' }}
              >
                AD
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">系统管理员</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>admin@nexuserp.com</div>
                <div className="mt-1.5 text-xs px-2 py-0.5 rounded inline-block"
                  style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.2)' }}>
                  超级管理员
                </div>
              </div>
              <button className="btn-placeholder text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.2)' }}
                onClick={() => toast.info('头像修改功能开发中')}>
                修改头像
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: `用户名`, value: `admin` },
                { label: `显示名称`, value: `系统管理员` },
                { label: `邮箱地址`, value: `admin@nexuserp.com` },
                { label: `手机号码`, value: `138 **** 5678` },
                { label: `所属部门`, value: `信息技术部` },
                { label: `职位`, value: `ERP 系统管理员` },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <label className="text-xs font-medium w-24 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{f.label}</label>
                  <input
                    defaultValue={f.value}
                    className="flex-1 bg-transparent text-xs px-3 py-2 rounded-lg outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(129,140,248,0.15)', color: 'var(--foreground)' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="liquid-btn text-xs px-4 py-2" onClick={() => toast.success('设置已保存')}>保存修改</button>
            </div>
          </div>
        </div>

        {/* Notifications tab */}
        <div className={activeTab === 'notifications' ? 'flex flex-col gap-4' : 'hidden'}>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">通知渠道</h3>
            <div className="flex flex-col gap-4">
              {[
                { k: 'email' as const, label: `邮件通知`, desc: `通过邮件接收系统通知`, Icon: MailIcon },
                { k: 'push' as const, label: `推送通知`, desc: `浏览器桌面推送提醒`, Icon: BellIcon },
                { k: 'sms' as const, label: `短信通知`, desc: `重要事项通过短信提醒`, Icon: SmartphoneIcon },
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(129,140,248,0.1)' }}>
                      <item.Icon size={14} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(item.k)}
                    className="toggle-btn w-10 h-5 rounded-full relative flex-shrink-0"
                    style={{
                      background: notifications[item.k] ? 'linear-gradient(90deg, var(--color-primary-500), #06b6d4)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      style={{
                        background: 'white',
                        left: notifications[item.k] ? 'calc(100% - 18px)' : '2px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">事件订阅</h3>
            <div className="flex flex-col gap-3">
              {[
                { k: 'order' as const, label: `订单状态变更` },
                { k: 'finance' as const, label: `财务审批通知` },
                { k: 'hr' as const, label: `人事变动提醒` },
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <button
                    onClick={() => toggle(item.k)}
                    className="toggle-btn w-10 h-5 rounded-full relative"
                    style={{
                      background: notifications[item.k] ? 'linear-gradient(90deg, var(--color-primary-500), #06b6d4)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      style={{
                        background: 'white',
                        left: notifications[item.k] ? 'calc(100% - 18px)' : '2px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security tab */}
        <div className={activeTab === 'security' ? 'flex flex-col gap-4' : 'hidden'}>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">账户安全</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: `修改密码`, desc: `上次修改: 30 天前`, Icon: KeyIcon, color: 'var(--primary)', action: `立即修改` },
                { label: `双因素认证`, desc: `已启用 TOTP 验证器`, Icon: ShieldIcon, color: 'var(--color-neon-green)', action: `管理 2FA` },
                { label: `活跃会话`, desc: `当前有 2 个设备登录`, Icon: MonitorIcon, color: 'var(--color-neon-cyan)', action: `查看会话` },
                { label: `登录历史`, desc: `查看最近登录记录`, Icon: GlobeIcon, color: 'var(--color-neon-purple)', action: `查看记录` },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                    <s.Icon size={15} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-foreground">{s.label}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</div>
                  </div>
                  <button className="btn-placeholder flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: `${s.color}10`, color: s.color, border: `1px solid ${s.color}20` }}
                    onClick={() => toast.info(`${s.action}功能开发中`)}>
                    {s.action} <ChevronRightIcon size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System tab */}
        <div className={activeTab === 'system' ? 'flex flex-col gap-4' : 'hidden'}>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">系统信息</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: `系统版本`, value: `NEXUS ERP v2.4.1` },
                { label: `数据库`, value: `PostgreSQL 16.2` },
                { label: `运行时间`, value: `47 天 12 小时` },
                { label: `系统时区`, value: `UTC+8 (中国标准时间)` },
                { label: `数据备份`, value: `每日凌晨 02:00 自动备份` },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid rgba(129,140,248,0.06)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{f.label}</span>
                  <span className="text-xs font-mono text-foreground">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">存储配置</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: `数据库存储`, used: 38, total: `500 GB`, color: 'var(--primary)' },
                { label: `文件存储`, used: 62, total: `2 TB`, color: 'var(--color-neon-cyan)' },
                { label: `日志存储`, used: 24, total: `100 GB`, color: 'var(--color-neon-green)' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <DatabaseIcon size={12} style={{ color: s.color }} />
                    <span className="text-xs font-medium text-foreground">{s.label}</span>
                    <span className="ml-auto text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{s.used}% / {s.total}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.used}%`,
                        background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                        boxShadow: `0 0 8px ${s.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-interactive flex items-center gap-2 text-xs px-4 py-2 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.2)' }}
              onClick={() => toast.success('配置已保存')}>
              <CheckIcon size={12} />
              保存所有配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
