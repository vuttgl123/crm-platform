import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import {
  AuthErrorCode,
  getAuthErrorMessageKey,
} from '../utils/authErrorMessages';

export interface AuthFormErrorProps {
  errorCode?: AuthErrorCode;
  fallbackMessageKey: string;
  /**
   * Interpolation values for the resolved message. ACCOUNT_LOCKED is the only
   * code that carries data, and it needs the unlock time formatted here in the
   * browser, where the viewer's timezone and language are known.
   */
  messageValues?: Record<string, string | number>;
  /** Overrides the key resolved from errorCode, for parameterised variants. */
  messageKeyOverride?: string;
}

export function AuthFormError({
  errorCode,
  fallbackMessageKey,
  messageValues,
  messageKeyOverride,
}: AuthFormErrorProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!errorCode) return null;

  const translationKey =
    messageKeyOverride ?? getAuthErrorMessageKey(errorCode, fallbackMessageKey);

  return (
    <div className="mb-5 p-3.5 rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] flex items-start gap-2.5 text-[13px] text-left">
      <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="font-medium leading-relaxed flex-1">
        {t(translationKey, messageValues)}
      </div>
    </div>
  );
}

export default AuthFormError;
