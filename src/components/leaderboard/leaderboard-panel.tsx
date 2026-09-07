import { useEffect, useRef } from 'react';
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
/** Kept in step with `ROW_HEIGHT` in `player-row.tsx`. */
const ROW_HEIGHT = 69;

type LeaderboardPanelProps = {
  /** The whole table, player included. */
  rows: Standing[];
  /** The player again, for the row pinned to the bottom. */
  you: Standing;
};

/**
 * Card holding the ranking (Figma node 1:572). The list scrolls: nine rows plus
 * the pinned row overflow the card even on the design's own frame.
 */
export function LeaderboardPanel({ rows, you }: LeaderboardPanelProps) {
  const scale = useDesignScale();
  const podium = rows.slice(0, PODIUM_SIZE);
  const rest = rows.slice(PODIUM_SIZE);

  const scroller = useRef<ScrollView>(null);
  const mineIndex = rows.findIndex((standing) => standing.isPlayer);

  // Bring the player's inline row into view once, so the pulsing ring on it is
  // the first thing seen even when they rank well down the list. The list is a
  // fixed grid (every row `ROW_HEIGHT`, known gaps), so the offset is computed
  // rather than measured.
  useEffect(() => {
    if (mineIndex < 0) return;
    const step = ROW_HEIGHT + ROW_GAP;
    let y = PADDING + mineIndex * step;
    if (mineIndex >= PODIUM_SIZE) {
      // Past the podium group: swap that group's last gap for the wider one.
      y += GROUP_GAP - ROW_GAP;
    }
    const target = Math.max(0, (y - 90) * scale);
    const timer = setTimeout(
      () => scroller.current?.scrollTo({ y: target, animated: true }),
      350,
    );
    return () => clearTimeout(timer);
  }, [mineIndex, scale]);

  return (
    <View style={[styles.panel, { borderRadius: 20 * scale, borderWidth: 1 * scale }]}>
      <ScrollView
        ref={scroller}
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
