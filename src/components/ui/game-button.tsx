import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useBreathe, useGlow } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';
import type { SfxId } from '@/game/audio/sfx';

const BUTTON_ASSET = require('@/assets/images/ui/button.png');

type GameButtonProps = {
  label: string;
  /** Design units from the Figma frame; the plate stretches to fill them. */
  width: number;
  height: number;
  fontSize: number;
  onPress?: () => void;
  /** Node 1:358 -- the plate at half opacity while the action is unavailable. */
  dimmed?: boolean;
  disabled?: boolean;
  /** Forwarded to `PressableScale` -- override for a Back/Close-flavoured plate (e.g. "Main Menu"). */
  sfx?: SfxId;
  /**
   * The call-to-action treatment: a slow breath plus a green halo pulsing
   * behind the plate. For the one primary button on a screen (the menu's
   * Play) -- matches the game screen's spin button at rest.
   */
  emphasis?: boolean;
};

/**
 * The green plate used for Play (node 1:355) and Claim (node 1:361). Both crop
 * the same texture and then stretch it to their own box, so one asset with
 * `contentFit: fill` reproduces either.
 */
export function GameButton({
  label,
  width,
  height,
  fontSize,
  onPress,
  dimmed = false,
  disabled = false,
  sfx,
  emphasis = false,
}: GameButtonProps) {
  const scale = useDesignScale();

  const active = emphasis && !disabled;
  const breatheStyle = useBreathe(active, 0.035);
  const glowStyle = useGlow(active, 0.4);

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      sfx={sfx}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.button, { width: width * scale, height: height * scale }]}>
      {active ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, { borderRadius: 18 * scale }, glowStyle]}
        />
      ) : null}
      <Animated.View style={[StyleSheet.absoluteFill, active && breatheStyle]}>
        <Image
          source={BUTTON_ASSET}
          style={[StyleSheet.absoluteFill, dimmed && styles.dimmed]}
          contentFit="fill"
        />
        <View style={styles.label}>
          <AppText weight="bold" style={{ fontSize: fontSize * scale }}>
            {label}
          </AppText>
        </View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
  // Flat green plate behind the button -- swells via opacity only, no shadow.
  glow: {
    position: 'absolute',
    top: '10%',
    left: '4%',
    right: '4%',
    bottom: '10%',
    backgroundColor: GameColors.chipGlow,
  },
});
