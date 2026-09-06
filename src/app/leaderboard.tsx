import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeaderboardPanel } from '@/components/leaderboard/leaderboard-panel';
import { ScreenTopBar } from '@/components/ui/screen-top-bar';
import { SplashColors } from '@/constants/theme';
import { buildStandings } from '@/game/leaderboard';
import { useDesignScale } from '@/hooks/use-design-scale';

// Same background as the menu. The leaderboard's own `bg` instance frames the
// image slightly differently, but reusing this one keeps the backdrop from
// jumping on the way in -- and the card covers all but a 24pt margin anyway.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');

/** Node 1:894 -- card sits 12 under the bar and runs to the safe area. */
const PANEL_INSET = 12;
const PANEL_MARGIN = 24;

export default function LeaderboardScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { rows, you } = buildStandings();
  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View
        style={[
          styles.panelSlot,
          {
            top: topBarHeight + PANEL_INSET * scale,
            bottom: insets.bottom,
            paddingHorizontal: PANEL_MARGIN * scale,
          },
        ]}>
        <LeaderboardPanel rows={rows} you={you} />
      </View>

      <ScreenTopBar title="Leaderboards" onBack={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  panelSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
