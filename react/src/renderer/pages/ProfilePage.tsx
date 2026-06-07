import React, { useState } from 'react';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  SaveIcon,
  ShieldIcon,
  KeyIcon,
  CameraIcon,
  CheckIcon,
  StarIcon,
  TrendingUpIcon,
  AwardIcon,
  ActivityIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info');
  const [name, setName] = useState(`张磊`);
  const [phone, setPhone] = useState(`+86 138-0000-1234`);
  const [bio, setBio] = useState(`负责企业核心业务系统的规划与运营管理，推动数字化转型。`);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleSave = () => {
    setEditing(false);
    toast.success(`个人信息已保存`);
  };

  const handleChangePwd = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast.error(`请填写完整密码信息`);
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error(`两次密码输入不一致`);
      return;
    }
    setOldPwd('');
    setNewPwd('');
    setConfirmPwd('');
    toast.success(`密码已修改成功`);
  };

  const stats = [
    { label: `登录次数`, value: '1,248', Icon: ActivityIcon, color: 'var(--primary)' },
    { label: `处理工单`, value: '326', Icon: TrendingUpIcon, color: 'var(--color-neon-cyan)' },
    { label: `审批完成`, value: '89', Icon: CheckIcon, color: 'var(--color-neon-green)' },
    { label: `获得评分`, value: '4.9', Icon: StarIcon, color: 'var(--color-neon-yellow)' },
  ];

  const recentActivity = [
    { action: `审批采购订单 #PO-2024-0892`, time: `2分钟前`, color: 'var(--color-neon-cyan)' },
    { action: `更新库存数量 — 原材料区`, time: `35分钟前`, color: 'var(--color-neon-green)' },
    { action: `生成月度销售报表`, time: `2小时前`, color: 'var(--primary)' },
    { action: `修改员工信息 — 李明`, time: `昨天 14:22`, color: 'var(--color-neon-purple)' },
    { action: `导出财务数据备份`, time: `昨天 09:10`, color: 'var(--color-neon-yellow)' },
  ];

  const tabs = [
    { id: 'info' as const, label: `基本信息`, Icon: UserIcon },
    { id: 'security' as const, label: `安全设置`, Icon: ShieldIcon },
    { id: 'activity' as const, label: `近期动态`, Icon: ActivityIcon },
  ];

  return (
    <div data-cmp="ProfilePage" className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Header banner */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(6,182,212,0.2) 50%, rgba(139,92,246,0.25) 100%)`,
          border: '1px solid var(--theme-card-border)',
          height: '140px',
        }}
      >
        <div className="aurora-orb" style={{ width: 200, height: 200, background: 'rgba(99,102,241,0.2)', top: -60, left: -40 }} />
        <div className="aurora-orb" style={{ width: 150, height: 150, background: 'rgba(6,182,212,0.2)', bottom: -40, right: 60 }} />
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(to top, var(--background), transparent)' }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <span className="status-dot status-online mr-1.5" />在线
          </span>
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(129,140,248,0.15)', color: 'var(--primary)', border: '1px solid rgba(129,140,248,0.3)' }}>
            系统管理员
          </span>
        </div>
      </div>

      {/* Avatar + name row */}
      <div className="flex items-end gap-4 -mt-14 px-2 relative z-10">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--color-primary-500), #06b6d4)`,
              boxShadow: `0 0 30px rgba(99,102,241,0.5)`,
              border: '3px solid var(--background)',
              color: 'white',
            }}
          >
            张
          </div>
          <button
            className="btn-placeholder absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            onClick={() => toast.info('头像上传功能开发中')}
          >
            <CameraIcon size={13} />
          </button>
        </div>
        <div className="pb-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">{name}</h2>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--color-neon-yellow)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <AwardIcon size={10} /> 高级用户
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>系统管理员 · 信息技术部 · admin@nexus.com</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="liquid-btn flex items-center gap-2 px-4 py-2 text-sm mb-2"
        >
          {editing ? <SaveIcon size={14} /> : <EditIcon size={14} />}
          {editing ? `保存更改` : `编辑资料`}
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className="glass-card flex-1 min-w-32 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{value}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--muted)', width: 'fit-content' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: activeTab === id ? 'var(--primary)' : 'transparent',
              color: activeTab === id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card p-4">
        {/* Basic Info */}
        <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
          <div className="flex flex-wrap gap-4">
            {[
              { label: `姓名`, value: name, Icon: UserIcon, editable: true, setter: setName },
              { label: `电子邮箱`, value: `admin@nexus.com`, Icon: MailIcon, editable: false, setter: () => {} },
              { label: `手机号码`, value: phone, Icon: PhoneIcon, editable: true, setter: setPhone },
              { label: `职位角色`, value: `系统管理员`, Icon: BriefcaseIcon, editable: false, setter: () => {} },
              { label: `所属部门`, value: `信息技术部`, Icon: BuildingIcon, editable: false, setter: () => {} },
              { label: `入职日期`, value: `2020-03-15`, Icon: CalendarIcon, editable: false, setter: () => {} },
              { label: `最后登录`, value: `2024-12-20 09:32`, Icon: ClockIcon, editable: false, setter: () => {} },
            ].map(({ label, value, Icon, editable, setter }) => (
              <div key={label} className="flex-1 min-w-56">
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  <Icon size={12} />{label}
                </label>
                {editing && editable ? (
                  <input
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg text-foreground outline-none"
                    style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
                  />
                ) : (
                  <div className="text-sm text-foreground px-3 py-2 rounded-lg"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {value}
                  </div>
                )}
              </div>
            ))}
            <div className="w-full">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>个人简介</label>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-lg text-foreground outline-none resize-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
                />
              ) : (
                <div className="text-sm text-foreground px-3 py-2 rounded-lg"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  {bio}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ display: activeTab === 'security' ? 'block' : 'none' }}>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <KeyIcon size={16} style={{ color: 'var(--primary)' }} />修改密码
          </h3>
          <div className="flex flex-col gap-4 max-w-md">
            {[
              { label: `当前密码`, value: oldPwd, setter: setOldPwd },
              { label: `新密码`, value: newPwd, setter: setNewPwd },
              { label: `确认新密码`, value: confirmPwd, setter: setConfirmPwd },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg text-foreground outline-none"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
                  placeholder={`请输入${label}`}
                />
              </div>
            ))}
            <button onClick={handleChangePwd} className="liquid-btn px-6 py-2.5 text-sm w-fit">
              确认修改密码
            </button>
          </div>

          <div className="mt-8 h-px" style={{ background: 'var(--border)' }} />
          <h3 className="text-base font-semibold text-foreground mt-6 mb-4 flex items-center gap-2">
            <ShieldIcon size={16} style={{ color: 'var(--color-neon-green)' }} />安全状态
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { label: `双因素认证`, status: `已启用`, color: 'var(--color-neon-green)', desc: `使用 TOTP 验证器应用` },
              { label: `登录通知`, status: `已启用`, color: 'var(--color-neon-green)', desc: `异地登录时发送邮件提醒` },
              { label: `会话超时`, status: `30分钟`, color: 'var(--primary)', desc: `无操作自动锁屏` },
              { label: `IP 白名单`, status: `未配置`, color: 'var(--color-neon-yellow)', desc: `建议配置可信 IP 范围` },
            ].map(({ label, status, color, desc }) => (
              <div key={label} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={{ display: activeTab === 'activity' ? 'block' : 'none' }}>
          <h3 className="text-base font-semibold text-foreground mb-4">近期操作记录</h3>
          <div className="flex flex-col gap-0">
            {recentActivity.map(({ action, time, color }, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
                  <div className="w-px flex-1 mt-1" style={{ background: idx < recentActivity.length - 1 ? 'var(--border)' : 'transparent', minHeight: '28px' }} />
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm text-foreground">{action}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
