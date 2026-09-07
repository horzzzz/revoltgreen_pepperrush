import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { BalancePill } from '@/components/ui/balance-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { useDesignScale } from '@/hooks/use-design-scale';

const PAUSE_ASSET = require('@/assets/images/game/icon-pause.png');
const MENU_ASSET = require('@/assets/images/game/icon-menu.png');

const ICON_SIZE = 36;

type GameTopBarProps = {
  onPause: () => void;
  onMenu: () => void;
};

/** Pause, balance and the menu button (Figma node 1:486, the bar's variant 3). */
export function GameTopBar({ onPause, onMenu }: GameTopBarProps) {
  const scale = useDesignScale();

  return (
    <TopBarShell style={styles.bar}>
      <PressableScale onPress={onPause} accessibilityRole="button" accessibilityLabel="Pause">
        <Image
          source={PAUSE_ASSET}
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
          contentFit="contain"
        />
      </PressableScale>

      <BalancePill />

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
});
