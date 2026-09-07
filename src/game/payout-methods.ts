/**
 * The payout method catalogue (Figma node 1:696) and the form each one asks for
 * on its connect screen (Figma nodes 1:907 / 1:913). The field sets are picked
 * to match how each method is actually paid out -- an e-wallet wants an email or
 * account id, a card wants the holder and number, a crypto network wants the
 * wallet address, a bank wants the IBAN, and mobile wallets are keyed by phone.
 */

import type { ImageSourcePropType } from 'react-native';

export type PayoutFieldSpec = {
  key: string;
  /** Placeholder text, shown exactly as written (the design keeps it lowercased). */
  label: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

export type PayoutMethodInfo = {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  fields: PayoutFieldSpec[];
};

// --- reusable field presets ------------------------------------------------

const NAME: PayoutFieldSpec = { key: 'name', label: 'Name' };
const EMAIL: PayoutFieldSpec = { key: 'email', label: 'Email', keyboardType: 'email-address' };
const PHONE: PayoutFieldSpec = { key: 'phone', label: 'Phone number', keyboardType: 'phone-pad' };
const CARD_HOLDER: PayoutFieldSpec = { key: 'holder', label: 'Cardholder name' };
const CARD_NUMBER: PayoutFieldSpec = { key: 'card', label: 'Card number', keyboardType: 'numeric' };
const IBAN: PayoutFieldSpec = { key: 'iban', label: 'IBAN' };

const card = (label = 'Card number') => [CARD_HOLDER, { ...CARD_NUMBER, label }];
const bankIban = [NAME, IBAN];
const wallet = (label: string): PayoutFieldSpec[] => [{ key: 'wallet', label }];

/** Used when a method has no explicit entry (keeps new library icons working). */
export const DEFAULT_PAYOUT_FIELDS: PayoutFieldSpec[] = [NAME, { key: 'account', label: 'Account / card number' }];

// --- catalogue -----------------------------------------------------------

const icon = (name: string): ImageSourcePropType => ICONS[name];

/** require() needs string literals, so the icons are resolved up front. */
const ICONS: Record<string, ImageSourcePropType> = {
  paypal: require('@/assets/images/exchange/methods/paypal.png'),
  visa: require('@/assets/images/exchange/methods/visa.png'),
  tether: require('@/assets/images/exchange/methods/tether.png'),
  'google-pay': require('@/assets/images/exchange/methods/google-pay.png'),
  btc: require('@/assets/images/exchange/methods/btc.png'),
  eth: require('@/assets/images/exchange/methods/eth.png'),
  'samsung-pay': require('@/assets/images/exchange/methods/samsung-pay.png'),
  payeer: require('@/assets/images/exchange/methods/payeer.png'),
  card: require('@/assets/images/exchange/methods/card.png'),
  'cartes-bancaires': require('@/assets/images/exchange/methods/cartes-bancaires.png'),
  'korean-cards': require('@/assets/images/exchange/methods/korean-cards.png'),
  mastercard: require('@/assets/images/exchange/methods/mastercard.png'),
  amazon: require('@/assets/images/exchange/methods/amazon.png'),
  'apple-pay': require('@/assets/images/exchange/methods/apple-pay.png'),
  blik: require('@/assets/images/exchange/methods/blik.png'),
  bank: require('@/assets/images/exchange/methods/bank.png'),
  crypto: require('@/assets/images/exchange/methods/crypto.png'),
  skrill: require('@/assets/images/exchange/methods/skrill.png'),
  eps: require('@/assets/images/exchange/methods/eps.png'),
  klarna: require('@/assets/images/exchange/methods/klarna.png'),
  'wallet-pay': require('@/assets/images/exchange/methods/wallet-pay.png'),
  'ideal-wero': require('@/assets/images/exchange/methods/ideal-wero.png'),
  interac: require('@/assets/images/exchange/methods/interac.png'),
  'kakao-pay': require('@/assets/images/exchange/methods/kakao-pay.png'),
  'mb-way': require('@/assets/images/exchange/methods/mb-way.png'),
  npay: require('@/assets/images/exchange/methods/npay.png'),
  affirm: require('@/assets/images/exchange/methods/affirm.png'),
  p24: require('@/assets/images/exchange/methods/p24.png'),
  payco: require('@/assets/images/exchange/methods/payco.png'),
  pix: require('@/assets/images/exchange/methods/pix.png'),
  sepa: require('@/assets/images/exchange/methods/sepa.png'),
  upi: require('@/assets/images/exchange/methods/upi.png'),
};

/** Node I1:906;1:789 -- the mockup's eleven, then the rest of the library. */
export const PAYOUT_METHODS: PayoutMethodInfo[] = [
  { key: 'paypal', label: 'PayPal', icon: icon('paypal'), fields: [EMAIL] },
  { key: 'visa', label: 'Visa', icon: icon('visa'), fields: card() },
  { key: 'trc20', label: 'TRC20', icon: icon('tether'), fields: wallet('USDT-TRC20 wallet address') },
  { key: 'google-pay', label: 'Google Pay', icon: icon('google-pay'), fields: [{ ...EMAIL, label: 'Google account email' }] },
  { key: 'btc', label: 'BTC', icon: icon('btc'), fields: wallet('BTC wallet address') },
  { key: 'eth', label: 'ETH', icon: icon('eth'), fields: wallet('ETH wallet address') },
  { key: 'samsung-pay', label: 'Samsung Pay', icon: icon('samsung-pay'), fields: [PHONE] },
  { key: 'payeer', label: 'Payeer', icon: icon('payeer'), fields: [NAME, { key: 'account', label: 'Account / card number' }] },
  { key: 'card', label: 'Card', icon: icon('card'), fields: [{ key: 'account', label: 'Card number / wallet address' }] },
  { key: 'cartes-bancaires', label: 'Cartes Bancaires', icon: icon('cartes-bancaires'), fields: card() },
  { key: 'korean-cards', label: 'Korean Cards', icon: icon('korean-cards'), fields: [{ key: 'account', label: 'Card number / wallet address' }] },
  { key: 'mastercard', label: 'Mastercard', icon: icon('mastercard'), fields: card() },
  { key: 'amazon', label: 'Amazon Pay', icon: icon('amazon'), fields: [EMAIL] },
  { key: 'apple-pay', label: 'Apple Pay', icon: icon('apple-pay'), fields: [{ ...EMAIL, label: 'Apple ID email' }] },
  { key: 'blik', label: 'BLIK', icon: icon('blik'), fields: [PHONE] },
  { key: 'bank', label: 'Bank Transfer', icon: icon('bank'), fields: [NAME, { key: 'account', label: 'Account number' }, { key: 'swift', label: 'SWIFT / BIC' }] },
  { key: 'crypto', label: 'Crypto Wallet', icon: icon('crypto'), fields: [{ key: 'network', label: 'Network' }, { key: 'wallet', label: 'Wallet address' }] },
  { key: 'skrill', label: 'Skrill', icon: icon('skrill'), fields: [EMAIL] },
  { key: 'eps', label: 'eps', icon: icon('eps'), fields: bankIban },
  { key: 'klarna', label: 'Klarna', icon: icon('klarna'), fields: [EMAIL] },
  { key: 'wallet-pay', label: 'Wallet Pay', icon: icon('wallet-pay'), fields: [PHONE] },
  { key: 'ideal-wero', label: 'iDEAL / Wero', icon: icon('ideal-wero'), fields: bankIban },
  { key: 'interac', label: 'Interac', icon: icon('interac'), fields: [EMAIL] },
  { key: 'kakao-pay', label: 'Kakao Pay', icon: icon('kakao-pay'), fields: [PHONE] },
  { key: 'mb-way', label: 'MB WAY', icon: icon('mb-way'), fields: [PHONE] },
  { key: 'npay', label: 'Naver Pay', icon: icon('npay'), fields: [PHONE] },
  { key: 'affirm', label: 'Affirm', icon: icon('affirm'), fields: [EMAIL] },
  { key: 'p24', label: 'Przelewy24', icon: icon('p24'), fields: [EMAIL] },
  { key: 'payco', label: 'PAYCO', icon: icon('payco'), fields: [PHONE] },
  { key: 'pix', label: 'Pix', icon: icon('pix'), fields: [{ key: 'pixkey', label: 'Pix key (CPF / email / phone)' }] },
  { key: 'sepa', label: 'SEPA', icon: icon('sepa'), fields: bankIban },
  { key: 'upi', label: 'UPI', icon: icon('upi'), fields: [{ key: 'upi', label: 'UPI ID' }] },
];

const BY_KEY = new Map(PAYOUT_METHODS.map((m) => [m.key, m]));

export function payoutMethodInfo(key: string): PayoutMethodInfo | undefined {
  return BY_KEY.get(key);
}
