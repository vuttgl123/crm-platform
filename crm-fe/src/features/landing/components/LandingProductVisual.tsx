import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LandingProductAsset } from '../content/homeProductEvidence';

export interface LandingProductVisualProps {
  asset: LandingProductAsset;
  priority?: boolean;
  className?: string;
}

export function LandingProductVisual({
  asset,
  priority = false,
  className,
}: LandingProductVisualProps): ReactElement {
  const { t } = useTranslation();

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[20px] border border-[var(--landing-line)] bg-[var(--landing-surface)] shadow-[0_24px_70px_rgba(7,24,43,0.12)]">
        <picture>
          {asset.mobileSrc ? (
            <source media="(max-width: 767px)" srcSet={asset.mobileSrc} />
          ) : null}
          <img
            src={asset.src}
            width={asset.width}
            height={asset.height}
            alt={t(asset.altKey)}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </div>
      <figcaption className="mt-3 text-xs text-[var(--landing-muted)]">
        {t(asset.captionKey)}
      </figcaption>
    </figure>
  );
}

export default LandingProductVisual;
