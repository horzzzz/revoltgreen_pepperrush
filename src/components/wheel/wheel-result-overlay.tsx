import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { GameColors } from '@/constants/theme';
import type { WheelReward } from '@/game/wheel';
import { useDesignScale } from '@/hooks/use-design-scale';

const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Mirrors the win card on the game screen (node 1:465). */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const COIN = { width: 64, height: 62 } as const;
const CONTINUE = { width: 382, height: 94, fontSize: 40 } as const;

type WheelResultOverlayProps = {
  reward: WheelReward;
  onContinue: () => void;
};

/** Shown over the wheel once it settles, with whatever the sector paid out. */
export function WheelResultOverlay({ reward, onContinue }: WheelResultOverlayProps) {
  const scale = useDesignScale();

  const title =
    reward.kind === 'coins'
      ? 'You won'
      : reward.kind === 'freeSpins'
        ? 'Free spins!'
        : 'No luck this time';

  return (
    <View style={[styles.container, { gap: 36 * scale }]}>
      <AppText weight="bold" style={[styles.title, { fontSize: 40 * scale }]}>
        {title}
      </AppText>

      {reward.kind !== 'nothing' ? (
        <View
          style={[
            styles.card,
            {
              width: CARD.width * scale,
              padding: CARD.padding * scale,
              borderRadius: CARD.radius * scale,
              gap: 10 * scale,
            },
          ]}>
          {reward.kind === 'coins' ? (
            <Image
              source={COIN_ASSET}
              style={{ width: COIN.width * scale, height: COIN.height * scale }}
              contentFit="contain"
            />
          ) : null}
          <AppText weight="bold" style={{ fontSize: 56 * scale }}>
            {reward.kind === 'coins' ? String(reward.coins) : `${reward.count} SPINS`}
          </AppText>
        </View>
      ) : null}

      <GameButton {...CONTINUE} label="Continue" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
  },
});
