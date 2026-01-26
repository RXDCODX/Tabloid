import { useCallback, useEffect, useRef } from 'react';

// Возвращает дебаунс-обёртку для переданной функции.
// При каждом вызове обёртки выполнение оригинальной функции откладывается на `delay` мс.
export default function useDebouncedCallback<
  T extends (...args: any[]) => void,
>(callback: T, delay = 300) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null
  );

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
      }
      timerRef.current = globalThis.setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay]
  );

  return debounced;
}
