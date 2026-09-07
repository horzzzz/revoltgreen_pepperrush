import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { GameColors } from '@/constants/theme';
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

type WinOverlayProps = {
  amount: number;
  onContinue: () => void;
  onMenu: () => void;
};

/** Win celebration (Figma node 1:462), shown over the game. */
export function WinOverlay({ amount, onContinue, onMenu }: WinOverlayProps) {
  const scale = useDesignScale();

  return (
    <View style={[styles.container, { gap: 36 * scale }]}>
      <View style={{ gap: 36 * scale, alignItems: 'center' }}>
        <Image
          source={TITLE_ASSET}
          style={{ width: TITLE.width * scale, height: TITLE.height * scale }}
          contentFit="contain"
        />

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
          <AppText weight="bold" style={{ fontSize: 72 * scale }}>
            {formatMoney(amount)}
          </AppText>
        </View>
      </View>

      <View style={{ gap: 12 * scale, alignItems: 'center' }}>
        <GameButton {...CONTINUE} label="Continue" onPress={onContinue} />
        <GameButton {...MENU} label="Menu" onPress={onMenu} sfx="ui-back" />
      </View>
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
