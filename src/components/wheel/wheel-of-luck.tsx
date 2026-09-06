import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useDesignScale } from '@/hooks/use-design-scale';

const SECTORS_ASSET = require('@/assets/images/wheel/sectors.png');
const RING_ASSET = require('@/assets/images/wheel/ring.png');
const CENTER_ASSET = require('@/assets/images/wheel/center.png');
const ARROW_ASSET = require('@/assets/images/wheel/arrow.png');

/** Node 1:221 -- `wheel_all`, and where each layer sits inside it. */
const WHEEL = { width: 382, height: 394.025 } as const;
/** Node 1:874 -- sectors and their labels, exported as one piece. */
const SECTORS = { x: 30, y: 36, width: 322, height: 322.936 } as const;
/** Node 1:846 -- the rim. Drawn over the sectors. */
const RING = { x: 0, y: 12, size: 382 } as const;
/** Node 1:879. */
const CENTER = { x: 157, y: 163, size: 68 } as const;
/** Node 1:877. */
const ARROW = { x: 171, y: 0, width: 40, height: 70 } as const;

type WheelOfLuckProps = {
  /** Rotation of the sector disc in degrees. Only this layer turns. */
  angle: SharedValue<number>;
};

export function WheelOfLuck({ angle }: WheelOfLuckProps) {
  const scale = useDesignScale();

  const sectorsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  return (
    <View style={{ width: WHEEL.width * scale, height: WHEEL.height * scale }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: SECTORS.x * scale,
            top: SECTORS.y * scale,
            width: SECTORS.width * scale,
            height: SECTORS.height * scale,
          },
          sectorsStyle,
        ]}>
        <Image source={SECTORS_ASSET} style={StyleSheet.absoluteFill} contentFit="fill" />
      </Animated.View>

      <Image
        source={RING_ASSET}
        style={{
          position: 'absolute',
          left: RING.x * scale,
          top: RING.y * scale,
          width: RING.size * scale,
          height: RING.size * scale,
        }}
        contentFit="contain"
      />

      <Image
        source={CENTER_ASSET}
        style={{
          position: 'absolute',
          left: CENTER.x * scale,
          top: CENTER.y * scale,
          width: CENTER.size * scale,
          height: CENTER.size * scale,
        }}
        contentFit="contain"
      />

      <Image
        source={ARROW_ASSET}
        style={{
          position: 'absolute',
          left: ARROW.x * scale,
          top: ARROW.y * scale,
          width: ARROW.width * scale,
          height: ARROW.height * scale,
        }}
        contentFit="contain"
      />
    </View>
  );
}
