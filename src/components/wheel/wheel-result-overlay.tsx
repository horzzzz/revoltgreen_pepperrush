import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { CountUpText, formatWhole } from '@/components/ui/count-up-text';
import { GameButton } from '@/components/ui/game-button';
import { usePopIn, useRiseIn, useShake } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import type { WheelReward } from '@/game/wheel';
import { useDesignScale } from '@/hooks/use-design-scale';

const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Mirrors the win card on the game screen (node 1:465). */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const COIN = { width: 64, height: 62 } as const;
const CONTINUE = { width: 382, height: 94, fontSize: 40 } as const;

const CARD_DELAY = 110;
const BUTTON_DELAY = 240;
const COUNT_MS = 700;

type WheelResultOverlayProps = {
  reward: WheelReward;
  onContinue: () => void;
};

/** Shown over the wheel once it settles, with whatever the sector paid out. */
export function WheelResultOverlay({ reward, onContinue }: WheelResultOverlayProps) {
  const scale = useDesignScale();

  const lost = reward.kind === 'nothing';
  // The overlay is mounted once per result, so mounting is the trigger. A
  // losing card gets a shake where a winning one gets a pop.
  const titlePopStyle = usePopIn(lost ? 0 : 1);
  const titleShakeStyle = useShake(lost ? 1 : 0, 5);
  const cardStyle = usePopIn(1, CARD_DELAY);
  const buttonStyle = useRiseIn(1, 24 * scale, BUTTON_DELAY);

  const title =
    reward.kind === 'coins'
      ? 'You won'
      : reward.kind === 'freeSpins'
        ? 'Free spins!'
        : 'No luck this time';

  return (
    <View style={[styles.container, { gap: 36 * scale }]}>
      <Animated.View style={lost ? titleShakeStyle : titlePopStyle}>
        <AppText weight="bold" style={[styles.title, { fontSize: 40 * scale }]}>
          {title}
        </AppText>
      </Animated.View>

      {reward.kind !== 'nothing' ? (
        <Animated.View
          style={[
            styles.card,
            {
              width: CARD.width * scale,
              padding: CARD.padding * scale,
              borderRadius: CARD.radius * scale,
              gap: 10 * scale,
            },
            cardStyle,
          ]}>
          {reward.kind === 'coins' ? (
            <Image
              source={COIN_ASSET}
              style={{ width: COIN.width * scale, height: COIN.height * scale }}
              contentFit="contain"
            />
          ) : null}
          {reward.kind === 'coins' ? (
            <CountUpText
              value={reward.coins}
              duration={COUNT_MS}
              format={formatWhole}
              weight="bold"
              style={{ fontSize: 56 * scale }}
            />
          ) : (
            <AppText weight="bold" style={{ fontSize: 56 * scale }}>
              {`${reward.count} SPINS`}
            </AppText>
          )}
        </Animated.View>
      ) : null}

      <Animated.View style={buttonStyle}>
        <GameButton {...CONTINUE} label="Continue" onPress={onContinue} />
      </Animated.View>
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
