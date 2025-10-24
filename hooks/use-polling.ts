import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
}

/**
 * Custom hook for polling-based real-time updates
 * This is a Vercel-compatible alternative to WebSocket connections
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions = {}
) {
  const { interval = 3000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Polling error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetcher, enabled]);

  const startPolling = useCallback(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchData();
    
    // Set up interval
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      startPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  useEffect(() => {
    // Restart polling when interval changes
    if (enabled) {
      stopPolling();
      startPolling();
    }
  }, [interval, enabled, startPolling, stopPolling]);

  return {
    data,
    error,
    isLoading,
    refetch,
    startPolling,
    stopPolling
  };
}