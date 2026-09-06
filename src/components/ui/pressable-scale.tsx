import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Pressable that dips and dims while held. Every control in the menu is still
 * a stub, so this is the only feedback a tap gives.
 */
/** Stub handler so a control without a destination still reacts to a tap. */
const noop = () => {};

export function PressableScale({ style, onPress = noop, ...rest }: PressableScaleProps) {
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    />
  );
}
