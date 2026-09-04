import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock } from 'lucide-react';

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
      <label htmlFor={id} className="block text-[13px] font-semibold text-[#1C1917]">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={computedDescribedBy}
          className={`flex w-full h-11 border bg-white px-3.5 pl-10 pr-11 text-[14px] text-[#1C1917] rounded-[6px] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all ${
            error ? 'border-[#FECACA] bg-[#FEF2F2]/30 focus:ring-[#B91C1C]' : 'border-[#E7E5E4]'
          }`}
          {...registration}
        />
        <Lock
          className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="w-8 h-8 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#A8A29E] hover:text-[#1C1917] transition-colors focus:outline-none"
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
        <p id={errorId} className="text-[12px] text-[#B91C1C] mt-1 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helpId} className="text-[12px] text-[#78716C] mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default PasswordField;
