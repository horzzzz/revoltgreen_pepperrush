import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { CountUpText } from '@/components/ui/count-up-text';
import { useBump, useFlash } from '@/components/vfx/use-vfx';
import { GameColors } from '@/constants/theme';
import { formatMoney } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const PLATE_ASSET = require('@/assets/images/game/stat-plate.png');

/** Nodes 1:128 / 1:133 -- the Win and Bet plates under the machine. */
const PLATE = { width: 185, height: 63 } as const;

type StatPlateProps = {
  label: string;
  value: number;
  /** Roll the number up instead of swapping it -- the Win plate does. */
  countUp?: boolean;
  /** Bump this to knock the plate and flash its outline. 0 never fires. */
  highlightId?: number;
  format?: (value: number) => string;
};

export function StatPlate({
  label,
  value,
  countUp = false,
  highlightId = 0,
  format = formatMoney,
}: StatPlateProps) {
  const scale = useDesignScale();
  const bumpStyle = useBump(highlightId, 0.1);
  const glowStyle = useFlash(highlightId, 2, 0.85);

  const text = format(value);
  const valueStyle = [styles.text, { fontSize: 20 * scale }];

  return (
    <Animated.View
      style={[
        styles.plate,
        { width: PLATE.width * scale, height: PLATE.height * scale },
        bumpStyle,
      ]}
      accessibilityLabel={`${label} ${text}`}>
      <Image source={PLATE_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 10 * scale,
            borderWidth: 2 * scale,
            borderColor: GameColors.chipGlow,
          },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      <AppText weight="bold" style={[styles.text, { fontSize: 14 * scale }]}>
        {label}
      </AppText>
      {countUp ? (
        <CountUpText value={value} format={format} weight="bold" style={valueStyle} />
      ) : (
        <AppText weight="bold" style={valueStyle}>
          {text}
        </AppText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
