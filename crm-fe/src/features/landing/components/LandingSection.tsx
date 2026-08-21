import type { ReactElement, ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export interface LandingSectionProps extends ComponentProps<'section'> {
  contained?: boolean;
}

export function LandingSection({
  contained = true,
  className,
  children,
  ...props
}: LandingSectionProps): ReactElement {
  return (
    <section className={cn('landing-section', className)} {...props}>
      {contained ? <div className="landing-container">{children}</div> : children}
    </section>
  );
}

export default LandingSection;
