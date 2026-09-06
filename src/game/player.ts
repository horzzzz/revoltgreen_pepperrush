/**
 * The player's state. Hard-coded until the economy exists -- every screen reads
 * it from here so there is a single place to swap for real storage later.
 */
export const PLAYER = {
  name: 'You',
  /** Coins in the menu's balance pill (Figma node I1:190;1:476). */
  coins: 100,
  /** Dollars the leaderboard ranks by. */
  balance: 12_500,
} as const;
