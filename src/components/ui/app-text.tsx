import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, SplashColors } from '@/constants/theme';

export type AppTextProps = TextProps & {
  weight?: keyof typeof Fonts;
};

/**
 * Every text in the app is GFS Neohellenic, so screens render text through
 * this instead of react-native's `Text` -- the family has to be set on each
 * text node, there is no app-wide default.
 */
export function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[styles.base, { fontFamily: Fonts[weight] }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: SplashColors.text,
  },
});
