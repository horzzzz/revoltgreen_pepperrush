import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { formatMoney } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const TITLE_ASSET = require('@/assets/images/game/big-win.png');
const COINS_ASSET = require('@/assets/images/game/coins-stack.png');

/** Node 1:205 -- the «BIG WIN» lettering, spanning the whole frame width. */
const TITLE = { width: 430, height: 308 } as const;
/** Node 1:206 -- 52 below the lettering. */
const AMOUNT = { gap: 52, fontSize: 64 } as const;
/** Nodes 1:207 / 1:208 -- the same pile, mirrored into the other corner. */
const COINS = { width: 183, height: 262 } as const;

type BigWinOverlayProps = {
  amount: number;
  onDismiss: () => void;
};

/** Big win celebration (Figma node 1:202). A tap anywhere closes it. */
export function BigWinOverlay({ amount, onDismiss }: BigWinOverlayProps) {
  const scale = useDesignScale();

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel={`Big win ${formatMoney(amount)}`}>
      <View style={styles.stacks} pointerEvents="none">
        <Image
          source={COINS_ASSET}
          style={{ width: COINS.width * scale, height: COINS.height * scale }}
          contentFit="contain"
        />
        <Image
          source={COINS_ASSET}
          style={[
            { width: COINS.width * scale, height: COINS.height * scale },
            styles.mirrored,
          ]}
          contentFit="contain"
        />
      </View>

      <View style={[styles.center, { gap: AMOUNT.gap * scale }]} pointerEvents="none">
        <Image
          source={TITLE_ASSET}
          style={{ width: TITLE.width * scale, height: TITLE.height * scale }}
          contentFit="contain"
        />
        <AppText weight="bold" style={{ fontSize: AMOUNT.fontSize * scale }}>
          {formatMoney(amount)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stacks: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
});
