import { PLAYER } from '@/game/player';

export type Standing = {
  rank: number;
  name: string;
  /** Withdrawal amount in dollars. */
  amount: number;
  isPlayer?: boolean;
};

/** Placeholder opponents, highest first. Amounts come from the Figma frame. */
const RIVALS: { name: string; amount: number }[] = [
  { name: 'NeonFalcon', amount: 100_000 },
  { name: 'CrimsonByte', amount: 99_000 },
  { name: 'VoltJuno', amount: 75_000 },
  { name: 'HexReaper', amount: 50_000 },
  { name: 'SolarKit', amount: 25_000 },
  { name: 'GhostPepper', amount: 10_000 },
  { name: 'MintCircuit', amount: 5_000 },
  { name: 'AshPilot', amount: 2_000 },
  { name: 'ZeroLuna', amount: 1_000 },
];

/**
 * Slots the player into the ranking by balance. Ties go to the rival, so a
 * player who only matches an opponent's amount lands just below them.
 *
 * `rows` is the whole table including the player; `you` is the same entry,
 * handed back separately for the row pinned to the bottom of the card.
 */
export function buildStandings(balance: number = PLAYER.balance): {
  rows: Standing[];
  you: Standing;
} {
  const ahead = RIVALS.filter((rival) => rival.amount >= balance).length;
  const you: Standing = { rank: ahead + 1, name: PLAYER.name, amount: balance, isPlayer: true };

  // The player occupies a rank, so everyone below them shifts down one.
  const rows: Standing[] = RIVALS.map((rival, index) => ({
    ...rival,
    rank: index < ahead ? index + 1 : index + 2,
  }));
  rows.splice(ahead, 0, you);

  return { rows, you };
}

/** "12500" -> "$ 12,500" */
export function formatAmount(amount: number) {
  return `$ ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
