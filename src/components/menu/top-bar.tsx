import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { PLAYER } from '@/game/player';
import { useDesignScale } from '@/hooks/use-design-scale';

const PILL_ASSET = require('@/assets/images/menu/pill.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node I1:190;1:478 -- the icon row, left to right. */
const ACTIONS = [
  { key: 'leaderboard', source: require('@/assets/images/menu/icon-leaderboard.png'), width: 36 },
  { key: 'wheel', source: require('@/assets/images/menu/icon-wheel.png'), width: 36 },
  { key: 'gift', source: require('@/assets/images/menu/icon-gift.png'), width: 35 },
  { key: 'settings', source: require('@/assets/images/menu/icon-settings.png'), width: 36 },
] as const;

type TopBarProps = {
  balance?: number;
};

/** Balance pill and shortcut buttons pinned to the top (Figma node 1:190). */
export function TopBar({ balance = PLAYER.coins }: TopBarProps) {
  const scale = useDesignScale();
  const router = useRouter();

  const handlers: Record<(typeof ACTIONS)[number]['key'], () => void> = {
    leaderboard: () => router.push('/leaderboard'),
    wheel: () => router.push('/wheel'),
    gift: () => router.push('/daily-bonus'),
    settings: () => router.push('/settings'),
  };

  return (
    <TopBarShell rounded style={styles.bar}>
      <PressableScale
        style={[
          styles.pill,
          { width: 130 * scale, height: 36 * scale, paddingHorizontal: 12 * scale },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Balance ${balance}`}>
        <Image source={PILL_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
        <AppText style={{ fontSize: 18 * scale }}>{balance}</AppText>
        <Image
          source={COIN_ASSET}
          style={{ width: 21 * scale, height: 20 * scale }}
          contentFit="contain"
        />
      </PressableScale>

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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
