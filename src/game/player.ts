/**
 * The player's state. The coin balance is the only part the game moves, so it
 * lives in a tiny store instead of a constant -- screens read it through
 * `useCoins()`. Nothing is persisted yet: a restart puts the balance back to
 * `STARTING_COINS`.
 */

import { useSyncExternalStore } from 'react';

export const PLAYER = {
  name: 'You',
  /** Dollars the leaderboard ranks by -- unrelated to the coin balance. */
  balance: 12_500,
} as const;

/** Coins in the balance pill (Figma node I1:190;1:476). */
export const STARTING_COINS = 100;

/** Node I1:193;1:343 -- what the daily bonus hands out. */
export const DAILY_BONUS_COINS = 1000;

let coins = STARTING_COINS;
const listeners = new Set<() => void>();

/** Bets go down to 0.1, so the balance is kept on whole cents. */
function toCents(value: number) {
  return Math.round(value * 100) / 100;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCoins() {
  return coins;
}

export function addCoins(amount: number) {
  if (amount <= 0) return;
  coins = toCents(coins + amount);
  emit();
}

/** Takes the stake if the balance covers it; returns false when it does not. */
export function spendCoins(amount: number) {
  if (amount > coins) return false;
  coins = toCents(coins - amount);
  emit();
  return true;
}

export function useCoins() {
  return useSyncExternalStore(subscribe, getCoins, getCoins);
}
