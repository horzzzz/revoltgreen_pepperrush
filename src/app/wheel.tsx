import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/ui/game-button';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { WheelOfLuck } from '@/components/wheel/wheel-of-luck';
import { SplashColors } from '@/constants/theme';
import {
  formatCountdown,
  landingAngle,
  pickSector,
  SPIN_COOLDOWN_MS,
  SPIN_MS,
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

type Phase = 'idle' | 'spinning' | 'cooldown';

/** Wheel of Luck (Figma nodes 1:217 idle / 1:227 on cooldown). */
export default function WheelScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const angle = useSharedValue(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState(SPIN_COOLDOWN_MS);

  const endsAt = useRef(0);

  // The cooldown is in-memory only -- it resets when the screen unmounts, and
  // will move into stored player state once the economy exists.
  useEffect(() => {
    if (phase !== 'cooldown') return;
    const tick = () => setRemaining(endsAt.current - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const finishSpin = useCallback(() => {
    endsAt.current = Date.now() + SPIN_COOLDOWN_MS;
    setPhase('cooldown');
  }, []);

  const spin = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('spinning');
    angle.value = withTiming(
      landingAngle(angle.value, pickSector()),
      { duration: SPIN_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishSpin)();
      },
    );
  }, [phase, angle, finishSpin]);

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
        <WheelOfLuck angle={angle} />
        <View style={{ flex: SPACE_BELOW }} />

        <GameButton
          {...BUTTON}
          label={phase === 'cooldown' ? formatCountdown(remaining) : 'Spin'}
          onPress={spin}
          dimmed={phase === 'cooldown'}
          disabled={phase !== 'idle'}
        />
      </View>

      <ScreenTopBar title="Wheel of Luck" onBack={() => router.back()} />
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
});
