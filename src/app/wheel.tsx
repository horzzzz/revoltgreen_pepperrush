import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/ui/game-button';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { WheelOfLuck } from '@/components/wheel/wheel-of-luck';
import { WheelResultOverlay } from '@/components/wheel/wheel-result-overlay';
import { GameColors, SplashColors } from '@/constants/theme';
import { playSfx, startSpinSound, stopSpinSound } from '@/game/audio/engine';
import {
  addCoins,
  addFreeSpins,
  canSpinWheel,
  consumeFreeSpin,
  getFreeSpins,
  markWheelSpin,
  wheelAvailableAt,
} from '@/game/player';
import {
  formatCountdown,
  landingAngle,
  pickSector,
  SPIN_MS,
  sectorReward,
  type WheelReward,
} from '@/game/wheel';
import { useDesignScale } from '@/hooks/use-design-scale';

// Reused from the menu so the backdrop does not jump on the way in.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Node 1:220 -- the plate under the wheel. */
const BUTTON = { width: 382, height: 94, fontSize: 40 } as const;
/** Node 1:217 -- air above and below the wheel, kept as the design's ratio. */
const SPACE_ABOVE = 157;
const SPACE_BELOW = 99;
/** Button sits 76 off the frame bottom, of which 34 is the home indicator. */
const BOTTOM_GAP = 42;
/** How long the wheel keeps the stage before the result card takes it. */
const REVEAL_DELAY_MS = 750;

/**
 * `revealing` is the beat between the disc stopping and the result card coming
 * up: the wheel is celebrating and the button has to stay locked, or a free
 * spin could be started straight through the celebration.
 */
type Phase = 'idle' | 'spinning' | 'revealing';

/** Wheel of Luck (Figma nodes 1:217 idle / 1:227 on cooldown). */
export default function WheelScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const angle = useSharedValue(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<WheelReward | null>(null);
  // Replay counters for the wheel's own celebration -- a prize flashes the rim
  // and throws confetti, a FAIL shudders instead.
  const [resultIds, setResultIds] = useState({ win: 0, fail: 0 });

  // The cooldown and the free-spin count both live in the player store; this
  // screen reads them imperatively and re-renders on a 1s tick, so the button
  // reflects them even mid-cooldown without leaning on store subscriptions.
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const landedRef = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => stopSpinSound, []);
  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const freeSpins = getFreeSpins();
  const hasFreeSpin = freeSpins > 0;
  const onCooldown = !canSpinWheel();
  // A free spin ignores the cooldown -- that is the whole point of it.
  const blocked = onCooldown && !hasFreeSpin;
  const remaining = wheelAvailableAt() - Date.now();

  const finishSpin = useCallback(() => {
    stopSpinSound();
    const reward = sectorReward(landedRef.current);
    if (reward.kind === 'coins') {
      addCoins(reward.coins);
      playSfx('reward-claim');
    } else if (reward.kind === 'freeSpins') {
      addFreeSpins(reward.count);
      playSfx('reward-claim');
    } else {
      playSfx('wheel-fail');
    }

    const won = reward.kind !== 'nothing';
    setResultIds((ids) => (won ? { ...ids, win: ids.win + 1 } : { ...ids, fail: ids.fail + 1 }));

    // The result card covers the whole screen, so it waits for the wheel to
    // finish celebrating -- otherwise the confetti is born behind a scrim.
    setPhase('revealing');
    revealTimer.current = setTimeout(() => {
      setResult(reward);
      setPhase('idle');
    }, REVEAL_DELAY_MS);
    tick();
  }, []);

  const spin = useCallback(() => {
    if (phase !== 'idle') return;
    // Live guard -- reads the store at the moment of the tap, so a stale render
    // cannot let a second spin through.
    const free = getFreeSpins() > 0;
    if (!free && !canSpinWheel()) return;

    if (free) consumeFreeSpin();
    else markWheelSpin();
    tick();

    setPhase('spinning');
    startSpinSound();
    landedRef.current = pickSector();
    angle.value = withTiming(
      landingAngle(angle.value, landedRef.current),
      { duration: SPIN_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishSpin)();
      },
    );
  }, [phase, angle, finishSpin]);

  const label = hasFreeSpin
    ? `Free spin (${freeSpins})`
    : onCooldown
      ? formatCountdown(remaining)
      : 'Spin';

  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View
        style={[
          styles.content,
          { paddingTop: topBarHeight, paddingBottom: insets.bottom + BOTTOM_GAP * scale },
        ]}>
        <View style={{ flex: SPACE_ABOVE }} />
        <WheelOfLuck
          angle={angle}
          spinning={phase === 'spinning'}
          winId={resultIds.win}
          failId={resultIds.fail}
        />
        <View style={{ flex: SPACE_BELOW }} />

        <GameButton
          {...BUTTON}
          label={label}
          onPress={spin}
          dimmed={blocked}
          disabled={phase !== 'idle' || blocked}
        />
      </View>

      <ScreenTopBar title="Wheel of Luck" onBack={() => router.back()} />

      {result ? (
        <View style={[StyleSheet.absoluteFill, styles.scrim]}>
          <WheelResultOverlay reward={result} onContinue={() => setResult(null)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  scrim: {
    backgroundColor: GameColors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
