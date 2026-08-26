import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MockWindow, mockScreens } from './product-ui';
import type { LandingProductScreen } from '../content/homeProductEvidence';

export interface LandingProductVisualProps {
  asset: LandingProductScreen;
  /**
   * Retained for call-site compatibility. No longer meaningful now that the
   * visual is rendered rather than fetched.
   */
  priority?: boolean;
  className?: string;
}

export function LandingProductVisual({
  asset,
  className,
}: LandingProductVisualProps): ReactElement {
  const { t } = useTranslation();
  const Screen = mockScreens[asset.screen];

  return (
    <figure className={className}>
      <MockWindow>
        <Screen />
      </MockWindow>

      {/* The mockup itself is aria-hidden, so this carries the accessible
          description the old <img alt> used to provide. */}
      <span className="sr-only">{t(asset.altKey)}</span>

      <figcaption className="lp-caption mt-3">{t(asset.captionKey)}</figcaption>
    </figure>
  );
}

export default LandingProductVisual;
