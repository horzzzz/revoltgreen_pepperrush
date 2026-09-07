/**
 * AppMetrica event reporting -- a thin, typed wrapper so call sites stay
 * declarative and the event / parameter names match the analytics spec
 * exactly. `activate()` is called once from the root layout; every reporter
 * below is a no-op until it has run.
 *
 * Spec events used by this app: `game` (the slot loop), `purchase` (coin
 * packs) and `settings`. There is no subscription paywall and no rewarded
 * video, so `paywall` and `rewarded_ad` are intentionally absent.
 */
import AppMetrica from '@appmetrica/react-native-analytics';

const API_KEY = '8d7d351d-6a18-403b-8128-557031485959';

let ready = false;

export function initAnalytics() {
  if (ready) return;
  try {
    AppMetrica.activate({ apiKey: API_KEY, sessionTimeout: 120 });
    ready = true;
  } catch {
    // Native module missing (e.g. Expo Go) -- reporting stays a no-op.
  }
}

function report(event: string, params: Record<string, unknown>) {
  if (!ready) return;
  try {
    AppMetrica.reportEvent(event, params);
  } catch {
    // Never let analytics throw into game logic.
  }
}

/** `game` -- one call per slot action. */
export function reportGame(action: 'start' | 'win' | 'loss') {
  report('game', { action });
}

/** `purchase` -- coin pack lifecycle. `price` omitted when not known yet. */
export function reportPurchase(
  action: 'click' | 'success' | 'error',
  itemId: string,
  price?: number,
) {
  const params: Record<string, unknown> = { action, item_id: itemId };
  if (typeof price === 'number' && Number.isFinite(price)) params.price = price;
  report('purchase', params);
}

/** `settings` -- the settings sheet was opened. */
export function reportSettingsOpen() {
  report('settings', { action: 'open' });
}

/** Best-effort numeric price from a localized string like "$2.99" / "2,99 €". */
export function parsePrice(display?: string): number | undefined {
  if (!display) return undefined;
  const match = display.replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : undefined;
}
