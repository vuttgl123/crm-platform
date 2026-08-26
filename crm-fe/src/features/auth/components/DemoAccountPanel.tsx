import React, { useState } from 'react';
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
    <div className="pt-4 border-t border-[#E7E5E4] text-left">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-[#1C1917]">
              {t('auth.gateway.demo.title')}
            </span>
            <span className="text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-[4px] border border-[#FDE68A] uppercase font-mono">
              {t('auth.gateway.demo.mockBadge')}
            </span>
          </div>

          <CollapsibleTrigger
            disabled={disabled}
            aria-label={t('auth.gateway.demo.toggle')}
            className="inline-flex items-center justify-center p-1.5 rounded-[4px] hover:bg-[#FAFAF9] text-[#78716C] transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#1D4ED8]' : ''
              }`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </div>

        <p className="text-[12px] text-[#78716C] mt-1 font-normal">
          {t('auth.gateway.demo.description')}
        </p>

        <CollapsibleContent className="mt-3 space-y-1.5">
          {demoAccountOptions.map((opt) => (
            <button
              key={opt.roleCode}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.credentials)}
              className="w-full p-2.5 rounded-[6px] border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/60 transition-all text-left flex items-center justify-between text-[12px] disabled:opacity-50 group"
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[#1C1917] group-hover:text-[#1D4ED8] transition-colors block">
                  {t(opt.labelKey)}
                </span>
                <span className="text-[#78716C] font-mono truncate block text-[11px] mt-0.5">
                  {opt.credentials.email}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-[#1D4ED8] shrink-0 ml-2 bg-white px-2 py-0.5 rounded-[4px] border border-[#BFDBFE] shadow-2xs">
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
