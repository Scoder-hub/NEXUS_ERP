import React, { useState } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  LockIcon,
  ZapIcon,
  ShieldIcon,
  ArrowRightIcon,
  GlobeIcon,
  Loader2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/auth.store';
import { loginSchema } from '../../shared/schemas/auth.schema';

type LoginFormValues = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const LoginPage: React.FC = () => {
  const login = useAuthStore((s) => s.login);
  const loginLoading = useAuthStore((s) => s.loginLoading);
  const navigate = useNavigate();

  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.username, data.password, data.rememberMe ?? false);
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败';
      toast.error(message);
    }
  };

  const features = [
    { Icon: ZapIcon, text: `智能生产调度`, color: 'var(--color-accent-dashboard)' },
    { Icon: ShieldIcon, text: `数据安全`, color: 'var(--color-accent-purchase)' },
    { Icon: GlobeIcon, text: `多语言支持`, color: 'var(--color-accent-sales)' },
  ];

  return (
    <div
      data-cmp="LoginPage"
      className="fixed inset-0 flex items-stretch"
      style={{ background: 'var(--background)', zIndex: 9999 }}
    >
      {/* Left decorative panel */}
      <div
        className="hidden md:flex flex-col justify-between p-12 flex-shrink-0"
        style={{
          width: '45%',
          background: 'var(--color-left-panel-bg)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orb decorations */}
        <div className="aurora-orb" style={{ width: 300, height: 300, background: 'var(--color-orb-brand)', top: -80, left: -80 }} />
        <div className="aurora-orb" style={{ width: 200, height: 200, background: 'var(--color-orb-cyan)', bottom: 100, right: -60 }} />
        <div className="aurora-orb" style={{ width: 150, height: 150, background: 'var(--color-orb-violet)', top: '40%', left: '40%' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-brand-gradient)', boxShadow: 'var(--color-brand-shadow)' }}>
              <ZapIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-black tracking-wider text-foreground">NEXUS ERP</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Open Source ERP Platform</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground leading-tight mb-3">
            驱动<br />
            <span style={{ background: 'var(--color-gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              数字化转型演示
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', maxWidth: 280 }}>
            集成采购、生产、销售、财务、人力资源于一体的开源 ERP 演示平台
          </p>
        </div>

        {/* Feature chips */}
        <div className="relative z-10 flex flex-col gap-3">
          {features.map(({ Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-sm text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom version */}
        <div className="relative z-10 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          NEXUS ERP Demo · Open Source
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-brand-gradient)' }}>
            <ZapIcon size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-wider text-foreground">NEXUS ERP</span>
        </div>

        <div className="w-full" style={{ maxWidth: 400 }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">欢迎</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>输入账号信息以访问演示系统</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div className="mb-4">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>用户名</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  <UserIcon size={15} />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  placeholder={`请输入用户名`}
                  className="w-full text-sm pl-9 pr-4 py-3 rounded-xl outline-none text-foreground transition-all"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
                />
              </div>
              {errors.username && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>密码</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  <LockIcon size={15} />
                </div>
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder={`请输入密码`}
                  className="w-full text-sm pl-9 pr-10 py-3 rounded-xl outline-none text-foreground transition-all"
                  style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="icon-btn absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {showPwd ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="hidden"
                />
                <div
                  className="w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all"
                  style={{ background: 'var(--input)', border: `1px solid var(--border)` }}>
                </div>
                记住登录状态
              </label>
              <button type="button" className="btn-interactive text-xs" style={{ color: 'var(--primary)' }}>忘记密码？</button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="liquid-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
              style={{
                background: loginLoading ? 'var(--muted)' : 'var(--color-brand-gradient)',
                color: loginLoading ? 'var(--muted-foreground)' : 'white',
                boxShadow: loginLoading ? 'none' : 'var(--color-brand-shadow)',
              }}>
              {loginLoading ? (
                <><Loader2Icon size={16} className="animate-spin" />验证中...</>
              ) : (
                <>登录系统<ArrowRightIcon size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
