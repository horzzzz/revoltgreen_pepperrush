import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DailyBonusCard } from '@/components/daily/daily-bonus-card';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { SplashColors } from '@/constants/theme';
import { playSfx } from '@/game/audio/engine';
import { formatCountdown } from '@/game/cooldown';
import { claimDailyBonus, DAILY_BONUS_COINS, useDailyStatus } from '@/game/player';

// Reused from the menu so the backdrop does not jump on the way in.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Daily bonus (Figma node 1:191). Claiming credits the shared coin balance. */
export default function DailyBonusScreen() {
  const router = useRouter();
  const daily = useDailyStatus();
  const [remaining, setRemaining] = useState(0);

  // Live countdown while the bonus is on cooldown.
  useEffect(() => {
    if (daily.canClaim) return;
    const tick = () => setRemaining(daily.nextAt - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [daily.canClaim, daily.nextAt]);

  const claim = () => {
    claimDailyBonus();
    playSfx('reward-claim');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />
      <DailyBonusCard
        amount={DAILY_BONUS_COINS}
        onClaim={claim}
        disabled={!daily.canClaim}
        countdownLabel={formatCountdown(remaining)}
      />
      <ScreenTopBar title="Daily Bonus" onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
