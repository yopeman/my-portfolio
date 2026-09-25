import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Reusable wrapper that applies scroll-reveal animations to its children.
 *
 * @param {Object}  props
 * @param {'up'|'down'|'left'|'right'|'scale'} props.direction - Animation direction
 * @param {number}  props.delay    - Delay in ms before animation starts
 * @param {number}  props.threshold - Intersection threshold
 * @param {boolean} props.stagger  - If true, uses stagger-children class
 * @param {string}  props.className - Additional CSS classes
 * @param {React.ReactNode} props.children
 */
export default function AnimatedSection({
  direction = 'up',
  delay = 0,
  threshold = 0.15,
  stagger = false,
  className = '',
  as: Tag = 'div',
  children,
  ...rest
}) {
  const { ref, isRevealed } = useScrollReveal({ threshold });

  const directionClass = {
    up: 'reveal',
    down: 'reveal-down',
    left: 'reveal-left',
    right: 'reveal-right',
    scale: 'reveal-scale',
  }[direction] || 'reveal';

  const revealedClass = isRevealed ? 'revealed' : '';
  const staggerClass = stagger ? `stagger-children${isRevealed ? ' revealed' : ''}` : '';

  return (
    <Tag
      ref={ref}
      className={`${stagger ? staggerClass : `${directionClass} ${revealedClass}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
