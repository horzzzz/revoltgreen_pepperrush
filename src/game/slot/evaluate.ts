/**
 * Line evaluation for the base game: left to right from the first reel, at
 * least three in a row, wild substitutes for any regular symbol but never for
 * a token and never pays on its own.
 */

import { PAYLINES } from './paylines';
import {
  type Cell,
  canSubstitute,
  PAYTABLE,
  type PayingSymbol,
  WILD,
} from './symbols';

export type WinLine = {
  /** Index into `PAYLINES`. */
  line: number;
  symbol: PayingSymbol;
  count: number;
  /** Coins won on this line, already multiplied by the bet. */
  amount: number;
  /** `[reel, row]` of every cell that pays, for the highlight on screen. */
  cells: [number, number][];
};

export type SpinWin = {
  lines: WinLine[];
  total: number;
};

/** Rounds to cents, so a 0.1 bet cannot smear a balance into float dust. */
function toCents(value: number) {
  return Math.round(value * 100) / 100;
}

export function evaluate(board: Cell[][], bet: number): SpinWin {
  const lines: WinLine[] = [];

  PAYLINES.forEach((rows, line) => {
    const cells = rows.map((row, reel) => board[reel][row]);

    // The paying symbol is the first non-wild one; a line of nothing but wilds
    // pays nothing, the same as in the reference.
    const symbol = cells.find(canSubstitute);
    if (!symbol) return;

    let count = 0;
    for (const cell of cells) {
      if (cell !== symbol && cell !== WILD) break;
      count += 1;
    }
    if (count < 3) return;

    const amount = toCents(PAYTABLE[symbol][count - 3] * bet);
    if (amount <= 0) return;

    lines.push({
      line,
      symbol,
      count,
      amount,
      cells: rows.slice(0, count).map((row, reel) => [reel, row] as [number, number]),
    });
  });

  return { lines, total: toCents(lines.reduce((sum, win) => sum + win.amount, 0)) };
}
