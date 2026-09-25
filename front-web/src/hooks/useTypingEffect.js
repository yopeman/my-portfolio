import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTypingEffect(words = [], options = {}, legacyPauseDuration) {
  const normalizedOptions = typeof options === 'number'
    ? { typingSpeed: options, pauseDuration: legacyPauseDuration }
    : options;
  const {
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseDuration = 2000,
  } = normalizedOptions;
  const reducedMotion = prefersReducedMotion();
  const wordsRef = useRef(words);
  const wordKey = words.join('\u0000');
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState(() => reducedMotion ? (words[0] || '') : '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    if (reducedMotion || !wordsRef.current.length) return undefined;

    const currentWord = wordsRef.current[wordIndex % wordsRef.current.length] || '';
    const delay = isPaused
      ? pauseDuration
      : isDeleting
        ? deletingSpeed
        : typingSpeed;
    const timeout = window.setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (!isDeleting) {
        const nextText = currentWord.slice(0, text.length + 1);
        setText(nextText);
        if (nextText.length === currentWord.length) setIsPaused(true);
        return;
      }

      const nextText = currentWord.slice(0, Math.max(0, text.length - 1));
      setText(nextText);
      if (nextText.length === 0) {
        setIsDeleting(false);
        setIsPaused(false);
        setWordIndex((current) => (current + 1) % wordsRef.current.length);
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deletingSpeed, isDeleting, isPaused, pauseDuration, reducedMotion, text.length, typingSpeed, wordIndex, wordKey]);

  return { text, isTyping: !reducedMotion && words.length > 0 && !isPaused, wordIndex };
}

export default useTypingEffect;
