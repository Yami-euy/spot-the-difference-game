// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two picture panels: same size, side by side, with a gap between them. */
export const PANEL = { width: 616, height: 490, y: 66, leftX: 16, rightX: 648 };
export const HUD_H = 58;
export const BAR_Y = 566;

/** Seconds of play per scene; the later scenes give less time, so the pressure rises. */
export const SCENE_TIMES = [120, 105, 90, 75];

/** Points: a find, a wrong click, a hint, and the per-second bonus for finishing a scene early. */
export const SCORE = { find: 100, wrong: -10, hint: -25, timeBonus: 2 };

/** Hints per scene, and how long a hint ring pulses (seconds). */
export const HINTS_PER_SCENE = 3;
export const HINT_PULSE = 1.6;

/** Wrong-click penalty in seconds, and how long the red X flashes. */
export const WRONG_TIME = 3;
export const WRONG_FLASH = 0.5;

/** How long a found marker pops in for, and how long the scene-complete card shows. */
export const MARK_POP = 0.3;
export const SCENE_CARD = 1.6;

/** The magnifier lens: radius in field pixels, and how much it zooms. */
export const LENS = { radius: 95, zoom: 2 };

/** Bottom-bar buttons (field coordinates). */
export const BUTTONS = {
  hint: { x: 868, y: 596, w: 112, h: 48, label: 'Hint (H)' },
  magnifier: { x: 992, y: 596, w: 150, h: 48, label: 'Magnifier (M)' },
  pause: { x: 1154, y: 596, w: 110, h: 48, label: 'Pause (P)' },
};

export const PALETTE = {
  backdrop: '#14121f',
  panel: '#1e1b2e',
  panelEdge: '#3d3658',
  text: '#f2ead8',
  muted: '#a89ec4',
  accent: '#ffc857',
  good: '#7ee081',
  bad: '#ff6b6b',
  timer: '#7ee081',
  timerLow: '#ff6b6b',
  button: '#2c2745',
  buttonEdge: '#4a4170',
  cursor: '#ffffff',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'spot-the-difference.best';
