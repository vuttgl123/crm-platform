/* global IntersectionObserver, Element */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface UseInViewOnceOptions {
  threshold?: number;
  rootMargin?: string;
  /** Skip observation entirely and report in view from the first render. */
  disabled?: boolean;
}

/**
 * Reports true the first time the element scrolls into view, then stops
 * observing. Extracted from the pattern already proven in AnimatedCounter.
 */
export function useInViewOnce<T extends Element>(
  options: UseInViewOnceOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.05, rootMargin = '80px', disabled = false } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Immediate viewport check on mount to prevent any delay/invisible state
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, disabled]);

  return [ref, inView];
}

export default useInViewOnce;
