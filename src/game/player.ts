/**
 * The player's state -- the single source of truth for everything the economy
 * touches: the coin balance, free spins won on the wheel, and the timestamps
 * the daily bonus and the wheel gate their cooldowns on. Screens read it through
 * the `use*` hooks; the daily bonus, the wheel and the slot machine all mutate
 * the same store, so a balance change in one place shows up everywhere.
 *
 * The state is persisted to AsyncStorage on every mutation and restored by
 * `hydratePlayer()` before the app's first frame (see `src/app/_layout.tsx`).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { DAILY_COOLDOWN_MS, WHEEL_COOLDOWN_MS } from '@/game/cooldown';

export const PLAYER = {
  name: 'You',
  /** Dollars the leaderboard ranks by -- unrelated to the coin balance. */
  balance: 12_500,
} as const;

/** Coins in the balance pill (Figma node I1:190;1:476) on a fresh install. */
export const STARTING_COINS = 100;

/** Node I1:193;1:343 -- what the daily bonus hands out. */
export const DAILY_BONUS_COINS = 1000;

const STORAGE_KEY = 'player.v2';

/**
 * Free spins never stack past this -- landing on "3 FREE SPINS" again while you
 * still have some just tops you back up, it does not let the wheel run forever.
 */
const MAX_FREE_SPINS = 3;

type PlayerState = {
  coins: number;
  freeSpins: number;
  /** `Date.now()` of the last daily bonus claim, `0` if never. */
  lastDailyClaimAt: number;
  /** `Date.now()` of the last wheel spin, `0` if never. */
  lastWheelSpinAt: number;
};

const state: PlayerState = {
  coins: STARTING_COINS,
  freeSpins: 0,
  lastDailyClaimAt: 0,
  lastWheelSpinAt: 0,
};

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

// --- persistence -----------------------------------------------------------

let persistTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced so a burst of mutations (a win, then a pot collect) writes once. */
function persist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, 300);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Restores the saved state. Call once, before the app renders. A missing or
 * unreadable record leaves the defaults in place (fresh install).
 */
export async function hydratePlayer() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<PlayerState>;
    if (isFiniteNumber(saved.coins)) state.coins = toCents(Math.max(0, saved.coins));
    if (isFiniteNumber(saved.freeSpins))
      state.freeSpins = Math.min(MAX_FREE_SPINS, Math.max(0, Math.floor(saved.freeSpins)));
    if (isFiniteNumber(saved.lastDailyClaimAt)) state.lastDailyClaimAt = saved.lastDailyClaimAt;
    if (isFiniteNumber(saved.lastWheelSpinAt)) state.lastWheelSpinAt = saved.lastWheelSpinAt;
    emit();
  } catch {
    // Corrupt record -- keep the defaults.
  }
}

// --- coins ---------------------------------------------------------------

export function getCoins() {
  return state.coins;
}

export function addCoins(amount: number) {
  if (amount <= 0) return;
  state.coins = toCents(state.coins + amount);
  emit();
  persist();
}

/** Takes the stake if the balance covers it; returns false when it does not. */
export function spendCoins(amount: number) {
  if (amount > state.coins) return false;
  state.coins = toCents(state.coins - amount);
  emit();
  persist();
  return true;
}

export function useCoins() {
  return useSyncExternalStore(subscribe, getCoins, getCoins);
}

// --- free spins --------------------------------------------------------------

export function getFreeSpins() {
  return state.freeSpins;
}

export function addFreeSpins(count: number) {
  if (count <= 0) return;
  state.freeSpins = Math.min(MAX_FREE_SPINS, state.freeSpins + Math.floor(count));
  emit();
  persist();
}

/** Uses one free spin if any are left; returns whether one was spent. */
export function consumeFreeSpin() {
  if (state.freeSpins <= 0) return false;
  state.freeSpins -= 1;
  emit();
  persist();
  return true;
}

// --- cooldowns --------------------------------------------------------------

export function canClaimDaily(now: number = Date.now()) {
  return now - state.lastDailyClaimAt >= DAILY_COOLDOWN_MS;
}

/** Grants the daily bonus if the cooldown is up; returns whether it did. */
export function claimDailyBonus() {
  if (!canClaimDaily()) return false;
  state.lastDailyClaimAt = Date.now();
  state.coins = toCents(state.coins + DAILY_BONUS_COINS);
  emit();
  persist();
  return true;
}

export function canSpinWheel(now: number = Date.now()) {
  return now - state.lastWheelSpinAt >= WHEEL_COOLDOWN_MS;
}

export function wheelAvailableAt() {
  return state.lastWheelSpinAt + WHEEL_COOLDOWN_MS;
}

export function markWheelSpin() {
  state.lastWheelSpinAt = Date.now();
  emit();
  persist();
}

function getDailyClaimAt() {
  return state.lastDailyClaimAt;
}

/**
 * Reactive to the stored timestamp -- the screen runs its own 1s ticker for the
 * live countdown while the cooldown is active.
 */
export function useDailyStatus() {
  const lastClaimAt = useSyncExternalStore(subscribe, getDailyClaimAt, getDailyClaimAt);
  return { canClaim: canClaimDaily(), nextAt: lastClaimAt + DAILY_COOLDOWN_MS };
}
