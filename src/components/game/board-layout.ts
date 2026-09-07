/** Geometry of the machine, in design units (Figma nodes 1:109 / 1:111). */

/** Node 1:112 -- one board cell. */
export const CELL = 64;
/** The flex-wrap gap between rows; the columns sit flush. */
export const ROW_GAP = 2;
/** Distance from one row's top to the next. */
export const PITCH = CELL + ROW_GAP;

export const GRID = { width: 320, height: 196 } as const;

/** Node 1:109 -- the box the machine art and the reel window share. */
export const BOARD_BOX = { width: 382, height: 263 } as const;
/** Node 1:110 -- the frame art inside that box. */
export const MACHINE = { x: 6, y: 0.85, width: 370, height: 254 } as const;
/** Node 1:111 -- where the reel window starts inside the box. */
export const GRID_ORIGIN = { x: 31, y: 32 } as const;

/** The wild is drawn two cells tall, gap included (node 1:819, 64x128). */
export const WILD_HEIGHT = CELL * 2 + ROW_GAP;

/** How long the reels blur before the first one lands. */
export const SPIN_MS = 620;
/** Extra time each reel to the right keeps spinning. */
export const REEL_STAGGER_MS = 130;
/** The drop-in that reveals a reel's result. */
export const DROP_MS = 260;
export const SETTLE_MS = 110;

/** Time from the start of a spin until the last reel has settled. */
export const SPIN_TOTAL_MS = SPIN_MS + REEL_STAGGER_MS * 4 + DROP_MS + SETTLE_MS;
