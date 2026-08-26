import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export type SectionTone = 'canvas' | 'surface' | 'dark' | 'mesh';
export type SectionSize = 'strip' | 'default' | 'tall';

const toneClass: Record<SectionTone, string> = {
  canvas: 'lp-tone-canvas',
  surface: 'lp-tone-surface',
  dark: 'lp-tone-dark',
  mesh: 'lp-tone-mesh',
};

const sizeClass: Record<SectionSize, string> = {
  strip: 'lp-size-strip',
  default: 'lp-size-default',
  tall: 'lp-size-tall',
};

export interface LandingSectionProps
  extends ComponentPropsWithoutRef<'section'> {
  as?: 'section' | 'div';
  contained?: boolean;
  /** Background treatment. Omit to inherit whatever the parent provides. */
  tone?: SectionTone;
  /** Vertical rhythm step. Omit for the default padding. */
  size?: SectionSize;
}

export function LandingSection({
  as = 'section',
  contained = true,
  tone,
  size,
  className,
  children,
  ...props
}: LandingSectionProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component
      className={cn(
        'landing-section',
        tone && toneClass[tone],
        size && sizeClass[size],
        className
      )}
      {...props}
    >
      {contained ? <div className="landing-container">{children}</div> : children}
    </Component>
  );
}

export default LandingSection;
