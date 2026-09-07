import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Fonts, GameColors, SplashColors } from '@/constants/theme';
import type { PayoutMethodInfo } from '@/game/payout-methods';
import { useDesignScale } from '@/hooks/use-design-scale';

const CLOSE_ASSET = require('@/assets/images/ui/icon-close.png');

/** Node I1:912;1:751 -- the card, its icon, and the field stack. */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const ICON_SIZE = 130;
const CLOSE_SIZE = 24;
const FIELD_GAP = 12;
const PLACEHOLDER = 'rgba(255,255,255,0.46)';

type PayoutConnectCardProps = {
  method: PayoutMethodInfo;
  initialValues: Record<string, string>;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
};

/** The connect-a-method card + Save button (Figma nodes 1:907 / 1:913). */
export function PayoutConnectCard({ method, initialValues, onClose, onSave }: PayoutConnectCardProps) {
  const scale = useDesignScale();
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const set = (key: string, text: string) => setValues((prev) => ({ ...prev, [key]: text }));
  const complete = method.fields.every((field) => (values[field.key] ?? '').trim().length > 0);

  return (
    <View style={[styles.wrap, { gap: 24 * scale }]}>
      <View
        style={[
          styles.card,
          {
            width: CARD.width * scale,
            padding: CARD.padding * scale,
            borderRadius: CARD.radius * scale,
          },
        ]}>
        <PressableScale
          onPress={onClose}
          sfx="ui-back"
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          style={[styles.close, { top: CARD.padding * scale, right: CARD.padding * scale }]}>
          <Image
            source={CLOSE_ASSET}
            style={{ width: CLOSE_SIZE * scale, height: CLOSE_SIZE * scale }}
            contentFit="contain"
          />
        </PressableScale>

        <View style={[styles.body, { gap: 8 * scale }]}>
          {/* Icons export on a square grey plate -- clip to a circle. */}
          <View
            style={{
              width: ICON_SIZE * scale,
              height: ICON_SIZE * scale,
              borderRadius: (ICON_SIZE / 2) * scale,
              overflow: 'hidden',
            }}>
            <Image source={method.icon} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
          <AppText style={[styles.name, { fontSize: 48 * scale }]}>{method.label}</AppText>

          <View style={[styles.fields, { gap: FIELD_GAP * scale }]}>
            {method.fields.map((field) => (
              <TextInput
                key={field.key}
                value={values[field.key] ?? ''}
                onChangeText={(text) => set(field.key, text)}
                placeholder={field.label}
                placeholderTextColor={PLACEHOLDER}
                keyboardType={field.keyboardType ?? 'default'}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    borderWidth: 2 * scale,
                    borderRadius: 13 * scale,
                    paddingHorizontal: 12 * scale,
                    paddingVertical: 8 * scale,
                    fontSize: 16 * scale,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <GameButton
        label="Save"
        width={CARD.width}
        height={96}
        fontSize={40}
        dimmed={!complete}
        disabled={!complete}
        onPress={() => onSave(values)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  close: {
    position: 'absolute',
    zIndex: 1,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  name: {
    color: SplashColors.text,
    textAlign: 'center',
  },
  fields: {
    width: '100%',
  },
  input: {
    borderColor: SplashColors.fillEdge,
    color: SplashColors.text,
    fontFamily: Fonts.regular,
    width: '100%',
  },
});
