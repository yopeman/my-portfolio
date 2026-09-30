import { useState, useEffect, useCallback } from 'react';

/**
 * Track mouse position for parallax and magnetic effects.
 * Returns normalized values (-1 to 1) relative to an optional element ref.
 *
 * @param {React.Ref} elementRef - Optional ref to calculate position relative to
 * @returns {{ x: number, y: number, normalizedX: number, normalizedY: number }}
 */
export function useMousePosition(elementRef = null) {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const handleMouseMove = useCallback((e) => {
    if (elementRef?.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({
        x,
        y,
        normalizedX: (x / rect.width) * 2 - 1,
        normalizedY: (y / rect.height) * 2 - 1,
      });
    } else {
      setPosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
        normalizedY: (e.clientY / window.innerHeight) * 2 - 1,
      });
    }
  }, [elementRef]);

  useEffect(() => {
    const target = elementRef?.current || window;
    target.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => target.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, elementRef]);

  return position;
}

export default useMousePosition;
