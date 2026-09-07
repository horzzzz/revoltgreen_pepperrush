import { StyleSheet, View } from 'react-native';

import { FreeCoinsBanner } from '@/components/shop/free-coins-banner';
import { PackTile } from '@/components/shop/pack-tile';
import { VipPackCard } from '@/components/shop/vip-pack-card';
import { GameColors } from '@/constants/theme';
import { addCoins } from '@/game/player';
import { FREE_COINS, PACKS, type Pack } from '@/game/shop';
import { useDesignScale } from '@/hooks/use-design-scale';

const STARTER_ICON = require('@/assets/images/shop/icon-starter.png');
const PREMIUM_ICON = require('@/assets/images/shop/icon-premium.png');

/** Node 1:922 -- the card, and node 1:688's own gap between its rows. */
const CARD = { width: 382, padding: 24, gap: 12, radius: 20 } as const;
const CONTENT_WIDTH = 334;
const ROW_GAP = 12;

const [starter, premium, vip] = PACKS;

/**
 * There is no payment backend behind this app -- "buying" a pack just grants
 * its coins locally, the same stub the daily bonus and the wheel use for
 * their own rewards.
 */
function grant(pack: Pack) {
  addCoins(pack.coins);
}

/** The shop card (Figma node 1:922). */
export function ShopPanel() {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          gap: CARD.gap * scale,
          borderRadius: CARD.radius * scale,
        },
      ]}>
      <View style={[styles.rows, { width: CONTENT_WIDTH * scale, gap: ROW_GAP * scale }]}>
        <FreeCoinsBanner amount={FREE_COINS} onClaim={() => addCoins(FREE_COINS)} />

        <View style={[styles.pair, { gap: ROW_GAP * scale }]}>
          <PackTile pack={starter} icon={STARTER_ICON} onBuy={grant} />
          <PackTile pack={premium} icon={PREMIUM_ICON} onBuy={grant} />
        </View>

        <VipPackCard pack={vip} onBuy={grant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  rows: {
    alignItems: 'center',
  },
  pair: {
    flexDirection: 'row',
  },
});
