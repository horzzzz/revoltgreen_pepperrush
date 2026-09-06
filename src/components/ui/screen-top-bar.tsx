import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { useDesignScale } from '@/hooks/use-design-scale';

const BACK_ASSET = require('@/assets/images/ui/icon-back.png');

const ICON_SIZE = 36;

type ScreenTopBarProps = {
  title: string;
  onBack?: () => void;
};

/** Back arrow with a centred title (Figma node 1:897). */
export function ScreenTopBar({ title, onBack }: ScreenTopBarProps) {
  const scale = useDesignScale();

  return (
    <TopBarShell>
      <View style={[styles.row, { height: ICON_SIZE * scale }]}>
        <PressableScale onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Image
            source={BACK_ASSET}
            style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
            contentFit="contain"
          />
        </PressableScale>

        {/* Centred on the bar rather than on the space left of the arrow, so it
            sits where the design puts it no matter how wide the title is. */}
        <View style={styles.titleSlot} pointerEvents="none">
          <AppText weight="bold" numberOfLines={1} style={[styles.title, { fontSize: 24 * scale }]}>
            {title}
          </AppText>
        </View>
      </View>
    </TopBarShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
