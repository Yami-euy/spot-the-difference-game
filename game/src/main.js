// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between five screens: title, play, paused, the scene-complete card, and game over.
//
// ?seed=N fixes the hint picks. ?shot=start|play|end (with &seed=N) stages that scene instead
// of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import {
  EVENT_FOUND, EVENT_HINT, EVENT_OVER, EVENT_SCENE, EVENT_WRONG,
  SCREEN_CARD, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE,
  createWorld,
} from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MAG, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { createSound } from './sound.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world, seed);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastPointer = { x: -1, y: -1 };

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    sound.unlock();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences in each scene.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`All scenes done. You found ${world.state.totalFound} of ${world.state.totalDiffs} differences. Score ${world.state.score}.`);
  }

  function react(events) {
    if (events & EVENT_FOUND) {
      sound.find();
      const scene = world.scene();
      announce(`Found! ${world.state.found.size} of ${scene.diffs.length} in this scene.`);
    }
    if (events & EVENT_WRONG) sound.wrong();
    if (events & EVENT_HINT) sound.hint();
    if (events & EVENT_SCENE) {
      sound.complete();
      screen = SCREEN_CARD;
    }
    if (events & EVENT_OVER) endGame();
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      sound.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        startGame();
        continue;
      }
      if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
        continue;
      }
      if (screen !== SCREEN_PLAY) continue;
      const button = world.buttonAt(click.x, click.y);
      if (button === 'hint') {
        react(world.useHint());
        continue;
      }
      if (button === 'magnifier') {
        world.state.magnifier = !world.state.magnifier;
        continue;
      }
      if (button === 'pause') {
        screen = SCREEN_PAUSED;
        announce('Paused.');
        continue;
      }
      const hit = world.panelAt(click.x, click.y);
      if (hit) react(world.markAt(hit.panel, hit.x, hit.y));
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (!actions) return;
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (screen === SCREEN_PLAY) {
        sound.unlock();
        react(world.markAtCursor());
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) react(world.useHint());
    if (actions & ACTION_MAG && screen === SCREEN_PLAY) {
      world.state.magnifier = !world.state.magnifier;
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const frameDt = Math.min((now - last) / 1000, MAX_FRAME);
    accumulator += frameDt;
    last = now;
    handleClicks();
    handleActions();
    // The crosshair follows the pointer; the arrow keys move it from wherever it is.
    const pointer = input.pointer;
    if (pointer.inside && (pointer.x !== lastPointer.x || pointer.y !== lastPointer.y)) {
      lastPointer = { x: pointer.x, y: pointer.y };
      world.state.cursor.x = pointer.x;
      world.state.cursor.y = pointer.y;
    }
    const move = input.move();
    if ((move.x !== 0 || move.y !== 0) && screen === SCREEN_PLAY) {
      // Scaled by the real frame time, so the cursor speed is the same at any frame rate.
      world.moveCursor(move.x, move.y, frameDt);
    }
    while (accumulator >= STEP) {
      accumulator -= STEP;
      if (screen === SCREEN_PLAY || screen === SCREEN_CARD) {
        const events = world.tick(STEP);
        if (events) {
          if (events & EVENT_OVER) endGame();
          else if (events & EVENT_SCENE) {
            sound.complete();
            screen = SCREEN_CARD;
          } else if (screen === SCREEN_CARD && !world.state.card) screen = SCREEN_PLAY;
        } else if (screen === SCREEN_CARD && !world.state.card) screen = SCREEN_PLAY;
      }
    }
    renderer.draw(world.state, screen, best, pointer);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Spot the Difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
