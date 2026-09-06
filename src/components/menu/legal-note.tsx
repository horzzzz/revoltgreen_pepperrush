import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { MenuColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

type LegalNoteProps = {
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
};

/** 18+ notice under the Play button (Figma node 1:182). */
export function LegalNote({ onOpenTerms, onOpenPrivacy }: LegalNoteProps) {
  const scale = useDesignScale();

  return (
    <View style={[styles.plate, { paddingVertical: 8 * scale, gap: 4 * scale }]}>
      <AppText style={[styles.disclaimer, { fontSize: 12 * scale }]}>
        By tapping “Play” you confirm that you 18+ and
      </AppText>

      <View style={[styles.links, { gap: 5 * scale }]}>
        <AppText style={{ fontSize: 16 * scale }}>our</AppText>
        <PressableScale onPress={onOpenTerms} accessibilityRole="link">
          <AppText style={[styles.link, { fontSize: 16 * scale }]}>Terms Of Use</AppText>
        </PressableScale>
        <AppText style={{ fontSize: 16 * scale }}>&</AppText>
        <PressableScale onPress={onOpenPrivacy} accessibilityRole="link">
          <AppText style={[styles.link, { fontSize: 16 * scale }]}>Privacy Policy</AppText>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    // Spans the full screen even though the stack above it is 382 wide.
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: MenuColors.notice,
  },
  disclaimer: {
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
});
