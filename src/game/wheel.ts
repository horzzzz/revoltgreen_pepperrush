/**
 * Prizes as they are painted on the sector artwork, clockwise from the one the
 * pointer sits on. The list has to stay in this order -- it is what maps a
 * result back to an angle.
 */
export const WHEEL_SECTORS = [
  'MEGA WIN! 10 000',
  '100',
  'FAIL',
  '500',
  '1 000',
  '200',
  '3 FREE SPINS',
  '300',
  'FAIL',
  '5 000',
  '150',
  '800',
] as const;

export const SECTOR_ANGLE = 360 / WHEEL_SECTORS.length;

/**
 * How long the disc turns, and how far it gets in that time.
 *
 * The duration is pinned to the rattle (`wheel-spin.m4a`, ~2.39 s -- see
 * `SPIN_SOURCE` in `src/game/audio/sfx.ts`), which is a one-shot, not a loop:
 * at the old 4200 ms the clip ran out around the 57% mark and the last second
 * and a half of the spin played in silence. Landing just inside the clip means
 * the rattle is still going when the disc settles, and `stopSpinSound()` fades
 * out what is left of it instead of the sound simply disappearing.
 *
 * Turns came down with it (5 -> 3) so the wheel keeps the speed it had --
 * `Easing.out(cubic)` starts at 3x the average, which is 3.9 rev/s here
 * against 3.6 before -- rather than becoming a blur in the shorter window.
 */
export const SPIN_TURNS = 3;
export const SPIN_MS = 3600;

export { WHEEL_COOLDOWN_MS as SPIN_COOLDOWN_MS, formatCountdown } from '@/game/cooldown';

export type WheelReward =
  | { kind: 'coins'; coins: number }
  | { kind: 'freeSpins'; count: number }
  | { kind: 'nothing' };

/**
 * How often each sector comes up, aligned to `WHEEL_SECTORS`. The wheel is
 * house-favoured: `FAIL` and the small cash prizes carry most of the weight,
 * while the 5 000 / 10 000 jackpots and the free spins are deliberately rare.
 * Total is 135, so 10 000 lands roughly once in 135 spins.
 */
const SECTOR_WEIGHTS = [
  1, // MEGA WIN! 10 000
  20, // 100
  26, // FAIL
  6, // 500
  3, // 1 000
  16, // 200
  2, // 3 FREE SPINS
  10, // 300
  26, // FAIL
  2, // 5 000
  18, // 150
  5, // 800
] as const;

/** What the sector at `index` pays out. Parsed from its label on the artwork. */
export function sectorReward(index: number): WheelReward {
  const label = WHEEL_SECTORS[index];
  if (label === 'FAIL') return { kind: 'nothing' };
  if (label === '3 FREE SPINS') return { kind: 'freeSpins', count: 3 };
  const coins = parseInt(label.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(coins) && coins > 0 ? { kind: 'coins', coins } : { kind: 'nothing' };
}

/**
 * Angle the disc has to reach for `index` to stop under the pointer, counted up
 * from `from` so the animation never winds backwards.
 */
export function landingAngle(from: number, index: number) {
  const settled = (360 - index * SECTOR_ANGLE) % 360;
  return from - (from % 360) + SPIN_TURNS * 360 + settled;
}

/** A weighted draw over `SECTOR_WEIGHTS` -- see the note there. */
export function pickSector() {
  const total = SECTOR_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < SECTOR_WEIGHTS.length; index += 1) {
    roll -= SECTOR_WEIGHTS[index];
    if (roll < 0) return index;
  }
  return SECTOR_WEIGHTS.length - 1;
}
