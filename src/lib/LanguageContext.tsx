import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language } from './translations';
import { translate, translateFmt } from './translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  tf: (key: string, params: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => translate('en', key),
  tf: (key: string, params: Record<string, string>) => translateFmt('en', key, params),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const t = (key: string) => translate(lang, key);
  const tf = (key: string, params: Record<string, string>) => translateFmt(lang, key, params);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
