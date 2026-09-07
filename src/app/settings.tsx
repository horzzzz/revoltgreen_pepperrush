import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { SettingsCard } from '@/components/settings/settings-card';
import { LEGAL_URLS } from '@/constants/legal';
import { reportSettingsOpen } from '@/game/analytics';
import { playSfx } from '@/game/audio/engine';
import { setAudioSetting, useAudioSettings } from '@/game/audio/settings';

/** Node 1:167 -- the sheet dims and blurs whatever screen is underneath. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const values = useAudioSettings();

  useEffect(() => {
    reportSettingsOpen();
  }, []);

  // The card's own Close button already sounds through its PressableScale
  // (sfx="ui-back") -- this handler is only for the backdrop, which is a
  // plain Pressable and stays silent on its own.
  const close = () => router.back();
  const closeFromBackdrop = () => {
    playSfx('ui-back');
    close();
  };

  return (
    <View style={styles.container}>
      {/* Tapping outside the card closes the sheet. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={closeFromBackdrop} accessibilityLabel="Close settings">
        <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill}>
          <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />
        </BlurView>
      </Pressable>

      <SettingsCard
        values={values}
        onChange={setAudioSetting}
        onClose={close}
        onOpenTerms={() => Linking.openURL(LEGAL_URLS.terms).catch(() => {})}
        onOpenPrivacy={() => Linking.openURL(LEGAL_URLS.privacy).catch(() => {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
