/**
 * Art for every board cell. The tiles are exported one by one from the
 * `elements` section of the Figma file -- on the mocked-up screen they are
 * crops of a sprite atlas, which is not something the app can slice.
 */

import type { ImageSourcePropType } from 'react-native';

import type { Cell } from '@/game/slot/symbols';

export const SYMBOL_ART: Record<Cell, ImageSourcePropType> = {
  WW: require('@/assets/images/game/symbols/wild.png'),
  H1: require('@/assets/images/game/symbols/safe.png'),
  H2: require('@/assets/images/game/symbols/diamond.png'),
  H3: require('@/assets/images/game/symbols/skull.png'),
  H4: require('@/assets/images/game/symbols/chili-green.png'),
  L1: require('@/assets/images/game/symbols/a.png'),
  L2: require('@/assets/images/game/symbols/k.png'),
  L3: require('@/assets/images/game/symbols/q.png'),
  L4: require('@/assets/images/game/symbols/j.png'),
  T_GREEN: require('@/assets/images/game/symbols/chili-green-token.png'),
  T_GOLD: require('@/assets/images/game/symbols/chili-gold.png'),
  T_RED: require('@/assets/images/game/symbols/chili-red.png'),
};
