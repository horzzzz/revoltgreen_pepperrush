import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SparkBurst } from '@/components/vfx/spark-burst';
import { useBump, useFlash } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import { SPARKS } from '@/constants/vfx';
import { isFull, POTS, type PotKey, type PotState } from '@/game/slot/pots';
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

/** How far the chili sparks scatter around a pot that just took one. */
const SPARK_RADIUS = 46;

type PotRowProps = {
  pots: PotState;
  /** Per pot: a counter that goes up each time it takes a chili. */
  bump: Record<PotKey, number>;
};

/** COLLECT / MULTIPLIER / 2X BOARD above the reels (Figma node 1:95). */
export function PotRow({ pots, bump }: PotRowProps) {
  const scale = useDesignScale();

  return (
    <View style={[styles.row, { gap: POT_GAP * scale }]}>
      {POTS.map(({ key }) => (
        <Pot key={key} potKey={key} full={isFull(pots, key)} bump={bump[key]} />
      ))}
    </View>
  );
}

type PotProps = {
  potKey: PotKey;
  full: boolean;
  bump: number;
};

function Pot({ potKey, full, bump }: PotProps) {
  const scale = useDesignScale();
  const bumpStyle = useBump(bump, 0.16);

  // Filling up is a one-way trip for now -- there is no bonus round to empty a
  // pot again (see `pots.ts`) -- so the flag itself works as the trigger: it
  // goes 0 -> 1 exactly once, on the spin that tops the pot off.
  const fullGlowStyle = useFlash(full ? 1 : 0, 3, 0.75);

  const size = { width: POT.width * scale, height: POT.height * scale };

  return (
    <Animated.View style={[size, bumpStyle]}>
      <Image source={POT_ART[potKey][full ? 'full' : 'empty']} style={size} contentFit="contain" />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 18 * scale,
            borderWidth: 2 * scale,
            borderColor: GameColors.chipGlow,
          },
          fullGlowStyle,
        ]}
        pointerEvents="none"
      />

      <SparkBurst
        trigger={bump}
        count={SPARKS.pot}
        radius={SPARK_RADIUS}
        size={7}
        duration={700}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
