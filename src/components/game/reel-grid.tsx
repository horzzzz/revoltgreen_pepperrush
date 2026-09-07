import { Image } from 'expo-image';
import { View } from 'react-native';

import {
  BOARD_BOX,
  GRID,
  GRID_ORIGIN,
  MACHINE,
  REEL_STAGGER_MS,
} from '@/components/game/board-layout';
import { BoardVfx } from '@/components/game/board-vfx';
import { Reel } from '@/components/game/reel';
import { REEL_COUNT } from '@/game/slot/reels';
import type { Cell } from '@/game/slot/symbols';
import { useDesignScale } from '@/hooks/use-design-scale';

const MACHINE_ASSET = require('@/assets/images/game/machine.png');

type ReelGridProps = {
  /** `board[reel][row]`. */
  board: Cell[][];
  wildTop: boolean[][];
  spinning: boolean;
  /** `winning[reel][row]` -- cells that are part of a paying line. */
  winning: boolean[][];
  /** Dim everything that did not pay, once the spin has resolved. */
  dimLosers: boolean;
  /** Replay counters for the celebration layer -- see `board-vfx.tsx`. */
  winId: number;
  popupWin: number;
  popupId: number;
  popupLive: boolean;
};

/** The machine frame with the 5x3 window cut into it (Figma node 1:109). */
export function ReelGrid({
  board,
  wildTop,
  spinning,
  winning,
  dimLosers,
  winId,
  popupWin,
  popupId,
  popupLive,
}: ReelGridProps) {
  const scale = useDesignScale();

  return (
    <View style={{ width: BOARD_BOX.width * scale, height: BOARD_BOX.height * scale }}>
      <Image
        source={MACHINE_ASSET}
        style={{
          position: 'absolute',
          left: MACHINE.x * scale,
          top: MACHINE.y * scale,
          width: MACHINE.width * scale,
          height: MACHINE.height * scale,
        }}
        contentFit="fill"
      />

      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          left: GRID_ORIGIN.x * scale,
          top: GRID_ORIGIN.y * scale,
          width: GRID.width * scale,
          height: GRID.height * scale,
          overflow: 'hidden',
        }}>
        {Array.from({ length: REEL_COUNT }, (_, reel) => (
          <Reel
            key={reel}
            cells={board[reel]}
            wildTop={wildTop[reel]}
            winning={winning[reel]}
            spinning={spinning}
            dimLosers={dimLosers}
            stopDelay={reel * REEL_STAGGER_MS}
          />
        ))}
      </View>

      {/* Last child on purpose: paint order is what puts the celebration over
          the symbols, and `zIndex` would leak out of this subtree. */}
      <BoardVfx
        winId={winId}
        popupWin={popupWin}
        popupId={popupId}
        popupLive={popupLive}
      />
    </View>
  );
}
