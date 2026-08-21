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
    <div className="pt-4 border-t border-[var(--auth-line)] text-left">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--auth-blue)]" aria-hidden="true" />
            <span className="text-xs font-bold text-[var(--auth-ink)]">
              {t('auth.gateway.demo.title')}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              {t('auth.gateway.demo.mockBadge')}
            </span>
          </div>

          <CollapsibleTrigger
            disabled={disabled}
            aria-label={t('auth.gateway.demo.toggle')}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-[var(--auth-canvas)] text-[var(--auth-muted)] transition-transform"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </div>

        <p className="text-xs text-[var(--auth-muted)] mt-1 font-normal">
          {t('auth.gateway.demo.description')}
        </p>

        <CollapsibleContent className="mt-3 space-y-1.5">
          {demoAccountOptions.map((opt) => (
            <button
              key={opt.roleCode}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.credentials)}
              className="w-full p-2.5 rounded-lg border border-[var(--auth-line)] bg-white hover:border-[var(--auth-blue)] hover:bg-[var(--auth-blue-soft)] transition-colors text-left flex items-center justify-between text-xs disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-[var(--auth-ink)] block">
                  {t(opt.labelKey)}
                </span>
                <span className="text-[var(--auth-muted)] truncate block text-[11px] mt-0.5">
                  {opt.credentials.email}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[var(--auth-blue)] shrink-0 ml-2 bg-[var(--auth-blue-soft)] px-2 py-0.5 rounded">
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
