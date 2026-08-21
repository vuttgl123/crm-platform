import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, UserCheck } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { LoginCredentials } from '@/types/auth';
import { demoAccountOptions } from '../content/authContent';

export interface DemoAccountPanelProps {
  onSelect: (credentials: Required<LoginCredentials>) => void;
  disabled?: boolean;
}

export function DemoAccountPanel({
  onSelect,
  disabled = false,
}: DemoAccountPanelProps): JSX.Element {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-4 border-t border-[#DCE5F0] text-left">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#085AC0]" aria-hidden="true" />
            <span className="text-xs font-bold text-[#07182B]">
              {t('auth.gateway.demo.title')}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              {t('auth.gateway.demo.mockBadge')}
            </span>
          </div>

          <CollapsibleTrigger
            disabled={disabled}
            aria-label={t('auth.gateway.demo.toggle')}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-transform"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </div>

        <p className="text-xs text-slate-500 mt-1 font-normal">
          {t('auth.gateway.demo.description')}
        </p>

        <CollapsibleContent className="mt-3 space-y-1.5">
          {demoAccountOptions.map((opt) => (
            <button
              key={opt.roleCode}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.credentials)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left flex items-center justify-between text-xs disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-[#07182B] block">
                  {t(opt.labelKey)}
                </span>
                <span className="text-slate-500 truncate block text-[11px]">
                  {opt.credentials.email}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#085AC0] shrink-0 ml-2">
                1-Click
              </span>
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default DemoAccountPanel;
