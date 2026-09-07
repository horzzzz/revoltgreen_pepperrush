#!/bin/bash
#
# Rebuilds assets/audio/ from its CC0 sources.
#
# Not part of any build -- the encoded .m4a files are committed. This exists so
# the set is reproducible: to swap a clip, change its row below and re-run,
# rather than hand-converting a file and losing track of where it came from.
# assets/audio/CREDITS.md is the human-readable version of the same table.
#
# Everything is converted with afconvert (CoreAudio), already on every macOS
# box, and reads WAV / Ogg Vorbis / MP3. A channel downmix straight out of
# Vorbis is refused, hence the WAV hop:
#
#   source -> stereo 16-bit WAV -> mono 16-bit WAV -> mono AAC 64k .m4a
#
# Music skips the downmix and stays stereo at 96k.
#
# Nothing is normalized on the way through -- these mirrors already ship the
# packs at a consistent peak, so the standing per-clip mix trims live in
# SFX_GAIN in src/game/audio/sfx.ts, where the balance stays tunable without a
# re-encode.
#
# `wheel-spin.m4a` (also reused for the slot reels) is supplied by the project
# owner, not fetched here -- see assets/audio/CREDITS.md.
#
# Usage: scripts/fetch-audio.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/audio"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# kenney.nl only hands out its download URL through JavaScript, so the packs
# come from Godot-addon mirrors that expose the same CC0 files over raw.
KENNEY_UI="https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds"
KENNEY_SCIFI="https://raw.githubusercontent.com/Boyquotes/kenney-sci-fi-sounds-for-godot/main/addons/kenney%20sci-fi%20sounds"
KENNEY_JINGLE="https://raw.githubusercontent.com/Boyquotes/kenney-music-jingles-for-godot/main/addons/kenney%20music%20jingles/Steel%20jingles"
# Kenney's Casino Audio pack (cards/chips/dice) mirrored on OpenGameArt as a zip.
KENNEY_CASINO_ZIP="https://opengameart.org/sites/default/files/kenney_casino-audio.zip"

MUSIC_URL="https://opengameart.org/sites/default/files/cc_soundtrack1_0.mp3"

# "<sfx id>|<base url>|<source file>". Keep in sync with assets/audio/CREDITS.md
# and the SFX_SOURCES registry in src/game/audio/sfx.ts.
SFX_MAP=(
  # UI -- every button in the app goes through PressableScale.
  "ui-click|$KENNEY_UI|select_002.wav"
  "ui-back|$KENNEY_UI|back_001.wav"
  "ui-denied|$KENNEY_UI|error_004.wav"
  "ui-toggle|$KENNEY_UI|switch_003.wav"
  # Economy.
  "purchase|$KENNEY_UI|confirmation_001.wav"
  "unlock|$KENNEY_SCIFI|force_field_001.ogg"
  "reward-claim|$KENNEY_JINGLE|jingles_steel_0.ogg"
  # Wheel of Luck.
  "wheel-fail|$KENNEY_UI|error_002.wav"
  # Slot machine.
  "reel-stop|$KENNEY_UI|drop_001.wav"
  "win|$KENNEY_JINGLE|jingles_steel_2.ogg"
  "lose|$KENNEY_UI|minimize_002.wav"
  "good-job|$KENNEY_JINGLE|jingles_steel_9.ogg"
  "big-win|$KENNEY_JINGLE|jingles_steel_15.ogg"
)

mkdir -p "$OUT"

encode_sfx() {
  local id="$1" src="$2"
  afconvert -f WAVE -d LEI16 "$src" "$TMP/$id.stereo.wav"

  # `--mix -c 1` is an error, not a no-op, on a source that is already mono --
  # and both the Kenney interface pack and the casino pack ship a mix of both.
  if afinfo "$TMP/$id.stereo.wav" | grep -q '^Data format: *1 ch'; then
    cp "$TMP/$id.stereo.wav" "$TMP/$id.mono.wav"
  else
    afconvert -f WAVE -d LEI16 --mix -c 1 "$TMP/$id.stereo.wav" "$TMP/$id.mono.wav"
  fi

  afconvert -f m4af -d aac -b 64000 "$TMP/$id.mono.wav" "$OUT/$id.m4a"
}

printf '%-14s %7s %7s %8s  %s\n' "ID" "PEAK" "LOUD" "LENGTH" "SOURCE"
for row in "${SFX_MAP[@]}"; do
  IFS='|' read -r id base file <<<"$row"
  curl -fsSL --retry 2 -m 60 -o "$TMP/$id.src" "$base/$file"
  encode_sfx "$id" "$TMP/$id.src"
  read -r peak loud <<<"$(python3 "$ROOT/scripts/audio-levels.py" "$TMP/$id.mono.wav")"
  secs="$(afinfo "$OUT/$id.m4a" | sed -n 's/estimated duration: \([0-9.]*\).*/\1/p')"
  printf '%-14s %6sdB %5sdB %7.2fs  %s\n' "$id" "$peak" "$loud" "$secs" "$file"
done

# pot-token comes out of Kenney's Casino Audio pack, which OpenGameArt only
# mirrors as a zip -- one extra hop to pull the single file out of it.
echo "pot-token      <-  chip-lay-1.ogg (kenney_casino-audio.zip)"
curl -fsSL --retry 2 -m 60 -o "$TMP/casino.zip" "$KENNEY_CASINO_ZIP"
unzip -p "$TMP/casino.zip" "Audio/chip-lay-1.ogg" > "$TMP/pot-token.src"
encode_sfx "pot-token" "$TMP/pot-token.src"
read -r peak loud <<<"$(python3 "$ROOT/scripts/audio-levels.py" "$TMP/pot-token.mono.wav")"
secs="$(afinfo "$OUT/pot-token.m4a" | sed -n 's/estimated duration: \([0-9.]*\).*/\1/p')"
printf '%-14s %6sdB %5sdB %7.2fs  %s\n' "pot-token" "$peak" "$loud" "$secs" "chip-lay-1.ogg"

echo "  music-theme  <-  cc_soundtrack1.mp3"
curl -fsSL --retry 2 -m 180 -o "$TMP/music.src" "$MUSIC_URL"
afconvert -f WAVE -d LEI16 "$TMP/music.src" "$TMP/music.wav"
afconvert -f m4af -d aac -b 96000 "$TMP/music.wav" "$OUT/music-theme.m4a"

echo
echo "Done. assets/audio is $(du -sh "$OUT" | cut -f1):"
ls -la "$OUT"
