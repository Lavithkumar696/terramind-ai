import { useEffect, useMemo, useRef, useState } from 'react';
import type { AggregatedResult } from '@/data/providers';
import { fetchAllEvents } from '@/data/providers';

const REFRESH_MS = 5 * 60 * 1000;

export function useDisasterEvents() {
  const [data, setData] = useState<AggregatedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchAllEvents();
        if (!active) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'failed to load events');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    timer.current = window.setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  return useMemo(() => ({ data, loading, error }), [data, loading, error]);
}
