import { useState, useEffect } from 'react';
import { aboutMe } from '../data/portfolioData';

export default function SlideImage({ className = '' }) {
  const [active, setActive] = useState(0);
  const [images] = useState(() => {
    const all = aboutMe.images;
    // Fisher‑Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 2);
  });

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 10_000);
    return () => clearInterval(id);
  }, [images]);

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-5000"
          style={{ opacity: i === active ? 1 : 0 }}
          loading="lazy"
        />
      ))}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
    </div>
  );
}