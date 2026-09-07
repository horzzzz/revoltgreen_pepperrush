import { AppText, type AppTextProps } from '@/components/ui/app-text';
import { formatMoney } from '@/game/slot/bet';
import { useCountUp } from '@/hooks/use-count-up';

type CountUpTextProps = Omit<AppTextProps, 'children'> & {
  value: number;
  duration?: number;
  /** Bump to re-run the roll when the value itself has not changed. */
  replayId?: number;
  format?: (value: number) => string;
};

/**
 * A number that rolls up to `value` instead of popping into place.
 *
 * The point of it being its own component is where the re-render lands.
 * `useCountUp` is a `requestAnimationFrame` loop calling `setState` ~60 times
 * a second, so whichever component calls the hook re-renders on every one of
 * those frames -- and when that was the game screen, an entire screen's worth
 * of tree was being reconciled through the whole celebration. Owning the hook
 * down here means the only thing that re-renders per frame is this one text
 * node, and every animation around it stays on the UI thread untouched.
 */
export function CountUpText({
  value,
  duration,
  replayId,
  format = formatMoney,
  ...rest
}: CountUpTextProps) {
  const shown = useCountUp(value, duration, replayId);
  return <AppText {...rest}>{format(shown)}</AppText>;
}

/** Whole coins, for the counters that never deal in fractions (the wheel). */
export function formatWhole(value: number) {
  return String(Math.round(value));
}
