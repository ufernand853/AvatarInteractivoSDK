// hooks/useAvatarTimeout.ts
import { useEffect, useRef } from "react";

export default function useAvatarTimeout({
        durationMs = 2 * 60 * 1000,
        onTimeout,
        onOneMinuteRemaining,
    } : {
    durationMs?: number;
    onTimeout: () => void;
    onOneMinuteRemaining?: () => void;
    }) 
  {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const oneMinRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (oneMinRef.current) clearTimeout(oneMinRef.current);

    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, durationMs);

    if (onOneMinuteRemaining && durationMs > 60000) {
      oneMinRef.current = setTimeout(() => {
        onOneMinuteRemaining();
      }, durationMs - 60000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (oneMinRef.current) clearTimeout(oneMinRef.current);
    };
  }, []);

  return { resetTimer };
}
