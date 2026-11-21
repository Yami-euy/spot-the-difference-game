# Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Yami-euy/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Yami-euy/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game: two near-identical pictures side by side, click the differences to mark them, and find them all before the clock runs out. Entry for the [make.fun bounty "Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

## What it is

- 4 original hand-drawn scenes (Night Market, Cozy Bookstore, Garden at Dusk, Train Station), 7 differences each — 28 in all.
- Click a difference in either panel to mark it with a green ring; a counter shows how many remain.
- Per-scene countdown (120s down to 75s), wrong clicks cost time and points, 3 hints per scene, a 2× magnifier lens, and full keyboard play (arrows/WASD to move, Enter/Space to mark, H hint, M magnifier, P pause).
- WebAudio sounds, title/pause/scene-card/game-over screens, best score saved locally.

## Run it

Serve the `game/` folder with any static server, for example:

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network calls — everything runs locally in the page.

## Screenshots

- `screenshots/1-cover.jpg` — Night Market mid-play, 3 of 7 found
- `screenshots/2-play.jpg` — Cozy Bookstore mid-play
- `screenshots/3-scene.jpg` — Garden at Dusk mid-play
- `screenshots/4-end.jpg` — all 28 differences found

All artwork is original, drawn in code. No copied art, names, or music.
