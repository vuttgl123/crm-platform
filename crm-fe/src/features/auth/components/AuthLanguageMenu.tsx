import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AuthLanguageMenu(): JSX.Element {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage === 'en' ? 'en' : 'vi';

  const handleLanguageChange = (value: string) => {
    if (value === 'vi' || value === 'en') {
      i18n.changeLanguage(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#07182B] shadow-2xs hover:bg-slate-50 transition-colors focus-visible:outline-[#085AC0]"
        aria-label={t('auth.gateway.language.label')}
      >
        <Globe className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <span>{currentLang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={currentLang} onValueChange={handleLanguageChange}>
          <DropdownMenuRadioItem value="vi">
            {t('auth.gateway.language.vietnamese')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            {t('auth.gateway.language.english')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
