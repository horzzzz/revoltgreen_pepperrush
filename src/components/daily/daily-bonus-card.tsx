import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { CountUpText, formatWhole } from '@/components/ui/count-up-text';
import { GameButton } from '@/components/ui/game-button';
import { SparkBurst } from '@/components/vfx/spark-burst';
import { useBump, usePopIn, usePulseScale } from '@/components/vfx/use-vfx';
import { GameColors, LeaderboardColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

const GIFT_ASSET = require('@/assets/images/daily/gift.png');
const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node 1:193. */
const CARD = { width: 382, padding: 24, radius: 20, gap: 36 } as const;
const GIFT = { width: 242, height: 251 } as const;
/** Node I1:193;1:339 -- the bordered strip under the gift. */
const NOTE = { radius: 15, border: 2, paddingVertical: 12, gap: 8 } as const;
const COIN = { width: 33, height: 32 } as const;
/** Node 1:361 -- the Claim plate is a touch shorter than the menu's Play. */
const CLAIM = { width: 334, height: 90, fontSize: 36 } as const;

type DailyBonusCardProps = {
  amount: number;
  onClaim?: () => void;
  /** Tapped after a claim -- leaves the screen. */
  onContinue?: () => void;
  /** The bonus was just claimed on this visit -- play the celebration. */
  claimed?: boolean;
  /** Already claimed today -- the button is dimmed and shows the countdown. */
  disabled?: boolean;
  /** "HH:MM:SS" until the next claim, shown under the button while disabled. */
  countdownLabel?: string;
};

export function DailyBonusCard({
  amount,
  onClaim,
  onContinue,
  claimed = false,
  disabled = false,
  countdownLabel,
}: DailyBonusCardProps) {
  const scale = useDesignScale();

  const trigger = claimed ? 1 : 0;
  // The gift kicks once on claim and then keeps a slow breath going under the
  // confetti; the amount pops in over a spark burst.
  const giftBumpStyle = useBump(trigger, 0.12);
  const giftPulseStyle = usePulseScale(claimed, 0.05, 6);
  const rewardPopStyle = usePopIn(claimed ? 1 : 0);

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
          borderWidth: 1 * scale,
          gap: CARD.gap * scale,
        },
      ]}>
      <View style={{ alignItems: 'center', gap: 12 * scale }}>
        <AppText weight="bold" style={[styles.title, { fontSize: 36 * scale }]}>
          {claimed ? 'Bonus Claimed!' : 'Daily Bonus!'}
        </AppText>

        <View style={{ alignItems: 'center', gap: 24 * scale }}>
          <View style={{ width: GIFT.width * scale, height: GIFT.height * scale }}>
            <Animated.View style={[StyleSheet.absoluteFill, giftBumpStyle]}>
              <Animated.View style={[StyleSheet.absoluteFill, giftPulseStyle]}>
                <Image source={GIFT_ASSET} style={StyleSheet.absoluteFill} contentFit="contain" />
              </Animated.View>
            </Animated.View>
            <SparkBurst trigger={trigger} count={20} radius={150} size={11} duration={1100} />
          </View>

          <View
            style={[
              styles.note,
              {
                borderRadius: NOTE.radius * scale,
                borderWidth: NOTE.border * scale,
                paddingVertical: NOTE.paddingVertical * scale,
                gap: NOTE.gap * scale,
              },
              claimed && styles.noteClaimed,
            ]}>
            {/* The design sets this one line in Georama; the app is one
                typeface throughout, so it stays GFS Neohellenic. */}
            <AppText style={{ fontSize: 20 * scale }}>
              {claimed ? 'Added to your balance' : 'We give you daily bonus!'}
            </AppText>

            <Animated.View style={[styles.reward, { gap: 6 * scale }, claimed && rewardPopStyle]}>
              <Image
                source={COIN_ASSET}
                style={{ width: COIN.width * scale, height: COIN.height * scale }}
                contentFit="contain"
              />
              {claimed ? (
                <CountUpText
                  value={amount}
                  duration={900}
                  format={(v) => `+${formatWhole(v)}`}
                  weight="bold"
                  style={{ fontSize: 36 * scale }}
                />
              ) : (
                <AppText weight="bold" style={{ fontSize: 36 * scale }}>
                  {amount}
                </AppText>
              )}
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'center', gap: 8 * scale }}>
        {claimed ? (
          <GameButton label="Continue" {...CLAIM} onPress={onContinue} sfx="ui-back" />
        ) : (
          <GameButton
            label="Claim"
            {...CLAIM}
            onPress={onClaim}
            dimmed={disabled}
            disabled={disabled}
          />
        )}
        {!claimed && disabled && countdownLabel ? (
          <AppText style={{ fontSize: 18 * scale }}>Next bonus in {countdownLabel}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LeaderboardColors.panel,
    borderColor: LeaderboardColors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  note: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderColor: LeaderboardColors.border,
    overflow: 'hidden',
  },
  noteClaimed: {
    borderColor: GameColors.chipGlow,
    backgroundColor: 'rgba(38,255,0,0.12)',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
