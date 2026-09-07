import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { GameColors } from '@/constants/theme';
import type { Pack } from '@/game/shop';
import { useDesignScale } from '@/hooks/use-design-scale';

const ICON_ASSET = require('@/assets/images/shop/icon-vip.png');

/** Node I1:922;1:695 -- the full-width card, icon and text side by side. */
const CARD = { width: 334, padding: 8, radius: 15, gap: 8 } as const;
const ICON = { width: 106, height: 93 } as const;
const BUTTON = { width: 318, height: 108, fontSize: 24 } as const;

type VipPackCardProps = {
  pack: Pack;
  onBuy: (pack: Pack) => void;
};

/** The VIP pack (Figma node 1:674) -- the one row that spans the full card. */
export function VipPackCard({ pack, onBuy }: VipPackCardProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
          gap: CARD.gap * scale,
        },
      ]}>
      <View style={[styles.row, { gap: 8 * scale }]}>
        <Image
          source={ICON_ASSET}
          style={{ width: ICON.width * scale, height: ICON.height * scale }}
          contentFit="contain"
        />
        <View style={[styles.copy, { gap: 4 * scale }]}>
          <AppText weight="bold" style={[styles.title, { fontSize: 20 * scale }]}>
            {pack.title}
          </AppText>
          <AppText style={{ fontSize: 12 * scale }}>{pack.description}</AppText>
        </View>
      </View>

      <GameButton {...BUTTON} label={pack.price} onPress={() => onBuy(pack)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: GameColors.panelBorder,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  copy: {
    flex: 1,
  },
  title: {
    textTransform: 'uppercase',
  },
});
