/* global MediaQueryListEvent */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when the user has asked the operating system to reduce motion.
 *
 * This has to exist in JavaScript, not only in CSS. A media query can
 * shorten a transition, but it cannot change an initial opacity of 0, and it
 * cannot stop a requestAnimationFrame loop.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
