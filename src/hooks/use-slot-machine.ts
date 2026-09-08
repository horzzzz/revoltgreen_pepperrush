import { useEffect, useRef, useState } from 'react';

import { DROP_MS, REEL_STAGGER_MS, SPIN_MS, SPIN_TOTAL_MS } from '@/components/game/board-layout';
import { WIN_POPUP_MS } from '@/constants/vfx';
import { reportGame } from '@/game/analytics';
import { playSfx, startSpinSound, stopSpinSound } from '@/game/audio/engine';
import { addCoins, spendCoins, useCoins } from '@/game/player';
import { type AutospinCount, DEFAULT_AUTOSPIN, DEFAULT_BET } from '@/game/slot/bet';
import { evaluate, type WinLine } from '@/game/slot/evaluate';
import { collectTokens, EMPTY_POTS, POTS, type PotKey, type PotState } from '@/game/slot/pots';
import { REEL_COUNT, ROW_COUNT, type SpinResult, spinReels } from '@/game/slot/reels';
import type { Token } from '@/game/slot/symbols';

/**
 * Pause after a spin that paid nothing. There is nothing on the board to read,
 * so this only has to be long enough that the reels do not look like they
 * never stopped.
 */
const AUTOSPIN_GAP_MS = 450;
/**
 * Pause after a spin that paid. The centre popup owns this beat -- the next
 * spin starts once the amount has finished counting up, held and faded, plus a
 * breath. Deriving it from `WIN_POPUP_MS` rather than hard-coding a number is
 * what keeps autospin from ever cutting a celebration in half: retiming the
 * popup retimes the loop with it.
 */
const AUTOSPIN_GAP_WIN_MS = WIN_POPUP_MS + 80;
/** From this multiple of the bet the win gets its own screen (node 1:198). */
const WIN_OVERLAY_X = 4;
/** And from this one the big win takes over and stops autospin (node 1:202). */
const BIG_WIN_X = 30;

export type Overlay = { kind: 'win' | 'bigWin'; amount: number };

type Phase = 'idle' | 'spinning' | 'landing';

/**
 * The centre popup's state. `amount` is kept even after the popup is dismissed
 * -- clearing it would flip the digits to 0.00 for the length of the fade --
 * so `live` is what says whether it should be on screen at all.
 */
type PopupState = { id: number; amount: number; live: boolean };
/** Per pot: how many times it has taken a chili. Drives the bounce. */
type PotBumps = Record<PotKey, number>;

const NO_BUMPS: PotBumps = { collect: 0, multiplier: 0, board: 0 };

const NO_WINS = emptyMask();

export function useSlotMachine() {
  const coins = useCoins();

  const [bet, setBetState] = useState(DEFAULT_BET);
  const [autospin, setAutospinState] = useState<AutospinCount>(DEFAULT_AUTOSPIN);
  const [autospinLeft, setAutospinLeftState] = useState(0);
  const [result, setResult] = useState<SpinResult>(spinReels);
  const [lines, setLines] = useState<WinLine[]>([]);
  const [winning, setWinning] = useState(NO_WINS);
  const [win, setWin] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pots, setPots] = useState<PotState>(EMPTY_POTS);
  const [overlay, setOverlay] = useState<Overlay | null>(null);

  // Counters, not flags: two identical wins in a row still change the number,
  // which is the case a boolean cannot express. Every effect downstream keys
  // its replay off one of these, so a new win restarts an animation instead of
  // stacking a second one on top of it.
  const [winId, setWinId] = useState(0);
  const [bigWinId, setBigWinId] = useState(0);
  const [popup, setPopup] = useState<PopupState>({ id: 0, amount: 0, live: false });
  const [potBump, setPotBump] = useState<PotBumps>(NO_BUMPS);

  // The spin runs off timers, so the state it reads has to be a ref -- a
  // closure captured at the start of a spin would go stale mid-flight.
  const betRef = useRef(bet);
  const autospinLeftRef = useRef(0);
  const busyRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => cancelTimers(), []);

  function cancelTimers() {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }

  function later(action: () => void, delay: number) {
    timers.current.push(setTimeout(action, delay));
  }

  function setBet(next: number) {
    betRef.current = next;
    setBetState(next);
  }

  function setAutospinLeft(next: number) {
    autospinLeftRef.current = next;
    setAutospinLeftState(next);
  }

  function stopAutospin() {
    setAutospinLeft(0);
  }

  function resolve(outcome: SpinResult) {
    const payout = evaluate(outcome.board, betRef.current);
    stopSpinSound();

    const won = payout.total > 0;
    reportGame(won ? 'win' : 'loss');

    if (won) {
      addCoins(payout.total);
      setWin(payout.total);
      setLines(payout.lines);
      setWinning(maskOf(payout.lines));
      setWinId((id) => id + 1);
    }
    if (outcome.tokens.length > 0) {
      playSfx('pot-token');
      setPotBump((current) => bumpPots(current, outcome.tokens));
    }
    setPots((current) => collectTokens(current, outcome.tokens));
    setPhase('idle');
    busyRef.current = false;

    if (payout.total >= betRef.current * BIG_WIN_X) {
      stopAutospin();
      playSfx('big-win');
      setBigWinId((id) => id + 1);
      setOverlay({ kind: 'bigWin', amount: payout.total });
      return;
    }
    // A plain win screen would interrupt an autospin run, so it only shows up
    // when the player is spinning by hand.
    if (payout.total >= betRef.current * WIN_OVERLAY_X && autospinLeftRef.current === 0) {
      playSfx('good-job');
      setOverlay({ kind: 'win', amount: payout.total });
      return;
    }
    if (won) {
      // The centre popup is the celebration for the wins that do not get a
      // screen of their own -- the two branches above already put the amount
      // in front of the player, and showing it twice would just be noise.
      setPopup((current) => ({ id: current.id + 1, amount: payout.total, live: true }));
      playSfx('win');
    } else if (autospinLeftRef.current === 0) {
      // Muted during autospin -- it would otherwise repeat every
      // AUTOSPIN_GAP_MS and turn into noise on a run of empty spins.
      playSfx('lose');
    }
    // A paying spin has a celebration to sit through; an empty one has not.
    if (autospinLeftRef.current > 0) {
      later(() => {
        // Re-checked at fire time, not trusted from when it was queued: the
        // gap is long enough for the player to tap the button or open the
        // pause menu, and a spin that slips through afterwards would run
        // behind the menu, spending coins nobody watched it spend.
        if (autospinLeftRef.current > 0) spin();
      }, won ? AUTOSPIN_GAP_WIN_MS : AUTOSPIN_GAP_MS);
    }
  }

  function spin() {
    if (busyRef.current) return;
    if (!spendCoins(betRef.current)) {
      stopAutospin();
      return;
    }
    if (autospinLeftRef.current > 0 && autospinLeftRef.current !== Infinity) {
      setAutospinLeft(autospinLeftRef.current - 1);
    }

    reportGame('start');

    busyRef.current = true;
    const outcome = spinReels();
    setWin(0);
    setLines([]);
    setWinning(NO_WINS);
    // Dropping `live` is what pulls the centre popup off screen. The id and the
    // amount are left alone, so this is a dismissal and not a replay -- however
    // fast the player taps, the previous win is never left hanging over reels
    // that are already turning.
    setPopup((current) => (current.live ? { ...current, live: false } : current));
    setPhase('spinning');
    startSpinSound();

    // A tick per reel as it lands, staggered the same way the board itself
    // settles (board-layout.ts) -- DROP_MS in so it lines up with the drop-in
    // animation revealing the result, not with the blur strip still spinning.
    for (let reel = 0; reel < REEL_COUNT; reel++) {
      later(() => playSfx('reel-stop'), SPIN_MS + reel * REEL_STAGGER_MS + DROP_MS);
    }

    // The new cells only go on the board once the blur strip is up, so no frame
    // can give the result away; from there each reel lands on its own beat.
    later(() => {
      setResult(outcome);
      setPhase('landing');
    }, SPIN_MS);
    later(() => resolve(outcome), SPIN_TOTAL_MS);
  }

  function startAutospin(count: AutospinCount) {
    setAutospinState(count);
    setAutospinLeft(count === 'max' ? Infinity : count);
    setOverlay(null);
    spin();
  }

  return {
    coins,
    bet,
    setBet,
    /** The count the panel offers next time it opens. */
    autospin,
    autospinLeft,
    startAutospin,
    stopAutospin,
    spin,
    canSpin: phase === 'idle' && coins >= bet,
    spinning: phase === 'spinning',
    /** A paying line is on the board, so everything else fades back. */
    dimLosers: phase === 'idle' && lines.length > 0,
    board: result.board,
    wildTop: result.wildTop,
    winning,
    win,
    pots,
    overlay,
    dismissOverlay: () => setOverlay(null),
    /** Replay counters for the effects layer -- see the note where they are declared. */
    vfx: {
      winId,
      bigWinId,
      popupId: popup.id,
      popupWin: popup.amount,
      popupLive: popup.live,
      potBump,
    },
  };
}

/** One bounce per pot that just took a chili, whatever the token count. */
function bumpPots(current: PotBumps, tokens: readonly Token[]): PotBumps {
  const next = { ...current };
  for (const { key, token } of POTS) {
    if (tokens.includes(token)) next[key] = current[key] + 1;
  }
  return next;
}

function emptyMask() {
  return Array.from({ length: REEL_COUNT }, () => Array.from({ length: ROW_COUNT }, () => false));
}

/** `[reel][row]` flags for every cell that is part of a paying line. */
function maskOf(lines: WinLine[]) {
  const mask = emptyMask();
  for (const line of lines) {
    for (const [reel, row] of line.cells) mask[reel][row] = true;
  }
  return mask;
}
