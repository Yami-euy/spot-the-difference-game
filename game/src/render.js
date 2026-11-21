// Drawing only: the world's state and the current screen in, pixels out. The 1280x720 playfield
// is scaled to fit the window and centred, the margin filled with the backdrop colour. Each scene
// is painted twice — variant A on the left panel, B on the right — with green rings on the found
// differences, a pulsing ring for a hint, and a red X for a wrong click. The magnifier is a 2x
// lens that follows the cursor, drawn from the frame already on the canvas.
import { BUTTONS, FIELD, FONT, HINT_PULSE, LENS, MARK_POP, PALETTE, PANEL } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN_CARD, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const PANEL_TITLE = { width: 640, line: 32 };

function fmtTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align, weight) {
    const key = `${size}|${weight || ''}`;
    if (!fonts.has(key)) fonts.set(key, `${weight || ''} ${size}px ${FONT}`.trim());
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawSceneInto(scene, variant, ox, oy) {
    context.save();
    context.beginPath();
    context.rect(ox, oy, PANEL.width, PANEL.height);
    context.clip();
    context.translate(ox, oy);
    scene.draw(context, variant, PANEL.width, PANEL.height);
    context.restore();
  }

  function drawPanels(state) {
    const scene = SCENES[state.sceneIndex];
    context.fillStyle = PALETTE.panelEdge;
    context.fillRect(PANEL.leftX - 3, PANEL.y - 3, PANEL.width + 6, PANEL.height + 6);
    context.fillRect(PANEL.rightX - 3, PANEL.y - 3, PANEL.width + 6, PANEL.height + 6);
    drawSceneInto(scene, 'A', PANEL.leftX, PANEL.y);
    drawSceneInto(scene, 'B', PANEL.rightX, PANEL.y);
    text('A', PANEL.leftX + 10, PANEL.y + 24, 18, 'rgba(255,255,255,0.75)', 'left', 'bold');
    text('B', PANEL.rightX + 10, PANEL.y + 24, 18, 'rgba(255,255,255,0.75)', 'left', 'bold');
  }

  function markerAt(ox, d, progress) {
    const x = ox + d.x;
    const y = PANEL.y + d.y;
    const r = d.r + 6;
    const pop = 0.55 + 0.45 * Math.min(1, progress);
    context.strokeStyle = PALETTE.good;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x, y, r * pop, 0, Math.PI * 2);
    context.stroke();
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, (r - 7) * pop, 0, Math.PI * 2);
    context.stroke();
    // A small check in the middle of the ring.
    context.strokeStyle = PALETTE.good;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(x - 8, y);
    context.lineTo(x - 2, y + 6);
    context.lineTo(x + 9, y - 7);
    context.stroke();
  }

  function drawMarkers(state) {
    const scene = SCENES[state.sceneIndex];
    for (const d of scene.diffs) {
      if (!state.found.has(d.id)) continue;
      const at = state.foundAt.get(d.id);
      const progress = at === undefined || at < 0 ? 1 : (state.elapsed - at) / MARK_POP;
      markerAt(PANEL.leftX, d, progress);
      const right = { x: d.bx === undefined ? d.x : d.bx, y: d.by === undefined ? d.y : d.by, r: d.r };
      markerAt(PANEL.rightX, right, progress);
    }
  }

  function drawHintPulse(state) {
    const pulse = state.hintPulse;
    if (!pulse || state.elapsed >= pulse.until) return;
    const scene = SCENES[state.sceneIndex];
    const d = scene.diffs.find((item) => item.id === pulse.id);
    if (!d) return;
    const remain = (pulse.until - state.elapsed) / HINT_PULSE;
    const alpha = 0.35 + 0.65 * remain;
    const r = d.r + 8 + 6 * Math.sin(state.elapsed * 10);
    context.strokeStyle = `rgba(255,200,87,${alpha.toFixed(2)})`;
    context.lineWidth = 4;
    for (const ox of [PANEL.leftX, PANEL.rightX]) {
      const bx = ox === PANEL.rightX && d.bx !== undefined ? d.bx : d.x;
      const by = ox === PANEL.rightX && d.by !== undefined ? d.by : d.y;
      context.beginPath();
      context.arc(ox + bx, PANEL.y + by, r, 0, Math.PI * 2);
      context.stroke();
    }
  }

  function drawWrongFlash(state) {
    const flash = state.wrongFlash;
    if (!flash || state.elapsed >= flash.until) return;
    const ox = flash.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    const x = ox + flash.x;
    const y = PANEL.y + flash.y;
    context.strokeStyle = PALETTE.bad;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(x - 12, y - 12);
    context.lineTo(x + 12, y + 12);
    context.moveTo(x + 12, y - 12);
    context.lineTo(x - 12, y + 12);
    context.stroke();
  }

  function drawHud(state) {
    text('SPOT THE DIFFERENCE', 16, 34, 22, PALETTE.text, 'left', 'bold');
    const scene = SCENES[state.sceneIndex];
    text(`Found ${state.found.size} / ${scene.diffs.length}`, FIELD.width / 2, 36, 28, PALETTE.accent, 'center', 'bold');
    const low = state.timeLeft <= 15;
    const timerColor = low ? PALETTE.timerLow : PALETTE.timer;
    text(fmtTime(state.timeLeft), FIELD.width - 16, 36, 30, timerColor, 'right', 'bold');
    // Timer bar under the time.
    const barW = 150;
    const barX = FIELD.width - 16 - barW;
    context.fillStyle = '#2c2745';
    context.fillRect(barX, 44, barW, 6);
    const frac = Math.max(0, state.timeLeft / 120);
    context.fillStyle = timerColor;
    context.fillRect(barX, 44, barW * frac, 6);
    text(`Score ${state.score}`, barX - 12, 58, 16, PALETTE.muted, 'right');
  }

  function drawBar(state) {
    const scene = SCENES[state.sceneIndex];
    text(`Scene ${state.sceneIndex + 1} of ${SCENES.length} — ${scene.name} · ${scene.sub}`, 16, 606, 20, PALETTE.text, 'left', 'bold');
    // Progress dots for the scenes.
    for (let i = 0; i < SCENES.length; i += 1) {
      context.fillStyle = i < state.sceneIndex ? PALETTE.good : i === state.sceneIndex ? PALETTE.accent : '#3d3658';
      context.beginPath();
      context.arc(16 + i * 24, 636, 7, 0, Math.PI * 2);
      context.fill();
    }
    text('Click a difference in either picture. Arrows move the cursor, Enter marks it.', 16, 668, 16, PALETTE.muted, 'left');
    text(`Hints left: ${state.hintsLeft}`, 16, 694, 16, PALETTE.muted, 'left');
    for (const name of Object.keys(BUTTONS)) {
      const b = BUTTONS[name];
      const active = name === 'magnifier' && state.magnifier;
      context.fillStyle = active ? '#4a4170' : PALETTE.button;
      context.fillRect(b.x, b.y, b.w, b.h);
      context.strokeStyle = active ? PALETTE.accent : PALETTE.buttonEdge;
      context.lineWidth = 2;
      context.strokeRect(b.x, b.y, b.w, b.h);
      text(b.label, b.x + b.w / 2, b.y + 30, 18, active ? PALETTE.accent : PALETTE.text, 'center', 'bold');
    }
  }

  function drawCursor(state) {
    const c = state.cursor;
    context.strokeStyle = 'rgba(0,0,0,0.6)';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(c.x, c.y, 12, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = PALETTE.cursor;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(c.x, c.y, 12, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(c.x - 18, c.y);
    context.lineTo(c.x - 6, c.y);
    context.moveTo(c.x + 6, c.y);
    context.lineTo(c.x + 18, c.y);
    context.moveTo(c.x, c.y - 18);
    context.lineTo(c.x, c.y - 6);
    context.moveTo(c.x, c.y + 6);
    context.lineTo(c.x, c.y + 18);
    context.stroke();
  }

  function drawLens(state) {
    if (!state.magnifier) return;
    const c = state.cursor;
    if (c.y < PANEL.y || c.y > PANEL.y + PANEL.height) return;
    if ((c.x < PANEL.leftX || c.x > PANEL.leftX + PANEL.width) && (c.x < PANEL.rightX || c.x > PANEL.rightX + PANEL.width)) return;
    const cx = view.x + c.x * view.scale;
    const cy = view.y + c.y * view.scale;
    const r = LENS.radius * view.scale;
    const half = (LENS.radius / LENS.zoom) * view.scale;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2);
    context.clip();
    context.drawImage(canvas, cx - half, cy - half, half * 2, half * 2, cx - r, cy - r, r * 2, r * 2);
    context.restore();
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(c.x, c.y, LENS.radius, 0, Math.PI * 2);
    context.stroke();
  }

  function drawOverlayPanel(title, lines, prompt) {
    const height = 120 + lines.length * PANEL_TITLE.line + 70;
    const x = (FIELD.width - PANEL_TITLE.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(20,18,31,0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, PANEL_TITLE.width, height);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    context.strokeRect(x, y, PANEL_TITLE.width, height);
    text(title, FIELD.width / 2, y + 64, 42, PALETTE.text, 'center', 'bold');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 118 + i * PANEL_TITLE.line, 20, PALETTE.muted, 'center');
    }
    if (prompt) text(prompt, FIELD.width / 2, y + height - 30, 22, PALETTE.accent, 'center', 'bold');
  }

  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (screen === SCREEN_TITLE) {
      drawPanels(state);
      drawOverlayPanel('SPOT THE DIFFERENCE', [
        'Four scenes. Seven differences in each. How sharp are your eyes?',
        'Click a difference in either picture — or move the cursor with the arrow keys',
        'and press Enter. H hints, M magnifies, P pauses. Wrong clicks cost time.',
        best > 0 ? `Best score ${best}` : '',
      ], 'Press Space or click to start');
      return;
    }
    drawPanels(state);
    drawMarkers(state);
    drawHintPulse(state);
    drawWrongFlash(state);
    drawHud(state);
    drawBar(state);
    if (screen === SCREEN_PLAY) {
      drawCursor(state);
      drawLens(state);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlayPanel('Paused', ['The clock is waiting for you.'], 'Press P or click to resume');
    } else if (screen === SCREEN_CARD && state.card) {
      drawOverlayPanel(state.card.title, state.card.lines, state.card.last ? 'Final results next…' : 'Next scene…');
    } else if (screen === SCREEN_OVER) {
      drawOverlayPanel('All scenes done!', [
        `You found ${state.totalFound} of ${state.totalDiffs} differences.`,
        `Score ${state.score}   ·   Best ${Math.max(best, state.score)}`,
        'Four original scenes — the market, the bookstore, the garden, the station.',
      ], 'Press Space or click to play again');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, view };
}
