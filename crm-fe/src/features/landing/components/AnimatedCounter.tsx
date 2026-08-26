import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface AnimatedCounterProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  decimals = 0,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps): ReactElement {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLSpanElement>({ disabled: reduced });
  const [count, setCount] = useState(reduced ? end : 0);

  useEffect(() => {
    if (!inView) return;

    // A CSS media query cannot reach requestAnimationFrame, so the
    // reduced-motion case has to short-circuit here.
    if (reduced) {
      setCount(end);
      return;
    }

    let frame = 0;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(eased * end);

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    frame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduced, end, duration]);

  const formattedValue = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={`tabular-nums inline-block ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
