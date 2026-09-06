import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SettingsCard, type SwitchKey } from '@/components/settings/settings-card';

/** Node 1:167 -- the sheet dims and blurs whatever screen is underneath. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

/** Notifications start off, as in the design. Not persisted yet. */
const INITIAL: Record<SwitchKey, boolean> = {
  music: true,
  sound: true,
  vibration: true,
  notifications: false,
};

export default function SettingsScreen() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL);

  const close = () => router.back();

  return (
    <View style={styles.container}>
      {/* Tapping outside the card closes the sheet. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close settings">
        <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill}>
          <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />
        </BlurView>
      </Pressable>

      <SettingsCard
        values={values}
        onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
        onClose={close}
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
