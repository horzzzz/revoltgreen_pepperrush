import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BetPanel } from '@/components/game/bet-panel';
import { BigWinOverlay } from '@/components/game/big-win-overlay';
import { GameTopBar } from '@/components/game/game-top-bar';
import { JackpotRail } from '@/components/game/jackpot-rail';
import { PauseMenu } from '@/components/game/pause-menu';
import { POT, POT_OVERLAP, PotRow } from '@/components/game/pot-row';
import { ReelGrid } from '@/components/game/reel-grid';
import { SpinButton } from '@/components/game/spin-button';
import { StatPlate } from '@/components/game/stat-plate';
import { WinOverlay } from '@/components/game/win-overlay';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useShake } from '@/components/vfx/use-vfx';
import { GameColors, SplashColors } from '@/constants/theme';
import { playSfx } from '@/game/audio/engine';
import { useDesignScale } from '@/hooks/use-design-scale';
import { useSlotMachine } from '@/hooks/use-slot-machine';

// The game runs on the same backdrop as the menu -- the `bg` component uses the
// variant without the pepper in the middle.
const BG_ASSET = require('@/assets/images/menu/bg.jpg');
const LOGO_ASSET = require('@/assets/images/menu/logo.png');

/** Node 1:142 -- the jackpot rail, 22 below the bar. */
const RAIL_TOP = 22;
/** Node 1:141 -- the logo shares that line and is drawn over the plates. */
const LOGO = { width: 174, height: 137 } as const;
/** Node 1:93 -- the pots, machine and plates, measured from under the bar. */
const STACK_TOP = 167.85;
const STACK_WIDTH = 382;
/** Node 1:138 sits 15 above the home indicator. */
const SPIN_BOTTOM_GAP = 15;

/** The slot itself (Figma node 1:90). */
export default function GameScreen() {
  const scale = useDesignScale();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const machine = useSlotMachine();
  const [betPanelOpen, setBetPanelOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  // Only the machine itself rings on a big win: the overlays are rendered
  // outside this wrapper, so the celebration screen sits still over a game
  // that is still shaking underneath it.
  const shakeStyle = useShake(machine.vfx.bigWinId, 7);

  // The bar's own height comes from the safe area, so everything under it is
  // anchored to the bar rather than to the design's fixed 100pt.
  const topBarHeight = insets.top + (5 + 36 + 12) * scale;

  const closeBetPanel = (bet: number) => {
    machine.setBet(bet);
    setBetPanelOpen(false);
  };

  const openPause = () => {
    machine.stopAutospin();
    setPaused(true);
  };

  // Restart drops whatever the reels were showing so the round comes back
  // clean, same as Play, just with the last result cleared first.
  const restart = () => {
    // `reset` covers stopping autospin, and also drops a spin that is still in
    // flight -- Restart during a spin used to leave the reels to land into a
    // round the player had already walked away from.
    machine.reset();
    machine.dismissOverlay();
    setPaused(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, shakeStyle]}>
        <Image source={BG_ASSET} style={StyleSheet.absoluteFill} contentFit="cover" />

        <View style={[styles.centered, { top: topBarHeight + RAIL_TOP * scale }]}>
          <JackpotRail />
        </View>

        <View
          style={[styles.centered, { top: topBarHeight + RAIL_TOP * scale }]}
          pointerEvents="none">
          <Image
            source={LOGO_ASSET}
            style={{ width: LOGO.width * scale, height: LOGO.height * scale }}
            contentFit="contain"
          />
        </View>

        <View style={[styles.centered, { top: topBarHeight + STACK_TOP * scale }]}>
          <View style={[styles.stack, { width: STACK_WIDTH * scale }]}>
            {/*
              The pots hang over the reel grid's top edge (Figma node 1:95). That
              overlap is drawn by the separate PotRow block below, painted after
              this one -- a spacer here just reserves the flow space they would
              otherwise take, so the reel grid still lands in the right place.
            */}
            <View style={{ height: (POT.height - POT_OVERLAP) * scale }} />
            <ReelGrid
              board={machine.board}
              wildTop={machine.wildTop}
              winning={machine.winning}
              spinning={machine.spinning}
              dimLosers={machine.dimLosers}
              winId={machine.vfx.winId}
              popupWin={machine.vfx.popupWin}
              popupId={machine.vfx.popupId}
              popupLive={machine.vfx.popupLive}
            />

            <View style={styles.statRow}>
              <StatPlate label="Win" value={machine.win} countUp highlightId={machine.vfx.winId} />
              <PressableScale
                onPress={() => setBetPanelOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Change bet">
                <StatPlate label="Bet" value={machine.bet} />
              </PressableScale>
            </View>
          </View>
        </View>

        <View
          style={[styles.centered, { top: topBarHeight + STACK_TOP * scale }]}
          pointerEvents="none">
          <PotRow pots={machine.pots} bump={machine.vfx.potBump} />
        </View>

        <View style={[styles.spin, { bottom: insets.bottom + SPIN_BOTTOM_GAP * scale }]}>
          <SpinButton
            onSpin={machine.spin}
            onHold={() => machine.startAutospin(machine.autospin)}
            onStopAuto={machine.stopAutospin}
            disabled={!machine.canSpin}
            autospinLeft={machine.autospinLeft}
          />
        </View>

        <GameTopBar onMenu={openPause} />
      </Animated.View>

      {betPanelOpen ? (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.scrim]}
          onPress={() => {
            // The panel's own Close icon already sounds through its
            // PressableScale (sfx="ui-back") -- tapping the backdrop is a
            // plain Pressable and needs its own.
            playSfx('ui-back');
            closeBetPanel(machine.bet);
          }}>
          <Pressable onPress={() => {}}>
            <BetPanel
              bet={machine.bet}
              autospin={machine.autospin}
              balance={machine.coins}
              onDismiss={closeBetPanel}
              onStart={(bet, count) => {
                machine.setBet(bet);
                setBetPanelOpen(false);
                machine.startAutospin(count);
              }}
            />
          </Pressable>
        </Pressable>
      ) : null}

      {machine.overlay?.kind === 'win' ? (
        <View style={[StyleSheet.absoluteFill, styles.scrim]}>
          <WinOverlay
            amount={machine.overlay.amount}
            onContinue={machine.dismissOverlay}
            onMenu={() => router.back()}
          />
        </View>
      ) : null}

      {/* Unlike the plain win screen, this one draws its own blurred backdrop
          (Figma node 1:204) instead of sitting on the shared flat scrim. */}
      {machine.overlay?.kind === 'bigWin' ? (
        <BigWinOverlay amount={machine.overlay.amount} onDismiss={machine.dismissOverlay} />
      ) : null}

      {paused ? (
        <PauseMenu
          onResume={() => setPaused(false)}
          onRestart={restart}
          onExchange={() => router.push('/exchange')}
          onSettings={() => router.push('/settings')}
          onMainMenu={() => router.back()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SplashColors.bg,
    overflow: 'hidden',
  },
  centered: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stack: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  spin: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrim: {
    backgroundColor: GameColors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
