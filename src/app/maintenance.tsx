import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { MaintenanceCard } from '@/components/exchange/maintenance-card';

/** Same blurred green scrim as the pause menu and settings sheet. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

/**
 * "Maintenance" modal (Figma node 1:194). The Exchange screen redirects here
 * once the player's $ balance reaches `EXCHANGE_MIN_USD` ($100) -- exchanging
 * is not available yet, so this stands in for the exchange flow.
 */
export default function MaintenanceScreen() {
  const router = useRouter();
  const close = () => router.back();

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close">
        <BlurView
          intensity={30}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}>
          <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />
        </BlurView>
      </Pressable>

      <View style={styles.center} pointerEvents="box-none">
        <MaintenanceCard onClose={close} onRetry={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
