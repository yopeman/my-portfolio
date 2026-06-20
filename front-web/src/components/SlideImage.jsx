import { useState, useEffect } from 'react';

export default function SlideImage({ className = '' }) {
  const [active, setActive] = useState(0);
  const [images] = useState(() => {
    const all = [
      '/about/image1.jpg', '/about/image2.jpeg', '/about/image3.png', '/about/image4.png',
      '/about/image5.JPG', '/about/image6.JPG', '/about/image7.jpg', '/about/image8.jpg',
      '/about/image9.JPG', '/about/image10.jpg',
    ];
    // Fisher‑Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 2);
  });

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), 60_000);
    return () => clearInterval(id);
  }, [images]);

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
          loading="lazy"
        />
      ))}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
    </div>
  );
}