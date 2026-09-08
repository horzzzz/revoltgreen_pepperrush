import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Toggle } from '@/components/ui/toggle';
import { LeaderboardColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const CLOSE_ASSET = require('@/assets/images/ui/icon-close.png');
// Same artwork as the back arrow, mirrored -- the design does the same.
const ARROW_ASSET = require('@/assets/images/ui/icon-back.png');

/** Node 1:168. */
const CARD = { width: 382, padding: 24, radius: 20, gap: 36 } as const;
/** Nodes 1:265 / 1:279 -- the two bordered groups. */
const GROUP = { padding: 24, radius: 15, border: 2, rowGap: 16 } as const;
const CLOSE_SIZE = 24;
const ARROW_SIZE = 36;

export type SwitchKey = 'music' | 'sound' | 'vibration' | 'notifications';

const SWITCHES: { key: SwitchKey; label: string }[] = [
  { key: 'music', label: 'Music' },
  { key: 'sound', label: 'Sound' },
  { key: 'vibration', label: 'Vibration' },
  { key: 'notifications', label: 'Notifications' },
];

type SettingsCardProps = {
  values: Record<SwitchKey, boolean>;
  onChange: (key: SwitchKey, value: boolean) => void;
  onClose?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
};

export function SettingsCard({
  values,
  onChange,
  onClose,
  onOpenPrivacy,
  onOpenTerms,
}: SettingsCardProps) {
  const scale = useDesignScale();

  const group = [
    styles.group,
    {
      padding: GROUP.padding * scale,
      borderRadius: GROUP.radius * scale,
      borderWidth: GROUP.border * scale,
      gap: GROUP.rowGap * scale,
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
          borderWidth: 1 * scale,
          gap: CARD.gap * scale,
        },
      ]}>
      <View style={styles.header}>
        {/* The close button sits on the right, so the title's own box is
            offset by that width to stay centred on the card. */}
        <AppText
          weight="bold"
          style={[styles.title, { fontSize: 30 * scale, marginLeft: CLOSE_SIZE * scale }]}>
          Settings
        </AppText>
        <PressableScale onPress={onClose} sfx="ui-back" accessibilityRole="button" accessibilityLabel="Close">
          <Image
            source={CLOSE_ASSET}
            style={{ width: CLOSE_SIZE * scale, height: CLOSE_SIZE * scale }}
            contentFit="contain"
          />
        </PressableScale>
      </View>

      <View style={group}>
        {SWITCHES.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <AppText style={{ fontSize: 20 * scale }}>{label}</AppText>
            <Toggle
              value={values[key]}
              onValueChange={(next) => onChange(key, next)}
              accessibilityLabel={label}
            />
          </View>
        ))}
      </View>

      <View style={group}>
        <LinkRow label="Privacy Policy" onPress={onOpenPrivacy} />
        <LinkRow label="Terms Of Use" onPress={onOpenTerms} />
      </View>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const scale = useDesignScale();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, { height: ARROW_SIZE * scale }]}>
      <AppText style={{ fontSize: 20 * scale }}>{label}</AppText>
      <Image
        source={ARROW_ASSET}
        style={{
          width: ARROW_SIZE * scale,
          height: ARROW_SIZE * scale,
          transform: [{ scaleX: -1 }],
        }}
        contentFit="contain"
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LeaderboardColors.panel,
    borderColor: LeaderboardColors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  header: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  group: {
    alignSelf: 'stretch',
    borderColor: LeaderboardColors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
