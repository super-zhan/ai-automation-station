'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import zh from './zh';
import en from './en';

export type Lang = 'zh' | 'en';
type Dict = Record<string, any>;

const dictionaries: Record<Lang, Dict> = { zh, en };

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'en' || saved === 'zh') {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const keys = key.split('.');
      let value: any = dictionaries[lang];
      for (const k of keys) {
        value = value?.[k];
      }
      if (typeof value === 'string') {
        if (vars) {
          return value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
        }
        return value;
      }
      // fallback to Chinese
      value = dictionaries['zh'];
      for (const k of keys) {
        value = value?.[k];
      }
      return (typeof value === 'string' ? value : key) as string;
    },
    [lang]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ lang: 'zh', setLang, t }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
