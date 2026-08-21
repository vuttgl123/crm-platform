import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { authBrandCapabilityKeys } from '../content/authContent';

export interface AuthBrandPanelProps {
  compact?: boolean;
}

export function AuthBrandPanel({ compact = false }: AuthBrandPanelProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <aside className="auth-brand-panel">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group"
          aria-label="VUM CRM"
        >
          <div className="w-9 h-9 rounded-xl bg-[#07182B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#085AC0] transition-colors">
            <span className="font-extrabold text-lg tracking-tight" translate="no">
              V
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-[#07182B] leading-none" translate="no">
              VUM CRM
            </span>
            <span className="text-[10px] font-bold text-[#52647A] tracking-wider uppercase mt-0.5">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Narrative */}
        <div className="space-y-2 max-w-[28rem]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#085AC0]">
            {t('auth.gateway.brand.descriptor')}
          </span>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#07182B] auth-display leading-tight">
            {t('auth.gateway.brand.statement')}
          </p>
        </div>
      </div>

      {/* Verified Capability Highlights */}
      {!compact && (
        <div className="auth-brand-capabilities pt-8">
          <ul className="space-y-3" aria-label="Năng lực VUM CRM">
            {authBrandCapabilityKeys.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm font-semibold text-[#07182B]">
                <div className="w-5 h-5 rounded-full bg-blue-100/80 text-[#085AC0] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
