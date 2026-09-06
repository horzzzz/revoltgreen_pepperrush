import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { LeaderboardColors, SplashColors } from '@/constants/theme';
import { formatAmount, type Standing } from '@/game/leaderboard';
import { useDesignScale } from '@/hooks/use-design-scale';

const ROW_HEIGHT = 69;
/** Node 1:535 -- the rank column. */
const RANK_WIDTH = 53;
/** Node 1:540 -- fixed so long nicknames ellipsize instead of pushing the amount. */
const NAME_WIDTH = 87;
/** Node 1:562 -- the highlighted row keeps its content in a narrower column. */
const HIGHLIGHT_CONTENT_WIDTH = 310;

type PlayerRowProps = {
  standing: Standing;
  /** The "You" row (node 1:561): full-bleed, gradient, no outline. */
  highlighted?: boolean;
};

export function PlayerRow({ standing, highlighted = false }: PlayerRowProps) {
  const scale = useDesignScale();

  const content = (
    <>
      <View style={{ width: RANK_WIDTH * scale, alignItems: 'center' }}>
        <AppText style={[styles.shadowed, { fontSize: 24 * scale }]}>{standing.rank}</AppText>
        <AppText style={[styles.caption, { fontSize: 8 * scale, marginTop: -2 * scale }]}>
          Number
        </AppText>
      </View>

      <AppText
        numberOfLines={1}
        style={[styles.shadowed, { width: NAME_WIDTH * scale, fontSize: 15 * scale }]}>
        {standing.name}
      </AppText>

      <View
        style={{
          paddingHorizontal: 12 * scale,
          paddingVertical: 4 * scale,
          alignItems: 'flex-end',
        }}>
        <AppText style={[styles.shadowed, { fontSize: 14 * scale }]}>
          {formatAmount(standing.amount)}
        </AppText>
        <AppText style={[styles.caption, { fontSize: 8 * scale }]}>withdrawal amount</AppText>
      </View>
    </>
  );

  if (!highlighted) {
    return (
      <View
        style={[
          styles.row,
          {
            height: ROW_HEIGHT * scale,
            padding: 12 * scale,
            borderWidth: 2 * scale,
            borderRadius: 15 * scale,
            justifyContent: 'space-between',
          },
        ]}>
        {content}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[SplashColors.fillEdge, SplashColors.fillMid, SplashColors.fillEdge]}
      locations={[0, 0.43756, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.row, { height: ROW_HEIGHT * scale, justifyContent: 'center' }]}>
      <View
        style={[
          styles.row,
          { width: HIGHLIGHT_CONTENT_WIDTH * scale, justifyContent: 'space-between' },
        ]}>
        {content}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: LeaderboardColors.border,
    overflow: 'hidden',
  },
  shadowed: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  caption: {
    opacity: 0.8,
    textTransform: 'capitalize',
  },
});
