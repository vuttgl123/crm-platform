import { useTranslation } from 'react-i18next';

export interface AuthPageHeaderProps {
  titleKey: string;
  descriptionKey: string;
  /** Interpolation values for the description, e.g. { email }. */
  descriptionValues?: Record<string, string | number>;
}

export function AuthPageHeader({
  titleKey,
  descriptionKey,
  descriptionValues,
}: AuthPageHeaderProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5 mb-6 text-left">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--auth-ink)] auth-display leading-tight">
        {t(titleKey)}
      </h1>
      <p className="text-sm text-[var(--auth-muted)] leading-relaxed font-normal">
        {t(descriptionKey, descriptionValues)}
      </p>
    </div>
  );
}

export default AuthPageHeader;
