import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import type { Language } from '@/lib/translations';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="w-4 h-4 text-stone-500" />
      <div className="flex items-center gap-0.5 rounded-lg border border-stone-300 overflow-hidden">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code as Language)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
              lang === l.code
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
            title={l.label}
          >
            {l.nativeLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
