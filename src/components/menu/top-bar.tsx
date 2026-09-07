import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { GameColors } from '@/constants/theme';
import { useCoins } from '@/game/player';
import { formatCoins } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const PILL_ASSET = require('@/assets/images/menu/pill.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Not in the Figma pill (node 1:190) -- added as the entry point into the shop. */
const ADD_BUTTON_SIZE = 28;

/** Node I1:190;1:478 -- the icon row, left to right. */
const ACTIONS = [
  { key: 'leaderboard', source: require('@/assets/images/menu/icon-leaderboard.png'), width: 36 },
  { key: 'wheel', source: require('@/assets/images/menu/icon-wheel.png'), width: 36 },
  { key: 'gift', source: require('@/assets/images/menu/icon-gift.png'), width: 35 },
  { key: 'settings', source: require('@/assets/images/menu/icon-settings.png'), width: 36 },
] as const;

/** Balance pill and shortcut buttons pinned to the top (Figma node 1:190). */
export function TopBar() {
  const scale = useDesignScale();
  const router = useRouter();
  const balance = formatCoins(useCoins());

  const handlers: Record<(typeof ACTIONS)[number]['key'], () => void> = {
    leaderboard: () => router.push('/leaderboard'),
    wheel: () => router.push('/wheel'),
    gift: () => router.push('/daily-bonus'),
    settings: () => router.push('/settings'),
  };

  const openShop = () => router.push('/shop');

  return (
    <TopBarShell rounded style={styles.bar}>
      <View style={[styles.balance, { gap: 8 * scale }]}>
        <PressableScale
          onPress={openShop}
          style={[
            styles.pill,
            { width: 130 * scale, height: 36 * scale, paddingHorizontal: 12 * scale },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Balance ${balance}. Add coins`}>
          <Image source={PILL_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
          <AppText style={{ fontSize: 18 * scale }}>{balance}</AppText>
          <Image
            source={COIN_ASSET}
            style={{ width: 21 * scale, height: 20 * scale }}
            contentFit="contain"
          />
        </PressableScale>

        <PressableScale
          onPress={openShop}
          style={[
            styles.addButton,
            { width: ADD_BUTTON_SIZE * scale, height: ADD_BUTTON_SIZE * scale },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add coins">
          <AppText weight="bold" style={{ fontSize: 18 * scale, lineHeight: 20 * scale }}>
            +
          </AppText>
        </PressableScale>
      </View>

      <View style={[styles.actions, { gap: 12 * scale }]}>
        {ACTIONS.map((action) => (
          <PressableScale
            key={action.key}
            onPress={handlers[action.key]}
            accessibilityRole="button"
            accessibilityLabel={action.key}>
            <Image
              source={action.source}
              style={{ width: action.width * scale, height: 36 * scale }}
              contentFit="contain"
            />
          </PressableScale>
        ))}
      </View>
    </TopBarShell>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: GameColors.panelBorder,
    backgroundColor: GameColors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
