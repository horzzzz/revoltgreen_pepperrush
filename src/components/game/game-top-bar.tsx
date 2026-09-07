import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { useCoins } from '@/game/player';
import { formatCoins } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const PAUSE_ASSET = require('@/assets/images/game/icon-pause.png');
const MENU_ASSET = require('@/assets/images/game/icon-menu.png');
// The pill and the coin are the same art the menu's bar uses.
const PILL_ASSET = require('@/assets/images/menu/pill.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

const ICON_SIZE = 36;
const PILL = { width: 130, height: 36 } as const;

type GameTopBarProps = {
  onPause: () => void;
  onMenu: () => void;
};

/** Pause, balance and the menu button (Figma node 1:486, the bar's variant 3). */
export function GameTopBar({ onPause, onMenu }: GameTopBarProps) {
  const scale = useDesignScale();
  const balance = formatCoins(useCoins());

  return (
    <TopBarShell style={styles.bar}>
      <PressableScale onPress={onPause} accessibilityRole="button" accessibilityLabel="Pause">
        <Image
          source={PAUSE_ASSET}
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
          contentFit="contain"
        />
      </PressableScale>

      <View
        style={[
          styles.pill,
          { width: PILL.width * scale, height: PILL.height * scale, paddingHorizontal: 12 * scale },
        ]}
        accessibilityLabel={`Balance ${balance}`}>
        <Image source={PILL_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
        <AppText style={{ fontSize: 18 * scale }}>{balance}</AppText>
        <Image
          source={COIN_ASSET}
          style={{ width: 21 * scale, height: 20 * scale }}
          contentFit="contain"
        />
      </View>

      <PressableScale onPress={onMenu} accessibilityRole="button" accessibilityLabel="Menu">
        <Image
          source={MENU_ASSET}
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
          contentFit="contain"
        />
      </PressableScale>
    </TopBarShell>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
