import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { GameColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const ICON_ASSET = require('@/assets/images/shop/icon-free-coins.png');

/** Node I1:922;1:692 -- the banner row, no price, top of the list. */
const BANNER = { width: 334, height: 79, padding: 8, radius: 15, gap: 12 } as const;
const ICON = { width: 50, height: 50 } as const;

type FreeCoinsBannerProps = {
  amount: number;
  onClaim: () => void;
};

/** "1000 FREE COINS" banner (Figma node 1:681). */
export function FreeCoinsBanner({ amount, onClaim }: FreeCoinsBannerProps) {
  const scale = useDesignScale();

  return (
    <PressableScale
      onPress={onClaim}
      accessibilityRole="button"
      accessibilityLabel={`Claim ${amount} free coins`}
      style={[
        styles.banner,
        {
          width: BANNER.width * scale,
          height: BANNER.height * scale,
          padding: BANNER.padding * scale,
          borderRadius: BANNER.radius * scale,
          gap: BANNER.gap * scale,
        },
      ]}>
      <Image
        source={ICON_ASSET}
        style={{ width: ICON.width * scale, height: ICON.height * scale }}
        contentFit="contain"
      />
      <AppText style={[styles.label, { fontSize: 19.73 * scale }]}>
        {amount} FREE COINS
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GameColors.panelBorder,
    overflow: 'hidden',
  },
  label: {
    textTransform: 'uppercase',
  },
});
