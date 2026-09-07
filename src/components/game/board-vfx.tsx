/**
 * Everything that lights up on the machine itself when a spin pays: the frame
 * glow, the spray of sparks, and the win amount in the middle of the reels.
 *
 * It is rendered by `ReelGrid` as the last child of the board box, which is
 * what puts it over the symbols. That is deliberately a paint-order trick and
 * not a `zIndex` -- see the note in `pot-row.tsx` about `zIndex` in React
 * Native not being scoped to a subtree, which is exactly the trap this file
 * would otherwise fall into, sitting under the bet panel and the overlays.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GRID, GRID_ORIGIN, MACHINE } from '@/components/game/board-layout';
import { AppText } from '@/components/ui/app-text';
import { CountUpText } from '@/components/ui/count-up-text';
import { SparkBurst } from '@/components/vfx/spark-burst';
import { useFlash } from '@/components/vfx/use-vfx';
import { GameColors, SplashColors } from '@/constants/theme';
import { SPARKS, WIN_POPUP, WIN_POPUP_LIFT } from '@/constants/vfx';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Middle of the reel window, in board-box units -- where a win reads from. */
const CENTER = {
  x: GRID_ORIGIN.x + GRID.width / 2,
  y: GRID_ORIGIN.y + GRID.height / 2,
} as const;

/** How far the sparks fly. Roughly the reel window's half-diagonal. */
const BURST_RADIUS = 160;
/** The box the amount is centred in, so it does not depend on the text height. */
const POPUP_BOX = 150;
const AMOUNT_SIZE = 56;
const CAPTION_SIZE = 18;
/** How fast the amount is pulled off when the next spin starts. */
const DISMISS_MS = 120;

/** Soft halo behind the amount, in place of a radial gradient RN cannot draw. */
const GLOW_OUTER = { width: 260, height: 116 } as const;
const GLOW_INNER = { width: 176, height: 82 } as const;

type BoardVfxProps = {
  /** Bumped on every paying spin -- drives the frame glow and the sparks. */
  winId: number;
  /** Amount for the centre popup, the id that replays it, and whether it is up. */
  popupWin: number;
  popupId: number;
  popupLive: boolean;
};

export function BoardVfx({ winId, popupWin, popupId, popupLive }: BoardVfxProps) {
  const scale = useDesignScale();
  const glowStyle = useFlash(winId, 2, 0.9);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: MACHINE.x * scale,
            top: MACHINE.y * scale,
            width: MACHINE.width * scale,
            height: MACHINE.height * scale,
            borderRadius: 26 * scale,
            borderWidth: 3 * scale,
            borderColor: GameColors.chipGlow,
          },
          glowStyle,
        ]}
      />

      <View
        style={{
          position: 'absolute',
          left: (CENTER.x - BURST_RADIUS) * scale,
          top: (CENTER.y - BURST_RADIUS) * scale,
          width: BURST_RADIUS * 2 * scale,
          height: BURST_RADIUS * 2 * scale,
        }}>
        <SparkBurst trigger={winId} count={SPARKS.win} radius={BURST_RADIUS} />
      </View>

      <WinAmountPopup amount={popupWin} popupId={popupId} live={popupLive} />
    </View>
  );
}

type WinAmountPopupProps = {
  amount: number;
  popupId: number;
  live: boolean;
};

/**
 * The win amount, centred on the reels.
 *
 * Four beats, all read from `WIN_POPUP` so the autospin loop can wait exactly
 * as long as this takes (see `use-slot-machine.ts`):
 *
 *   in     pop in past full size and settle back
 *   count  the digits roll up to the amount
 *   hold   a small breath, so the number is readable at rest
 *   out    drift up and fade
 *
 * `live` going false is the "a new spin started" signal: whatever is on screen
 * is pulled off in 120 ms, so the previous win can never be left hanging over
 * spinning reels no matter how fast the player taps. The amount stays put
 * while that happens, so the digits fade out reading what was won rather than
 * snapping to zero first.
 */
function WinAmountPopup({ amount, popupId, live }: WinAmountPopupProps) {
  const scale = useDesignScale();

  const pop = useSharedValue(0);
  const breath = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pop);
    cancelAnimation(breath);
    cancelAnimation(exit);

    if (!live || popupId <= 0 || amount <= 0) {
      // Dismissal rides the same `exit` the natural fade uses, just faster.
      // Winding `pop` back down instead would be a bug: by the time a spin
      // starts, a popup that already finished sits at exit = 1, and touching
      // `exit` to hide it would flash the amount back on screen first.
      breath.value = 0;
      exit.value = withTiming(1, { duration: DISMISS_MS, easing: Easing.in(Easing.quad) });
      return;
    }

    pop.value = 0;
    breath.value = 0;
    exit.value = 0;
    pop.value = withTiming(1, { duration: WIN_POPUP.in, easing: Easing.out(Easing.back(2.6)) });
    breath.value = withDelay(
      WIN_POPUP.in + WIN_POPUP.count,
      withSequence(
        withTiming(1, { duration: WIN_POPUP.hold / 2 }),
        withTiming(0, { duration: WIN_POPUP.hold / 2 }),
      ),
    );
    exit.value = withDelay(
      WIN_POPUP.in + WIN_POPUP.count + WIN_POPUP.hold,
      withTiming(1, { duration: WIN_POPUP.out, easing: Easing.in(Easing.quad) }),
    );

    return () => {
      cancelAnimation(pop);
      cancelAnimation(breath);
      cancelAnimation(exit);
    };
  }, [popupId, amount, live, pop, breath, exit]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 2.5) * (1 - exit.value),
    transform: [
      { translateY: -WIN_POPUP_LIFT * scale * exit.value },
      {
        scale:
          (0.45 + 0.55 * pop.value) * (1 + 0.04 * breath.value) * (1 - 0.1 * exit.value),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: (CENTER.y - POPUP_BOX / 2) * scale,
          height: POPUP_BOX * scale,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}>
      <View
        style={{
          position: 'absolute',
          width: GLOW_OUTER.width * scale,
          height: GLOW_OUTER.height * scale,
          borderRadius: (GLOW_OUTER.height / 2) * scale,
          backgroundColor: 'rgba(38,255,0,0.10)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: GLOW_INNER.width * scale,
          height: GLOW_INNER.height * scale,
          borderRadius: (GLOW_INNER.height / 2) * scale,
          backgroundColor: 'rgba(38,255,0,0.16)',
        }}
      />

      <AppText
        weight="bold"
        style={{
          fontSize: CAPTION_SIZE * scale,
          letterSpacing: 4 * scale,
          color: SplashColors.fillEdge,
        }}>
        WIN
      </AppText>
      <CountUpText
        value={amount}
        duration={WIN_POPUP.count}
        replayId={popupId}
        weight="bold"
        style={{
          fontSize: AMOUNT_SIZE * scale,
          textShadowColor: 'rgba(4,23,10,0.9)',
          textShadowRadius: 10 * scale,
          textShadowOffset: { width: 0, height: 2 * scale },
        }}
      />
    </Animated.View>
  );
}
