import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
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
}: GameButtonProps) {
  const scale = useDesignScale();

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      sfx={sfx}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.button, { width: width * scale, height: height * scale }]}>
      <Image
        source={BUTTON_ASSET}
        style={[StyleSheet.absoluteFill, dimmed && styles.dimmed]}
        contentFit="fill"
      />
      <AppText weight="bold" style={{ fontSize: fontSize * scale }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
});
