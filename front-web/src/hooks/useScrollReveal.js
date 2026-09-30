import { useCallback, useEffect, useState } from 'react';

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) {
  const [element, setElement] = useState(null);
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isRevealed, setIsRevealed] = useState(reducedMotion);

  // A callback ref (rather than useRef) so the observer attaches whenever the
  // element actually mounts. Components that render conditionally would
  // otherwise observe nothing, because the effect ran before the node existed.
  const ref = useCallback((node) => setElement(node), []);

  useEffect(() => {
    if (!element || reducedMotion) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, once, reducedMotion, rootMargin, threshold]);

  return { ref, isRevealed };
}

export function useStaggerReveal(options = {}) {
  const { ref, isRevealed } = useScrollReveal(options);
  return { ref, isRevealed, className: `stagger-children${isRevealed ? ' revealed' : ''}` };
}

export default useScrollReveal;
