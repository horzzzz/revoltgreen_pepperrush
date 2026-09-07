import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Nodes 1:888..1:891 -- each tier has its own plate, all 65 tall. */
const PLATES = {
  grand: require('@/assets/images/game/jackpot-grand.png'),
  major: require('@/assets/images/game/jackpot-major.png'),
  minor: require('@/assets/images/game/jackpot-minor.png'),
  mini: require('@/assets/images/game/jackpot-mini.png'),
} as const;

type Tier = {
  tier: keyof typeof PLATES;
  label: string;
  value: string;
  /** Plate widths differ slightly from tier to tier (node 1:142). */
  width: number;
};

const LEFT: Tier[] = [
  { tier: 'grand', label: 'GRAND', value: 'x5,000.00', width: 98 },
  { tier: 'major', label: 'MAJOR', value: 'x200.00', width: 97 },
];

const RIGHT: Tier[] = [
  { tier: 'minor', label: 'MINOR', value: 'x50.00', width: 96 },
  { tier: 'mini', label: 'MINI', value: 'x20.00', width: 90 },
];

const PLATE_HEIGHT = 65;
/** Node 1:146 -- the caption starts 22 below the plate's top edge. */
const TEXT_TOP = 22;
const RAIL_WIDTH = 382;

/**
 * The four jackpot plates flanking the logo (Figma node 1:142). The amounts are
 * fixed, exactly as the reference plays them -- they are not progressive.
 */
export function JackpotRail() {
  const scale = useDesignScale();

  return (
    <View style={[styles.rail, { width: RAIL_WIDTH * scale }]}>
      <View style={styles.column}>
        {LEFT.map((tier) => (
          <JackpotPlate key={tier.tier} {...tier} />
        ))}
      </View>
      <View style={[styles.column, styles.rightColumn]}>
        {RIGHT.map((tier) => (
          <JackpotPlate key={tier.tier} {...tier} />
        ))}
      </View>
    </View>
  );
}

function JackpotPlate({ tier, label, value, width }: Tier) {
  const scale = useDesignScale();

  return (
    <View style={{ width: width * scale, height: PLATE_HEIGHT * scale }}>
      <Image source={PLATES[tier]} style={StyleSheet.absoluteFill} contentFit="fill" />
      <View style={[styles.caption, { top: TEXT_TOP * scale }]}>
        <AppText style={[styles.text, { fontSize: 10 * scale }]}>{label}</AppText>
        <AppText weight="bold" style={[styles.text, { fontSize: 14 * scale }]}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  column: {
    alignItems: 'flex-start',
  },
  rightColumn: {
    alignItems: 'center',
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    // The plates carry black type; the glow is what keeps it readable on metal.
    color: GameColors.jackpotText,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
