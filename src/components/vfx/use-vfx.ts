/**
 * The handful of moves every celebration in the app is built out of. Each hook
 * owns one shared value and hands back a finished animated style, so a screen
 * says `useShake(bigWinId)` instead of spelling out a sequence again.
 *
 * All of them follow the same two rules, which are what keeps the effects off
 * the JS thread and out of each other's way:
 *
 *   - only `transform` and `opacity` are ever animated;
 *   - a replay is `cancelAnimation` + reset + start, never a second animation
 *     layered on the first, so a win landing on top of the previous one
 *     restarts the move instead of fighting it.
 *
 * `trigger` is a counter, not a boolean: the same event happening twice in a
 * row still changes the number, which is exactly the case a boolean misses.
 */

import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { VFX } from '@/constants/vfx';

/**
 * Scales and fades in with a slight overshoot. `trigger` of 0 means "nothing
 * has happened yet" and leaves the subject hidden; a component that plays this
 * once on mount passes a constant 1.
 */
export function usePopIn(trigger: number, delay = 0, duration = VFX.popIn) {
  const pop = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pop);
    pop.value = 0;
    if (trigger <= 0) return;
    pop.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.back(2.2)) }));
    return () => cancelAnimation(pop);
  }, [trigger, delay, duration, pop]);

  return useAnimatedStyle(() => ({
    // The back easing overshoots past 1, which is where the pop comes from --
    // the opacity ramp is faster than the scale so it is never seen tiny.
    opacity: Math.min(1, pop.value * 2.5),
    transform: [{ scale: 0.6 + 0.4 * pop.value }],
  }));
}

/** Rises into place while fading in -- for a panel or a pile sliding on. */
export function useRiseIn(trigger: number, distance = 40, delay = 0, duration = 420) {
  const rise = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(rise);
    rise.value = 0;
    if (trigger <= 0) return;
    rise.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    return () => cancelAnimation(rise);
  }, [trigger, delay, duration, rise]);

  return useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: distance * (1 - rise.value) }],
  }));
}

/** A breathing scale while `active`, for a fixed number of cycles. */
export function usePulseScale(active: boolean, amount = 0.08, cycles = 3) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pulse);
    pulse.value = 0;
    if (!active) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: VFX.pulse, easing: Easing.inOut(Easing.quad) }),
      cycles * 2,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [active, cycles, pulse]);

  return useAnimatedStyle(() => ({ transform: [{ scale: 1 + amount * pulse.value }] }));
}

/** Opacity blinking a fixed number of times -- the glow around a win. */
export function useFlash(trigger: number, cycles = 2, peak = 1) {
  const flash = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(flash);
    flash.value = 0;
    if (trigger <= 0) return;
    flash.value = withRepeat(
      withTiming(peak, { duration: VFX.flash, easing: Easing.inOut(Easing.quad) }),
      cycles * 2,
      true,
    );
    return () => cancelAnimation(flash);
  }, [trigger, cycles, peak, flash]);

  return useAnimatedStyle(() => ({ opacity: flash.value }));
}

/**
 * A glow that keeps breathing for as long as `active` -- the wheel's rim while
 * it is turning. The second and last unbounded loop in the app (the other is
 * `useBreathe`), and like that one it is a single node that stops the instant
 * the flag drops.
 */
export function useGlow(active: boolean, peak = 0.85) {
  const glow = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(glow);
    glow.value = 0;
    if (!active) return;
    glow.value = withRepeat(
      withTiming(peak, { duration: VFX.pulse * 1.6, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(glow);
  }, [active, peak, glow]);

  return useAnimatedStyle(() => ({ opacity: glow.value }));
}

/** One squash-and-pop, for something that just took a hit. */
export function useBump(trigger: number, amount = 0.18) {
  const bump = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(bump);
    bump.value = 0;
    if (trigger <= 0) return;
    bump.value = withSequence(
      withTiming(1, { duration: VFX.bump * 0.35, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: VFX.bump * 0.65, easing: Easing.out(Easing.back(3)) }),
    );
    return () => cancelAnimation(bump);
  }, [trigger, bump]);

  return useAnimatedStyle(() => ({ transform: [{ scale: 1 + amount * bump.value }] }));
}

/**
 * A damped shake. One linear ramp drives both axes, with the amplitude falling
 * off across it, so the whole thing is a single timing rather than a chain of
 * a dozen little ones.
 */
export function useShake(trigger: number, amplitude = 6) {
  const shake = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(shake);
    shake.value = 0;
    if (trigger <= 0) return;
    shake.value = withTiming(1, { duration: VFX.shake, easing: Easing.linear });
    return () => cancelAnimation(shake);
  }, [trigger, shake]);

  return useAnimatedStyle(() => {
    const t = shake.value;
    const damping = (1 - t) * (1 - t);
    return {
      transform: [
        { translateX: Math.sin(t * Math.PI * 8) * amplitude * damping },
        { translateY: Math.cos(t * Math.PI * 6) * amplitude * 0.55 * damping },
      ],
    };
  });
}

/**
 * The one animation in the app that runs forever: the spin button's idle
 * breath. It is a single node on the UI thread and stops the moment `active`
 * goes false (the reels start, or the balance runs dry).
 */
export function useBreathe(active: boolean, amount = 0.03) {
  const breath = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(breath);
    breath.value = 0;
    if (!active) return;
    breath.value = withRepeat(
      withTiming(1, { duration: VFX.breathe, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [active, breath]);

  return useAnimatedStyle(() => ({ transform: [{ scale: 1 + amount * breath.value }] }));
}
