import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { GameColors, SplashColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const CLOSE_ASSET = require('@/assets/images/ui/icon-close.png');
const ART_ASSET = require('@/assets/images/exchange/maintenance.png');

/** Node 1:197 -- the card, its inner group gap, and the gap down to the button. */
const CARD = { width: 382, padding: 24, radius: 20, gap: 36 } as const;
const GROUP_GAP = 16;
const CLOSE_SIZE = 24;
/** Node I1:197;1:350. */
const ART = { width: 264, height: 249 } as const;

const COPY =
  'The good news: once we’re back, every user will receive a special loyalty bonus. Hang tight, we’re almost there!';

type MaintenanceCardProps = {
  onClose: () => void;
  onRetry: () => void;
};

/** "Maintenance" modal card (Figma node 1:197). */
export function MaintenanceCard({ onClose, onRetry }: MaintenanceCardProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
          gap: CARD.gap * scale,
        },
      ]}>
      <View style={[styles.group, { gap: GROUP_GAP * scale }]}>
        <View style={styles.header}>
          <AppText weight="bold" style={[styles.title, { fontSize: 30 * scale }]}>
            Maintenance
          </AppText>
          <PressableScale
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Image
              source={CLOSE_ASSET}
              style={{ width: CLOSE_SIZE * scale, height: CLOSE_SIZE * scale }}
              contentFit="contain"
            />
          </PressableScale>
        </View>

        <Image
          source={ART_ASSET}
          style={{ width: ART.width * scale, height: ART.height * scale }}
          contentFit="contain"
        />

        <View
          style={[
            styles.copyBox,
            { borderWidth: 2 * scale, borderRadius: 15 * scale, padding: 12 * scale },
          ]}>
          <AppText style={[styles.copy, { fontSize: 20 * scale }]}>{COPY}</AppText>
        </View>
      </View>

      <GameButton label="Try again" width={334} height={94} fontSize={36} onPress={onRetry} />
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
  group: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    textTransform: 'uppercase',
  },
  copyBox: {
    width: '100%',
    borderColor: SplashColors.fillEdge,
    alignItems: 'center',
  },
  copy: {
    textAlign: 'center',
  },
});
