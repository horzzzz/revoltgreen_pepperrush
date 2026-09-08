import { ScrollView, StyleSheet, View } from 'react-native';

import { PlayerRow } from '@/components/leaderboard/player-row';
import { LeaderboardColors } from '@/constants/theme';
import { type Standing } from '@/game/leaderboard';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node 1:574 -- the podium is its own group, set off from the rest. */
const PODIUM_SIZE = 3;
const PADDING = 24;
const ROW_GAP = 8;
const GROUP_GAP = 12;
/** Node 1:572 -- air between the list and the pinned "You" row. */
const LIST_TO_YOU = 36;

type LeaderboardPanelProps = {
  /** The whole table, player included. */
  rows: Standing[];
  /** The player again, for the row pinned to the bottom. */
  you: Standing;
};

/**
 * Card holding the ranking (Figma node 1:572). The list scrolls: nine rows plus
 * the pinned row overflow the card even on the design's own frame.
 *
 * It deliberately opens at the top -- a leaderboard is read from 1st place
 * down. The player's own position is not lost by that: their inline row keeps
 * its pulsing ring, and the same row is pinned under the list at all times.
 */
export function LeaderboardPanel({ rows, you }: LeaderboardPanelProps) {
  const scale = useDesignScale();
  const podium = rows.slice(0, PODIUM_SIZE);
  const rest = rows.slice(PODIUM_SIZE);

  return (
    <View style={[styles.panel, { borderRadius: 20 * scale, borderWidth: 1 * scale }]}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={{
          paddingTop: PADDING * scale,
          paddingHorizontal: PADDING * scale,
          paddingBottom: LIST_TO_YOU * scale,
          gap: GROUP_GAP * scale,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ gap: ROW_GAP * scale }}>
          {podium.map((standing) => (
            <PlayerRow key={standing.rank} standing={standing} mine={standing.isPlayer} />
          ))}
        </View>
        <View style={{ gap: ROW_GAP * scale }}>
          {rest.map((standing) => (
            <PlayerRow key={standing.rank} standing={standing} mine={standing.isPlayer} />
          ))}
        </View>
      </ScrollView>

      <PlayerRow standing={you} highlighted />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: LeaderboardColors.panel,
    borderColor: LeaderboardColors.border,
    overflow: 'hidden',
  },
  list: {
    flex: 1,
  },
});
