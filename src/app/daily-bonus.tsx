import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DailyBonusCard } from '@/components/daily/daily-bonus-card';
import { SplashColors } from '@/constants/theme';
import { DAILY_BONUS_COINS } from '@/game/player';

// Reused from the menu so the backdrop does not jump on the way in.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Daily bonus (Figma node 1:191). Claiming only closes the screen for now. */
export default function DailyBonusScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />
      <DailyBonusCard amount={DAILY_BONUS_COINS} onClaim={() => router.back()} />
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
