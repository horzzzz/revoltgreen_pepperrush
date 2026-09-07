import { Image } from 'expo-image';
import { type ImageSourcePropType, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { GameColors } from '@/constants/theme';
import type { Pack } from '@/game/shop';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node I1:922;1:693 -- the narrow card Starter and Premium share. */
const TILE = { width: 160, padding: 8, radius: 15, gap: 8 } as const;
const ICON = { width: 90, height: 53 } as const;
const BUTTON = { width: 144, height: 58, fontSize: 14 } as const;

type PackTileProps = {
  pack: Pack;
  icon: ImageSourcePropType;
  /** The store's localized price, or the pack's placeholder while it loads. */
  priceLabel: string;
  /** This pack's purchase is in flight. */
  busy?: boolean;
  /** Store unavailable, or another pack's purchase is in flight. */
  disabled?: boolean;
  onBuy: (pack: Pack) => void;
};

/** One of the two side-by-side packs (Figma node 1:667). */
export function PackTile({ pack, icon, priceLabel, busy, disabled, onBuy }: PackTileProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.tile,
        {
          width: TILE.width * scale,
          padding: TILE.padding * scale,
          borderRadius: TILE.radius * scale,
          gap: TILE.gap * scale,
        },
      ]}>
      <View style={{ gap: 4 * scale, alignItems: 'center' }}>
        <Image
          source={icon}
          style={{ width: ICON.width * scale, height: ICON.height * scale }}
          contentFit="contain"
        />
        <View style={{ gap: 4 * scale, alignItems: 'center' }}>
          <AppText weight="bold" style={[styles.title, { fontSize: 16 * scale }]}>
            {pack.title}
          </AppText>
          <AppText style={[styles.description, { fontSize: 12 * scale }]}>
            {pack.description}
          </AppText>
        </View>
      </View>

      <GameButton
        {...BUTTON}
        label={busy ? '…' : priceLabel}
        dimmed={disabled}
        disabled={disabled}
        onPress={() => onBuy(pack)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 2,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    textAlign: 'center',
  },
});
