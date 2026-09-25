import { useEffect, useRef, useState } from 'react';

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isRevealed, setIsRevealed] = useState(reducedMotion);

  useEffect(() => {
    const element = ref.current;
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
  }, [once, reducedMotion, rootMargin, threshold]);

  return { ref, isRevealed };
}

export function useStaggerReveal(options = {}) {
  const { ref, isRevealed } = useScrollReveal(options);
  return { ref, isRevealed, className: `stagger-children${isRevealed ? ' revealed' : ''}` };
}

export default useScrollReveal;
