import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CountUpText } from '@/components/ui/count-up-text';
import { GameButton } from '@/components/ui/game-button';
import { SparkBurst } from '@/components/vfx/spark-burst';
import { usePopIn, useRiseIn } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import { SPARKS } from '@/constants/vfx';
import { formatMoney } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const TITLE_ASSET = require('@/assets/images/game/good-job.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node 1:464 -- the «GOOD JOB!» lettering. */
const TITLE = { width: 383, height: 126 } as const;
/** Node 1:465 -- the card the amount sits in. */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const COIN = { width: 64, height: 62 } as const;
/** Nodes 1:470 / 1:471. */
const CONTINUE = { width: 382, height: 94, fontSize: 40 } as const;
const MENU = { width: 334, height: 90, fontSize: 40 } as const;

/**
 * The screen builds itself up in three beats -- lettering, then the amount,
 * then the way out -- so the eye lands on the number rather than on a button.
 * The overlay is mounted fresh on every win, so a constant trigger is all the
 * animations need: mounting *is* the event.
 */
const CARD_DELAY = 110;
const BUTTONS_DELAY = 260;
/** Roughly how far the sparks have to travel to clear the card. */
const SPARK_RADIUS = 190;

type WinOverlayProps = {
  amount: number;
  onContinue: () => void;
  onMenu: () => void;
};

/** Win celebration (Figma node 1:462), shown over the game. */
export function WinOverlay({ amount, onContinue, onMenu }: WinOverlayProps) {
  const scale = useDesignScale();

  const titleStyle = usePopIn(1);
  const cardStyle = usePopIn(1, CARD_DELAY);
  const buttonsStyle = useRiseIn(1, 26 * scale, BUTTONS_DELAY);

  return (
    <View style={[styles.container, { gap: 36 * scale }]}>
      <View style={{ gap: 36 * scale, alignItems: 'center' }}>
        <Animated.View style={titleStyle}>
          <Image
            source={TITLE_ASSET}
            style={{ width: TITLE.width * scale, height: TITLE.height * scale }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View style={cardStyle}>
          <SparkBurst trigger={1} count={SPARKS.win} radius={SPARK_RADIUS} duration={1100} />

          <View
            style={[
              styles.card,
              {
                width: CARD.width * scale,
                padding: CARD.padding * scale,
                borderRadius: CARD.radius * scale,
                gap: 6 * scale,
              },
            ]}>
            <Image
              source={COIN_ASSET}
              style={{ width: COIN.width * scale, height: COIN.height * scale }}
              contentFit="contain"
            />
            <CountUpText
              value={amount}
              format={formatMoney}
              weight="bold"
              style={{ fontSize: 72 * scale }}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[{ gap: 12 * scale, alignItems: 'center' }, buttonsStyle]}>
        <GameButton {...CONTINUE} label="Continue" onPress={onContinue} />
        <GameButton {...MENU} label="Menu" onPress={onMenu} sfx="ui-back" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
