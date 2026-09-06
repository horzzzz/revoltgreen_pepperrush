import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useDesignScale } from '@/hooks/use-design-scale';

const BUTTON_ASSET = require('@/assets/images/menu/button-play.png');

/** Node 1:355 -- the plate is artwork, the label sits on top of it. */
const BUTTON = { width: 382, height: 94, fontSize: 40 } as const;

type PlayButtonProps = {
  onPress?: () => void;
};

export function PlayButton({ onPress }: PlayButtonProps) {
  const scale = useDesignScale();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Play"
      style={[styles.button, { width: BUTTON.width * scale, height: BUTTON.height * scale }]}>
      <Image source={BUTTON_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
      <AppText weight="bold" style={{ fontSize: BUTTON.fontSize * scale }}>
        Play
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
