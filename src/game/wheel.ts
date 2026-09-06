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

/** Full turns the wheel makes before settling, so a spin reads as a spin. */
export const SPIN_TURNS = 5;
export const SPIN_MS = 4200;

/** One spin a day. */
export const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Angle the disc has to reach for `index` to stop under the pointer, counted up
 * from `from` so the animation never winds backwards.
 */
export function landingAngle(from: number, index: number) {
  const settled = (360 - index * SECTOR_ANGLE) % 360;
  return from - (from % 360) + SPIN_TURNS * 360 + settled;
}

export function pickSector() {
  return Math.floor(Math.random() * WHEEL_SECTORS.length);
}

/** 3661000 -> "01:01:01" */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => n.toString().padStart(2, '0');
  return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60].map(pad).join(':');
}
