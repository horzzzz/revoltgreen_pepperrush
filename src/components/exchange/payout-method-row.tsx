import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { SplashColors } from '@/constants/theme';
import type { PayoutMethodInfo } from '@/game/payout-methods';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node 1:766 -- the grey disc every method icon sits on. */
const DISC_BG = '#495963';

type PayoutMethodRowProps = {
  method: PayoutMethodInfo;
  connected: boolean;
  onConnect: (key: string) => void;
};

/** One row of the payout method list (Figma node 1:764). */
export function PayoutMethodRow({ method, connected, onConnect }: PayoutMethodRowProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.row,
        { borderWidth: 2 * scale, borderRadius: 15 * scale, padding: 10 * scale },
      ]}>
      <View style={[styles.identity, { gap: 8 * scale }]}>
        <View
          style={[
            styles.disc,
            { width: 40 * scale, height: 40 * scale, borderRadius: 20 * scale },
          ]}>
          {/* The library icons export on a square grey plate; clipping to a
              circle (as the design does, node 1:779) drops the corners. */}
          <View
            style={{
              width: 34 * scale,
              height: 34 * scale,
              borderRadius: 17 * scale,
              overflow: 'hidden',
            }}>
            <Image source={method.icon} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
        </View>
        <AppText numberOfLines={1} style={[styles.label, { fontSize: 14 * scale }]}>
          {method.label}
        </AppText>
      </View>

      <GameButton
        label={connected ? 'Connected' : 'Connect'}
        width={144}
        height={40}
        fontSize={20}
        dimmed={connected}
        onPress={() => onConnect(method.key)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: SplashColors.fillEdge,
    width: '100%',
    overflow: 'hidden',
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disc: {
    backgroundColor: DISC_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
