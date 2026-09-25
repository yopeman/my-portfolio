import { useEffect, useState } from 'react';

export function useAsyncResource(loader, deps, fallback) {
  const [state, setState] = useState(() => ({ data: fallback, loading: true, error: null }));

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState((s) => ({ data: s.data ?? fallback, loading: false, error: err }));
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return state;
}