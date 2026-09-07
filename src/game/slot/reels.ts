/**
 * Reel strips. The composition of every strip reproduces the per-cell symbol
 * frequencies measured on the live reference RGS (reference §7.1, sample of
 * 3 000 cells): odd reels (1/3/5) and even reels (2/4) run different sets, and
 * the wild never appears on the first reel.
 *
 * The strips are shuffled once at module load with a fixed seed, so a build
 * always plays the same reels while the order stays free of accidental
 * patterns.
 *
 * Measured over 300 000 spins of the built strips: line RTP 41 % (reference
 * 42.4 %), hit rate 26.6 % (27.7 %), median non-zero win 0.6x the bet (0.6x),
 * a token in 31.8 % of spins (~32 %), and never a wild on reel 1.
 */

import {
  type Cell,
  isToken,
  type ReelSymbol,
  type Token,
  TOKENS,
  WILD,
} from './symbols';

export const REEL_COUNT = 5;
export const ROW_COUNT = 3;

/** Cells per strip. 200 keeps the measured percentages accurate to 0.5 pt. */
const STRIP_LENGTH = 200;

/**
 * Measured share of each symbol in the visible window, per reel, in percent.
 * The rows do not add up to 100 -- the remainder is the token layer, which is
 * rolled separately in `spinReels`, so the mix gets normalised per reel.
 */
const REEL_MIX: Record<ReelSymbol, number>[] = [
  { WW: 0.0, H1: 10.0, H2: 16.8, H3: 15.0, H4: 6.8, L1: 12.5, L2: 4.3, L3: 15.8, L4: 14.8 },
  { WW: 2.7, H1: 12.3, H2: 17.0, H3: 19.2, H4: 17.8, L1: 2.8, L2: 19.2, L3: 4.5, L4: 2.2 },
  { WW: 4.8, H1: 16.5, H2: 15.7, H3: 13.5, H4: 6.8, L1: 11.3, L2: 3.7, L3: 14.2, L4: 10.0 },
  { WW: 5.2, H1: 21.2, H2: 15.8, H3: 18.0, H4: 15.2, L1: 2.0, L2: 16.7, L3: 1.3, L4: 1.0 },
  { WW: 3.5, H1: 20.3, H2: 13.8, H3: 15.8, H4: 5.8, L1: 12.2, L2: 1.7, L3: 12.0, L4: 11.7 },
];

/**
 * Chance per spin that a token of one colour lands. The reference sees a chili
 * of a given colour in ~15 % of spins and at least one in a third of them
 * (§8.5); 0.12 per colour gives 1 - 0.88^3 = 32 %.
 */
const TOKEN_CHANCE = 0.12;

/** A strip plus, for every cell, whether it is the upper half of a wild pair. */
type Strip = { symbols: ReelSymbol[]; wildTop: boolean[] };

/** Deterministic PRNG, so the strips are the same in every build. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Symbol counts for one strip. The wild is drawn two cells tall, so its count
 * is rounded to an even number and laid down as pairs; the rounding drift ends
 * up on the most frequent regular symbol.
 */
function stripCounts(mix: Record<ReelSymbol, number>) {
  const total = Object.values(mix).reduce((sum, pct) => sum + pct, 0);
  const counts = {} as Record<ReelSymbol, number>;

  for (const [symbol, pct] of Object.entries(mix) as [ReelSymbol, number][]) {
    counts[symbol] = Math.round((pct / total) * STRIP_LENGTH);
  }
  counts.WW -= counts.WW % 2;

  const filler = (Object.entries(counts) as [ReelSymbol, number][])
    .filter(([symbol]) => symbol !== WILD)
    .sort((a, b) => b[1] - a[1])[0][0];
  const placed = Object.values(counts).reduce((sum, n) => sum + n, 0);
  counts[filler] += STRIP_LENGTH - placed;

  return counts;
}

function buildStrip(mix: Record<ReelSymbol, number>, seed: number): Strip {
  const counts = stripCounts(mix);

  // A wild pair travels as one item so the two halves never get split apart.
  const items: ReelSymbol[][] = [];
  for (const [symbol, count] of Object.entries(counts) as [ReelSymbol, number][]) {
    if (symbol === WILD) {
      for (let i = 0; i < count / 2; i += 1) items.push([WILD, WILD]);
    } else {
      for (let i = 0; i < count; i += 1) items.push([symbol]);
    }
  }

  const random = mulberry32(seed);
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const symbols: ReelSymbol[] = [];
  const wildTop: boolean[] = [];
  for (const item of items) {
    for (let i = 0; i < item.length; i += 1) {
      symbols.push(item[i]);
      wildTop.push(item.length === 2 && i === 0);
    }
  }

  return { symbols, wildTop };
}

export const STRIPS: Strip[] = REEL_MIX.map((mix, reel) => buildStrip(mix, 0x5eed + reel));

export type SpinResult = {
  /** `board[reel][row]`, reel 0 leftmost, row 0 top. */
  board: Cell[][];
  /** `wildTop[reel][row]` -- the cell holds the top half of a two-cell wild. */
  wildTop: boolean[][];
  /** Tokens that landed this spin, in the order they were rolled. */
  tokens: Token[];
};

/** One base-game spin: a random window on every strip, then the token layer. */
export function spinReels(random: () => number = Math.random): SpinResult {
  const board: Cell[][] = [];
  const wildTop: boolean[][] = [];

  for (let reel = 0; reel < REEL_COUNT; reel += 1) {
    const strip = STRIPS[reel];
    const start = Math.floor(random() * strip.symbols.length);
    const column: Cell[] = [];
    const columnWildTop: boolean[] = [];

    for (let row = 0; row < ROW_COUNT; row += 1) {
      const index = (start + row) % strip.symbols.length;
      column.push(strip.symbols[index]);
      // The window can cut a pair in half; the bottom half then has no top of
      // its own and the reel draws the tall art shifted a cell up.
      columnWildTop.push(strip.wildTop[index]);
    }

    board.push(column);
    wildTop.push(columnWildTop);
  }

  const tokens: Token[] = [];
  for (const token of TOKENS) {
    if (random() >= TOKEN_CHANCE) continue;
    const spot = freeSpot(board, random);
    if (!spot) continue;
    board[spot[0]][spot[1]] = token;
    tokens.push(token);
  }

  return { board, wildTop, tokens };
}

/** A cell a token may take over: not another token, and not part of a wild. */
function freeSpot(board: Cell[][], random: () => number): [number, number] | null {
  const spots: [number, number][] = [];
  for (let reel = 0; reel < REEL_COUNT; reel += 1) {
    for (let row = 0; row < ROW_COUNT; row += 1) {
      const cell = board[reel][row];
      if (cell !== WILD && !isToken(cell)) spots.push([reel, row]);
    }
  }
  if (spots.length === 0) return null;
  return spots[Math.floor(random() * spots.length)];
}
