import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { BalancePill } from '@/components/ui/balance-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { useDesignScale } from '@/hooks/use-design-scale';

const MENU_ASSET = require('@/assets/images/game/icon-menu.png');

const ICON_SIZE = 36;

type GameTopBarProps = {
  onMenu: () => void;
};

/** Balance and the menu button (Figma node 1:486). The menu button opens the pause menu. */
export function GameTopBar({ onMenu }: GameTopBarProps) {
  const scale = useDesignScale();

  return (
    <TopBarShell style={styles.bar}>
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
