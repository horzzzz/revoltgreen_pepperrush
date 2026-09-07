/**
 * The MUSIC / SOUND / VIBRATION / NOTIFICATIONS switches on the Settings
 * sheet (`src/components/settings/settings-card.tsx`), persisted under their
 * own key -- an unrelated concern to the economy in `@/game/player`, and one
 * the player expects to survive a reinstall of their save just as much as
 * their coins.
 *
 * Music and Sound are booleans, not levels, because the switches they drive
 * are a two-state `Toggle`. The engine takes a 0..1 volume, so each write
 * maps the flag onto the ends of that range -- leaving room for real sliders
 * later without touching the engine.
 *
 * Vibration and Notifications aren't wired to anything yet -- there is no
 * haptics or push-notification code in the app -- but are saved here too so
 * the switches read back correctly next launch instead of resetting to on.
 *
 * Every write to Music/Sound pushes into the engine immediately, so a toggle
 * flipped mid-spin takes effect on the sound already playing rather than on
 * the next one. Modelled on the persistence pattern in `@/game/player.ts`:
 * a module-level store, `AsyncStorage`, `useSyncExternalStore`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { setMusicVolume, setSfxVolume } from './engine';

const STORAGE_KEY = 'audio-settings.v1';

type AudioSettingsState = {
  music: boolean;
  sound: boolean;
  vibration: boolean;
  notifications: boolean;
};

/**
 * `state` is reassigned wholesale on every change rather than mutated in
 * place -- `useAudioSettings` hands this object straight to `SettingsCard`
 * as its `values` prop, and with the project's React Compiler on
 * (`experiments.reactCompiler` in app.json) a same-reference object reads as
 * "unchanged" and the whole subtree's re-render gets memoized away. Mutating
 * in place made the engine side effect fire (the sound really did toggle)
 * while every switch -- not just the one tapped -- silently stopped
 * re-rendering for the rest of the session.
 */
let state: AudioSettingsState = {
  music: true,
  sound: true,
  vibration: true,
  notifications: false,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
}

/** Pushes the current flags into the audio engine -- see `hydrateAudioSettings`. */
function applyToEngine() {
  setMusicVolume(state.music ? 1 : 0);
  setSfxVolume(state.sound ? 1 : 0);
}

/**
 * Restores the saved switches and pushes them into the audio engine. Call
 * once, before the app renders (`src/app/_layout.tsx`), same as
 * `hydratePlayer()` -- otherwise a player who turned Sound off last session
 * would hear everything at full volume until they happened to open Settings.
 */
export async function hydrateAudioSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AudioSettingsState>;
      state = {
        music: typeof saved.music === 'boolean' ? saved.music : state.music,
        sound: typeof saved.sound === 'boolean' ? saved.sound : state.sound,
        vibration: typeof saved.vibration === 'boolean' ? saved.vibration : state.vibration,
        notifications:
          typeof saved.notifications === 'boolean' ? saved.notifications : state.notifications,
      };
    }
  } catch {
    // Corrupt record -- keep the defaults.
  }
  applyToEngine();
  emit();
}

export function getAudioSettings(): AudioSettingsState {
  return state;
}

export function useAudioSettings(): AudioSettingsState {
  return useSyncExternalStore(subscribe, getAudioSettings, getAudioSettings);
}

export type AudioSettingKey = keyof AudioSettingsState;

export function setAudioSetting(key: AudioSettingKey, value: boolean) {
  state = { ...state, [key]: value };
  if (key === 'music') setMusicVolume(value ? 1 : 0);
  else if (key === 'sound') setSfxVolume(value ? 1 : 0);
  emit();
  persist();
}
