import { useRef, useEffect, useCallback } from 'react';

export default function ParticleCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);

  const getThemeColor = useCallback(() => {
    const root = document.documentElement;
    if (root.classList.contains('night')) {
      return { dot: 'rgba(168, 85, 247, 0.4)', line: 'rgba(168, 85, 247, 0.08)' };
    }
    if (root.classList.contains('dark')) {
      return { dot: 'rgba(139, 92, 246, 0.35)', line: 'rgba(139, 92, 246, 0.06)' };
    }
    return { dot: 'rgba(99, 102, 241, 0.25)', line: 'rgba(99, 102, 241, 0.05)' };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connectionDistance = 120;
    const mouseRadius = 150;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(60, Math.max(18, Math.floor((width * height) / 26000)));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const colors = getThemeColor();
      const mouse = mouseRef.current;

      for (let index = 0; index < particlesRef.current.length; index += 1) {
        const particle = particlesRef.current[index];
        if (!reducedMotion) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseRadius && distance > 0) {
            const force = ((mouseRadius - distance) / mouseRadius) * 0.02;
            particle.vx -= (dx / distance) * force;
            particle.vy -= (dy / distance) * force;
          }
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.999;
          particle.vy *= 0.999;
          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;
          if (particle.y < -10) particle.y = height + 10;
          if (particle.y > height + 10) particle.y = -10;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = colors.dot;
        context.fill();

        for (let nextIndex = index + 1; nextIndex < particlesRef.current.length; nextIndex += 1) {
          const nextParticle = particlesRef.current[nextIndex];
          const dx = particle.x - nextParticle.x;
          const dy = particle.y - nextParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(nextParticle.x, nextParticle.y);
            context.strokeStyle = colors.line.replace(/[\d.]+\)$/, `${opacity * 0.15})`);
            context.lineWidth = 0.6;
            context.stroke();
          }
        }
      }

      if (!reducedMotion) animationRef.current = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const handlePointerLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    draw();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(parent);
    if (!resizeObserver) window.addEventListener('resize', resize);
    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      parent.removeEventListener('pointermove', handlePointerMove);
      parent.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [getThemeColor]);

  return <canvas ref={canvasRef} className={`particle-canvas ${className}`} aria-hidden="true" />;
}
