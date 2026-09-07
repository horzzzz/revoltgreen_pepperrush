# Audio credits

Everything here is **CC0** (or a file the project owner already owns) — free
for commercial use with no attribution required. Listed anyway for
traceability; nothing needs to ship in-app.

`scripts/fetch-audio.sh` rebuilds this whole directory from the sources below,
so this table and that script's `SFX_MAP` have to stay in step.

| File | Pack / author | Original file | License |
|---|---|---|---|
| `ui-click.m4a` | Kenney — Interface Sounds | `select_002.wav` | CC0 |
| `ui-back.m4a` | Kenney — Interface Sounds | `back_001.wav` | CC0 |
| `ui-denied.m4a` | Kenney — Interface Sounds | `error_004.wav` | CC0 |
| `ui-toggle.m4a` | Kenney — Interface Sounds | `switch_003.wav` | CC0 |
| `purchase.m4a` | Kenney — Interface Sounds | `confirmation_001.wav` | CC0 |
| `unlock.m4a` | Kenney — Sci-Fi Sounds | `force_field_001.ogg` | CC0 |
| `reward-claim.m4a` | Kenney — Music Jingles | `Steel jingles/jingles_steel_0.ogg` | CC0 |
| `wheel-fail.m4a` | Kenney — Interface Sounds | `error_002.wav` | CC0 |
| `reel-stop.m4a` | Kenney — Interface Sounds | `drop_001.wav` | CC0 |
| `win.m4a` | Kenney — Music Jingles | `Steel jingles/jingles_steel_2.ogg` | CC0 |
| `lose.m4a` | Kenney — Interface Sounds | `minimize_002.wav` | CC0 |
| `good-job.m4a` | Kenney — Music Jingles | `Steel jingles/jingles_steel_9.ogg` | CC0 |
| `big-win.m4a` | Kenney — Music Jingles | `Steel jingles/jingles_steel_15.ogg` | CC0 |
| `pot-token.m4a` | Kenney — Casino Audio | `Audio/chip-lay-1.ogg` | CC0 |
| `wheel-spin.m4a` | Provided by the project owner | — | — |
| `music-theme.m4a` | "Arcade Soundtracks" by cynicmusic (soundtrack1) | `cc_soundtrack1.mp3` | CC0 |

## Sources

- Kenney packs — <https://kenney.nl/assets> (Interface Sounds, Sci-Fi Sounds,
  Music Jingles, Casino Audio). Every pack's own `License.txt` dedicates it to
  the public domain under <http://creativecommons.org/publicdomain/zero/1.0/>.
  kenney.nl only produces its download URL through JavaScript, so
  `fetch-audio.sh` pulls the Interface/Sci-Fi/Jingles files from the
  Godot-addon mirrors (`Calinou/kenney-interface-sounds`,
  `Boyquotes/kenney-sci-fi-sounds-for-godot`,
  `Boyquotes/kenney-music-jingles-for-godot`), and the Casino Audio pack
  (cards/chips/dice — used here for the pot's chip-drop) from OpenGameArt's
  own mirror of the same zip, since it isn't in any of those Godot repos.
- "Arcade Soundtracks" — <https://opengameart.org/content/arcadesoundtracks>,
  CC0, five short (20–60 s) mobile/arcade background loops; `soundtrack1` was
  picked as the liveliest of the five by measured loudness (see Encoding).

## Encoding

Sources are `.wav`/`.ogg`/`.mp3`; everything was re-encoded to AAC `.m4a` with
`afconvert` — **mono, ~64 kbps** for the one-shots, **stereo, ~96 kbps** for
the music. No content was altered: no trimming, no gain, no normalization.
The fourteen effects together come to ~120 KB; the music is ~470 KB.

Standing per-clip mix trims are **not** baked into the files. They live in
`SFX_GAIN` in `src/game/audio/sfx.ts`, so the balance can be re-tuned without
touching an asset. `fetch-audio.sh` prints each clip's measured peak *and*
loudness (via `scripts/audio-levels.py`); the trims are computed from the
**loudness** column, and the music bed they are balanced against is
`MUSIC_MIX_LEVEL` in `src/game/audio/engine.ts`.

## Why loudness and not peak

Every pack here masters to roughly -1 dBFS no matter what the sound is, so
peak says nothing about whether a clip will be heard over the others or the
music. `unlock.m4a` (`force_field_001.ogg`) peaks the same as `ui-click.m4a`
but carries 11 dB more actual energy — trimming both to the same peak would
have buried the quieter one. See the derivation in `scripts/fetch-audio.sh`'s
header and `src/game/audio/sfx.ts`'s `SFX_GAIN` comment for the full ladder.

## Why the music loops without a crossfade

`cc_soundtrack1.mp3` is one of five short, already-loopable arcade/puzzle
background cues in the "Arcade Soundtracks" pack — the artist built them for
exactly this (mobile game background music), so `expo-audio`'s plain
`loop = true` is good enough with no trimming or crossfade needed on our side.
