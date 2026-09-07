import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { formatMoney } from '@/game/slot/bet';
import { useDesignScale } from '@/hooks/use-design-scale';

const TITLE_ASSET = require('@/assets/images/game/big-win.png');
// Nodes 1:207 / 1:208 turned out not to be the same pile mirrored -- they're two
// different windows into one wide coin-pile image, so each needed its own crop.
const COINS_RIGHT_ASSET = require('@/assets/images/game/coins-right.png');
const COINS_LEFT_ASSET = require('@/assets/images/game/coins-left.png');

/** Node 1:204 -- the dimmed, blurred backdrop; same recipe as the settings sheet. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

/** Node 1:205 -- the «BIG WIN» lettering, spanning the whole frame width. */
const TITLE = { top: 244, width: 430, height: 308 } as const;
/** Node 1:206 -- centered box below the lettering. */
const AMOUNT = { top: 604, height: 83, fontSize: 72 } as const;
/** Node 1:207 -- the right pile, flush with the bottom-right corner. */
const COINS_RIGHT = { width: 183, height: 262 } as const;
/** Node 1:208 -- the left pile, a different crop, 31 shorter than the right one. */
const COINS_LEFT = { width: 183, height: 231 } as const;

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
      <BlurView
        intensity={30}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />

        <View style={[styles.centeredColumn, { top: TITLE.top * scale }]}>
          <Image
            source={TITLE_ASSET}
            style={{ width: TITLE.width * scale, height: TITLE.height * scale }}
            contentFit="contain"
          />
        </View>

        <View
          style={[
            styles.centeredColumn,
            { top: AMOUNT.top * scale, height: AMOUNT.height * scale, justifyContent: 'center' },
          ]}>
          <AppText weight="bold" style={{ fontSize: AMOUNT.fontSize * scale }}>
            {formatMoney(amount)}
          </AppText>
        </View>
      </BlurView>

      {/* Coins sit above the blur, crisp against it, same as in the design. */}
      <Image
        source={COINS_RIGHT_ASSET}
        style={[
          styles.coinsRight,
          { width: COINS_RIGHT.width * scale, height: COINS_RIGHT.height * scale },
        ]}
        contentFit="contain"
        pointerEvents="none"
      />
      <Image
        source={COINS_LEFT_ASSET}
        style={[
          styles.coinsLeft,
          { width: COINS_LEFT.width * scale, height: COINS_LEFT.height * scale },
        ]}
        contentFit="contain"
        pointerEvents="none"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centeredColumn: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  coinsRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  coinsLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});
