import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PayoutConnectCard } from '@/components/exchange/payout-connect-card';
import { connectPayout, usePayout } from '@/game/payout';
import { payoutMethodInfo } from '@/game/payout-methods';

/** Same blurred green scrim as the pause menu and settings sheet. */
const SCRIM = ['rgba(8,40,8,0.8)', 'rgba(6,38,3,0.8)'] as const;

/** Connect a payout method (Figma nodes 1:907 / 1:913) -- shown over Exchange. */
export default function ConnectPayoutScreen() {
  const router = useRouter();
  const { method: methodKey } = useLocalSearchParams<{ method: string }>();
  const connection = usePayout();
  const method = methodKey ? payoutMethodInfo(methodKey) : undefined;

  const close = () => router.back();

  if (!method) {
    close();
    return null;
  }

  const initialValues = connection?.method === method.key ? connection.fields : {};

  const save = (values: Record<string, string>) => {
    connectPayout(method.key, values);
    // Drop the modal and the method list, landing back on Exchange where the
    // top button now reads "Connected".
    router.dismissTo('/exchange');
  };

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
        pointerEvents="box-none">
        <PayoutConnectCard
          method={method}
          initialValues={initialValues}
          onClose={close}
          onSave={save}
        />
      </KeyboardAvoidingView>
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
