import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopPanel } from '@/components/shop/shop-panel';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { SplashColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

// Same background as the menu -- see leaderboard.tsx for why this one is reused.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Node 1:922 -- the card sits 24 under the bar and hugs a 24pt side margin. */
const PANEL_TOP = 24;
const PANEL_MARGIN = 24;

/** Shop (Figma node 1:919). */
export default function ShopScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View
        style={[
          styles.panelSlot,
          { top: topBarHeight + PANEL_TOP * scale, paddingHorizontal: PANEL_MARGIN * scale },
        ]}>
        <ShopPanel />
      </View>

      <ScreenTopBar title="Shop" onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  panelSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
