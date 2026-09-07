import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { playSfx } from '@/game/audio/engine';
import type { SfxId } from '@/game/audio/sfx';

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /**
   * Which clip a successful press plays. Defaults to `ui-click`; the usual
   * override is `ui-back` on a Back/Close button, or `ui-toggle` on a switch.
   * Ignored when the press is rejected -- that always plays `ui-denied`.
   */
  sfx?: SfxId;
  /**
   * Skips the press sound entirely -- for a control that already fires its
   * own dedicated sound (the spin button, the big-win overlay's own fanfare),
   * or a backdrop that shouldn't click at all.
   */
  silent?: boolean;
};

/**
 * Pressable that dips and dims while held and plays the shared UI click --
 * every button in the app goes through this, so the feedback is consistent
 * and can't be forgotten on a new one.
 *
 * Fires the sound on `onPressIn`, not `onPress`: finger-down is what reads as
 * an instant response, and `onPress` doesn't land until finger-up, which
 * would make the click lag the button's own press-in scale animation.
 *
 * `disabled` is handled here rather than handed to `Pressable`, which would
 * stop dispatching touches entirely and leave a locked button completely
 * silent -- a tap that does nothing *and* says nothing reads as the app being
 * broken. Instead a disabled press plays the rejection blip and goes no
 * further: the wrapped handlers never run, the press-in scale never applies,
 * and `accessibilityState` still reports the button as disabled the way
 * `Pressable` used to do for us.
 */
export function PressableScale({
  style,
  onPressIn,
  onPress,
  onLongPress,
  disabled,
  sfx = 'ui-click',
  silent,
  accessibilityState,
  ...rest
}: PressableScaleProps) {
  const handlePressIn = (event: GestureResponderEvent) => {
    if (!silent) playSfx(disabled ? 'ui-denied' : sfx);
    if (!disabled) onPressIn?.(event);
  };

  const enabledOnly = <T,>(handler: T | undefined): T | undefined => (disabled ? undefined : handler);

  return (
    <Pressable
      {...rest}
      onPressIn={handlePressIn}
      onPress={enabledOnly(onPress)}
      onLongPress={enabledOnly(onLongPress)}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      style={({ pressed }) => [style, pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
    />
  );
}
