/**
 * Timings, pool sizes and the palette every visual effect reads from. It is a
 * companion to `src/components/game/board-layout.ts`: that file owns the
 * geometry of the machine, this one owns its rhythm.
 *
 * The autospin loop in `use-slot-machine.ts` reads `WIN_POPUP_MS` from here,
 * so a change to the celebration's length automatically moves the gap between
 * two autospins with it -- the two can never drift apart and start overlapping.
 */

import { GameColors, SplashColors } from '@/constants/theme';

/**
 * The four beats of the centred win amount. `count` is the count-up, and it
 * starts as the pop lands rather than after it, so the number is already
 * running while the plate is still settling.
 */
export const WIN_POPUP = {
  in: 200,
  count: 460,
  hold: 200,
  out: 300,
} as const;

/** Total life of the popup -- what an autospin has to wait out. */
export const WIN_POPUP_MS = WIN_POPUP.in + WIN_POPUP.count + WIN_POPUP.hold + WIN_POPUP.out;

/** How far up the amount drifts as it fades, in design units. */
export const WIN_POPUP_LIFT = 34;

/**
 * Particles per burst. These are deliberately small: every particle is a live
 * `useAnimatedStyle`, and the whole point of the one-shared-value design in
 * `spark-burst.tsx` is that these numbers stay countable rather than
 * "whatever a particle system feels like".
 */
export const SPARKS = {
  win: 14,
  bigWin: 24,
  wheel: 18,
  pot: 6,
} as const;

/** The game's greens plus white, so a burst reads as part of the art. */
export const SPARK_COLORS = [
  GameColors.chipGlow,
  SplashColors.fillEdge,
  SplashColors.fillMid,
  '#ffffff',
] as const;

/** Shared beats for the small reusable moves in `use-vfx.ts`. */
export const VFX = {
  /** Pop-in of a title, a card, the amount. */
  popIn: 260,
  /** One half-cycle of a pulse; a pulse of N cycles lasts 2 * N * this. */
  pulse: 320,
  /** One on/off cycle of a glow flash. */
  flash: 260,
  /** A single squash-and-pop, for a pot taking a token. */
  bump: 260,
  /** How long a shake rings out for. */
  shake: 420,
  /** The idle breath of the spin button; one half-cycle. */
  breathe: 1100,
} as const;
