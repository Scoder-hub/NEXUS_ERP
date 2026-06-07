import React, { createContext, useContext, useState } from 'react';
import { GlobeIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import type { LangCode, Language } from '../types';
const LANGUAGES: Language[] = [{
  code: 'zh-CN',
  label: `简体中文`,
  flag: `🇨🇳`,
  nativeLabel: `简体中文`
}, {
  code: 'en-US',
  label: `English (US)`,
  flag: `🇺🇸`,
  nativeLabel: `English`
}, {
  code: 'ja-JP',
  label: `日本語`,
  flag: `🇯🇵`,
  nativeLabel: `日本語`
}, {
  code: 'ko-KR',
  label: `한국어`,
  flag: `🇰🇷`,
  nativeLabel: `한국어`
}, {
  code: 'de-DE',
  label: `Deutsch`,
  flag: `🇩🇪`,
  nativeLabel: `Deutsch`
}];
interface LangContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  languages: Language[];
  currentLang: Language;
}
export const LangContext = createContext<LangContextType>({
  lang: 'zh-CN',
  setLang: () => {},
  languages: LANGUAGES,
  currentLang: LANGUAGES[0]
});
export const LangProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [lang, setLang] = useState<LangCode>('zh-CN');
  const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  return <LangContext.Provider value={{
    lang,
    setLang,
    languages: LANGUAGES,
    currentLang
  }}>
      {children}
    </LangContext.Provider>;
};
export const useLang = () => useContext(LangContext);
interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'compact';
}
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact'
}) => {
  const {
    lang,
    setLang,
    languages,
    currentLang
  } = useLang();
  const [open, setOpen] = useState(false);
  return <div data-cmp="LanguageSwitcher" className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all" style={{
      background: open ? 'var(--muted)' : 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--muted-foreground)'
    }}>
        <span className="text-sm">{currentLang.flag}</span>
        {variant === 'dropdown' && <span className="text-xs font-medium text-foreground">{currentLang.nativeLabel}</span>}
        <GlobeIcon size={13} />
        <ChevronDownIcon size={11} style={{
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s'
      }} />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden transition-all duration-200" style={{
      background: 'var(--theme-card-bg)',
      border: '1px solid var(--border)',
      boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
      minWidth: 180,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'all' : 'none',
      transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
      zIndex: 9999
    }}>
        <div className="px-3 py-2" style={{
        borderBottom: '1px solid var(--border)'
      }}>
          <span className="text-xs font-semibold" style={{
          color: 'var(--muted-foreground)'
        }}>切换语言</span>
        </div>
        {languages.map(l => <button key={l.code} onClick={() => {
        setLang(l.code);
        setOpen(false);
      }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all" style={{
        background: lang === l.code ? 'rgba(99,102,241,0.08)' : 'transparent'
      }}>
            <span className="text-base">{l.flag}</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">{l.nativeLabel}</div>
              <div className="text-xs" style={{
            color: 'var(--muted-foreground)'
          }}>{l.label}</div>
            </div>
            <div style={{
          visibility: lang === l.code ? 'visible' : 'hidden'
        }}>
              <CheckIcon size={12} style={{
            color: 'var(--primary)'
          }} />
            </div>
          </button>)}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0" style={{
      display: open ? 'block' : 'none',
      zIndex: 9998
    }} onClick={() => setOpen(false)} />
    </div>;
};
export default LanguageSwitcher;