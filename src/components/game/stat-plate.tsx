import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useDesignScale } from '@/hooks/use-design-scale';

const PLATE_ASSET = require('@/assets/images/game/stat-plate.png');

/** Nodes 1:128 / 1:133 -- the Win and Bet plates under the machine. */
const PLATE = { width: 185, height: 63 } as const;

type StatPlateProps = {
  label: string;
  value: string;
};

export function StatPlate({ label, value }: StatPlateProps) {
  const scale = useDesignScale();

  return (
    <View
      style={[styles.plate, { width: PLATE.width * scale, height: PLATE.height * scale }]}
      accessibilityLabel={`${label} ${value}`}>
      <Image source={PLATE_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
      <AppText weight="bold" style={[styles.text, { fontSize: 14 * scale }]}>
        {label}
      </AppText>
      <AppText weight="bold" style={[styles.text, { fontSize: 20 * scale }]}>
        {value}
      </AppText>
    </View>
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
