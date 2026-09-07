/**
 * The one connected payout method. Only a single method can be linked at a time
 * (Figma: "Connected" replaces "Add payout method" on the exchange screen) --
 * connecting another one overwrites this record, so the previous method's
 * details are dropped. Persisted to AsyncStorage, restored by `hydratePayout()`
 * before the first frame (see `src/app/_layout.tsx`).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type PayoutConnection = {
  /** A key from `PAYOUT_METHODS` (see `src/game/payout-methods.ts`). */
  method: string;
  /** Field key -> what the player typed. Shape depends on the method. */
  fields: Record<string, string>;
};

const STORAGE_KEY = 'payout.v1';

let connection: PayoutConnection | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return connection;
}

/** Restores the saved connection. Call once, before the app renders. */
export async function hydratePayout() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<PayoutConnection>;
    if (saved && typeof saved.method === 'string' && saved.fields && typeof saved.fields === 'object') {
      connection = { method: saved.method, fields: saved.fields as Record<string, string> };
      emit();
    }
  } catch {
    // Corrupt record -- stay unlinked.
  }
}

/** Links `method`, replacing whatever was linked before. */
export function connectPayout(method: string, fields: Record<string, string>) {
  connection = { method, fields };
  emit();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(connection)).catch(() => {});
}

export function getPayout() {
  return connection;
}

export function usePayout() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
