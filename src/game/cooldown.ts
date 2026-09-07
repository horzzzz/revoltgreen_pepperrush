/**
 * Shared cooldown windows and the countdown formatter. The wheel and the daily
 * bonus both gate on "once every N hours", and both the player store and the
 * screens need the same numbers, so they live here rather than next to either
 * feature.
 */

/** One spin a day on the Wheel of Luck. */
export const WHEEL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** One daily bonus claim a day. */
export const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** 3661000 -> "01:01:01" */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => n.toString().padStart(2, '0');
  return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60].map(pad).join(':');
}
