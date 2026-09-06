import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LegalNote } from '@/components/menu/legal-note';
import { TopBar } from '@/components/menu/top-bar';
import { GameButton } from '@/components/ui/game-button';
import { MenuColors, SplashColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

// The menu's `bg` instance is a different variant than the splash one -- same
// arch, no pepper floating in the middle.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');
const LOGO_ASSET = require('@/assets/images/menu/logo.png');
const HERO_ASSET = require('@/assets/images/menu/hero.png');

/** Node 1:239 -- the inner logo box, 302-wide frame around it is empty. */
const LOGO = { width: 239.4, height: 189, topBarGap: 10 } as const;
/** Node 1:176 -- the character, centred 24pt right of the screen's axis. */
const HERO = { width: 830, height: 1246, offsetX: 24, belowLogo: 115 } as const;
/** Node 1:177 -- scrim that fades the character into the bottom of the screen. */
const SCRIM_HEIGHT = 425;
/** Node 1:178 -- 64 from the frame bottom, of which 34 is the home indicator. */
const STACK_BOTTOM_GAP = 30;
const STACK_GAP = 36;
/** Node 1:355 -- the Play plate. */
const PLAY = { width: 382, height: 94, fontSize: 40 } as const;

/** Main menu (Figma node 1:173). Every control is still a stub. */
export default function MenuScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Anchoring the logo to the bar (rather than to a fixed 122pt) keeps the
  // header composition intact on a device with a taller status bar.
  const topBarHeight = insets.top + (5 + 36 + 12) * scale;
  const logoTop = topBarHeight + LOGO.topBarGap * scale;

  return (
    <View style={styles.container}>
      <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

      <Image
        source={LOGO_ASSET}
        style={[
          styles.logo,
          {
            top: logoTop,
            width: LOGO.width * scale,
            height: LOGO.height * scale,
            marginLeft: (-LOGO.width * scale) / 2,
          },
        ]}
        contentFit="contain"
      />

      <Image
        source={HERO_ASSET}
        style={{
          position: 'absolute',
          top: logoTop + HERO.belowLogo * scale,
          left: width / 2 + HERO.offsetX * scale - (HERO.width * scale) / 2,
          width: HERO.width * scale,
          height: HERO.height * scale,
        }}
        contentFit="cover"
      />

      <LinearGradient
        colors={[MenuColors.scrimFrom, MenuColors.scrimTo]}
        style={[styles.scrim, { height: SCRIM_HEIGHT * scale }]}
      />

      <View
        style={[
          styles.stack,
          { bottom: insets.bottom + STACK_BOTTOM_GAP * scale, gap: STACK_GAP * scale },
        ]}>
        <GameButton label="Play" {...PLAY} />
        <LegalNote />
      </View>

      <TopBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  logo: {
    position: 'absolute',
    left: '50%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  stack: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
