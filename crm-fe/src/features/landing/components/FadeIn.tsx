import React, { useRef, useState, useEffect, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Stagger step: 1 (60ms), 2 (120ms), 3 (180ms), 4 (240ms), 5 (300ms) */
  stagger?: 1 | 2 | 3 | 4 | 5;
  as?: ElementType;
  className?: string;
}

/**
 * Enterprise Editorial Fade-In:
 * Single view animation: opacity 0->1, translateY 12px->0, 400ms ease-out.
 * Runs exactly once. Strictly disabled under prefers-reduced-motion.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  stagger,
  as: Component = 'div',
  className,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Immediate viewport check for above-the-fold elements
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '40px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const staggerClass = stagger ? `stagger-${stagger}` : '';

  return (
    <Component
      ref={ref}
      className={cn('editorial-fade', isVisible && 'is-visible', staggerClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default FadeIn;
