import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface LandingSectionProps
  extends ComponentPropsWithoutRef<'section'> {
  as?: 'section' | 'div';
  contained?: boolean;
}

export function LandingSection({
  as = 'section',
  contained = true,
  className,
  children,
  ...props
}: LandingSectionProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component className={cn('landing-section', className)} {...props}>
      {contained ? <div className="landing-container">{children}</div> : children}
    </Component>
  );
}

export default LandingSection;
