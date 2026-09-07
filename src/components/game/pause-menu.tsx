import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { GameColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

/** Node 1:215 -- same blurred green backdrop as the big win screen and settings. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

/** Node 1:216 -- the card, header row, and the button list inside it. */
const CARD = { width: 382, padding: 24, gap: 36, radius: 20 } as const;
const HEADER_HEIGHT = 35;
const BUTTON = { width: 334, height: 94, fontSize: 40, gap: 12 } as const;

type PauseMenuProps = {
  onResume: () => void;
  onRestart: () => void;
  onExchange: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
};

/** Pause menu (Figma node 1:213). No close button -- Play is what dismisses it. */
export function PauseMenu({
  onResume,
  onRestart,
  onExchange,
  onSettings,
  onMainMenu,
}: PauseMenuProps) {
  const scale = useDesignScale();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={30}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={[StyleSheet.absoluteFill, styles.center]}>
        <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />

        <View
          style={[
            styles.card,
            {
              width: CARD.width * scale,
              padding: CARD.padding * scale,
              gap: CARD.gap * scale,
              borderRadius: CARD.radius * scale,
            },
          ]}>
          <View style={{ height: HEADER_HEIGHT * scale, justifyContent: 'center' }}>
            <AppText weight="bold" style={[styles.heading, { fontSize: 30 * scale }]}>
              Paused
            </AppText>
          </View>

          <View style={{ gap: BUTTON.gap * scale }}>
            <GameButton {...BUTTON} label="Play" onPress={onResume} />
            <GameButton {...BUTTON} label="Restart" onPress={onRestart} />
            <GameButton {...BUTTON} label="Exchange" onPress={onExchange} />
            <GameButton {...BUTTON} label="Settings" onPress={onSettings} />
            <GameButton {...BUTTON} label="Main Menu" onPress={onMainMenu} />
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heading: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
