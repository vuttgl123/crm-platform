import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ShieldCheck } from 'lucide-react';

export interface AuthBrandPanelProps {
  compact?: boolean;
}

const capabilityKeys = [
  'auth.gateway.brand.capabilities.pipeline',
  'auth.gateway.brand.capabilities.cpq',
  'auth.gateway.brand.capabilities.contracts',
  'auth.gateway.brand.capabilities.permissions',
] as const;

export function AuthBrandPanel({
  compact = false,
}: AuthBrandPanelProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <aside className="auth-brand-panel">
      <div className="space-y-8">
        {/* Brand header */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5"
          aria-label="VUM CRM"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-white text-[#1C1917] font-mono font-bold text-xs transition-colors group-hover:bg-[#BFDBFE]">
            V
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[17px] font-bold tracking-tight text-white"
              translate="no"
            >
              VUM CRM
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#A8A29E] bg-[#292524] px-2 py-0.5 rounded-[4px] border border-[#44403C]">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Narrative */}
        <div className="space-y-3.5 max-w-sm">
          <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-[#A8A29E] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#BFDBFE] inline-block shrink-0 rounded-full" />
            {t('auth.gateway.brand.descriptor')}
          </p>
          <h2 className="text-[26px] sm:text-[30px] font-bold leading-tight text-white tracking-tight">
            {t('auth.gateway.brand.statement')}
          </h2>
          <p className="text-[14px] text-[#A8A29E] leading-relaxed">
            {t('auth.gateway.brand.description')}
          </p>
        </div>
      </div>

      {/* Capability Highlights */}
      {!compact && (
        <div className="auth-brand-capabilities space-y-6 pt-6 border-t border-[#292524]">
          <ul
            className="space-y-3"
            aria-label={t('auth.gateway.brand.capabilitiesLabel')}
          >
            {capabilityKeys.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 text-[13px] font-medium text-white/90"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#292524] border border-[#44403C] text-[#BFDBFE]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </div>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 pt-2 text-[12px] font-medium text-[#A8A29E]">
            <ShieldCheck
              className="h-4 w-4 text-[#BFDBFE] shrink-0"
              aria-hidden="true"
            />
            <span>{t('auth.gateway.brand.assurance')}</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AuthBrandPanel;
