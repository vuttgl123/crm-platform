import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ShieldCheck } from 'lucide-react';
import { authBrandCapabilityKeys } from '../content/authContent';

export interface AuthBrandPanelProps {
  compact?: boolean;
}

/**
 * The gateway's dark region, matching how the landing page reserves
 * .editorial-dark-region for a few designated blocks. Every colour here is an
 * on-dark value: the --auth-ink / --auth-muted scale is for light surfaces and
 * would be invisible against this panel.
 */
export function AuthBrandPanel({
  compact = false,
}: AuthBrandPanelProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <aside className="auth-brand-panel">
      <div className="space-y-7">
        {/* Brand header */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5"
          aria-label="VUM CRM"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--ed-inverse)] text-[var(--ed-ink)] transition-colors group-hover:bg-[var(--ed-accent-border)]">
            <span
              className="text-lg font-extrabold tracking-tight"
              translate="no"
            >
              V
            </span>
          </div>
          <div className="flex flex-col">
            <span
              className="text-lg font-extrabold leading-none tracking-tight text-[var(--ed-inverse)]"
              translate="no"
            >
              VUM CRM
            </span>
            <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Narrative */}
        <div className="max-w-[28rem] space-y-3">
          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ed-accent-border)]">
            {t('auth.gateway.brand.descriptor')}
          </span>
          <h2 className="auth-display text-2xl font-extrabold leading-tight text-[var(--ed-inverse)] sm:text-3xl">
            {t('auth.gateway.brand.statement')}
          </h2>
        </div>
      </div>

      {/* Capability highlights */}
      {!compact && (
        <div className="auth-brand-capabilities space-y-6 pt-8">
          <ul
            className="space-y-3.5"
            aria-label={t('auth.gateway.brand.capabilitiesLabel')}
          >
            {authBrandCapabilityKeys.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 text-sm font-medium text-white/85"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[var(--ed-accent-border)]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </div>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs font-medium text-white/55">
            <ShieldCheck
              className="h-4 w-4 text-[var(--ed-accent-border)]"
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
