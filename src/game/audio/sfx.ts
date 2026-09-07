/**
 * One-shot sound effect registry. `require()` targets have to be spelled out
 * literally -- Metro can't resolve a dynamic one, the same constraint the
 * image assets live under.
 *
 * There are no voice pools: `engine.ts` decodes each clip once into an
 * `AudioBuffer` and spawns a throwaway source node per play, so a sound can
 * overlap itself as many times as the game asks for -- the reel-stop ticks
 * and pot-token drops both rely on that during a single spin.
 *
 * `assets/audio/CREDITS.md` lists where every clip came from, and
 * `scripts/fetch-audio.sh` rebuilds the whole directory from those sources.
 */

export type SfxId =
  // UI -- every button in the app goes through `PressableScale`.
  | 'ui-click'
  | 'ui-back'
  | 'ui-denied'
  | 'ui-toggle'
  // Economy.
  | 'purchase'
  | 'unlock'
  | 'reward-claim'
  // Wheel of Luck.
  | 'wheel-fail'
  // Slot machine -- driven by use-slot-machine.ts.
  | 'reel-stop'
  | 'pot-token'
  | 'win'
  | 'lose'
  | 'good-job'
  | 'big-win';

export const SFX_SOURCES: Record<SfxId, number> = {
  'ui-click': require('@/assets/audio/ui-click.m4a'),
  'ui-back': require('@/assets/audio/ui-back.m4a'),
  'ui-denied': require('@/assets/audio/ui-denied.m4a'),
  'ui-toggle': require('@/assets/audio/ui-toggle.m4a'),
  purchase: require('@/assets/audio/purchase.m4a'),
  unlock: require('@/assets/audio/unlock.m4a'),
  'reward-claim': require('@/assets/audio/reward-claim.m4a'),
  'wheel-fail': require('@/assets/audio/wheel-fail.m4a'),
  'reel-stop': require('@/assets/audio/reel-stop.m4a'),
  'pot-token': require('@/assets/audio/pot-token.m4a'),
  win: require('@/assets/audio/win.m4a'),
  lose: require('@/assets/audio/lose.m4a'),
  'good-job': require('@/assets/audio/good-job.m4a'),
  'big-win': require('@/assets/audio/big-win.m4a'),
};

/**
 * Standing per-clip mix trim, applied by `playSfx` on top of the SOUND
 * setting. Every clip is listed, including the ones that come out near 1, so
 * the table reads as a mix rather than as a list of exceptions.
 *
 * These are computed, not dialled by ear. `scripts/fetch-audio.sh` prints
 * each clip's LOUD figure -- RMS over its loudest 300 ms -- and each trim is
 * whatever puts that figure on the target below, clamped so no clip is
 * boosted past -1 dBFS peak (a few of them hit that clamp and land slightly
 * under target).
 *
 * The targets are a ladder, in dB of loudness, against the music bed
 * (`MUSIC_MIX_LEVEL` in engine.ts, ~-24.5 dB for this track):
 *
 *   -12   the biggest moment on the screen   big-win
 *   -14   payouts                            good-job, reward-claim
 *   -15   confirmations                      purchase, unlock, win
 *   -18   punctuation                        ui-denied, wheel-fail, lose
 *   -19   ordinary taps                      ui-click, ui-toggle, ui-back
 *   -21   the relentless ones                reel-stop, pot-token
 *
 * So the rule of thumb is frequency: anything that can fire several times in
 * one spin sits just above the music and no further, while the things that
 * happen once in a while are allowed to be loud. See CREDITS.md for why this
 * is measured on loudness rather than peak.
 */
export const SFX_GAIN: Partial<Record<SfxId, number>> = {
  'ui-click': 0.87,
  'ui-back': 1,
  'ui-denied': 0.83,
  'ui-toggle': 0.51,
  purchase: 0.66,
  unlock: 0.38,
  'reward-claim': 1.04,
  'wheel-fail': 0.89,
  'reel-stop': 0.99,
  'pot-token': 1.17,
  win: 0.73,
  lose: 0.41,
  'good-job': 0.94,
  'big-win': 1.01,
};

/**
 * The rattle used for both the slot reels and the Wheel of Luck -- supplied
 * by the project owner, not fetched by `fetch-audio.sh`. At ~2.4 s it is a
 * one-shot rather than a loop: shorter than either spin (SPIN_TOTAL_MS in
 * board-layout.ts, SPIN_MS in wheel.ts), so looping it would replay the
 * rattle mid-spin.
 */
export const SPIN_SOURCE: number = require('@/assets/audio/wheel-spin.m4a');
export const MUSIC_THEME_SOURCE: number = require('@/assets/audio/music-theme.m4a');
