import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PayoutMethodsPanel } from '@/components/exchange/payout-methods-panel';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { SplashColors } from '@/constants/theme';
import { usePayout } from '@/game/payout';
import { useDesignScale } from '@/hooks/use-design-scale';

// Reused from the menu so the backdrop does not jump on the way in.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Node 1:906 -- card sits 24 under the bar, hugs a 24pt side margin. */
const PANEL_TOP = 24;
const PANEL_MARGIN = 24;
const PANEL_BOTTOM = 24;

/** Add payout method (Figma node 1:902). Connecting a method is wired later. */
export default function AddPayoutMethodScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const connection = usePayout();

  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <ScrollView
        style={[styles.scroll, { top: topBarHeight + PANEL_TOP * scale }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: PANEL_MARGIN * scale,
            paddingBottom: insets.bottom + PANEL_BOTTOM * scale,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <PayoutMethodsPanel
          connectedKey={connection?.method ?? null}
          onConnect={(method) => router.push({ pathname: '/connect-payout', params: { method } })}
        />
      </ScrollView>

      <ScreenTopBar title="Add payout method" onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  scroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    alignItems: 'center',
  },
});
