import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <Alert variant="destructive" className="mb-4 text-left border-rose-200 bg-rose-50/80 text-rose-900">
      <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
      <AlertDescription className="text-xs font-medium leading-relaxed">
        {t(translationKey, messageValues)}
      </AlertDescription>
    </Alert>
  );
}

export default AuthFormError;
