import { useEffect, useState } from 'react';

/**
 * Runs a number up to `target` so a win rolls onto the plate instead of
 * popping into place. Jumps straight to 0 when the board is cleared.
 */
export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (target <= 0) {
      setValue(target);
      return;
    }

    const start = Date.now();
    let frame = requestAnimationFrame(function tick() {
      const progress = Math.min(1, (Date.now() - start) / duration);
      setValue(Math.round(target * progress * 100) / 100);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
