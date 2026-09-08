import { Image } from 'expo-image';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useBreathe, useGlow } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
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
  const idle = !disabled && !auto;

  // A hold that turns into autospin ends with the finger lifting, and RN
  // reports that lift as a press. Without this, releasing the hold immediately
  // fires `onStopAuto` and kills the autospin you just started. The flag is
  // set when the long-press fires and swallows exactly the one press that
  // closes the same gesture; every press after that (reset in `onPressIn`)
  // counts as a real tap again.
  const startedAutoRef = useRef(false);

  const handlePressIn = () => {
    startedAutoRef.current = false;
  };

  const handleLongPress = () => {
    startedAutoRef.current = true;
    onHold();
  };

  const handlePress = () => {
    if (startedAutoRef.current) {
      startedAutoRef.current = false;
      return;
    }
    if (auto) onStopAuto();
    else onSpin();
  };
  // The button waiting to be pressed: a deeper breath than the app's other
  // idle pulses, backed by a green halo that swells behind the plate -- the
  // spin button is the one control the whole screen is built around, so it
  // gets the loudest resting state.
  const breatheStyle = useBreathe(idle, 0.06);
  const glowStyle = useGlow(idle, 0.4);

  const caption = auto
    ? autospinLeft === Infinity
      ? 'TAP TO STOP'
      : `${autospinLeft} LEFT - TAP TO STOP`
    : 'HOLD FOR AUTO';

  return (
    <View style={[styles.container, { gap: CAPTION_GAP * scale }]}>
      <PressableScale
        onPressIn={handlePressIn}
        onPress={handlePress}
        onLongPress={auto ? undefined : handleLongPress}
        delayLongPress={HOLD_MS}
        disabled={disabled && !auto}
        accessibilityRole="button"
        accessibilityLabel={auto ? 'Stop autospin' : 'Spin'}
        accessibilityState={{ disabled: disabled && !auto }}
        style={{ width: BUTTON.width * scale, height: BUTTON.height * scale }}>
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, { borderRadius: (BUTTON.width * scale) / 2 }, glowStyle]}
        />
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
  // A flat green disc behind the plate -- no shadow or elevation (those are
  // the one thing the effects layer never asks for on a moving/animating
  // node); the swell comes purely from the pulsing opacity.
  glow: {
    position: 'absolute',
    top: '18%',
    left: '18%',
    right: '18%',
    bottom: '18%',
    backgroundColor: GameColors.chipGlow,
  },
});
