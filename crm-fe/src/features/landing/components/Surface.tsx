import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export type SurfaceElevation = 'flat' | 'sm' | 'md' | 'lg';
export type SurfaceTone = 'surface' | 'sunk' | 'dark-raised';

const elevationClass: Record<SurfaceElevation, string> = {
  flat: 'lp-elev-flat',
  sm: 'lp-elev-sm',
  md: 'lp-elev-md',
  lg: 'lp-elev-lg',
};

const toneClass: Record<SurfaceTone, string> = {
  surface: 'lp-surface',
  sunk: 'lp-surface-sunk',
  'dark-raised': 'lp-surface-dark-raised',
};

export interface SurfaceProps extends ComponentPropsWithoutRef<'div'> {
  as?: ElementType;
  elevation?: SurfaceElevation;
  tone?: SurfaceTone;
  /** Adds hover lift and border emphasis. */
  interactive?: boolean;
}

export function Surface({
  as = 'div',
  elevation = 'sm',
  tone = 'surface',
  interactive = false,
  className,
  children,
  ...props
}: SurfaceProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component
      className={cn(
        'lp-card',
        toneClass[tone],
        elevationClass[elevation],
        interactive && 'lp-card-interactive',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Surface;
