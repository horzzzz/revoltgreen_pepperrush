import { StyleSheet, View } from 'react-native';

import { PayoutMethodRow } from '@/components/exchange/payout-method-row';
import { GameColors } from '@/constants/theme';
import { PAYOUT_METHODS } from '@/game/payout-methods';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node 1:906 -- the card, and node I1:906;1:789's row gap. */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const CONTENT_WIDTH = 334;
const ROW_GAP = 12;

type PayoutMethodsPanelProps = {
  /** Key of the currently linked method, or null. */
  connectedKey: string | null;
  onConnect: (key: string) => void;
};

/** The payout method list card (Figma node 1:906). */
export function PayoutMethodsPanel({ connectedKey, onConnect }: PayoutMethodsPanelProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
        },
      ]}>
      <View style={[styles.list, { width: CONTENT_WIDTH * scale, gap: ROW_GAP * scale }]}>
        {PAYOUT_METHODS.map((method) => (
          <PayoutMethodRow
            key={method.key}
            method={method}
            connected={method.key === connectedKey}
            onConnect={onConnect}
          />
        ))}
      </View>
    </View>
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
  list: {
    alignItems: 'center',
  },
});
