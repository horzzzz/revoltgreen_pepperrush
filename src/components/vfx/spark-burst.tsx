/**
 * A one-shot spray of particles, used for every "something just paid out"
 * moment: the centre of the machine on a win, a pot taking a chili, the wheel
 * settling on a prize.
 *
 * The design that makes it cheap: **one** shared value for the whole burst.
 * `progress` runs 0 -> 1 once, and each particle's `useAnimatedStyle` derives
 * its own position from that single number plus a handful of plain constants
 * it was handed (angle, distance, delay, spin, colour). So N particles cost N
 * style evaluations per frame on the UI thread and exactly one animation --
 * not N animations racing each other.
 *
 * Consequences worth knowing:
 *
 *   - the pool is fixed for the life of the component, so nothing mounts or
 *     unmounts while the game is running;
 *   - a replay is a reset of that one value, so two wins in a row can never
 *     leave two bursts stacked on screen;
 *   - at rest `progress` is 0, every particle computes opacity 0, and the
 *     whole layer is invisible without being unmounted.
 *
 * Particles are plain `Animated.View`s with a background colour -- no images,
 * no shadows, no `elevation`. On Android a shadow on a moving view is the
 * single most expensive thing you can ask for, and this is the layer that
 * would ask for it 24 times over.
 */

import { useEffect, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SPARK_COLORS } from '@/constants/vfx';
import { useDesignScale } from '@/hooks/use-design-scale';

export type SparkShape = 'spark' | 'confetti';

type SparkBurstProps = {
  /** Bump this to replay. 0 means "has not fired yet" and stays invisible. */
  trigger: number;
  count: number;
  /** How far the outermost particle travels, in design units. */
  radius: number;
  /** Particle size in design units; confetti is drawn half as wide. */
  size?: number;
  duration?: number;
  shape?: SparkShape;
  colors?: readonly string[];
  /** Extra downward drift by the end of the flight, as a share of `radius`. */
  gravity?: number;
  /** Where the burst sits. Defaults to filling its parent; it fires from the centre. */
  style?: StyleProp<ViewStyle>;
};

type Particle = {
  angle: number;
  distance: number;
  /** Share of the flight this particle waits out before it starts. */
  delay: number;
  spin: number;
  size: number;
  color: string;
};

export function SparkBurst({
  trigger,
  count,
  radius,
  size = 9,
  duration = 900,
  shape = 'spark',
  colors = SPARK_COLORS,
  gravity = 0.45,
  style,
}: SparkBurstProps) {
  const scale = useDesignScale();
  const progress = useSharedValue(0);

  // Re-rolled per burst so two wins in a row do not throw the same shape
  // twice. `trigger` is the seed rather than a bare cache-buster, which keeps
  // the shape reproducible and the whole thing a pure function of its props.
  // Plain numbers, not hooks -- the pool size never changes, so the hook count
  // below stays constant.
  const particles = useMemo(
    () => makeParticles(trigger, count, radius, size, colors),
    [trigger, count, radius, size, colors],
  );

  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (trigger <= 0) return;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.quad) });
    return () => cancelAnimation(progress);
  }, [trigger, duration, progress]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {particles.map((particle, index) => (
        <Spark
          key={index}
          particle={particle}
          progress={progress}
          scale={scale}
          gravity={gravity}
          shape={shape}
        />
      ))}
    </Animated.View>
  );
}

type SparkProps = {
  particle: Particle;
  progress: SharedValue<number>;
  scale: number;
  gravity: number;
  shape: SparkShape;
};

function Spark({ particle, progress, scale, gravity, shape }: SparkProps) {
  const width = particle.size * (shape === 'confetti' ? 0.55 : 1) * scale;
  const height = particle.size * scale;

  const animatedStyle = useAnimatedStyle(() => {
    // Each particle lives on its own slice of the shared flight, which is what
    // gives the burst a ragged edge instead of a single expanding ring.
    const span = 1 - particle.delay;
    const raw = (progress.value - particle.delay) / span;
    const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;

    const eased = 1 - (1 - t) * (1 - t);
    const travel = particle.distance * eased * scale;
    const fall = gravity * particle.distance * t * t * scale;

    // Always the same four transforms, in the same order, even at rest: a
    // style whose transform list changes shape between frames is the kind of
    // thing Reanimated has no reason to handle gracefully.
    return {
      // A quick fade in, then the long fade out that reads as the spark dying.
      opacity: t <= 0 ? 0 : t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88,
      transform: [
        { translateX: Math.cos(particle.angle) * travel },
        { translateY: Math.sin(particle.angle) * travel + fall },
        { rotate: `${particle.spin * t}deg` },
        { scale: t <= 0 ? 0 : 1 - 0.45 * t },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -width / 2,
          marginTop: -height / 2,
          width,
          height,
          borderRadius: shape === 'confetti' ? 1 * scale : height / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Particles are spread over the circle in even slices with a jitter inside
 * each, rather than fully at random -- a plain random spread clumps, and a
 * clumped burst reads as a bug rather than as a spray.
 *
 * The jitter comes from a seeded generator rather than `Math.random`, so the
 * pool is a pure function of the burst's id: the same burst re-rendered draws
 * the same shape, and the next one draws a different one.
 */
function makeParticles(
  seed: number,
  count: number,
  radius: number,
  size: number,
  colors: readonly string[],
): Particle[] {
  const random = seededRandom(seed * 2654435761 + count);
  const slice = (Math.PI * 2) / count;

  return Array.from({ length: count }, (_, index) => ({
    angle: index * slice + (random() - 0.5) * slice,
    distance: radius * (0.45 + random() * 0.55),
    delay: random() * 0.22,
    spin: (random() - 0.5) * 540,
    size: size * (0.6 + random() * 0.6),
    color: colors[Math.floor(random() * colors.length)],
  }));
}

/** mulberry32 -- small, fast, and good enough to scatter confetti with. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
