import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SlideImage({ images = [], className = '' }) {
  const [active, setActive] = useState(0);
  const selectedImages = images.slice(0, 2);

  useEffect(() => {
    if (selectedImages.length < 2) return undefined;
    const id = setInterval(() => setActive((current) => (current + 1) % selectedImages.length), 10_000);
    return () => clearInterval(id);
  }, [selectedImages.length]);

  const currentImage = selectedImages.length ? active % selectedImages.length : 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {selectedImages.length > 0 ? (
        selectedImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-5000"
            style={{ opacity: index === currentImage ? 1 : 0 }}
            loading="lazy"
          />
        ))
      ) : (
        <div className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-400 dark:from-indigo-950/40 dark:to-purple-950/40">
          <ImageOff className="h-10 w-10" />
          <span className="text-sm font-semibold">No images available</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
    </div>
  );
}
