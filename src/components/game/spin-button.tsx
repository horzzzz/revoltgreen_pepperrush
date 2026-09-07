import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useBreathe } from '@/components/vfx/use-vfx';
import { useDesignScale } from '@/hooks/use-design-scale';

const SPIN_ASSET = require('@/assets/images/game/spin.png');

/** Node 1:139 -- the plate, and node 1:140 -- the caption under it. */
const BUTTON = { width: 161, height: 158 } as const;
const CAPTION_GAP = 8;
const HOLD_MS = 350;

type SpinButtonProps = {
  onSpin: () => void;
  /** Held down: start autospinning. */
  onHold: () => void;
  /** Tapping while autospin runs stops it. */
  onStopAuto: () => void;
  disabled: boolean;
  /** Spins left, `Infinity` for the `max` option, `0` when autospin is off. */
  autospinLeft: number;
};

/** The spin button (Figma node 1:138). Hold it to hand over to autospin. */
export function SpinButton({
  onSpin,
  onHold,
  onStopAuto,
  disabled,
  autospinLeft,
}: SpinButtonProps) {
  const scale = useDesignScale();
  const auto = autospinLeft > 0;
  // The one animation in the app that loops without an end: a single node
  // breathing while the button is waiting to be pressed. It stops the moment
  // the reels start or the balance runs dry.
  const breatheStyle = useBreathe(!disabled && !auto);

  const caption = auto
    ? autospinLeft === Infinity
      ? 'TAP TO STOP'
      : `${autospinLeft} LEFT - TAP TO STOP`
    : 'HOLD FOR AUTO';

  return (
    <View style={[styles.container, { gap: CAPTION_GAP * scale }]}>
      <PressableScale
        onPress={auto ? onStopAuto : onSpin}
        onLongPress={auto ? undefined : onHold}
        delayLongPress={HOLD_MS}
        disabled={disabled && !auto}
        accessibilityRole="button"
        accessibilityLabel={auto ? 'Stop autospin' : 'Spin'}
        accessibilityState={{ disabled: disabled && !auto }}
        style={{ width: BUTTON.width * scale, height: BUTTON.height * scale }}>
        <Animated.View style={[StyleSheet.absoluteFill, breatheStyle]}>
          <Image
            source={SPIN_ASSET}
            style={[StyleSheet.absoluteFill, disabled && !auto && styles.dimmed]}
            contentFit="contain"
          />
        </Animated.View>
      </PressableScale>

      <AppText weight="bold" style={[styles.caption, { fontSize: 14 * scale }]}>
        {caption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  caption: {
    textAlign: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
});
