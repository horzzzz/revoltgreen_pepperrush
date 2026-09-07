import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { GameColors } from '@/constants/theme';
import {
  type AutospinCount,
  AUTOSPIN_COUNTS,
  BET_LADDER,
  maxAffordableBet,
} from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const CLOSE_ASSET = require('@/assets/images/ui/icon-close.png');
// Both chip grids share one blank plate (Figma's own crop bakes the label into
// the bitmap, which would double up with the text `Chip` draws below).
const CHIP_ASSET = require('@/assets/images/game/chip.png');

/** Node 1:493 -- the card, and the two chip sizes inside it (1:498 / 1:801). */
const CARD = { width: 382, padding: 24, gap: 12, radius: 20 } as const;
const CONTENT_WIDTH = 334;
const AUTOSPIN_CHIP_SIZE = { width: 109, height: 63 } as const;
const BET_CHIP_SIZE = { width: 83, height: 48 } as const;
/** Node 1:532 -- the Start plate is the same one Play and Claim use. */
const START = { width: CONTENT_WIDTH, height: 90, fontSize: 36 } as const;

type BetPanelProps = {
  bet: number;
  autospin: AutospinCount;
  /** What `max` on the bet ladder resolves to. */
  balance: number;
  /** Closing keeps the bet the player picked but does not start autospin. */
  onDismiss: (bet: number) => void;
  onStart: (bet: number, autospin: AutospinCount) => void;
};

/**
 * Autospin and bet picker (Figma node 1:493). The headers are set in Aref Ruqaa
 * in the file; the app ships a single face, so they use GFS Neohellenic bold.
 */
export function BetPanel({ bet, autospin, balance, onDismiss, onStart }: BetPanelProps) {
  const scale = useDesignScale();
  const [betChoice, setBetChoice] = useState<number | 'max'>(bet);
  const [autoChoice, setAutoChoice] = useState<AutospinCount>(autospin);

  const chosenBet = betChoice === 'max' ? maxAffordableBet(balance) : betChoice;

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          gap: CARD.gap * scale,
          borderRadius: CARD.radius * scale,
        },
      ]}>
      <View style={[styles.header, { width: CONTENT_WIDTH * scale }]}>
        <AppText weight="bold" style={[styles.heading, { fontSize: 30 * scale }]}>
          Autospin
        </AppText>
        <PressableScale
          onPress={() => onDismiss(chosenBet)}
          sfx="ui-back"
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Image
            source={CLOSE_ASSET}
            style={{ width: 24 * scale, height: 24 * scale }}
            contentFit="contain"
          />
        </PressableScale>
      </View>

      <View style={[styles.chips, styles.spread, { width: CONTENT_WIDTH * scale }]}>
        {AUTOSPIN_COUNTS.map((count) => (
          <Chip
            key={String(count)}
            label={count === 'max' ? 'max' : String(count)}
            art={CHIP_ASSET}
            size={AUTOSPIN_CHIP_SIZE}
            selected={autoChoice === count}
            onPress={() => setAutoChoice(count)}
          />
        ))}
      </View>

      <View style={[styles.header, { width: CONTENT_WIDTH * scale }]}>
        <AppText weight="bold" style={[styles.heading, { fontSize: 30 * scale }]}>
          Bet
        </AppText>
      </View>

      <View style={[styles.chips, styles.trailing, { width: CONTENT_WIDTH * scale }]}>
        {BET_LADDER.map((value) => (
          <Chip
            key={value}
            label={String(value)}
            art={CHIP_ASSET}
            size={BET_CHIP_SIZE}
            selected={betChoice === value}
            onPress={() => setBetChoice(value)}
          />
        ))}
        <Chip
          label="max"
          art={CHIP_ASSET}
          size={BET_CHIP_SIZE}
          selected={betChoice === 'max'}
          onPress={() => setBetChoice('max')}
        />
      </View>

      <GameButton {...START} label="Start" onPress={() => onStart(chosenBet, autoChoice)} />
    </View>
  );
}

type ChipProps = {
  label: string;
  art: number;
  size: { width: number; height: number };
  selected: boolean;
  onPress: () => void;
};

/** One value chip. The picked one keeps full opacity and gets the green glow. */
function Chip({ label, art, size, selected, onPress }: ChipProps) {
  const scale = useDesignScale();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { width: size.width * scale, height: size.height * scale },
        selected ? styles.chipSelected : styles.chipIdle,
      ]}>
      <Image source={art} style={StyleSheet.absoluteFill} contentFit="fill" />
      <AppText weight="bold" style={{ fontSize: 24 * scale }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  spread: {
    justifyContent: 'space-between',
  },
  trailing: {
    justifyContent: 'flex-end',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIdle: {
    opacity: 0.5,
  },
  chipSelected: {
    shadowColor: GameColors.chipGlow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
