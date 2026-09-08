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
    /**
     * Android otherwise lays every line out inside the font's *bounding box*
     * (head yMax/yMin: +1051 / -286 per 1000 em) instead of its line metrics
     * (hhea ascent/descent: +873 / -245). GFS Neohellenic's bounding box runs
     * far higher above the caps than it does below the descenders, so that
     * padding is lopsided and the glyphs end up sitting ~6.9% of the font size
     * *below* the middle of their own box -- 2.8pt on a 40pt button label.
     * Anything centred against that box (every `GameButton` label, the daily
     * bonus amount next to its coin, the plates on the game screen) came out
     * low by exactly that much.
     *
     * With the padding off the box is the hhea one, whose centre lands on
     * +314 -- which is where the digits actually sit (`0` spans -16..644,
     * centre +314) and within a percent of where the caps do. iOS already
     * measured it this way, so this also makes the two platforms agree.
     */
    includeFontPadding: false,
  },
});
