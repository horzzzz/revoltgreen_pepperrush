/**
 * Design tokens taken from the Figma file (sbKUEr6VroRxQcnrbBzqhm). The app is
 * dark-only, so there is no light/dark map -- just the values the frames are
 * drawn against.
 */

/** Natural size of the Figma frames, in design points. */
export const DesignFrame = { width: 430, height: 932 } as const;

/** Splash / loading screen tokens (Figma node 1:169). */
export const SplashColors = {
  /** Native splash + backdrop behind the background image. */
  bg: '#000000',
  /** Progress-bar track (node 1:235). */
  track: '#0b1015',
  trackBorder: '#caae60',
  /** Progress-bar fill gradient (node 1:236), mid stop at 43.756%. */
  fillEdge: '#9ae900',
  fillMid: '#578300',
  text: '#ffffff',
} as const;

/** Menu tokens (Figma node 1:173). */
export const MenuColors = {
  /** Bottom scrim over the character art (node 1:177), from transparent down. */
  scrimFrom: 'rgba(15,21,11,0)',
  scrimTo: '#0f150b',
  /** Plate behind the 18+ notice (node 1:182). */
  notice: 'rgba(0,0,0,0.6)',
  text: '#ffffff',
} as const;

/** Leaderboard tokens (Figma node 1:894). */
export const LeaderboardColors = {
  /** Card behind the list (node 1:572). */
  panel: '#0f150b',
  /** Card outline and row outlines -- same green as the progress bar's fill. */
  border: SplashColors.fillEdge,
  text: '#ffffff',
} as const;

/**
 * GFS Neohellenic is the app-wide typeface -- every piece of text uses it.
 * Loaded in `src/app/_layout.tsx`; render text through `AppText` rather than
 * react-native's `Text` so the family is applied.
 */
export const Fonts = {
  regular: 'GFSNeohellenic_400Regular',
  bold: 'GFSNeohellenic_700Bold',
} as const;
