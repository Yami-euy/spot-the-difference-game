// The game's rules and state, with no drawing and no browser in it: which scene is up, which
// differences are found, the countdown, the score, the hints, the keyboard cursor and the
// magnifier. step() advances one fixed step and returns what happened as bit flags, so the caller
// can react (and play sounds) without the world knowing about screens or sound.
import { BUTTONS, HINTS_PER_SCENE, HINT_PULSE, LENS, MARK_POP, PANEL, SCENE_TIMES, SCORE, SCENE_CARD, WRONG_FLASH, WRONG_TIME } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CARD = 'card';
export const SCREEN_OVER = 'over';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_HINT = 4;
export const EVENT_SCENE = 8;
export const EVENT_OVER = 16;

function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function createWorld(random) {
  const state = {
    sceneIndex: 0,
    found: new Set(),
    foundAt: new Map(),
    timeLeft: SCENE_TIMES[0],
    score: 0,
    hintsLeft: HINTS_PER_SCENE,
    totalFound: 0,
    totalDiffs: SCENES.reduce((n, s) => n + s.diffs.length, 0),
    elapsed: 0,
    cursor: { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + PANEL.height / 2 },
    magnifier: false,
    hintPulse: null,
    wrongFlash: null,
    card: null,
    cardUntil: 0,
    finished: false,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function reset() {
    state.sceneIndex = 0;
    state.found = new Set();
    state.foundAt = new Map();
    state.timeLeft = SCENE_TIMES[0];
    state.score = 0;
    state.hintsLeft = HINTS_PER_SCENE;
    state.totalFound = 0;
    state.elapsed = 0;
    state.cursor = { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + PANEL.height / 2 };
    state.magnifier = false;
    state.hintPulse = null;
    state.wrongFlash = null;
    state.card = null;
    state.finished = false;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.foundAt = new Map();
    state.timeLeft = SCENE_TIMES[index];
    state.hintsLeft = HINTS_PER_SCENE;
    state.hintPulse = null;
    state.wrongFlash = null;
    state.card = null;
  }

  /** The scene's differences, with the hit zones each one owns on each panel. */
  function diffAt(panel, sx, sy) {
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      const d = diffs[i];
      if (state.found.has(d.id)) continue;
      const bx = d.bx === undefined ? d.x : d.bx;
      const by = d.by === undefined ? d.y : d.by;
      if (dist2(sx, sy, d.x, d.y) <= d.r * d.r) return d;
      if ((bx !== d.x || by !== d.y) && dist2(sx, sy, bx, by) <= d.r * d.r) return d;
    }
    return null;
  }

  function finishScene(timedOut) {
    const bonus = timedOut ? 0 : Math.ceil(state.timeLeft) * SCORE.timeBonus;
    state.score += bonus;
    state.totalFound += state.found.size;
    const last = state.sceneIndex >= SCENES.length - 1;
    state.card = {
      title: timedOut ? "Time's up!" : 'Scene complete!',
      lines: [
        `${scene().name} — ${state.found.size} of ${scene().diffs.length} differences found`,
        timedOut ? 'No time bonus this time.' : `Time bonus +${bonus}`,
      ],
      last,
    };
    state.cardUntil = state.elapsed + SCENE_CARD;
    if (last) state.finished = true;
    return EVENT_SCENE;
  }

  function markAt(panel, sx, sy) {
    const d = diffAt(panel, sx, sy);
    if (d) {
      state.found.add(d.id);
      state.foundAt.set(d.id, state.elapsed);
      state.score += SCORE.find;
      if (state.found.size === scene().diffs.length) return finishScene(false) | EVENT_FOUND;
      return EVENT_FOUND;
    }
    state.score = Math.max(0, state.score + SCORE.wrong);
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME);
    state.wrongFlash = { panel, x: sx, y: sy, until: state.elapsed + WRONG_FLASH };
    return EVENT_WRONG;
  }

  function useHint() {
    if (state.hintsLeft <= 0) return 0;
    const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return 0;
    const pick = remaining[Math.floor(random() * remaining.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score + SCORE.hint);
    state.hintPulse = { id: pick.id, until: state.elapsed + HINT_PULSE };
    return EVENT_HINT;
  }

  function advance() {
    if (state.sceneIndex >= SCENES.length - 1) return EVENT_OVER;
    startScene(state.sceneIndex + 1);
    return 0;
  }

  function step(dt) {
    state.elapsed += dt;
    if (state.card && state.elapsed >= state.cardUntil) {
      state.card = null;
      if (state.finished) return EVENT_OVER;
      advance();
    }
    return 0;
  }

  function tick(dt) {
    state.elapsed += dt;
    if (state.card) {
      if (state.elapsed >= state.cardUntil) {
        state.card = null;
        if (state.finished) return EVENT_OVER;
        advance();
      }
      return 0;
    }
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      return finishScene(true);
    }
    return 0;
  }

  /** Map field coordinates to a panel + scene coordinates; null when outside both panels. */
  function panelAt(fx, fy) {
    if (fy >= PANEL.y && fy < PANEL.y + PANEL.height) {
      if (fx >= PANEL.leftX && fx < PANEL.leftX + PANEL.width) return { panel: 'left', x: fx - PANEL.leftX, y: fy - PANEL.y };
      if (fx >= PANEL.rightX && fx < PANEL.rightX + PANEL.width) return { panel: 'right', x: fx - PANEL.rightX, y: fy - PANEL.y };
    }
    return null;
  }

  function buttonAt(fx, fy) {
    for (const name of Object.keys(BUTTONS)) {
      const b = BUTTONS[name];
      if (fx >= b.x && fx < b.x + b.w && fy >= b.y && fy < b.y + b.h) return name;
    }
    return null;
  }

  function moveCursor(dx, dy, dt) {
    const speed = 420;
    state.cursor.x = Math.min(PANEL.rightX + PANEL.width - 4, Math.max(PANEL.leftX + 4, state.cursor.x + dx * speed * dt));
    state.cursor.y = Math.min(PANEL.y + PANEL.height - 4, Math.max(PANEL.y + 4, state.cursor.y + dy * speed * dt));
  }

  function markAtCursor() {
    const hit = panelAt(state.cursor.x, state.cursor.y);
    if (!hit) return 0;
    return markAt(hit.panel, hit.x, hit.y);
  }

  /** Stage a mid-play frame for screenshots: scene `index`, `foundIds` already marked. */
  function stagePlay(index, foundIds, timeLeft) {
    reset();
    startScene(index);
    for (const id of foundIds) {
      state.found.add(id);
      state.foundAt.set(id, -1); // -1: marker fully popped, no animation
    }
    state.timeLeft = timeLeft;
  }

  /** Stage the end screen for screenshots: the last scene, all found, clock at zero. */
  function stageOver(score, totalFound) {
    reset();
    startScene(SCENES.length - 1);
    for (const d of SCENES[SCENES.length - 1].diffs) {
      state.found.add(d.id);
      state.foundAt.set(d.id, -1);
    }
    state.score = score;
    state.totalFound = totalFound;
    state.timeLeft = 0;
    state.finished = true;
  }

  reset();
  return {
    state, scene, reset, startScene, markAt, markAtCursor, useHint, step, tick,
    panelAt, buttonAt, moveCursor, stagePlay, stageOver, MARK_POP, LENS,
  };
}
