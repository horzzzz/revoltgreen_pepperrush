import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { FreeCoinsBanner } from '@/components/shop/free-coins-banner';
import { PackTile } from '@/components/shop/pack-tile';
import { VipPackCard } from '@/components/shop/vip-pack-card';
import { GameColors } from '@/constants/theme';
import { useBilling } from '@/game/billing';
import { addCoins } from '@/game/player';
import { FREE_COINS, PACKS } from '@/game/shop';
import { useDesignScale } from '@/hooks/use-design-scale';

const STARTER_ICON = require('@/assets/images/shop/icon-starter.png');
const PREMIUM_ICON = require('@/assets/images/shop/icon-premium.png');

/** Node 1:922 -- the card, and node 1:688's own gap between its rows. */
const CARD = { width: 382, padding: 24, gap: 12, radius: 20 } as const;
const CONTENT_WIDTH = 334;
const ROW_GAP = 12;

const [starter, premium, vip] = PACKS;

/** The shop card (Figma node 1:922). */
export function ShopPanel() {
  const scale = useDesignScale();
  const { connected, priceFor, pendingSku, buy, error } = useBilling();

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
          <PackTile
            pack={starter}
            icon={STARTER_ICON}
            priceLabel={priceFor(starter) ?? starter.fallbackPrice}
            busy={pendingSku === starter.productId}
            disabled={!connected || (pendingSku !== null && pendingSku !== starter.productId)}
            onBuy={buy}
          />
          <PackTile
            pack={premium}
            icon={PREMIUM_ICON}
            priceLabel={priceFor(premium) ?? premium.fallbackPrice}
            busy={pendingSku === premium.productId}
            disabled={!connected || (pendingSku !== null && pendingSku !== premium.productId)}
            onBuy={buy}
          />
        </View>

        <VipPackCard
          pack={vip}
          priceLabel={priceFor(vip) ?? vip.fallbackPrice}
          busy={pendingSku === vip.productId}
          disabled={!connected || (pendingSku !== null && pendingSku !== vip.productId)}
          onBuy={buy}
        />

        {error ? (
          <AppText style={styles.error}>{error}</AppText>
        ) : !connected ? (
          <AppText style={styles.notice}>Connecting to the store…</AppText>
        ) : null}
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
  notice: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  error: {
    fontSize: 12,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
