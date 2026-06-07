import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ZapIcon,
  DeleteIcon,
  UnlockIcon,
  Loader2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

interface LockScreenProps {
  isLocked?: boolean;
  userName?: string;
  userAvatar?: string;
  onUnlock?: (pin?: string, password?: string) => void;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const PIN_LENGTH = 6;

const LockScreen: React.FC<LockScreenProps> = ({
  isLocked = false,
  userName = `张磊`,
  userAvatar = `张`,
  onUnlock = () => {},
}) => {
  const [mode, setMode] = useState<'pin' | 'password'>('pin');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [time, setTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLocked && mode === 'password') {
      inputRef.current?.focus();
    }
  }, [isLocked, mode]);

  const attemptUnlockPin = useCallback((p: string) => {
    setLoading(true);
    onUnlock(p, undefined);
    setTimeout(() => {
      setLoading(false);
      setPin('');
    }, 600);
  }, [onUnlock]);

  const attemptUnlockPassword = useCallback(() => {
    if (!password) return;
    setLoading(true);
    onUnlock(undefined, password);
    setTimeout(() => {
      setLoading(false);
      setPassword('');
    }, 800);
  }, [password, onUnlock]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') attemptUnlockPassword();
  };

  const handlePinInput = (digit: string) => {
    if (loading) return;
    setPin(prev => {
      const next = prev + digit;
      if (next.length === PIN_LENGTH) {
        // 使用 setTimeout 避免在 setState 回调中直接触发状态更新
        setTimeout(() => attemptUnlockPin(next), 0);
      }
      return next;
    });
  };

  const handlePinDelete = () => {
    setPin(p => p.slice(0, -1));
  };

  const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div
      data-cmp="LockScreen"
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: `var(--background)`,
        zIndex: 8888,
        transition: 'opacity 0.4s ease',
        opacity: isLocked ? 1 : 0,
        pointerEvents: isLocked ? 'all' : 'none',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Background orbs */}
      <div className="aurora-orb" style={{ width: 500, height: 500, background: 'var(--color-orb-brand-sm)', top: -100, left: -100 }} />
      <div className="aurora-orb" style={{ width: 400, height: 400, background: 'var(--color-orb-cyan-sm)', bottom: -50, right: -50 }} />

      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-brand-gradient)' }}>
          <ZapIcon size={13} className="text-white" />
        </div>
        <span className="text-sm font-black tracking-wider text-foreground">NEXUS ERP</span>
      </div>

      {/* Clock */}
      <div className="text-center mb-10">
        <div className="text-6xl font-black text-foreground mb-2"
          style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>
          {timeStr}
        </div>
        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{dateStr}</div>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-3"
          style={{ background: 'var(--color-brand-gradient)', boxShadow: 'var(--color-brand-shadow-lg)' }}>
          {userAvatar}
        </div>
        <div className="text-base font-semibold text-foreground">{userName}</div>
        <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          <LockIcon size={10} />屏幕已锁定
        </div>
      </div>

      {/* Mode switch */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
        {(['pin', 'password'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setPin(''); setPassword(''); }}
            className="btn-interactive px-4 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: mode === m ? 'var(--theme-card-bg)' : 'transparent',
              color: mode === m ? 'var(--foreground)' : 'var(--muted-foreground)',
              border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            {m === 'pin' ? `PIN码解锁` : `密码解锁`}
          </button>
        ))}
      </div>

      {/* PIN mode */}
      <div style={{ display: mode === 'pin' ? 'flex' : 'none' }} className="flex-col items-center">
        {/* PIN dots */}
        <div className={`flex gap-3 mb-8 ${shake ? 'animate-pulse' : ''}`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all duration-200"
              style={{
                background: i < pin.length
                  ? 'var(--color-brand-gradient)'
                  : 'var(--border)',
                boxShadow: i < pin.length ? 'var(--color-pin-dot-shadow)' : 'none',
                transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
              }} />
          ))}
        </div>

        {/* Numpad */}
        <div className="flex flex-col gap-2" style={{ opacity: loading ? 0.5 : 1 }}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']].map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map((key, ki) => {
                if (key === '') return <div key={ki} style={{ width: 64 }} />;
                if (key === 'del') {
                  return (
                    <button key={ki} onClick={handlePinDelete}
                      disabled={loading}
                      className="icon-btn w-16 h-16 rounded-2xl flex items-center justify-center active:scale-95"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                      <DeleteIcon size={18} />
                    </button>
                  );
                }
                return (
                  <button key={ki} onClick={() => handlePinInput(key)}
                    disabled={loading}
                    className="btn-interactive w-16 h-16 rounded-2xl text-lg font-bold text-foreground active:scale-95"
                    style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--border)' }}>
                    {loading && pin.length >= PIN_LENGTH ? <Loader2Icon size={16} className="animate-spin mx-auto" style={{ color: 'var(--muted-foreground)' }} /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      {/* Password mode */}
      <div style={{ display: mode === 'password' ? 'flex' : 'none', maxWidth: 320 }} className="flex-col items-center w-full">
        <div className={`relative w-full mb-4 ${shake ? 'animate-pulse' : ''}`}
          style={{ maxWidth: 300 }}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            <LockIcon size={15} />
          </div>
          <input
            ref={inputRef}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            type={showPwd ? 'text' : 'password'}
            placeholder={`输入解锁密码`}
            className="w-full text-sm pl-9 pr-10 py-3.5 rounded-xl outline-none text-foreground text-center tracking-widest transition-all"
            style={{ background: 'var(--input)', border: '1px solid var(--border)' }}
          />
          <button onClick={() => setShowPwd(!showPwd)}
            className="icon-btn absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-foreground)' }}>
            {showPwd ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
          </button>
        </div>
        <button onClick={attemptUnlockPassword} disabled={!password || loading}
          className="liquid-btn flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm w-full"
          style={{
            background: password && !loading ? 'var(--color-brand-gradient)' : 'var(--muted)',
            color: password && !loading ? 'white' : 'var(--muted-foreground)',
            boxShadow: password && !loading ? 'var(--color-brand-shadow)' : 'none',
            maxWidth: 300,
          }}>
          {loading ? <Loader2Icon size={15} className="animate-spin" /> : <UnlockIcon size={15} />}
          {loading ? `验证中...` : `解锁`}
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
