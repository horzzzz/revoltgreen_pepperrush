import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GameButton } from '@/components/ui/game-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { GameColors, SplashColors } from '@/constants/theme';
import {
  canConvertCoins,
  COINS_PER_EXCHANGE,
  convertCoinsToUsd,
  EXCHANGE_MIN_USD,
  USD_PER_EXCHANGE,
  useCoins,
  useUsd,
} from '@/game/player';
import { useDesignScale } from '@/hooks/use-design-scale';

const COIN_ASSET = require('@/assets/images/menu/coin.png');

/** Node I1:901;1:605 -- a decorative strip of supported payout methods. */
const PREVIEW_ICONS = [
  require('@/assets/images/exchange/methods/paypal.png'),
  require('@/assets/images/exchange/methods/visa.png'),
  require('@/assets/images/exchange/methods/tether.png'),
  require('@/assets/images/exchange/methods/google-pay.png'),
  require('@/assets/images/exchange/methods/btc.png'),
  require('@/assets/images/exchange/methods/eth.png'),
];
const PREVIEW_ICON_SIZE = 50;

/** Node 1:901 -- the card, and node I1:901;1:590's inner column width. */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const CONTENT_WIDTH = 334;

/**
 * The rate button's own type sizes, and the correction the arrow needs.
 *
 * `→` is drawn around the maths axis -- its ink centre sits at +0.350 em where
 * the digits' sits at +0.314 em -- so centring the two text boxes against each
 * other still leaves the arrow riding about a point high. Push it back down by
 * exactly that difference.
 */
const RATE_FONT_SIZE = 36;
const ARROW_FONT_SIZE = 28;
const ARROW_NUDGE = (0.35 - 0.314) * ARROW_FONT_SIZE;

/** Same green as the progress bar's fill and every outline on the screen. */
const GREEN = SplashColors.fillEdge;

const FILL_GRADIENT = {
  colors: [GREEN, SplashColors.fillMid, GREEN] as const,
  locations: [0, 0.43756, 1] as const,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

/** 1644 -> "1,644" -- Hermes has no reliable Intl, so group by hand. */
function group(value: number) {
  return String(Math.floor(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type ExchangePanelProps = {
  onPlay: () => void;
  onAddPayout: () => void;
};

/** The Exchange card (Figma node 1:901). */
export function ExchangePanel({ onPlay, onAddPayout }: ExchangePanelProps) {
  const scale = useDesignScale();
  const coins = useCoins();
  const usd = useUsd();

  const coinProgress = Math.min(coins / COINS_PER_EXCHANGE, 1);
  const usdProgress = Math.min(usd / EXCHANGE_MIN_USD, 1);
  const unlocked = usd >= EXCHANGE_MIN_USD;
  // Reads the store rather than `coins` so the button and the mutation agree
  // on one rule; `coins` is what re-renders this when the balance moves.
  const canConvert = canConvertCoins();

  const exchange = () => {
    Alert.alert('Exchange', `Your payout request for $${group(usd)} has been received.`);
  };

  return (
    <View
      style={[
        styles.card,
        {
          width: CARD.width * scale,
          padding: CARD.padding * scale,
          borderRadius: CARD.radius * scale,
        },
      ]}>
      <View style={[styles.inner, { width: CONTENT_WIDTH * scale }]}>
        <View style={[styles.topGroup, { gap: 24 * scale }]}>
          <GameButton
            label="Add payout method"
            width={CONTENT_WIDTH}
            height={72}
            fontSize={24}
            onPress={onAddPayout}
          />

          {/* Coins -> $ conversion progress (node I1:901;1:594). */}
          <View style={[styles.rowBetween, { gap: 12 * scale }]}>
            <View
              style={[
                styles.coinTrack,
                { width: 296 * scale, height: 16 * scale, borderWidth: 2 * scale },
              ]}>
              <View style={{ width: `${coinProgress * 100}%`, height: '100%' }}>
                <LinearGradient {...FILL_GRADIENT} style={StyleSheet.absoluteFill} />
              </View>
            </View>
            <Image
              source={COIN_ASSET}
              style={{ width: 21 * scale, height: 20 * scale }}
              contentFit="contain"
            />
          </View>

          <View style={styles.rowBetween}>
            <AppText style={{ fontSize: 20 * scale }}>
              {group(coins)}/{group(COINS_PER_EXCHANGE)}
            </AppText>
            <GameButton label="Play to start" width={160} height={55} fontSize={16} onPress={onPlay} />
          </View>

          {/* Conversion rate (node I1:901;1:601) -- the control that performs
              the conversion. Coins used to roll over into dollars on their own
              the instant the balance crossed a batch; now one press buys one
              batch, so the player chooses when (and how much) to convert. */}
          <PressableScale
            onPress={convertCoinsToUsd}
            disabled={!canConvert}
            accessibilityRole="button"
            accessibilityLabel={`Exchange ${group(COINS_PER_EXCHANGE)} coins for $${USD_PER_EXCHANGE}`}
            style={[
              styles.rate,
              {
                gap: 12 * scale,
                borderWidth: 2 * scale,
                borderRadius: 10 * scale,
                paddingHorizontal: 24 * scale,
                paddingVertical: 6 * scale,
              },
              !canConvert && styles.rateLocked,
            ]}>
            <AppText style={{ fontSize: RATE_FONT_SIZE * scale }}>
              {group(COINS_PER_EXCHANGE)}
            </AppText>
            <AppText style={{ fontSize: ARROW_FONT_SIZE * scale, marginTop: ARROW_NUDGE * scale }}>
              {'→'}
            </AppText>
            <AppText style={{ fontSize: RATE_FONT_SIZE * scale }}>${USD_PER_EXCHANGE}</AppText>
          </PressableScale>

          {/* Payout methods (node I1:901;1:605) -- decorative. */}
          <View style={styles.rowBetween}>
            {PREVIEW_ICONS.map((icon, i) => (
              <View
                key={i}
                style={{
                  width: PREVIEW_ICON_SIZE * scale,
                  height: PREVIEW_ICON_SIZE * scale,
                  borderRadius: (PREVIEW_ICON_SIZE / 2) * scale,
                  overflow: 'hidden',
                }}>
                <Image source={icon} style={StyleSheet.absoluteFill} contentFit="cover" />
              </View>
            ))}
          </View>

          {/* Dollar balance (node I1:901;1:651). */}
          <View
            style={[
              styles.balanceBox,
              {
                borderWidth: 2 * scale,
                borderRadius: 10 * scale,
                paddingHorizontal: 24 * scale,
                paddingVertical: 12 * scale,
              },
            ]}>
            <AppText style={{ fontSize: 16 * scale }}>BALANCE</AppText>
            <AppText style={{ fontSize: 24 * scale }}>$ {group(usd)}</AppText>
          </View>

          {/* $ -> $100 exchange-unlock progress (node I1:901;1:656). */}
          <View style={[styles.usdGroup, { gap: 12 * scale }]}>
            <View style={styles.rowBetween}>
              <AppText style={{ fontSize: 14 * scale, width: 32 * scale }}>$1</AppText>
              <View
                style={[
                  styles.usdTrack,
                  { width: 254 * scale, height: 8 * scale, borderWidth: 1 * scale },
                ]}>
                <View
                  style={[
                    styles.knob,
                    {
                      width: 16 * scale,
                      height: 16 * scale,
                      borderRadius: 8 * scale,
                      left: usdProgress * (254 - 16) * scale,
                    },
                  ]}>
                  <LinearGradient {...FILL_GRADIENT} style={StyleSheet.absoluteFill} />
                </View>
              </View>
              <AppText style={{ fontSize: 14 * scale, textAlign: 'right' }}>
                ${EXCHANGE_MIN_USD}
              </AppText>
            </View>
            <AppText style={{ fontSize: 14 * scale }}>${group(usd)}</AppText>
          </View>
        </View>

        {/* Exchange (node I1:901;1:663) -- locked until the $ balance reaches $100. */}
        <View style={[styles.bottomGroup, { gap: 12 * scale }]}>
          <GameButton
            label="Exchange"
            width={CONTENT_WIDTH}
            height={94}
            fontSize={36}
            dimmed={!unlocked}
            disabled={!unlocked}
            onPress={exchange}
          />
          <AppText style={{ fontSize: 14 * scale, textAlign: 'center' }}>
            {unlocked ? 'Ready to exchange.' : `Get $${EXCHANGE_MIN_USD} to Exchange.`}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topGroup: {
    width: '100%',
    alignItems: 'center',
  },
  bottomGroup: {
    width: '100%',
    alignItems: 'center',
  },
  usdGroup: {
    width: '100%',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  rate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: GREEN,
  },
  /** Not enough coins banked for a batch -- same treatment as a dimmed plate. */
  rateLocked: {
    opacity: 0.5,
  },
  coinTrack: {
    borderColor: GREEN,
    borderRadius: 500,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  usdTrack: {
    borderColor: GREEN,
    borderRadius: 500,
    backgroundColor: GameColors.panel,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    overflow: 'hidden',
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: GREEN,
    width: '100%',
  },
});
