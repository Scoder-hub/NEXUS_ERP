import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  PackageIcon,
  WalletIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  ZapIcon,
  ChevronRightIcon,
  BellIcon,
  LogOutIcon,
  SparklesIcon,
  CalendarClockIcon,
  HardHatIcon,
  GaugeIcon,
  UserCircleIcon,
  MessageSquareIcon,
  ScrollTextIcon,
  DatabaseBackupIcon,
  PowerIcon,
} from 'lucide-react';
import { NavPage } from '../types';

interface SidebarProps {
  activePage?: NavPage;
  onNavigate?: (page: NavPage) => void;
  collapsed?: boolean;
  onLockScreen?: () => void;
  onLogout?: () => void;
}

const navItems: { id: NavPage; label: string; Icon: React.ElementType; badge?: number; group?: string }[] = [
  { id: 'dashboard',              label: `仪表盘`,       Icon: LayoutDashboardIcon,  group: 'main' },
  { id: 'purchase',               label: `采购管理`,     Icon: ShoppingCartIcon,     group: 'main', badge: 3 },
  { id: 'sales',                  label: `销售管理`,     Icon: TrendingUpIcon,       group: 'main', badge: 7 },
  { id: 'inventory',              label: `库存管理`,     Icon: PackageIcon,          group: 'main' },
  { id: 'finance',                label: `财务管理`,     Icon: WalletIcon,           group: 'main' },
  { id: 'hr',                     label: `人力资源`,     Icon: UsersIcon,            group: 'main' },
  { id: 'reports',                label: `报表分析`,     Icon: BarChart3Icon,        group: 'main' },
  { id: 'production-plan',        label: `生产计划`,     Icon: CalendarClockIcon,    group: 'production', badge: 2 },
  { id: 'workshop-exec',          label: `车间执行`,     Icon: HardHatIcon,          group: 'production' },
  { id: 'production-dashboard',   label: `生产看板`,     Icon: GaugeIcon,            group: 'production' },
  { id: 'generation',             label: `生成管理`,     Icon: SparklesIcon,         group: 'tools', badge: 2 },
  { id: 'notifications',          label: `通知审批`,     Icon: BellIcon,             group: 'tools', badge: 4 },
  { id: 'messages',               label: `消息对话`,     Icon: MessageSquareIcon,    group: 'tools', badge: 2 },
  { id: 'operation-logs',         label: `操作日志`,     Icon: ScrollTextIcon,       group: 'system' },
  { id: 'data-backup',            label: `数据备份`,     Icon: DatabaseBackupIcon,   group: 'system' },
  { id: 'profile',               label: `个人中心`,     Icon: UserCircleIcon,       group: 'system' },
  { id: 'settings',               label: `系统设置`,     Icon: SettingsIcon,         group: 'system' },
];

// Hardcoded hex colors — same as prototype, required for string interpolation (${color}20, ${color}40)
const colorMap: Record<NavPage, string> = {
  dashboard:              '#818cf8',
  purchase:               '#22d3ee',
  sales:                  '#34d399',
  inventory:              '#fb923c',
  finance:                '#a78bfa',
  hr:                     '#f472b6',
  reports:                '#60a5fa',
  generation:             '#e879f9',
  settings:               '#8892b0',
  'production-plan':      '#38bdf8',
  'workshop-exec':        '#4ade80',
  'production-dashboard': '#0ea5e9',
  profile:                '#818cf8',
  notifications:          '#f43f5e',
  messages:               '#34d399',
  'operation-logs':       '#fbbf24',
  'data-backup':          '#a78bfa',
};

const GROUP_LABELS: Record<string, string> = {
  main:       `主导航`,
  production: `生产管理`,
  tools:      `协同工具`,
  system:     `系统管理`,
};

const PARTICLES = [0, 1, 2, 3, 4] as const;

const Sidebar: React.FC<SidebarProps> = ({
  activePage = 'dashboard',
  onNavigate = () => {},
  collapsed = false,
  onLockScreen = () => {},
  onLogout = () => {},
}) => {
  const prevActiveRef = useRef<NavPage>(activePage);
  const animKeyRef = useRef<number>(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  if (prevActiveRef.current !== activePage) {
    prevActiveRef.current = activePage;
    animKeyRef.current += 1;
  }
  const animKey = animKeyRef.current;

  // Group items
  const groups = ['main', 'production', 'tools', 'system'] as const;

  return (
    <aside
      data-cmp="Sidebar"
      className="relative flex flex-col h-screen z-20"
      style={{
        width: collapsed ? '72px' : '240px',
        background: 'var(--theme-sidebar-bg)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--theme-sidebar-border)',
        transition: 'width 0.3s ease',
        flexShrink: 0,
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)' }}
      />

      {/* Logo */}
      <div className={`flex items-center gap-3 px-5${collapsed ? ' justify-center' : ''}`} style={{ paddingTop: '19px', paddingBottom: '19px' }}>
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: '0 0 20px rgba(99,102,241,0.5)',
          }}
        >
          <ZapIcon size={18} style={{ color: 'white' }} />
        </div>
        <div className={collapsed ? 'hidden' : 'block'}>
          <div className="text-sm font-bold gradient-text tracking-wider">NEXUS ERP</div>
          <div className="text-xs" style={{ color: 'var(--theme-nav-inactive-text)' }}>Open Source Demo</div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-2" style={{ background: 'var(--theme-divider)' }} />

      {/* Nav items grouped */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5 pb-2">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group);
          return (
            <div key={group}>
              {/* Group label */}
              <div className={`px-2 pt-3 pb-1 ${collapsed ? 'hidden' : ''}`}>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--theme-nav-section-label)' }}
                >
                  {GROUP_LABELS[group]}
                </span>
              </div>

              {items.map(({ id, label, Icon, badge }) => {
                const isActive = activePage === id;
                const color = colorMap[id];
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className="w-full flex items-center gap-3 rounded-xl relative transition-all duration-200 overflow-visible group"
                    style={{
                      padding: '9px 12px',
                      background: isActive
                        ? `linear-gradient(135deg, ${color}20, ${color}10)`
                        : 'transparent',
                      border: isActive
                        ? `1px solid ${color}40`
                        : '1px solid transparent',
                      color: isActive ? color : 'var(--theme-nav-inactive-text)',
                    }}
                  >
                    {/* Hover indicator bar */}
                    <div
                      className={`nav-hover-bar absolute left-0 top-2 bottom-2 rounded-full pointer-events-none${isActive ? ' hidden' : ''}`}
                      style={{
                        width: '2px',
                        background: 'rgba(196, 181, 253, 0.5)',
                      }}
                    />

                    {/* Active left bar */}
                    <div
                      key={isActive ? `bar-${animKey}` : `bar-inactive-${id}`}
                      className={`absolute left-0 top-2 bottom-2 rounded-full ${isActive ? 'nav-active-bar' : ''}`}
                      style={{
                        width: isActive ? '5px' : '0px',
                        background: isActive
                          ? 'linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)'
                          : 'transparent',
                        boxShadow: isActive
                          ? '0 0 8px 2px rgba(139,92,246,0.7), 0 0 24px 6px rgba(139,92,246,0.35)'
                          : 'none',
                        transition: 'width 0.15s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 60%)' }}
                      />
                    </div>

                    {/* Particle trail */}
                    {isActive && PARTICLES.map((i) => {
                      const shadowColors = [
                        'rgba(167,139,250,0.65)',
                        'rgba(155,114,245,0.60)',
                        'rgba(144,97,238,0.55)',
                        'rgba(132,80,228,0.55)',
                        'rgba(124,58,237,0.50)',
                      ];
                      return (
                        <div
                          key={`particle-${animKey}-${i}`}
                          className={`nav-particle-${i} absolute rounded-full pointer-events-none`}
                          style={{
                            left: '1px',
                            top: '8px',
                            width: i % 2 === 0 ? '4px' : '3px',
                            height: i % 2 === 0 ? '4px' : '3px',
                            boxShadow: `0 0 4px 1px ${shadowColors[i]}`,
                          }}
                        />
                      );
                    })}

                    {/* Glow sweep */}
                    <div
                      key={isActive ? `sweep-${animKey}` : `sweep-inactive-${id}`}
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
                    >
                      <div
                        className={isActive ? 'nav-active-glow-sweep' : ''}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '40px',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.25) 50%, transparent 100%)',
                          display: isActive ? 'block' : 'none',
                        }}
                      />
                    </div>

                    <Icon size={17} style={{ color: isActive ? color : 'var(--theme-nav-inactive-text)', flexShrink: 0 }} />

                    <span className={`text-sm font-medium flex-1 text-left whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>
                      {label}
                    </span>

                    {badge && !collapsed && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${color}30`,
                          color: color,
                          border: `1px solid ${color}40`,
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {badge}
                      </span>
                    )}

                    {isActive && !collapsed && (
                      <ChevronRightIcon size={14} style={{ color: color, opacity: 0.7 }} />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3">
        <div className="mx-0 h-px mb-3" style={{ background: 'var(--theme-divider)' }} />

        {/* User profile */}
        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200${collapsed ? ' flex-col justify-center' : ''}`}
          style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}
          onClick={() => onNavigate('profile')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white' }}
          >
            管
          </div>
          <div className={`flex-1 min-w-0 ${collapsed ? 'hidden' : ''}`}>
            <div className="text-xs font-semibold text-foreground truncate">管理员</div>
            <div className="text-xs truncate" style={{ color: 'var(--theme-nav-inactive-text)' }}>admin@nexus.com</div>
          </div>
          <LogOutIcon
            size={14}
            style={{ color: 'var(--theme-nav-inactive-text)', flexShrink: 0 }}
            className={collapsed ? '' : ''}
            onClick={e => { e.stopPropagation(); setShowLogoutConfirm(true); }}
          />
        </div>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'color-mix(in srgb, rgba(0,0,0,0.6) 70%, var(--background))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '300px',
              maxWidth: 'calc(100vw - 32px)',
              padding: '24px 20px 18px',
              borderRadius: '16px',
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
              boxShadow:
                '0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 80px rgba(99,102,241,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              animation: 'dialogIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(145deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
                border: '1.5px solid rgba(239,68,68,0.25)',
                boxShadow: '0 0 20px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <PowerIcon size={22} strokeWidth={1.8} style={{ color: '#f87171' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                确认退出登录？
              </div>
              <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--muted-foreground)', opacity: 0.7, lineHeight: 1.4 }}>
                退出后需要重新登录才能使用系统
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--theme-btn-bg)',
                  border: '1px solid var(--theme-btn-border)',
                  color: 'var(--foreground)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--theme-input-bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--theme-btn-bg)'; e.currentTarget.style.borderColor = 'var(--theme-btn-border)'; }}
              >
                取消
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  cursor: 'pointer',
                  transition: 'filter 0.15s ease, transform 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default Sidebar;
