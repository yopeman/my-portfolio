import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

const INTERVAL_TIME = 10000;

export default function SlideImage({ images = [], className = '' }) {
  const [active, setActive] = useState(0);
  const selectedImages = images.slice(0, 2);
  const imageCount = selectedImages.length;

  useEffect(() => {
    if (imageCount < 2) return undefined;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % imageCount);
    }, INTERVAL_TIME);
    return () => window.clearInterval(interval);
  }, [imageCount]);

  const currentImage = imageCount ? active % imageCount : 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl group ${className}`}>
      {imageCount > 0 ? (
        <>
          {selectedImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden={index !== currentImage}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImage ? 'opacity-100 animate-ken-burns' : 'opacity-0'}`}
              loading="lazy"
            />
          ))}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
          {imageCount > 1 && (
            <div className="absolute inset-x-4 bottom-3 z-10 flex items-center gap-2">
              {selectedImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActive(index)}
                  className="group/progress h-1.5 flex-1 overflow-hidden rounded-full bg-black/20 dark:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <span
                    className={`block h-full origin-left rounded-full bg-indigo-400 dark:bg-violet-400 night:bg-purple-400 ${index === currentImage ? 'slide-progress' : 'opacity-40'}`}
                    style={index === currentImage ? { animationDuration: `${INTERVAL_TIME}ms` } : undefined}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-400 dark:from-indigo-950/40 dark:to-purple-950/40">
          <ImageOff className="h-10 w-10" />
          <span className="text-sm font-semibold">No images available</span>
        </div>
      )}
    </div>
  );
}
