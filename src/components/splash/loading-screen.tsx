import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { SplashColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const BG_ASSET = require('@/assets/images/splash/bg.jpg');
const HI_ASSET = require('@/assets/images/splash/hi.png');

const PROGRESS_MS = 2000;

/** Node 1:172 -- the "HI! LET'S MAKE TODAY LUCKY!" lockup. */
const HI = { width: 289.649, height: 100.4, rotation: '-0.67deg' } as const;
/** Node 1:234 -- progress bar, and the gap down to the "Loading" label. */
const BAR = { width: 382, height: 27, border: 4, radius: 15, fillRadius: 12, labelGap: 12 } as const;
/** Vertical air between the lockup and the bar (806 - 668.68 - 100.4). */
const HI_TO_BAR = 36.92;
/** Distance from the label baseline box to the frame bottom, minus the home indicator. */
const BOTTOM_GAP = 26;

type LoadingScreenProps = {
  onDone: () => void;
};

/** Progress screen shown right after the native splash (Figma node 1:169). */
export function LoadingScreen({ onDone }: LoadingScreenProps) {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [percent, setPercent] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    progress.value = withTiming(100, { duration: PROGRESS_MS, easing: Easing.linear });
    // Advance on a plain timer rather than the animation's completion callback
    // -- the visual bar is decorative; this is the source of truth.
    const timer = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, PROGRESS_MS);
    return () => clearTimeout(timer);
  }, [progress, onDone]);

  // Only crosses back to JS when the whole percent changes, so the label costs
  // ~100 renders over the whole run instead of one per frame.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (value, previous) => {
      if (value !== previous) runOnJS(setPercent)(value);
    },
  );

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View style={[styles.stack, { bottom: insets.bottom + BOTTOM_GAP * scale }]}>
        <Image
          source={HI_ASSET}
          style={{
            width: HI.width * scale,
            aspectRatio: HI.width / HI.height,
            transform: [{ rotate: HI.rotation }],
          }}
          contentFit="contain"
        />

        <View
          style={[
            styles.track,
            {
              marginTop: HI_TO_BAR * scale,
              width: BAR.width * scale,
              height: BAR.height * scale,
              borderWidth: BAR.border * scale,
              borderRadius: BAR.radius * scale,
            },
          ]}>
          <Animated.View
            style={[styles.fill, { borderRadius: BAR.fillRadius * scale }, fillStyle]}>
            <LinearGradient
              colors={[SplashColors.fillEdge, SplashColors.fillMid, SplashColors.fillEdge]}
              locations={[0, 0.43756, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <AppText style={{ marginTop: BAR.labelGap * scale, fontSize: 24 * scale }}>
          Loading {percent}%
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
  },
  stack: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  track: {
    backgroundColor: SplashColors.track,
    borderColor: SplashColors.trackBorder,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
});
