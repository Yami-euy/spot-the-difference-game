// The screenshot scenes behind ?shot=start|play|end. Each one stages a real game state, so the
// frame is what the game really looks like and the same seed always gives the same frame.
// ?shot=play&seed=1 is the cover: scene 1 mid-play with 3 differences found (ringed) and 4 still
// unfound, the counter reading 3 / 7. seed=2 shows scene 2 with 2 found; seed=3 shows scene 3
// with 5 found. ?shot=end shows the finished game with its score.
import { SCENES } from './scenes.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const PLAY_STAGES = [
  { scene: 0, found: [0, 2, 5], timeLeft: 78 },
  { scene: 1, found: [1, 4], timeLeft: 61 },
  { scene: 2, found: [0, 1, 3, 5, 6], timeLeft: 34 },
];

/**
 * Set `world` to the named scene and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world, seed) {
  if (name === 'end') {
    const total = SCENES.reduce((n, s) => n + s.diffs.length, 0);
    world.stageOver(2140, total);
    return { screen: SCREEN_OVER, best: 2140 };
  }
  if (name === 'play') {
    const pick = PLAY_STAGES[(seed - 1 + PLAY_STAGES.length) % PLAY_STAGES.length];
    world.stagePlay(pick.scene, pick.found, pick.timeLeft);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  world.reset();
  return { screen: SCREEN_TITLE, best: 0 };
}
