import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { SplashColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node 1:456 / 1:459 -- 42x22 track with a 14pt knob inset by 4. */
const TRACK = { width: 42, height: 22 } as const;
const KNOB = { size: 14, inset: 4 } as const;
/** The off state is the same artwork at half opacity. */
const OFF_OPACITY = 0.5;

const KNOB_GRADIENT = ['#FEFEFE', '#DECFF6'] as const;

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  const scale = useDesignScale();
  const travel = (TRACK.width - KNOB.size - KNOB.inset * 2) * scale;
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 160 });
  }, [value, progress]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * travel }],
  }));

  return (
    <PressableScale
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={{ opacity: value ? 1 : OFF_OPACITY }}>
      <LinearGradient
        colors={[SplashColors.fillEdge, SplashColors.fillMid, SplashColors.fillEdge]}
        locations={[0, 0.43756, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.track,
          {
            width: TRACK.width * scale,
            height: TRACK.height * scale,
            borderRadius: (TRACK.height / 2) * scale,
            padding: KNOB.inset * scale,
          },
        ]}>
        <Animated.View style={knobStyle}>
          <View
            style={{
              width: KNOB.size * scale,
              height: KNOB.size * scale,
              borderRadius: (KNOB.size / 2) * scale,
              overflow: 'hidden',
            }}>
            <LinearGradient colors={KNOB_GRADIENT} style={StyleSheet.absoluteFill} />
          </View>
        </Animated.View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
});
