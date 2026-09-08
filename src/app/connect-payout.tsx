import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PayoutConnectCard } from '@/components/exchange/payout-connect-card';
import { playSfx } from '@/game/audio/engine';
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

  // The card's own Close button already sounds through its PressableScale
  // (sfx="ui-back") -- this handler is only for the backdrop.
  const close = () => router.back();
  const closeFromBackdrop = () => {
    playSfx('ui-back');
    close();
  };

  if (!method) {
    close();
    return null;
  }

  const initialValues = connection?.method === method.key ? connection.fields : {};

  const save = (values: Record<string, string>) => {
    connectPayout(method.key, values);
    playSfx('unlock');
    // Only this modal goes away. It used to unwind all the way to Exchange,
    // which threw the player out of the method list they were working in --
    // the list is still behind the card and already re-renders the saved
    // method as "Connected", so dropping the card is the whole job.
    close();
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closeFromBackdrop} accessibilityLabel="Close">
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
