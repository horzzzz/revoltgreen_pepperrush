import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { LeaderboardColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const GIFT_ASSET = require('@/assets/images/daily/gift.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node 1:193. */
const CARD = { width: 382, padding: 24, radius: 20, gap: 36 } as const;
const GIFT = { width: 242, height: 251 } as const;
/** Node I1:193;1:339 -- the bordered strip under the gift. */
const NOTE = { radius: 15, border: 2, paddingVertical: 12, gap: 8 } as const;
const COIN = { width: 33, height: 32 } as const;
/** Node 1:361 -- the Claim plate is a touch shorter than the menu's Play. */
const CLAIM = { width: 334, height: 90, fontSize: 36 } as const;

type DailyBonusCardProps = {
  amount: number;
  onClaim?: () => void;
};

export function DailyBonusCard({ amount, onClaim }: DailyBonusCardProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
          borderWidth: 1 * scale,
          gap: CARD.gap * scale,
        },
      ]}>
      <View style={{ alignItems: 'center', gap: 12 * scale }}>
        <AppText weight="bold" style={[styles.title, { fontSize: 36 * scale }]}>
          Daily Bonus!
        </AppText>

        <View style={{ alignItems: 'center', gap: 24 * scale }}>
          <Image
            source={GIFT_ASSET}
            style={{ width: GIFT.width * scale, height: GIFT.height * scale }}
            contentFit="contain"
          />

          <View
            style={[
              styles.note,
              {
                borderRadius: NOTE.radius * scale,
                borderWidth: NOTE.border * scale,
                paddingVertical: NOTE.paddingVertical * scale,
                gap: NOTE.gap * scale,
              },
            ]}>
            {/* The design sets this one line in Georama; the app is one
                typeface throughout, so it stays GFS Neohellenic. */}
            <AppText style={{ fontSize: 20 * scale }}>We give you daily bonus!</AppText>

            <View style={[styles.reward, { gap: 6 * scale }]}>
              <Image
                source={COIN_ASSET}
                style={{ width: COIN.width * scale, height: COIN.height * scale }}
                contentFit="contain"
              />
              <AppText weight="bold" style={{ fontSize: 36 * scale }}>
                {amount}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <GameButton label="Claim" {...CLAIM} onPress={onClaim} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LeaderboardColors.panel,
    borderColor: LeaderboardColors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    textTransform: 'uppercase',
  },
  note: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderColor: LeaderboardColors.border,
    overflow: 'hidden',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
