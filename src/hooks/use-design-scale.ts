import { useWindowDimensions } from 'react-native';

import { DesignFrame } from '@/constants/theme';

/** Past this the layout stops growing, so a tablet does not get giant controls. */
const MAX_LAYOUT_WIDTH = 520;

/**
 * Factor that turns a Figma measurement (taken on the 430pt-wide frame) into
 * device points. Screens lay themselves out in design units and multiply.
 */
export function useDesignScale() {
  const { width } = useWindowDimensions();
  return Math.min(width, MAX_LAYOUT_WIDTH) / DesignFrame.width;
}
