import React from 'react';
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
      <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1C1917] tracking-tight leading-tight">
        {t(titleKey)}
      </h1>
      <p className="text-[14px] text-[#57534E] leading-relaxed font-normal">
        {t(descriptionKey, descriptionValues)}
      </p>
    </div>
  );
}

export default AuthPageHeader;
