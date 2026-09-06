import { BlurView } from 'expo-blur';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDesignScale } from '@/hooks/use-design-scale';

/** Design puts the bar's top padding at 64 on a frame with a 59pt status bar. */
const STATUS_BAR_GAP = 5;

type TopBarShellProps = {
  children: React.ReactNode;
  /** The menu's bar rounds its bottom corners (node 1:190); other screens don't. */
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The blurred plate every screen's top bar sits on. Its own height comes from
 * the safe area, so the 112pt of the Figma frame is only reproduced on a device
 * whose status bar matches the design's.
 */
export function TopBarShell({ children, rounded = false, style }: TopBarShellProps) {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={18}
      tint="dark"
      experimentalBlurMethod="dimezisBlurView"
      style={[
        styles.bar,
        {
          paddingTop: insets.top + STATUS_BAR_GAP * scale,
          paddingBottom: 12 * scale,
          paddingHorizontal: 24 * scale,
          borderBottomLeftRadius: rounded ? 20 * scale : 0,
          borderBottomRightRadius: rounded ? 20 * scale : 0,
        },
        style,
      ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
