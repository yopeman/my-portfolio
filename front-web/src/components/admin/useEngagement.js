import { useEffect, useState } from 'react';
import { feedbackApi } from '../../api/feedback.js';
import { reactionsApi } from '../../api/reactions.js';

const EMPTY = { like: 0, dislike: 0, love: 0, total: 0 };
const EMPTY_COUNTS = { comments: 0, replies: 0, total: 0 };

/**
 * Batched comment and reaction totals for a list of records, keyed by record id.
 * Two requests cover an entire admin table rather than one per row.
 */
export function useEngagement(parentEntity, ids) {
  const key = (ids || []).map(String).join(',');
  const [data, setData] = useState({});

  useEffect(() => {
    const list = key ? key.split(',') : [];
    if (list.length === 0) return undefined;

    let active = true;
    const timer = window.setTimeout(async () => {
      const [feedbackResult, reactionResult] = await Promise.allSettled([
        feedbackApi.counts(parentEntity, list),
        reactionsApi.counts(parentEntity, list),
      ]);
      if (!active) return;

      const next = {};
      for (const id of list) {
        next[id] = { ...EMPTY_COUNTS, comments: 0, replies: 0, total: 0, ...EMPTY };
      }
      if (feedbackResult.status === 'fulfilled') {
        for (const [id, value] of Object.entries(feedbackResult.value.counts || {})) {
          if (next[id]) next[id] = { ...next[id], ...value };
        }
      }
      if (reactionResult.status === 'fulfilled') {
        for (const [id, value] of Object.entries(reactionResult.value.summaries || {})) {
          if (next[id]) next[id] = { ...next[id], ...value };
        }
      }
      setData(next);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [parentEntity, key]);

  return data;
}

export function engagementFor(engagement, id) {
  const value = engagement?.[String(id)];
  return value ? { ...EMPTY_COUNTS, ...EMPTY, ...value } : { ...EMPTY_COUNTS, ...EMPTY };
}
