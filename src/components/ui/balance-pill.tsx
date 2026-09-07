import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useCoins } from '@/game/player';
import { formatCoins } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const PILL_ASSET = require('@/assets/images/menu/pill.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node I1:190;1:476 -- the coin balance pill. Same art on every screen's bar. */
const PILL = { width: 130, height: 36 } as const;

/**
 * The coin balance pill. Reads the shared player store, so every bar that
 * renders it shows the same number.
 */
export function BalancePill() {
  const scale = useDesignScale();
  const balance = formatCoins(useCoins());

  return (
    <View
      style={[
        styles.pill,
        { width: PILL.width * scale, height: PILL.height * scale, paddingHorizontal: 12 * scale },
      ]}
      accessibilityLabel={`Balance ${balance}`}>
      <Image source={PILL_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
      <AppText style={{ fontSize: 18 * scale }}>{balance}</AppText>
      <Image
        source={COIN_ASSET}
        style={{ width: 21 * scale, height: 20 * scale }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
