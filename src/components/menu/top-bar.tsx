import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useReducer } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TopBarShell } from '@/components/ui/top-bar-shell';
import { GameColors, MenuColors } from '@/constants/theme';
import { canClaimDaily, canSpinWheelNow, useCoins } from '@/game/player';
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

  // The reward cooldowns are time-based and the menu stays mounted (and frozen)
  // under the wheel / daily screens, so a store change alone doesn't refresh
  // this bar. Re-check on every focus -- coming back from spinning the wheel or
  // claiming the bonus -- and on a slow tick for a cooldown expiring in place.
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useFocusEffect(
    useCallback(() => {
      tick();
    }, []),
  );
  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // A red dot on a shortcut whose reward is waiting to be collected.
  const alerts: Partial<Record<(typeof ACTIONS)[number]['key'], boolean>> = {
    wheel: canSpinWheelNow(),
    gift: canClaimDaily(),
  };

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
          {/* Drawn as two bars rather than a "+" glyph -- the font's plus sits
              off its own baseline and never lands dead-centre in the circle. */}
          <View
            style={[styles.plusBar, { width: 12 * scale, height: 2.4 * scale, marginLeft: -6 * scale, marginTop: -1.2 * scale }]}
          />
          <View
            style={[styles.plusBar, { width: 2.4 * scale, height: 12 * scale, marginLeft: -1.2 * scale, marginTop: -6 * scale }]}
          />
        </PressableScale>
      </View>

      <View style={[styles.actions, { gap: 12 * scale }]}>
        {ACTIONS.map((action) => (
          <PressableScale
            key={action.key}
            onPress={handlers[action.key]}
            accessibilityRole="button"
            accessibilityLabel={alerts[action.key] ? `${action.key}, reward available` : action.key}>
            <Image
              source={action.source}
              style={{ width: action.width * scale, height: 36 * scale }}
              contentFit="contain"
            />
            {alerts[action.key] ? (
              <View
                style={[
                  styles.badge,
                  {
                    width: 10 * scale,
                    height: 10 * scale,
                    borderRadius: 5 * scale,
                    borderWidth: 1.5 * scale,
                    right: -2 * scale,
                    top: -1 * scale,
                  },
                ]}
              />
            ) : null}
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
  // Two bars pinned to the circle's exact centre (top/left 50% + negative
  // margins of half their own size), so the "+" is centred by geometry, not
  // by font metrics.
  plusBar: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: MenuColors.text,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FF3B30',
    borderColor: MenuColors.text,
  },
});
