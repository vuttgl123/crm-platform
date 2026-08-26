import type { ElementType, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds. Ignored when reduced motion is requested. */
  delay?: number;
  as?: ElementType;
  className?: string;
  variant?: 'fade-up' | 'zoom-in';
}

/**
 * Fades and lifts its children into place the first time they scroll into
 * view.
 */
export function Reveal({
  children,
  delay = 0,
  as: Component = 'div',
  className,
  variant = 'fade-up',
}: RevealProps): ReactElement {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ disabled: reduced });

  const baseClass = variant === 'zoom-in' ? 'lp-reveal-zoom' : 'lp-reveal';

  return (
    <Component
      ref={ref}
      className={cn(baseClass, inView && 'lp-reveal-in', className)}
      style={
        !reduced && delay > 0 ? { transitionDelay: `${delay}ms` } : undefined
      }
    >
      {children}
    </Component>
  );
}

export default Reveal;

