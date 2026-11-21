// Keyboard and pointer input. Held arrow keys move the crosshair; one-shot presses (confirm,
// pause, hint, magnifier) are queued as bit flags and taken once by the loop, so a press between
// two frames is never lost and never counted twice. Pointer clicks are queued with their field
// coordinates, and the pointer position is tracked for the magnifier and the crosshair.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MAG = 8;

const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const MAG = new Set(['KeyM']);

export function createInput(canvas) {
  const keys = { up: false, down: false, left: false, right: false };
  let actions = 0;
  let clicks = [];
  const pointer = { x: 0, y: 0, inside: false };

  function fieldPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    // The canvas is drawn at device pixels for a 1280x720 field; map back to field units.
    const fieldScale = Math.min(canvas.width / 1280, canvas.height / 720);
    const offsetX = (canvas.width - 1280 * fieldScale) / 2;
    const offsetY = (canvas.height - 720 * fieldScale) / 2;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top) * scaleY;
    return { x: (px - offsetX) / fieldScale, y: (py - offsetY) / fieldScale };
  }

  window.addEventListener('keydown', (event) => {
    if (UP.has(event.code)) keys.up = true;
    else if (DOWN.has(event.code)) keys.down = true;
    else if (LEFT.has(event.code)) keys.left = true;
    else if (RIGHT.has(event.code)) keys.right = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (MAG.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MAG;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (UP.has(event.code)) keys.up = false;
    else if (DOWN.has(event.code)) keys.down = false;
    else if (LEFT.has(event.code)) keys.left = false;
    else if (RIGHT.has(event.code)) keys.right = false;
  });
  // A key released while the tab is hidden never sends keyup: let go of everything on blur.
  window.addEventListener('blur', () => {
    keys.up = keys.down = keys.left = keys.right = false;
  });
  canvas.addEventListener('pointermove', (event) => {
    const p = fieldPosition(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = fieldPosition(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
    clicks.push(p);
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });

  return {
    pointer,
    /** The held-key movement direction, -1/0/1 on each axis. */
    move() {
      return {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0),
      };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The clicks since the last call, as field coordinates. */
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
  };
}
