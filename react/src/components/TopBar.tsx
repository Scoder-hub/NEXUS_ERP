import React, { useState, useCallback, useRef } from 'react';
import {
  SearchIcon,
  BellIcon,
  RefreshCwIcon,
  MenuIcon,
  ChevronDownIcon,
  SlidersHorizontalIcon,
  SunIcon,
  MoonIcon,
  CloudSunIcon,
  CloudRainIcon,
  CloudIcon,
  SunriseIcon,
  ThermometerIcon,
  DropletsIcon,
  LockIcon,
} from 'lucide-react';
import { NavPage } from '../types';
import LanguageSwitcher from './LanguageSwitcher';

const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard:              { title: `仪表盘`,       subtitle: `实时业务数据概览` },
  purchase:               { title: `采购管理`,     subtitle: `供应商与采购订单` },
  sales:                  { title: `销售管理`,     subtitle: `客户订单与销售追踪` },
  inventory:              { title: `库存管理`,     subtitle: `仓库库存与出入库` },
  finance:                { title: `财务管理`,     subtitle: `账单、收付款与报告` },
  hr:                     { title: `人力资源`,     subtitle: `员工档案与薪酬管理` },
  reports:                { title: `报表分析`,     subtitle: `多维度业务分析报告` },
  settings:               { title: `系统设置`,     subtitle: `偏好与权限配置` },
  generation:             { title: `生成管理`,     subtitle: `AI 内容生成与任务调度` },
  'production-plan':      { title: `生产计划排程`, subtitle: `工单管理与甘特图排产` },
  'workshop-exec':        { title: `车间执行管理`, subtitle: `工序流转与工位状态监控` },
  'production-dashboard': { title: `生产数据看板`, subtitle: `产能、日产量与设备开机率可视化` },
  profile:                { title: `个人中心`,     subtitle: `账户信息与安全设置` },
  notifications:          { title: `通知审批`,     subtitle: `系统通知与审批流程` },
  messages:               { title: `消息对话`,     subtitle: `内部即时通讯` },
  'operation-logs':       { title: `操作日志`,     subtitle: `系统操作记录与审计` },
  'data-backup':          { title: `数据备份恢复`, subtitle: `数据库备份策略与还原` },
};

/* ── Static weather / festival data ─────────────────────────────────────── */
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'partlyCloudy';

interface WeatherInfo {
  type: WeatherType;
  label: string;
  temp: string;
  feelsLike: string;
  humidity: string;
  Icon: React.ElementType;
  color: string;
}

const WEATHER_MAP: Record<WeatherType, WeatherInfo> = {
  sunny:        { type: 'sunny',        label: `晴`,   temp: `28°`, feelsLike: `31°C`, humidity: `45%`,  Icon: SunriseIcon,   color: '#fb923c' },
  partlyCloudy: { type: 'partlyCloudy', label: `多云`, temp: `24°`, feelsLike: `26°C`, humidity: `58%`,  Icon: CloudSunIcon,  color: '#fbbf24' },
  cloudy:       { type: 'cloudy',       label: `阴`,   temp: `21°`, feelsLike: `20°C`, humidity: `72%`,  Icon: CloudIcon,     color: '#94a3b8' },
  rainy:        { type: 'rainy',        label: `小雨`, temp: `18°`, feelsLike: `17°C`, humidity: `88%`,  Icon: CloudRainIcon, color: '#60a5fa' },
};

const todayWeather = (() => {
  const types: WeatherType[] = ['sunny', 'partlyCloudy', 'cloudy', 'rainy'];
  const idx = new Date().getDate() % types.length;
  return WEATHER_MAP[types[idx]];
})();

const FESTIVAL_MAP: Record<string, string> = {
  '01-01': `🎉 元旦`,
  '02-14': `💝 情人节`,
  '03-08': `👩 妇女节`,
  '04-01': `😄 愚人节`,
  '05-01': `🏗️ 劳动节`,
  '05-04': `✊ 青年节`,
  '06-01': `🧒 儿童节`,
  '07-01': `🎗️ 建党节`,
  '08-01': `🎖️ 建军节`,
  '09-10': `📚 教师节`,
  '10-01': `🇨🇳 国庆节`,
  '12-24': `🎄 平安夜`,
  '12-25': `🎁 圣诞节`,
};

const todayFestival = (() => {
  const now = new Date();
  const key = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return FESTIVAL_MAP[key] ?? null;
})();

/* ── Component ────────────────────────────────────────────────────────────── */
interface TopBarProps {
  activePage?: NavPage;
  onToggleSidebar?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onNavigate?: (page: NavPage) => void;
  onLockScreen?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  activePage = 'dashboard',
  onToggleSidebar = () => {},
  theme = 'dark',
  onToggleTheme = () => {},
  onNavigate = () => {},
  onLockScreen = () => {},
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [spinKey, setSpinKey] = useState(0);
  const [weatherHover, setWeatherHover] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageInfo = pageTitles[activePage] ?? { title: activePage, subtitle: '' };
  const { title, subtitle } = pageInfo;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  const isLight = theme === 'light';
  const WeatherIcon = todayWeather.Icon;

  const handleThemeToggle = useCallback(() => {
    setSpinKey(k => k + 1);
    onToggleTheme();
  }, [onToggleTheme]);

  const handleWeatherMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setWeatherHover(true);
  };

  const handleWeatherMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => setWeatherHover(false), 120);
  };

  return (
    <header
      data-cmp="TopBar"
      className="flex items-center gap-4 px-4 py-2 relative z-10"
      style={{
        background: 'var(--theme-topbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--theme-topbar-border)',
        height: '56px',
        flexShrink: 0,
      }}
    >
      {/* Menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="icon-btn flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          color: 'var(--theme-nav-inactive-text)',
          background: 'var(--theme-btn-bg)',
          border: '1px solid var(--theme-btn-border)',
        }}
      >
        <MenuIcon size={16} />
      </button>

      {/* Page title */}
      <div className="flex-shrink-0">
        <h1 className="text-base font-bold text-foreground leading-none">{title}</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-nav-inactive-text)' }}>{subtitle}</p>
      </div>

      {/* Breadcrumb separator */}
      <div className="h-6 w-px mx-1 flex-shrink-0" style={{ background: 'var(--theme-input-border)' }} />

      {/* Search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2 transition-shadow duration-200 focus-within:shadow-[0_0_0_2px_var(--ring)]"
        style={{
          background: 'var(--theme-input-bg)',
          border: '1px solid var(--theme-input-border)',
        }}
      >
        <SearchIcon size={14} style={{ color: 'var(--theme-nav-inactive-text)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder={`搜索订单、产品、客户...`}
          className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder-gray-500 focus:ring-2 focus:ring-[var(--ring)]"
        />
        <kbd
          className="text-xs px-1.5 py-0.5 rounded hidden sm:flex items-center"
          style={{
            background: 'var(--theme-btn-bg)',
            color: 'var(--theme-nav-inactive-text)',
            border: '1px solid var(--theme-btn-border)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* ── Date / Time / Weather / Festival block ──────────────────────── */}
      <div className="flex flex-col items-end gap-0.5">
        {/* Row 1: time + weather */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{timeStr}</span>

          {/* Weather badge with tooltip */}
          <div
            className="relative"
            onMouseEnter={handleWeatherMouseEnter}
            onMouseLeave={handleWeatherMouseLeave}
          >
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-default"
              style={{
                background: isLight ? `${todayWeather.color}18` : `${todayWeather.color}22`,
                border: `1px solid ${todayWeather.color}40`,
              }}
            >
              <WeatherIcon size={11} style={{ color: todayWeather.color }} />
              <span className="text-xs font-medium" style={{ color: todayWeather.color, fontSize: '10px' }}>
                {todayWeather.label} {todayWeather.temp}
              </span>
            </div>

            {/* Weather Tooltip */}
            <div
              className="absolute right-0 top-full mt-2 z-50 pointer-events-none"
              style={{
                opacity: weatherHover ? 1 : 0,
                transform: weatherHover ? 'translateY(0px) scale(1)' : 'translateY(-4px) scale(0.97)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                minWidth: '148px',
              }}
            >
              <div
                className="absolute right-3 -top-1.5 w-3 h-3 rotate-45"
                style={{
                  background: 'var(--color-tooltip-bg)',
                  borderTop: '1px solid var(--color-tooltip-border)',
                  borderLeft: '1px solid var(--color-tooltip-border)',
                }}
              />
              <div
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: 'var(--color-tooltip-bg)',
                  border: '1px solid var(--color-tooltip-border)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'var(--color-dropdown-shadow)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2 pb-1.5" style={{ borderBottom: '1px solid var(--color-tooltip-divider)' }}>
                  <WeatherIcon size={12} style={{ color: todayWeather.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>今日天气详情</span>
                </div>
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-1">
                    <ThermometerIcon size={11} style={{ color: 'var(--color-weather-thermometer)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>体感温度</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{todayWeather.feelsLike}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <DropletsIcon size={11} style={{ color: 'var(--color-weather-droplets)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>湿度</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{todayWeather.humidity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Festival badge */}
          <div
            className="flex items-center px-1.5 py-0.5 rounded-md"
            style={{
              display: todayFestival ? 'flex' : 'none',
              background: 'var(--color-festival-gradient)',
              boxShadow: 'var(--color-festival-glow)',
            }}
          >
            <span style={{ fontSize: '10px', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {todayFestival ?? ''}
            </span>
          </div>
        </div>
        {/* Row 2: date */}
        <span className="text-xs" style={{ color: 'var(--theme-nav-inactive-text)' }}>{dateStr}</span>
      </div>

      {/* Language Switcher */}
      <LanguageSwitcher variant="compact" />

      {/* Refresh */}
      <button
        className="icon-btn flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          color: 'var(--theme-nav-inactive-text)',
          background: 'var(--theme-btn-bg)',
          border: '1px solid var(--theme-btn-border)',
        }}
      >
        <RefreshCwIcon size={14} />
      </button>

      {/* Filter */}
      <button
        className="icon-btn flex items-center justify-center w-8 h-8 rounded-lg"
        style={{
          color: 'var(--theme-nav-inactive-text)',
          background: 'var(--theme-btn-bg)',
          border: '1px solid var(--theme-btn-border)',
        }}
      >
        <SlidersHorizontalIcon size={14} />
      </button>

      {/* Lock Screen */}
      <button
        onClick={onLockScreen}
        className="icon-btn flex items-center justify-center w-8 h-8 rounded-lg"
        title={`锁定屏幕`}
        style={{
          color: 'var(--theme-nav-inactive-text)',
          background: 'var(--theme-btn-bg)',
          border: '1px solid var(--theme-btn-border)',
        }}
      >
        <LockIcon size={14} />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={handleThemeToggle}
        className="icon-btn theme-toggle-btn flex items-center justify-center w-8 h-8 rounded-lg relative"
        title={isLight ? `切换到深色模式` : `切换到浅色模式`}
        style={{
          color: 'var(--color-theme-toggle)',
          background: 'var(--color-theme-toggle-bg)',
          border: '1px solid var(--color-theme-toggle-border)',
        }}
      >
        <span key={spinKey} className="theme-icon-spin flex items-center justify-center">
          {isLight ? <SunIcon size={14} /> : <MoonIcon size={14} />}
        </span>
      </button>

      {/* Notification bell → navigate to notifications page */}
      <button
        onClick={() => onNavigate('notifications')}
        className="icon-btn flex items-center justify-center w-8 h-8 rounded-lg relative"
        style={{
          color: 'var(--primary)',
          background: 'var(--color-notification-bg)',
          border: '1px solid var(--color-notification-border)',
        }}
      >
        <BellIcon size={14} />
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: 'var(--color-notification-badge)', color: 'white', fontSize: '9px' }}
        >
          4
        </span>
      </button>

      {/* Avatar → profile menu */}
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'var(--color-brand-gradient)',
              color: 'white',
              boxShadow: 'var(--color-avatar-shadow)',
            }}
          >
            管
          </div>
          <ChevronDownIcon
            size={12}
            style={{
              color: 'var(--theme-nav-inactive-text)',
              transform: avatarMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {/* Avatar dropdown */}
        <div
          className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--color-dropdown-shadow)',
            minWidth: 160,
            opacity: avatarMenuOpen ? 1 : 0,
            pointerEvents: avatarMenuOpen ? 'all' : 'none',
            transform: avatarMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
            transition: 'all 0.2s ease',
            zIndex: 9999,
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="text-sm font-semibold text-foreground">管理员</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>admin@nexus.com</div>
          </div>
          <button
            className="btn-interactive w-full text-left px-4 py-2.5 text-sm"
            style={{ color: 'var(--foreground)' }}
            onClick={() => { onNavigate('profile'); setAvatarMenuOpen(false); }}
          >
            👤 个人中心
          </button>
          <button
            className="btn-interactive w-full text-left px-4 py-2.5 text-sm"
            style={{ color: 'var(--foreground)' }}
            onClick={() => { onNavigate('messages'); setAvatarMenuOpen(false); }}
          >
            💬 我的消息
          </button>
          <button
            className="btn-interactive w-full text-left px-4 py-2.5 text-sm"
            style={{ color: 'var(--foreground)', borderTop: '1px solid var(--border)' }}
            onClick={() => { onLockScreen(); setAvatarMenuOpen(false); }}
          >
            🔒 锁定屏幕
          </button>
        </div>

        {/* backdrop */}
        <div
          className="fixed inset-0"
          style={{ display: avatarMenuOpen ? 'block' : 'none', zIndex: 9998 }}
          onClick={() => setAvatarMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default TopBar;
