import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ShieldCheck } from 'lucide-react';
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
          <div className="w-9 h-9 rounded-xl bg-[var(--auth-ink)] flex items-center justify-center text-white shadow-xs group-hover:bg-[var(--auth-blue)] transition-colors">
            <span className="font-extrabold text-lg tracking-tight" translate="no">
              V
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-[var(--auth-ink)] leading-none" translate="no">
              VUM CRM
            </span>
            <span className="text-[10px] font-bold text-[var(--auth-muted)] tracking-wider uppercase mt-0.5">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Narrative */}
        <div className="space-y-3 max-w-[28rem]">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--auth-blue)]">
            {t('auth.gateway.brand.descriptor')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--auth-ink)] auth-display leading-tight">
            {t('auth.gateway.brand.statement')}
          </h2>
        </div>
      </div>

      {/* Verified Capability Highlights */}
      {!compact && (
        <div className="auth-brand-capabilities pt-8 space-y-6">
          <ul className="space-y-3.5" aria-label="Năng lực VUM CRM">
            {authBrandCapabilityKeys.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm font-semibold text-[var(--auth-ink)]">
                <div className="w-5 h-5 rounded-full bg-[var(--auth-blue)] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3 h-3" aria-hidden="true" />
                </div>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-[var(--auth-line)] flex items-center gap-2 text-xs font-semibold text-[var(--auth-muted)]">
            <ShieldCheck className="w-4 h-4 text-[var(--auth-blue)]" aria-hidden="true" />
            <span>Mã hóa bảo mật &amp; Quản trị dữ liệu đa cấp</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AuthBrandPanel;
