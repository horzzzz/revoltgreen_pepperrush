/**
 * Bet ladder and autospin counts. The ladder is the reference's `main` one
 * (0.1 ... 500) and the chips are laid out exactly as the panel draws them
 * (Figma node 1:493): highest first, `max` last.
 */

export const BET_LADDER = [
  500, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 7, 5, 3, 2, 1, 0.8, 0.6, 0.4, 0.2, 0.1,
] as const;

export const DEFAULT_BET = 1;

/** `'max'` keeps spinning until the player stops it or runs out of coins. */
export type AutospinCount = number | 'max';

export const AUTOSPIN_COUNTS: readonly AutospinCount[] = [100, 60, 50, 30, 20, 'max'];

export const DEFAULT_AUTOSPIN: AutospinCount = 100;

/** Largest bet on the ladder the balance can still cover, never below the floor. */
export function maxAffordableBet(balance: number) {
  const floor = BET_LADDER[BET_LADDER.length - 1];
  return BET_LADDER.find((bet) => bet <= balance) ?? floor;
}

/** 25 -> "25.00", the way the Win and Bet plates read in the design. */
export function formatMoney(value: number) {
  return value.toFixed(2);
}

/** Balance in the top bar: whole coins stay whole, fractions keep two digits. */
export function formatCoins(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
