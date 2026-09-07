/**
 * Idempotent coin grants for completed store purchases -- the piece that
 * keeps a replayed StoreKit/Play Billing transaction (app killed right after
 * paying, offline when `finishTransaction` should have run, etc.) from
 * crediting the same purchase twice.
 *
 * Mirrors the storage pattern in `@/game/player`: module-level state,
 * debounce-free single write, hydrated once before the app renders.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { addCoins } from '@/game/player';
import { packForProductId } from '@/game/shop';

const STORAGE_KEY = 'purchases.v1';

/** Bounds the persisted set -- a runaway history should never grow forever. */
const MAX_TRACKED_TRANSACTIONS = 500;

const grantedTransactionIds = new Set<string>();
let hydrated = false;

function persist() {
  const ids = Array.from(grantedTransactionIds);
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
}

/** Restores the set of already-granted transaction ids. Call once at startup. */
export async function hydratePurchases() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as unknown;
      if (Array.isArray(saved)) {
        for (const id of saved) {
          if (typeof id === 'string') grantedTransactionIds.add(id);
        }
      }
    }
  } catch {
    // Corrupt record -- start from an empty set.
  } finally {
    hydrated = true;
  }
}

type GrantablePurchase = {
  transactionId?: string | null;
  id: string;
  productId: string;
};

/**
 * Credits the pack's coins for `purchase` if (and only if) this transaction
 * has not been granted before. Returns whether it granted anything, so the
 * caller can decide whether to surface an error for an unrecognized SKU.
 */
export async function grantOnce(purchase: GrantablePurchase): Promise<boolean> {
  if (!hydrated) await hydratePurchases();

  const transactionId = purchase.transactionId || purchase.id;
  if (!transactionId || grantedTransactionIds.has(transactionId)) return false;

  const pack = packForProductId(purchase.productId);
  if (!pack) return false;

  addCoins(pack.coins);

  grantedTransactionIds.add(transactionId);
  if (grantedTransactionIds.size > MAX_TRACKED_TRANSACTIONS) {
    const [oldest] = grantedTransactionIds;
    grantedTransactionIds.delete(oldest);
  }
  persist();

  return true;
}
