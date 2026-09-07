/**
 * Coin packs (Figma node 1:919). There is no payment backend behind this app,
 * so a "purchase" just grants the coins locally -- the same stub the daily
 * bonus and the wheel already use for their rewards. Nothing here charges
 * real money.
 */
export type Pack = {
  id: string;
  title: string;
  description: string;
  price: string;
  coins: number;
};

/** Node I1:922;1:681 -- the banner row, no price, once-per-visit in spirit. */
export const FREE_COINS = 1000;

export const PACKS: readonly Pack[] = [
  {
    id: 'starter',
    title: 'Starter Pack',
    description: '1,500 Coins + 3 Free Spins +10% Bonus on Every Win for 3 Days',
    price: '$2.99',
    coins: 1500,
  },
  {
    id: 'premium',
    title: 'Premium Pack',
    description: '4,500 Coins + 6 Free Spins +15% Bonus on Every Win for 7 Days',
    price: '$5.99',
    coins: 4500,
  },
  {
    id: 'vip',
    title: 'VIP Pack',
    description: '10,000 coins + 7 days 25% Win Boost + 10 free spins + priority withdrawal',
    price: '$9.99',
    coins: 10000,
  },
];
