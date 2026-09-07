import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExchangePanel } from '@/components/exchange/exchange-panel';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { SplashColors } from '@/constants/theme';
import { EXCHANGE_MIN_USD, useUsd } from '@/game/player';
import { useDesignScale } from '@/hooks/use-design-scale';

// Reused from the menu so the backdrop does not jump on the way in.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Node 1:901 -- card sits 24 under the bar, hugs a 24pt side margin. */
const PANEL_TOP = 24;
const PANEL_MARGIN = 24;
const PANEL_BOTTOM = 24;

/** Exchange / payout (Figma node 1:898). */
export default function ExchangeScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const usd = useUsd();

  // Once the $ balance clears the exchange floor the screen is replaced by the
  // Maintenance modal (Figma node 1:194) -- exchanging is not available yet.
  if (usd >= EXCHANGE_MIN_USD) return <Redirect href="/maintenance" />;

  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View
        style={[
          styles.panelSlot,
          {
            top: topBarHeight + PANEL_TOP * scale,
            bottom: insets.bottom + PANEL_BOTTOM * scale,
            paddingHorizontal: PANEL_MARGIN * scale,
          },
        ]}>
        <ExchangePanel
          onPlay={() => router.push('/game')}
          onAddPayout={() => router.push('/add-payout-method')}
        />
      </View>

      <ScreenTopBar title="Exchange" onBack={() => router.back()} />
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
