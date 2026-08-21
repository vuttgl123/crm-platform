import { useTranslation } from 'react-i18next';

export interface AuthPageHeaderProps {
  titleKey: string;
  descriptionKey: string;
}

export function AuthPageHeader({
  titleKey,
  descriptionKey,
}: AuthPageHeaderProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5 mb-6 text-left">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#07182B] auth-display leading-tight">
        {t(titleKey)}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed font-normal">
        {t(descriptionKey)}
      </p>
    </div>
  );
}
