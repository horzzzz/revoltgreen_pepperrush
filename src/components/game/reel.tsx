import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  CELL,
  DROP_MS,
  GRID,
  PITCH,
  ROW_GAP,
  SETTLE_MS,
  WILD_HEIGHT,
} from '@/components/game/board-layout';
import { SYMBOL_ART } from '@/components/game/symbol-art';
import { ROW_COUNT } from '@/game/slot/reels';
import { type Cell, REEL_SYMBOLS, WILD } from '@/game/slot/symbols';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Cells in the blur strip. Rendered twice so the loop has no seam. */
const FILLER_LENGTH = 8;
/** Time one cell takes to pass by while the reel is spinning. */
const FILLER_CELL_MS = 55;
/** How far the column overshoots before it settles back. */
const OVERSHOOT = 7;

const FILLER_POOL = REEL_SYMBOLS.filter((symbol) => symbol !== WILD);

type ReelProps = {
  /** The three cells this reel shows, top to bottom. */
  cells: Cell[];
  /** Per row: the cell holds the upper half of a two-cell wild. */
  wildTop: boolean[];
  spinning: boolean;
  /** Reel index -- reels to the right keep spinning a little longer. */
  stopDelay: number;
  /** Per row: part of a winning line. Only read while `dimLosers` is on. */
  winning: boolean[];
  dimLosers: boolean;
};

/** One column of the machine: a blur strip that the result drops in over. */
export function Reel({ cells, wildTop, spinning, stopDelay, winning, dimLosers }: ReelProps) {
  const scale = useDesignScale();
  const [filler] = useState(makeFiller);

  const spinY = useSharedValue(0);
  const dropY = useSharedValue(0);
  const fillerOpacity = useSharedValue(0);
  const resultOpacity = useSharedValue(1);

  useEffect(() => {
    if (spinning) {
      resultOpacity.value = 0;
      fillerOpacity.value = 1;
      spinY.value = 0;
      spinY.value = withRepeat(
        withTiming(FILLER_LENGTH * PITCH, {
          duration: FILLER_LENGTH * FILLER_CELL_MS,
          easing: Easing.linear,
        }),
        -1,
      );
      return;
    }

    // The board already holds the new cells -- the blur strip is simply hiding
    // them until this reel's turn to land.
    dropY.value = -(GRID.height + PITCH);
    resultOpacity.value = withDelay(stopDelay, withTiming(1, { duration: 0 }));
    dropY.value = withDelay(
      stopDelay,
      withSequence(
        withTiming(OVERSHOOT, { duration: DROP_MS, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: SETTLE_MS, easing: Easing.out(Easing.quad) }),
      ),
    );
    fillerOpacity.value = withDelay(stopDelay + DROP_MS, withTiming(0, { duration: 0 }));

    const timer = setTimeout(() => cancelAnimation(spinY), stopDelay + DROP_MS + SETTLE_MS);
    return () => clearTimeout(timer);
  }, [spinning, stopDelay, spinY, dropY, fillerOpacity, resultOpacity]);

  const fillerStyle = useAnimatedStyle(() => ({
    opacity: fillerOpacity.value,
    transform: [{ translateY: spinY.value * scale }],
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: dropY.value * scale }],
  }));

  return (
    <View style={{ width: CELL * scale, height: GRID.height * scale, overflow: 'hidden' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            top: -FILLER_LENGTH * PITCH * scale,
            width: CELL * scale,
          },
          fillerStyle,
        ]}>
        {[...filler, ...filler].map((symbol, index) => (
          <Image
            key={index}
            source={SYMBOL_ART[symbol]}
            style={{ width: CELL * scale, height: CELL * scale, marginBottom: ROW_GAP * scale }}
            contentFit="contain"
          />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, resultStyle]}>
        {layOutColumn(cells, wildTop, winning).map((node) => (
          <Image
            key={node.row}
            source={SYMBOL_ART[node.cell]}
            style={{
              position: 'absolute',
              left: 0,
              top: node.top * scale,
              width: CELL * scale,
              height: node.height * scale,
              opacity: dimLosers && !node.winning ? 0.3 : 1,
            }}
            contentFit="contain"
          />
        ))}
      </Animated.View>
    </View>
  );
}

function makeFiller() {
  return Array.from(
    { length: FILLER_LENGTH },
    () => FILLER_POOL[Math.floor(Math.random() * FILLER_POOL.length)],
  );
}

type CellNode = { row: number; cell: Cell; top: number; height: number; winning: boolean };

/**
 * Turns a column into what actually gets drawn: regular cells one per row, and
 * a two-cell wild as a single tall image -- including the case where the window
 * only shows its lower half.
 */
function layOutColumn(column: Cell[], tops: boolean[], winning: boolean[]) {
  const nodes: CellNode[] = [];

  for (let row = 0; row < ROW_COUNT; row += 1) {
    const cell = column[row];
    if (cell !== WILD) {
      nodes.push({ row, cell, top: row * PITCH, height: CELL, winning: winning[row] });
      continue;
    }

    // The upper half already drew the whole thing.
    if (row > 0 && column[row - 1] === WILD && tops[row - 1]) continue;

    // A window can cut a pair, leaving only its lower half on screen; the art
    // then hangs a cell above the window and the clip takes care of the rest.
    const top = tops[row] ? row * PITCH : (row - 1) * PITCH;
    nodes.push({
      row,
      cell,
      top,
      height: WILD_HEIGHT,
      winning: winning[row] || (tops[row] && row + 1 < ROW_COUNT && winning[row + 1]),
    });
  }

  return nodes;
}
