import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SparkBurst } from '@/components/vfx/spark-burst';
import { useFlash, useGlow, useShake } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import { SPARKS } from '@/constants/vfx';
import { SECTOR_ANGLE } from '@/game/wheel';
import { useDesignScale } from '@/hooks/use-design-scale';

const SECTORS_ASSET = require('@/assets/images/wheel/sectors.png');
const RING_ASSET = require('@/assets/images/wheel/ring.png');
const CENTER_ASSET = require('@/assets/images/wheel/center.png');
const ARROW_ASSET = require('@/assets/images/wheel/arrow.png');

/** Node 1:221 -- `wheel_all`, and where each layer sits inside it. */
const WHEEL = { width: 382, height: 394.025 } as const;
/** Node 1:874 -- sectors and their labels, exported as one piece. */
const SECTORS = { x: 30, y: 36, width: 322, height: 322.936 } as const;
/** Node 1:846 -- the rim. Drawn over the sectors. */
const RING = { x: 0, y: 12, size: 382 } as const;
/** Node 1:879. */
const CENTER = { x: 157, y: 163, size: 68 } as const;
/** Node 1:877. */
const ARROW = { x: 171, y: 0, width: 40, height: 70 } as const;

/** How far the pointer is knocked back as a sector goes past, in degrees. */
const ARROW_KICK = 13;
/** How far the prize confetti scatters from the middle of the wheel. */
const BURST_RADIUS = 190;

type WheelOfLuckProps = {
  /** Rotation of the sector disc in degrees. Only this layer turns. */
  angle: SharedValue<number>;
  /** The disc is turning -- the rim breathes while it does. */
  spinning: boolean;
  /** Bumped when a spin pays out: the rim flashes and confetti goes up. */
  winId: number;
  /** Bumped when it lands on FAIL: the whole wheel shudders instead. */
  failId: number;
};

export function WheelOfLuck({ angle, spinning, winId, failId }: WheelOfLuckProps) {
  const scale = useDesignScale();

  const shakeStyle = useShake(failId, 6);
  const rimGlowStyle = useGlow(spinning);
  const rimFlashStyle = useFlash(winId, 3);

  // The pointer's tick. `useAnimatedReaction` watches which sector is under it
  // and kicks the arrow whenever that number changes -- roughly sixty times
  // across a spin, and not one of them crosses onto the JS thread.
  const tick = useSharedValue(0);
  useAnimatedReaction(
    () => Math.floor(angle.value / SECTOR_ANGLE),
    (current, previous) => {
      if (previous === null || current === previous) return;
      tick.value = withSequence(
        withTiming(1, { duration: 45, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 130, easing: Easing.out(Easing.back(3)) }),
      );
    },
  );

  const sectorsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-ARROW_KICK * tick.value}deg` }],
  }));

  const rim = {
    position: 'absolute',
    left: RING.x * scale,
    top: RING.y * scale,
    width: RING.size * scale,
    height: RING.size * scale,
  } as const;

  return (
    <Animated.View
      style={[{ width: WHEEL.width * scale, height: WHEEL.height * scale }, shakeStyle]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: SECTORS.x * scale,
            top: SECTORS.y * scale,
            width: SECTORS.width * scale,
            height: SECTORS.height * scale,
          },
          sectorsStyle,
        ]}>
        <Image source={SECTORS_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
      </Animated.View>

      <Image
        source={RING_ASSET}
        style={rim}
        contentFit="contain"
      />

      {/* Two rings over the rim art: one breathing while it turns, one that
          flashes on a prize. Both are outlines, so they cost a border and
          nothing else. */}
      <Animated.View
        style={[
          rim,
          { borderRadius: (RING.size / 2) * scale, borderWidth: 3 * scale, borderColor: GameColors.chipGlow },
          rimGlowStyle,
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          rim,
          { borderRadius: (RING.size / 2) * scale, borderWidth: 5 * scale, borderColor: '#ffffff' },
          rimFlashStyle,
        ]}
        pointerEvents="none"
      />

      <Image
        source={CENTER_ASSET}
        style={{
          position: 'absolute',
          left: CENTER.x * scale,
          top: CENTER.y * scale,
          width: CENTER.size * scale,
          height: CENTER.size * scale,
        }}
        contentFit="contain"
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            left: ARROW.x * scale,
            top: ARROW.y * scale,
            width: ARROW.width * scale,
            height: ARROW.height * scale,
          },
          arrowStyle,
        ]}>
        <Image source={ARROW_ASSET} style={StyleSheet.absoluteFill} contentFit="contain" />
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          left: (RING.x + RING.size / 2 - BURST_RADIUS) * scale,
          top: (RING.y + RING.size / 2 - BURST_RADIUS) * scale,
          width: BURST_RADIUS * 2 * scale,
          height: BURST_RADIUS * 2 * scale,
        }}
        pointerEvents="none">
        <SparkBurst
          trigger={winId}
          count={SPARKS.wheel}
          radius={BURST_RADIUS}
          size={12}
          shape="confetti"
          duration={1200}
          gravity={0.8}
        />
      </View>
    </Animated.View>
  );
}
