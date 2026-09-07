/**
 * Web has no StoreKit / Play Billing to connect to, and `expo-iap` ships no
 * web implementation -- this stub keeps the same contract as `billing.tsx`
 * so the shop screen doesn't need to branch on platform. Metro picks this
 * file automatically for web builds (see `app.json`'s `web.output`).
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { Pack } from '@/game/shop';

type BillingState = {
  connected: boolean;
  priceFor: (pack: Pack) => string | undefined;
  pendingSku: string | null;
  buy: (pack: Pack) => void;
  error: string | null;
};

const BillingContext = createContext<BillingState | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const value = useMemo<BillingState>(
    () => ({
      connected: false,
      priceFor: () => undefined,
      pendingSku: null,
      buy: () => {},
      error: null,
    }),
    [],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingState {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within a BillingProvider');
  return ctx;
}
