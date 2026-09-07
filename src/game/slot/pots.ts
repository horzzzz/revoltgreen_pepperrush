/**
 * The three pots above the reels (Figma nodes 1:820/1:822, 1:824/1:826,
 * 1:828/1:830). Each collects tokens of its own colour; a full pot is what
 * arms the Hold & Win round in the reference (§3).
 *
 * The bonus round itself is not built yet -- there is no design for it -- so a
 * pot that fills up simply stays full and `readyModes` reports it. That is the
 * single place to hook the round up later.
 */

import type { Token } from './symbols';

export type PotKey = 'collect' | 'multiplier' | 'board';

export const POTS: readonly { key: PotKey; token: Token }[] = [
  { key: 'collect', token: 'T_GREEN' },
  { key: 'multiplier', token: 'T_GOLD' },
  { key: 'board', token: 'T_RED' },
];

/** Tokens a pot holds before it is full. */
export const POT_CAPACITY = 12;

export type PotState = Record<PotKey, number>;

export const EMPTY_POTS: PotState = { collect: 0, multiplier: 0, board: 0 };

export function collectTokens(pots: PotState, tokens: readonly Token[]): PotState {
  const next = { ...pots };
  for (const { key, token } of POTS) {
    const landed = tokens.filter((candidate) => candidate === token).length;
    next[key] = Math.min(POT_CAPACITY, next[key] + landed);
  }
  return next;
}

export function isFull(pots: PotState, key: PotKey) {
  return pots[key] >= POT_CAPACITY;
}

/** Pots that have filled up -- the entry point for the future Hold & Win. */
export function readyModes(pots: PotState) {
  return POTS.filter(({ key }) => isFull(pots, key)).map(({ key }) => key);
}
