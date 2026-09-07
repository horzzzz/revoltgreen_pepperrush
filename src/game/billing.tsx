/**
 * Store connection for the shop -- StoreKit 2 on iOS, Play Billing on
 * Android, through `expo-iap`'s `useIAP` hook. Mounted once around the whole
 * app (see `src/app/_layout.tsx`) rather than inside the shop screen, so a
 * purchase left unfinished by a previous session (app killed right after
 * paying, no network to call `finishTransaction`) gets replayed and settled
 * on the very first connect, even if the player never opens the shop.
 *
 * There is no payment backend behind this app: a purchase is trusted once
 * the store reports it as `purchased`, and `grantOnce` (see
 * `@/game/purchases`) makes crediting it idempotent against replays.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ErrorCode, useIAP, type Product, type Purchase } from 'expo-iap';

import { parsePrice, reportPurchase } from '@/game/analytics';
import { playSfx } from '@/game/audio/engine';
import { grantOnce } from '@/game/purchases';
import { PACK_SKUS, packForProductId, type Pack } from '@/game/shop';

type BillingState = {
  /** Whether the store connection (StoreKit / Play Billing) is up. */
  connected: boolean;
  /** The store's own localized price for a pack, once `fetchProducts` resolves. */
  priceFor: (pack: Pack) => string | undefined;
  /** The SKU currently mid-purchase, if any -- disables its button. */
  pendingSku: string | null;
  /** Starts a purchase. No-op while another purchase is pending. */
  buy: (pack: Pack) => void;
  /** Message from the last failed purchase, cleared on the next attempt. */
  error: string | null;
};

const BillingContext = createContext<BillingState | null>(null);

function productDisplayPrice(products: Product[], productId: string): string | undefined {
  return products.find((product) => product.id === productId)?.displayPrice;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The `useIAP` error callback is registered once, so it can't read the
  // `pendingSku` state -- a ref carries the SKU that is mid-purchase into it.
  const pendingSkuRef = useRef<string | null>(null);
  useEffect(() => {
    pendingSkuRef.current = pendingSku;
  }, [pendingSku]);

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: (purchase: Purchase) => {
      void handlePurchase(purchase);
    },
    onPurchaseError: (purchaseError) => {
      const sku = pendingSkuRef.current;
      setPendingSku(null);
      if (sku) reportPurchase('error', sku, priceForId(sku));
      if (purchaseError.code === ErrorCode.UserCancelled) return;
      playSfx('ui-denied');
      setError(purchaseError.message);
    },
  });

  function priceForId(productId: string): number | undefined {
    return parsePrice(
      productDisplayPrice(products, productId) ?? packForProductId(productId)?.fallbackPrice,
    );
  }

  async function handlePurchase(purchase: Purchase) {
    try {
      // 'pending' covers Ask to Buy / delayed payment methods -- nothing to
      // grant yet, and nothing to finish until the store settles it.
      if (purchase.purchaseState === 'purchased') {
        await grantOnce(purchase);
        await finishTransaction({ purchase, isConsumable: true });
        reportPurchase('success', purchase.productId, priceForId(purchase.productId));
        playSfx('purchase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPendingSku(null);
    }
  }

  // Load store products as soon as the connection is up (and again on a
  // reconnect, e.g. the Play Store not being ready at mount time).
  useEffect(() => {
    if (!connected) return;
    fetchProducts({ skus: [...PACK_SKUS], type: 'in-app' }).catch((err) => {
      setError(err instanceof Error ? err.message : String(err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const value = useMemo<BillingState>(
    () => ({
      connected,
      priceFor: (pack) => productDisplayPrice(products, pack.productId),
      pendingSku,
      buy: (pack) => {
        if (pendingSku || !connected) return;
        setError(null);
        setPendingSku(pack.productId);
        reportPurchase(
          'click',
          pack.productId,
          parsePrice(productDisplayPrice(products, pack.productId) ?? pack.fallbackPrice),
        );
        requestPurchase({
          type: 'in-app',
          request: {
            apple: { sku: pack.productId, quantity: 1 },
            google: { skus: [pack.productId] },
          },
        }).catch((err) => {
          setPendingSku(null);
          setError(err instanceof Error ? err.message : String(err));
        });
      },
      error,
    }),
    [connected, products, pendingSku, error, requestPurchase],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingState {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within a BillingProvider');
  return ctx;
}
