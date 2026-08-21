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
}

export function AuthFormError({
  errorCode,
  fallbackMessageKey,
}: AuthFormErrorProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!errorCode) return null;

  const translationKey = getAuthErrorMessageKey(errorCode, fallbackMessageKey);

  return (
    <Alert variant="destructive" className="mb-4 text-left border-rose-200 bg-rose-50/80 text-rose-900">
      <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
      <AlertDescription className="text-xs font-medium leading-relaxed">
        {t(translationKey)}
      </AlertDescription>
    </Alert>
  );
}

export default AuthFormError;
