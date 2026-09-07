import { useEffect, useRef, useState } from 'react';

import { DROP_MS, REEL_STAGGER_MS, SPIN_MS, SPIN_TOTAL_MS } from '@/components/game/board-layout';
import { playSfx, startSpinSound, stopSpinSound } from '@/game/audio/engine';
import { addCoins, spendCoins, useCoins } from '@/game/player';
import { type AutospinCount, DEFAULT_AUTOSPIN, DEFAULT_BET } from '@/game/slot/bet';
import { evaluate, type WinLine } from '@/game/slot/evaluate';
import { collectTokens, EMPTY_POTS, type PotState } from '@/game/slot/pots';
import { REEL_COUNT, ROW_COUNT, type SpinResult, spinReels } from '@/game/slot/reels';

/** Pause between two autospins, so a result stays readable. */
const AUTOSPIN_GAP_MS = 700;
/** From this multiple of the bet the win gets its own screen (node 1:198). */
const WIN_OVERLAY_X = 10;
/** And from this one the big win takes over and stops autospin (node 1:202). */
const BIG_WIN_X = 50;

export type Overlay = { kind: 'win' | 'bigWin'; amount: number };

type Phase = 'idle' | 'spinning' | 'landing';

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

    if (payout.total > 0) {
      addCoins(payout.total);
      setWin(payout.total);
      setLines(payout.lines);
      setWinning(maskOf(payout.lines));
    }
    if (outcome.tokens.length > 0) playSfx('pot-token');
    setPots((current) => collectTokens(current, outcome.tokens));
    setPhase('idle');
    busyRef.current = false;

    if (payout.total >= betRef.current * BIG_WIN_X) {
      stopAutospin();
      playSfx('big-win');
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
    if (payout.total > 0) {
      playSfx('win');
    } else if (autospinLeftRef.current === 0) {
      // Muted during autospin -- it would otherwise repeat every
      // AUTOSPIN_GAP_MS and turn into noise on a run of empty spins.
      playSfx('lose');
    }
    if (autospinLeftRef.current > 0) later(spin, AUTOSPIN_GAP_MS);
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

    busyRef.current = true;
    const outcome = spinReels();
    setWin(0);
    setLines([]);
    setWinning(NO_WINS);
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
  };
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
