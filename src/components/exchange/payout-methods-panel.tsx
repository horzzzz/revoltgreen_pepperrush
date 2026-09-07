import { StyleSheet, View } from 'react-native';

import { PayoutMethodRow, type PayoutMethod } from '@/components/exchange/payout-method-row';
import { GameColors } from '@/constants/theme';
import { useDesignScale } from '@/hooks/use-design-scale';

/**
 * Node I1:906;1:789 -- the list, top to bottom. The mockup pins eleven methods
 * at the top; the rest are the remaining icons from the payout-method library
 * (Figma node 1:696).
 */
const METHODS: PayoutMethod[] = [
  { key: 'paypal', label: 'PayPal', icon: require('@/assets/images/exchange/methods/paypal.png') },
  { key: 'visa', label: 'Visa', icon: require('@/assets/images/exchange/methods/visa.png') },
  { key: 'trc20', label: 'TRC20', icon: require('@/assets/images/exchange/methods/tether.png') },
  { key: 'google-pay', label: 'Google Pay', icon: require('@/assets/images/exchange/methods/google-pay.png') },
  { key: 'btc', label: 'BTC', icon: require('@/assets/images/exchange/methods/btc.png') },
  { key: 'eth', label: 'ETH', icon: require('@/assets/images/exchange/methods/eth.png') },
  { key: 'samsung-pay', label: 'Samsung Pay', icon: require('@/assets/images/exchange/methods/samsung-pay.png') },
  { key: 'payeer', label: 'Payeer', icon: require('@/assets/images/exchange/methods/payeer.png') },
  { key: 'card', label: 'Card', icon: require('@/assets/images/exchange/methods/card.png') },
  { key: 'cartes-bancaires', label: 'Cartes Bancaires', icon: require('@/assets/images/exchange/methods/cartes-bancaires.png') },
  { key: 'korean-cards', label: 'Korean Cards', icon: require('@/assets/images/exchange/methods/korean-cards.png') },
  { key: 'mastercard', label: 'Mastercard', icon: require('@/assets/images/exchange/methods/mastercard.png') },
  { key: 'amazon', label: 'Amazon Pay', icon: require('@/assets/images/exchange/methods/amazon.png') },
  { key: 'apple-pay', label: 'Apple Pay', icon: require('@/assets/images/exchange/methods/apple-pay.png') },
  { key: 'blik', label: 'BLIK', icon: require('@/assets/images/exchange/methods/blik.png') },
  { key: 'bank', label: 'Bank Transfer', icon: require('@/assets/images/exchange/methods/bank.png') },
  { key: 'crypto', label: 'Crypto Wallet', icon: require('@/assets/images/exchange/methods/crypto.png') },
  { key: 'skrill', label: 'Skrill', icon: require('@/assets/images/exchange/methods/skrill.png') },
  { key: 'eps', label: 'eps', icon: require('@/assets/images/exchange/methods/eps.png') },
  { key: 'klarna', label: 'Klarna', icon: require('@/assets/images/exchange/methods/klarna.png') },
  { key: 'wallet-pay', label: 'Wallet Pay', icon: require('@/assets/images/exchange/methods/wallet-pay.png') },
  { key: 'ideal-wero', label: 'iDEAL / Wero', icon: require('@/assets/images/exchange/methods/ideal-wero.png') },
  { key: 'interac', label: 'Interac', icon: require('@/assets/images/exchange/methods/interac.png') },
  { key: 'kakao-pay', label: 'Kakao Pay', icon: require('@/assets/images/exchange/methods/kakao-pay.png') },
  { key: 'mb-way', label: 'MB WAY', icon: require('@/assets/images/exchange/methods/mb-way.png') },
  { key: 'npay', label: 'Naver Pay', icon: require('@/assets/images/exchange/methods/npay.png') },
  { key: 'affirm', label: 'Affirm', icon: require('@/assets/images/exchange/methods/affirm.png') },
  { key: 'p24', label: 'Przelewy24', icon: require('@/assets/images/exchange/methods/p24.png') },
  { key: 'payco', label: 'PAYCO', icon: require('@/assets/images/exchange/methods/payco.png') },
  { key: 'pix', label: 'Pix', icon: require('@/assets/images/exchange/methods/pix.png') },
  { key: 'sepa', label: 'SEPA', icon: require('@/assets/images/exchange/methods/sepa.png') },
  { key: 'upi', label: 'UPI', icon: require('@/assets/images/exchange/methods/upi.png') },
];

/** Node 1:906 -- the card, and node I1:906;1:789's row gap. */
const CARD = { width: 382, padding: 24, radius: 20 } as const;
const CONTENT_WIDTH = 334;
const ROW_GAP = 12;

type PayoutMethodsPanelProps = {
  onConnect: (key: string) => void;
};

/** The payout method list card (Figma node 1:906). */
export function PayoutMethodsPanel({ onConnect }: PayoutMethodsPanelProps) {
  const scale = useDesignScale();

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
      <View style={[styles.list, { width: CONTENT_WIDTH * scale, gap: ROW_GAP * scale }]}>
        {METHODS.map((method) => (
          <PayoutMethodRow key={method.key} method={method} onConnect={onConnect} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.panel,
    borderWidth: 1,
    borderColor: GameColors.panelBorder,
    alignItems: 'center',
    overflow: 'hidden',
  },
  list: {
    alignItems: 'center',
  },
});
