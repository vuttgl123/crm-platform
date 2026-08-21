import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  describedBy?: string;
  helperText?: string;
  registration: UseFormRegisterReturn;
}

export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  error,
  describedBy,
  helperText,
  registration,
}: PasswordFieldProps): JSX.Element {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const computedDescribedBy = error
    ? errorId
    : describedBy || (helperText ? helpId : undefined);

  return (
    <div className="space-y-1.5 text-left">
      <Label htmlFor={id} className="text-xs font-semibold text-[var(--auth-ink)]">
        {label}
      </Label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={computedDescribedBy}
          className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pr-11 text-sm text-[var(--auth-ink)] placeholder:text-slate-400 focus-visible:border-[var(--auth-blue)] ${
            error ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-[var(--auth-line)]'
          }`}
          {...registration}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="auth-icon-button auth-interactive absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--auth-ink)]"
          aria-label={
            visible
              ? t('auth.gateway.password.hide')
              : t('auth.gateway.password.show')
          }
        >
          {visible ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-rose-600 mt-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helpId} className="text-xs text-[var(--auth-muted)] mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default PasswordField;
