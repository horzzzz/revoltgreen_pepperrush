/**
 * Confetti falling across the whole frame, for as long as the big-win screen
 * is up. Same one-shared-value trick as `spark-burst.tsx`: a single value ramps
 * up linearly, every piece offsets and speeds it by its own constants, and the
 * modulo wraps it back to the top -- so the rain is continuous but costs one
 * animation.
 *
 * It is one long ramp rather than a repeat, and that matters: with a repeat,
 * `fall` snapping back to 0 at the end of each pass puts a jump in
 * `(fall * speed + phase) % 1` for every piece whose speed is not exactly 1,
 * and the whole rain visibly teleports once a cycle. Ramping straight through
 * FALL_CYCLES leaves the modulo continuous. It is also bounded, so the loop
 * cannot outlive a missed cleanup the way `withRepeat(-1)` could.
 */

import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SPARK_COLORS, SPARKS } from '@/constants/vfx';

/** One top-to-bottom pass. */
const FALL_MS = 2600;
/** Enough passes to outlast any time a player spends on the win screen. */
const FALL_CYCLES = 8;
/** How far above and below the frame a piece is born and dies. */
const MARGIN = 60;

type ConfettiRainProps = {
  count?: number;
  colors?: readonly string[];
};

type Piece = {
  /** Horizontal position as a share of the frame width. */
  x: number;
  /** Where in the fall this piece starts, so they are not a single wave. */
  phase: number;
  /** Speed multiplier -- the near/far feel comes from this plus size. */
  speed: number;
  sway: number;
  swayCycles: number;
  spin: number;
  width: number;
  height: number;
  color: string;
};

export function ConfettiRain({ count = SPARKS.bigWin, colors = SPARK_COLORS }: ConfettiRainProps) {
  const { width, height } = useWindowDimensions();
  const fall = useSharedValue(0);

  const pieces = useMemo(() => makePieces(count, colors), [count, colors]);

  useEffect(() => {
    fall.value = 0;
    fall.value = withTiming(FALL_CYCLES, {
      duration: FALL_MS * FALL_CYCLES,
      easing: Easing.linear,
    });
    return () => cancelAnimation(fall);
  }, [fall]);

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, index) => (
        <Confetto key={index} piece={piece} fall={fall} width={width} height={height} />
      ))}
    </Animated.View>
  );
}

type ConfettoProps = {
  piece: Piece;
  fall: SharedValue<number>;
  width: number;
  height: number;
};

function Confetto({ piece, fall, width, height }: ConfettoProps) {
  const travel = height + MARGIN * 2;

  const animatedStyle = useAnimatedStyle(() => {
    const raw = (fall.value * piece.speed + piece.phase) % 1;
    const t = raw < 0 ? raw + 1 : raw;

    return {
      opacity: t < 0.08 ? t / 0.08 : t > 0.88 ? (1 - t) / 0.12 : 1,
      transform: [
        { translateY: -MARGIN + t * travel },
        { translateX: Math.sin(t * Math.PI * 2 * piece.swayCycles) * piece.sway },
        { rotate: `${piece.spin * t}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: piece.x * width,
          top: 0,
          width: piece.width,
          height: piece.height,
          borderRadius: 1,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}

function makePieces(count: number, colors: readonly string[]): Piece[] {
  return Array.from({ length: count }, (_, index) => ({
    // Spread across the width in even columns with a jitter, so the rain
    // covers the frame instead of clumping the way pure random does.
    x: (index + 0.5) / count + (Math.random() - 0.5) / count,
    phase: Math.random(),
    speed: 0.75 + Math.random() * 0.6,
    sway: 8 + Math.random() * 22,
    swayCycles: 1 + Math.random() * 2,
    spin: (Math.random() - 0.5) * 1080,
    width: 5 + Math.random() * 4,
    height: 9 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}
