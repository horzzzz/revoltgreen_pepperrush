import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { isFull, POTS, type PotState } from '@/game/slot/pots';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Nodes 1:820/1:822, 1:824/1:826, 1:828/1:830 -- empty and full of chilis. */
const POT_ART = {
  collect: {
    empty: require('@/assets/images/game/pot-collect.png'),
    full: require('@/assets/images/game/pot-collect-full.png'),
  },
  multiplier: {
    empty: require('@/assets/images/game/pot-multiplier.png'),
    full: require('@/assets/images/game/pot-multiplier-full.png'),
  },
  board: {
    empty: require('@/assets/images/game/pot-board.png'),
    full: require('@/assets/images/game/pot-board-full.png'),
  },
} as const;

/** Node 1:96 -- one pot, and the gap between them (node 1:95). */
export const POT = { width: 102.804, height: 128.305 } as const;
const POT_GAP = 8;
/**
 * Node 1:95 sits `mb-[-35px]`, so the pots hang over the machine's top edge.
 * The overlap is done by the parent screen (an absolute offset, painted after
 * the reel grid) rather than a negative margin here -- a negative margin needs
 * a `zIndex` to stay above the sibling it overlaps, and `zIndex` in RN is not
 * scoped to a subtree: it was winning against unrelated screens stacked on
 * top of this one, like the bet panel.
 */
export const POT_OVERLAP = 35;

type PotRowProps = {
  pots: PotState;
};

/** COLLECT / MULTIPLIER / 2X BOARD above the reels (Figma node 1:95). */
export function PotRow({ pots }: PotRowProps) {
  const scale = useDesignScale();

  return (
    <View style={[styles.row, { gap: POT_GAP * scale }]}>
      {POTS.map(({ key }) => (
        <Image
          key={key}
          source={isFull(pots, key) ? POT_ART[key].full : POT_ART[key].empty}
          style={{ width: POT.width * scale, height: POT.height * scale }}
          contentFit="contain"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
