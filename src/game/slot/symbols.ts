/**
 * Symbols and the paytable, taken from the reference breakdown
 * (`docs/reference-3-chili-charms.md`, section 2). Nine symbols live on the
 * reels; the three chili tokens are a separate layer that only feeds the pots.
 *
 * Art mapping (Figma nodes in `elements`):
 *   WW  wild, 2 cells tall (1:819)   H1 safe (1:818)     H2 diamond (1:812)
 *   H3  skull (1:816)                H4 chili (1:813)    L1..L4 A/K/Q/J
 *   tokens: green 1:814, gold 1:817, red 1:815
 */

export const REEL_SYMBOLS = ['WW', 'H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4'] as const;
export type ReelSymbol = (typeof REEL_SYMBOLS)[number];

/** Chili tokens. They never pay a line -- they fly into the pots above the reels. */
export const TOKENS = ['T_GREEN', 'T_GOLD', 'T_RED'] as const;
export type Token = (typeof TOKENS)[number];

/** What a single position on the board can hold. */
export type Cell = ReelSymbol | Token;

export const WILD = 'WW' satisfies ReelSymbol;

export type PayingSymbol = Exclude<ReelSymbol, 'WW'>;

/**
 * Multipliers of the bet for 3 / 4 / 5 on a line. The wild has no pay of its
 * own, and all four low symbols pay the same -- they only differ visually.
 */
export const PAYTABLE: Record<PayingSymbol, readonly [number, number, number]> = {
  H1: [0.6, 3, 10],
  H2: [0.3, 2, 7],
  H3: [0.2, 1, 5],
  H4: [0.2, 1, 5],
  L1: [0.1, 0.5, 1],
  L2: [0.1, 0.5, 1],
  L3: [0.1, 0.5, 1],
  L4: [0.1, 0.5, 1],
};

export function isToken(cell: Cell): cell is Token {
  return cell === 'T_GREEN' || cell === 'T_GOLD' || cell === 'T_RED';
}

/** Wild substitutes for every regular symbol, but never for a token. */
export function canSubstitute(cell: Cell): cell is PayingSymbol {
  return !isToken(cell) && cell !== WILD;
}
