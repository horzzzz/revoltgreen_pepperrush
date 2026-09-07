/**
 * Coin packs (Figma node 1:919), sold as consumable in-app purchases through
 * `expo-iap` -- StoreKit 2 on iOS, Play Billing on Android. `productId` is
 * the SKU registered in App Store Connect / Google Play Console; `coins` is
 * what `grantOnce()` (see `@/game/purchases`) credits once the store confirms
 * the purchase. `fallbackPrice` is only a placeholder label shown before the
 * store's own localized price (`displayPrice`) has loaded, or if the store
 * is unreachable -- it is never charged.
 */
export type Pack = {
  id: string;
  productId: string;
  title: string;
  description: string;
  fallbackPrice: string;
  coins: number;
};

/** Node I1:922;1:681 -- the banner row, no price, once-per-visit in spirit. */
export const FREE_COINS = 1000;

export const PACKS: readonly Pack[] = [
  {
    id: 'starter',
    productId: 'revoltgreen_pepperrush_1500',
    title: 'Starter Pack',
    description: '1,500 Coins + 3 Free Spins +10% Bonus on Every Win for 3 Days',
    fallbackPrice: '$2.99',
    coins: 1500,
  },
  {
    id: 'premium',
    productId: 'revoltgreen_pepperrush_4500',
    title: 'Premium Pack',
    description: '4,500 Coins + 6 Free Spins +15% Bonus on Every Win for 7 Days',
    fallbackPrice: '$5.99',
    coins: 4500,
  },
  {
    id: 'vip',
    productId: 'revoltgreen_pepperrush_10000',
    title: 'VIP Pack',
    description: '10,000 coins + 7 days 25% Win Boost + 10 free spins',
    fallbackPrice: '$9.99',
    coins: 10000,
  },
];

export const PACK_SKUS: readonly string[] = PACKS.map((pack) => pack.productId);

export function packForProductId(productId: string): Pack | undefined {
  return PACKS.find((pack) => pack.productId === productId);
}
