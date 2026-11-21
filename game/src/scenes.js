// The four scenes. Every scene is drawn twice — variant 'A' on the left panel, 'B' on the right —
// by the same code, so the two pictures share one style. Each scene hides exactly 7 differences:
// a difference is a small conditional inside the drawing (absent in B, extra in B, a different
// colour, or a moved element). A difference's hit position is its 'A' spot; `bx`/`by` is where it
// sits on the right panel when it moves (otherwise the same spot). All art is original, drawn
// here in code — no images, no network, nothing copied.
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}
function text(ctx, value, x, y, size, color, align, weight) {
  ctx.font = `${weight || ''} ${size}px system-ui, sans-serif`.trim();
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}
function sky(ctx, stops, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 616, h);
}

/* ------------------------------------------------------------------ scene 1 */
const MARKET_STARS = [
  [40, 30], [120, 22], [200, 44], [260, 26], [330, 40], [410, 24], [470, 44], [590, 30],
  [70, 100], [150, 84], [240, 96], [370, 88], [450, 104], [580, 92],
];
function drawMarket(ctx, variant) {
  const B = variant === 'B';
  sky(ctx, [[0, '#2b1b4a'], [0.7, '#7a3a6e'], [1, '#e8734a']], 380);
  for (const [x, y] of MARKET_STARS) circle(ctx, x, y, 2, '#ffe9a8');
  if (B) circle(ctx, 95, 62, 2.5, '#ffe9a8'); // diff 4: one extra star in B
  if (!B) { // diff 1: the moon is missing in B
    circle(ctx, 545, 62, 24, '#ffe9a8');
    circle(ctx, 537, 55, 5, '#e8c97a');
    circle(ctx, 552, 70, 4, '#e8c97a');
  }
  // String lights sagging across the top.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 46);
  ctx.quadraticCurveTo(308, 92, 616, 40);
  ctx.stroke();
  const bulbColors = ['#ff5d5d', '#ffc857', '#7ee081', '#5db9ff'];
  for (let i = 0; i < 13; i += 1) {
    const t = i / 12;
    const x = t * 616;
    const y = (1 - t) * (1 - t) * 46 + 2 * (1 - t) * t * 92 + t * t * 40;
    circle(ctx, x, y + 8, 5, bulbColors[i % 4]);
  }
  // Ground.
  rect(ctx, 0, 380, 616, 110, '#3a2f2a');
  for (let i = 0; i < 24; i += 1) ellipse(ctx, (i * 53) % 616 + 12, 400 + ((i * 37) % 80), 10, 5, '#4a3d33');
  // Stall A: fruit. Posts, striped awning, counter, two baskets.
  rect(ctx, 40, 150, 10, 230, '#5a3a22');
  rect(ctx, 200, 150, 10, 230, '#5a3a22');
  for (let s = 0; s < 6; s += 1) { // diff 5: stripe 3 is red in A, green in B
    const c = s === 2 ? (B ? '#3fae6a' : '#e84a4a') : s % 2 === 0 ? '#e84a4a' : '#f5e6c8';
    rect(ctx, 30 + s * 31, 150, 31, 36, c);
  }
  rect(ctx, 30, 186, 186, 6, '#5a3a22');
  rect(ctx, 30, 330, 186, 50, '#7a4a2b');
  rect(ctx, 24, 322, 198, 12, '#a06a3f');
  if (!B) { // diff 3: the basket of oranges is missing in B
    poly(ctx, [[62, 300], [118, 300], [110, 326], [70, 326]], '#8a5a2b');
    circle(ctx, 78, 292, 10, '#ff8c2a');
    circle(ctx, 96, 286, 10, '#ff8c2a');
    circle(ctx, 110, 296, 9, '#ff9e4a');
    circle(ctx, 86, 300, 9, '#ff7a1a');
  }
  poly(ctx, [[150, 306], [200, 306], [194, 328], [156, 328]], '#8a5a2b');
  circle(ctx, 164, 298, 9, '#d83a3a');
  circle(ctx, 180, 292, 9, '#e84a4a');
  circle(ctx, 192, 300, 8, '#c92f2f');
  // The cat by stall A. Diff 6: gone in B.
  if (!B) {
    ellipse(ctx, 192, 440, 22, 13, '#2e2a33');
    circle(ctx, 208, 424, 10, '#2e2a33');
    poly(ctx, [[200, 416], [204, 404], [208, 416]], '#2e2a33');
    poly(ctx, [[212, 416], [216, 404], [218, 416]], '#2e2a33');
    ctx.strokeStyle = '#2e2a33';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(172, 440);
    ctx.quadraticCurveTo(158, 428, 162, 414);
    ctx.stroke();
  }
  // Stall B: paper lanterns.
  rect(ctx, 260, 140, 10, 240, '#5a3a22');
  rect(ctx, 400, 140, 10, 240, '#5a3a22');
  rect(ctx, 250, 140, 170, 10, '#5a3a22');
  const lantern = (x, y, r, color) => {
    circle(ctx, x, y, r, color);
    rect(ctx, x - 6, y - r - 4, 12, 5, '#c9a227');
    rect(ctx, x - 6, y + r - 1, 12, 5, '#c9a227');
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - r + 4);
    ctx.lineTo(x, y + r - 4);
    ctx.stroke();
  };
  lantern(285, 210, 20, '#e84a4a');
  lantern(330, 228, 22, B ? '#2bb3a3' : '#e84a4a'); // diff 2: middle lantern changes colour
  lantern(378, 205, 19, '#e84a4a');
  const smallY = B ? 332 : 300; // diff 7: the small lantern hangs lower in B
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(370, 250);
  ctx.lineTo(370, smallY - 12);
  ctx.stroke();
  lantern(370, smallY, 12, '#ffc857');
  rect(ctx, 255, 330, 160, 50, '#7a4a2b');
  // Stall C: steamed buns.
  rect(ctx, 440, 150, 10, 230, '#5a3a22');
  rect(ctx, 586, 150, 10, 230, '#5a3a2b');
  rect(ctx, 440, 170, 156, 44, '#f5e6c8');
  text(ctx, 'BAKPAO', 518, 200, 22, '#7a3a22', 'center', 'bold');
  rect(ctx, 440, 330, 156, 50, '#7a4a2b');
  rect(ctx, 434, 322, 168, 12, '#a06a3f');
  for (let i = 0; i < 3; i += 1) {
    ellipse(ctx, 500, 296 - i * 16, 34, 9, '#c9a86a');
    rect(ctx, 466, 288 - i * 16, 68, 10, '#b8935a');
  }
  circle(ctx, 486, 282, 5, '#fff2d8');
  circle(ctx, 512, 282, 5, '#fff2d8');
}

/* ------------------------------------------------------------------ scene 2 */
const BOOK_COLORS = ['#c94f4f', '#3a6fd8', '#3fae6a', '#f2c94c', '#8a5fc0', '#e88bb0', '#2bb3a3', '#d8842a'];
function bookRow(ctx, x, y, w, h, count, colorShift, skipIndex, colorOverride) {
  const bw = w / count;
  for (let i = 0; i < count; i += 1) {
    if (i === skipIndex) continue;
    const color = colorOverride && i === colorOverride.index ? colorOverride.color : BOOK_COLORS[(i + colorShift) % BOOK_COLORS.length];
    const bh = h - ((i * 7) % 12);
    rect(ctx, x + i * bw + 1, y + (h - bh), bw - 2, bh, color);
    rect(ctx, x + i * bw + 2, y + (h - bh) + 6, bw - 4, 2, 'rgba(255,255,255,0.35)');
  }
}
function drawBookstore(ctx, variant) {
  const B = variant === 'B';
  rect(ctx, 0, 0, 616, 400, '#e8d5b0');
  rect(ctx, 0, 400, 616, 90, '#8a5a3b');
  for (let i = 0; i < 6; i += 1) rect(ctx, 0, 408 + i * 14, 616, 2, '#6b4423');
  // Left shelf: three rows of books.
  rect(ctx, 16, 55, 224, 345, '#6b4423');
  bookRow(ctx, 26, 70, 204, 95, 9, 0, -1, { index: 4, color: B ? '#f2c94c' : '#3a6fd8' }); // diff 1: one spine changes colour
  bookRow(ctx, 26, 180, 204, 95, 9, 3, B ? 7 : -1, null); // diff 4: one book is missing in B
  bookRow(ctx, 26, 290, 204, 95, 9, 6, -1, null);
  // Right shelf.
  rect(ctx, 376, 55, 224, 345, '#6b4423');
  bookRow(ctx, 386, 70, 204, 95, 9, 2, -1, null);
  bookRow(ctx, 386, 180, 204, 95, 9, 5, -1, null);
  bookRow(ctx, 386, 290, 204, 95, 9, 1, -1, null);
  // Globe on the right shelf.
  circle(ctx, 488, 36, 20, '#5db9ff');
  ellipse(ctx, 482, 30, 8, 5, '#3fae6a');
  ellipse(ctx, 496, 42, 7, 4, '#3fae6a');
  rect(ctx, 480, 54, 16, 4, '#c9a227');
  // Window between the shelves: night, rain, moon.
  rect(ctx, 260, 60, 96, 135, '#5a3a22');
  rect(ctx, 268, 68, 80, 119, '#1b2a4a');
  circle(ctx, 322, 92, 12, '#ffe9a8');
  ctx.strokeStyle = 'rgba(180,200,255,0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    const x = 274 + i * 11;
    const y = 120 + (i % 3) * 22;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 12);
    ctx.stroke();
  }
  // Wall clock. Diff 3: the hands read 3:00 in A, 4:30 in B.
  circle(ctx, 308, 245, 26, '#f5f0e6');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(308, 245, 26, 0, Math.PI * 2);
  ctx.stroke();
  const hand = (angle, len) => {
    ctx.strokeStyle = '#2e2a33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(308, 245);
    ctx.lineTo(308 + Math.cos(angle) * len, 245 + Math.sin(angle) * len);
    ctx.stroke();
  };
  if (B) { hand(-Math.PI / 2 + 0.65, 14); hand(Math.PI / 2, 20); }
  else { hand(0, 14); hand(-Math.PI / 2, 20); }
  circle(ctx, 308, 245, 3, '#2e2a33');
  // Table with books and a lamp.
  rect(ctx, 200, 330, 220, 14, '#7a4a2b');
  rect(ctx, 214, 344, 12, 56, '#5a3a22');
  rect(ctx, 394, 344, 12, 56, '#5a3a22');
  rect(ctx, 232, 306, 56, 10, '#c94f4f');
  rect(ctx, 238, 296, 48, 10, '#3a6fd8');
  rect(ctx, 244, 287, 40, 9, '#3fae6a');
  if (B) rect(ctx, 306, 320, 44, 9, '#8a5fc0'); // diff 6: one extra book on the table in B
  if (!B) { // diff 5: the lamp glows in A, dark in B
    const g = ctx.createRadialGradient(385, 268, 4, 385, 268, 90);
    g.addColorStop(0, 'rgba(255,217,138,0.55)');
    g.addColorStop(1, 'rgba(255,217,138,0)');
    ctx.fillStyle = g;
    ctx.fillRect(295, 178, 180, 180);
  }
  rect(ctx, 380, 306, 10, 24, '#2e2a33');
  poly(ctx, [[368, 306], [402, 306], [394, 272], [376, 272]], B ? '#8b93a3' : '#e84a4a');
  circle(ctx, 385, 268, 6, B ? '#8b93a3' : '#ffd98a');
  // Armchair and the cat. Diff 2: no cat in B.
  poly(ctx, [[440, 450], [440, 360], [470, 340], [560, 340], [585, 360], [585, 450]], '#a06a3f');
  rect(ctx, 448, 400, 130, 18, '#c98a5a');
  if (!B) {
    ellipse(ctx, 512, 392, 26, 12, '#e88b3a');
    circle(ctx, 534, 382, 10, '#e88b3a');
    poly(ctx, [[528, 374], [531, 364], [535, 374]], '#e88b3a');
    poly(ctx, [[538, 374], [542, 364], [544, 374]], '#e88b3a');
  }
  // Potted plant. Diff 7: the flower is missing in B.
  poly(ctx, [[52, 420], [98, 420], [90, 462], [60, 462]], '#b5533c');
  ellipse(ctx, 66, 400, 10, 26, '#3fae6a');
  ellipse(ctx, 84, 398, 10, 28, '#2f8a52');
  ellipse(ctx, 75, 388, 8, 22, '#4cbf74');
  if (!B) {
    circle(ctx, 75, 372, 7, '#e88bb0');
    circle(ctx, 75, 372, 3, '#f2c94c');
  }
}

/* ------------------------------------------------------------------ scene 3 */
const FIREFLIES = [[300, 120], [120, 90], [220, 160], [420, 100], [520, 200], [180, 230], [460, 250], [80, 300]];
function drawGarden(ctx, variant) {
  const B = variant === 'B';
  sky(ctx, [[0, '#1f2a5e'], [0.55, '#6b4a8a'], [1, '#e8935a']], 490);
  circle(ctx, 520, 70, 22, '#ffe9a8');
  circle(ctx, 512, 64, 4, '#e8c97a');
  // Tree with blossom canopy.
  ctx.strokeStyle = '#4a2f1d';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(95, 490);
  ctx.quadraticCurveTo(80, 320, 110, 190);
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(105, 260);
  ctx.quadraticCurveTo(150, 220, 180, 180);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(100, 300);
  ctx.quadraticCurveTo(50, 260, 30, 210);
  ctx.stroke();
  const blossom = [[70, 120], [120, 90], [170, 130], [100, 170], [150, 190], [50, 170], [200, 90], [130, 140], [90, 210], [170, 220]];
  for (const [x, y] of blossom) {
    circle(ctx, x, y, 20, '#f2a7c3');
    circle(ctx, x - 6, y - 4, 12, '#e88bb0');
  }
  if (B) { // diff 5: an extra blossom cluster in B
    circle(ctx, 205, 100, 18, '#f2a7c3');
    circle(ctx, 218, 112, 12, '#e88bb0');
    circle(ctx, 192, 112, 10, '#f7c6d9');
  }
  // Pond with lily pads.
  ellipse(ctx, 480, 375, 120, 55, '#3f7f9e');
  ellipse(ctx, 480, 375, 108, 46, '#4a90b0');
  ellipse(ctx, 420, 360, 34, 12, '#3fae6a');
  ellipse(ctx, 540, 355, 30, 11, '#3fae6a');
  ellipse(ctx, 480, 395, 36, 12, '#2f8a52');
  circle(ctx, 480, 385, 8, B ? '#f5f0e6' : '#f28bb0'); // diff 2: the lily flower changes colour
  circle(ctx, 480, 385, 3, '#f2c94c');
  // Stepping stones. Diff 4: the middle stone is missing in B.
  ellipse(ctx, 390, 430, 26, 9, '#b8bcc4');
  if (!B) ellipse(ctx, 460, 445, 26, 9, '#b8bcc4');
  ellipse(ctx, 530, 430, 26, 9, '#b8bcc4');
  // Bench with a cushion. Diff 6: the cushion is red in A, blue in B.
  rect(ctx, 230, 360, 150, 12, '#7a4a2b');
  rect(ctx, 230, 330, 150, 10, '#7a4a2b');
  rect(ctx, 240, 372, 10, 58, '#5a3a22');
  rect(ctx, 360, 372, 10, 58, '#5a3a22');
  rect(ctx, 245, 348, 120, 12, B ? '#3a6fd8' : '#d84a4a');
  // Birdhouse on a pole. Diff 3: gone in B.
  if (!B) {
    rect(ctx, 326, 180, 8, 120, '#5a3a22');
    rect(ctx, 308, 150, 44, 34, '#a06a3f');
    poly(ctx, [[302, 152], [330, 128], [358, 152]], '#7a3a22');
    circle(ctx, 330, 168, 7, '#2e2a33');
  }
  // Fireflies. Diff 1: one is missing in B.
  for (let i = 0; i < FIREFLIES.length; i += 1) {
    if (B && i === 0) continue;
    const [x, y] = FIREFLIES[i];
    circle(ctx, x, y, 4, '#ffe98a');
    circle(ctx, x, y, 2, '#fffbe0');
  }
  // Tulips along the bottom.
  const tulipColors = ['#e84a4a', '#f2c94c', '#e88bb0', '#ff8c2a'];
  for (let i = 0; i < 12; i += 1) {
    const x = 30 + i * 50;
    ctx.strokeStyle = '#2f8a52';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 490);
    ctx.lineTo(x, 462);
    ctx.stroke();
    poly(ctx, [[x - 8, 462], [x + 8, 462], [x + 5, 444], [x, 438], [x - 5, 444]], tulipColors[i % 4]);
  }
  // Butterfly. Diff 7: gone in B.
  if (!B) {
    ellipse(ctx, 132, 296, 10, 14, '#ff8c2a');
    ellipse(ctx, 150, 296, 10, 14, '#ffb84d');
    ellipse(ctx, 134, 310, 8, 10, '#ff8c2a');
    ellipse(ctx, 148, 310, 8, 10, '#ffb84d');
    rect(ctx, 139, 292, 4, 24, '#2e2a33');
  }
}

/* ------------------------------------------------------------------ scene 4 */
function drawStation(ctx, variant) {
  const B = variant === 'B';
  rect(ctx, 0, 0, 616, 195, '#cfe3ee');
  // Roof beam and hanging lamps.
  rect(ctx, 0, 0, 616, 48, '#2e3440');
  for (const x of [120, 308, 500]) {
    ctx.strokeStyle = '#2e3440';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 48);
    ctx.lineTo(x, 62);
    ctx.stroke();
    circle(ctx, x, 68, 7, '#ffd98a');
  }
  // Big clock. Diff 1: the hands read 10:10 in A, 2:40 in B.
  circle(ctx, 308, 118, 34, '#f5f0e6');
  ctx.strokeStyle = '#2e3440';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(308, 118, 34, 0, Math.PI * 2);
  ctx.stroke();
  const hand = (angle, len) => {
    ctx.strokeStyle = '#2e2a33';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(308, 118);
    ctx.lineTo(308 + Math.cos(angle) * len, 118 + Math.sin(angle) * len);
    ctx.stroke();
  };
  if (B) { hand(-Math.PI / 2 + 1.1, 18); hand(Math.PI / 2 - 0.5, 26); }
  else { hand(-Math.PI / 2 - 1.0, 18); hand(-Math.PI / 2 + 1.0, 26); }
  circle(ctx, 308, 118, 4, '#2e2a33');
  // Platform sign. Diff 4: platform 3 in A, 5 in B.
  rect(ctx, 430, 70, 130, 42, '#2e3440');
  text(ctx, B ? 'PLAT 5' : 'PLAT 3', 495, 100, 26, '#f5f0e6', 'center', 'bold');
  // Train.
  poly(ctx, [[40, 195], [580, 195], [580, 330], [40, 330]], '#2a7f8f');
  rect(ctx, 40, 195, 540, 16, '#1f5f6b');
  rect(ctx, 40, 308, 540, 10, '#f2c94c');
  const windows = [80, 170, 260, 350, 440];
  for (let i = 0; i < windows.length; i += 1) {
    const lit = i === 2 ? !B : true; // diff 2: the third window is dark in B
    rect(ctx, windows[i], 222, 60, 48, lit ? '#ffd98a' : '#1e2a33');
    rect(ctx, windows[i] + 28, 222, 4, 48, '#2a7f8f');
  }
  for (const x of [90, 220, 350, 480]) {
    circle(ctx, x, 338, 16, '#2e2a33');
    circle(ctx, x, 338, 6, '#5a6470');
  }
  // Platform.
  rect(ctx, 0, 352, 616, 138, '#9aa0a8');
  rect(ctx, 0, 352, 616, 8, '#f2c94c');
  // Benches.
  const bench = (x, slat) => {
    rect(ctx, x, 392, 120, 10, slat);
    rect(ctx, x, 366, 120, 10, slat);
    rect(ctx, x + 6, 402, 8, 40, '#5a3a22');
    rect(ctx, x + 106, 402, 8, 40, '#5a3a22');
    rect(ctx, x + 6, 340, 8, 28, '#5a3a22');
    rect(ctx, x + 106, 340, 8, 28, '#5a3a22');
  };
  bench(80, '#7a4a2b');
  bench(450, B ? '#3fae6a' : '#7a4a2b'); // diff 7: the second bench's slats change colour
  // Lamps. Diff 5: a third lamp post appears in B.
  const lamp = (x) => {
    rect(ctx, x - 3, 300, 6, 100, '#2e3440');
    circle(ctx, x, 292, 9, '#ffd98a');
    poly(ctx, [[x - 12, 292], [x + 12, 292], [x + 7, 280], [x - 7, 280]], '#2e3440');
  };
  lamp(210);
  lamp(520);
  if (B) lamp(360);
  // Luggage. Diff 3: the blue suitcase is missing in B.
  rect(ctx, 118, 430, 36, 28, '#c94f4f');
  rect(ctx, 130, 422, 12, 8, '#8a2f2f');
  rect(ctx, 118, 442, 36, 4, '#8a2f2f');
  if (!B) {
    rect(ctx, 162, 434, 30, 24, '#3a6fd8');
    rect(ctx, 172, 427, 10, 7, '#274a8a');
  }
  // Pigeon. Diff 6: gone in B.
  if (!B) {
    ellipse(ctx, 280, 438, 14, 9, '#8b93a3');
    circle(ctx, 292, 428, 7, '#8b93a3');
    poly(ctx, [[298, 428], [304, 430], [298, 432]], '#e8a33a');
    ctx.strokeStyle = '#8b93a3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(276, 446);
    ctx.lineTo(276, 452);
    ctx.moveTo(284, 446);
    ctx.lineTo(284, 452);
    ctx.stroke();
  }
}

export const SCENES = [
  {
    name: 'Night Market',
    sub: 'Pasar Malam',
    draw: drawMarket,
    diffs: [
      { id: 0, x: 545, y: 62, r: 30, label: 'moon' },
      { id: 1, x: 330, y: 228, r: 26, label: 'lantern colour' },
      { id: 2, x: 90, y: 300, r: 30, label: 'oranges' },
      { id: 3, x: 95, y: 62, r: 12, label: 'extra star' },
      { id: 4, x: 123, y: 168, r: 18, label: 'awning stripe' },
      { id: 5, x: 192, y: 435, r: 26, label: 'cat' },
      { id: 6, x: 370, y: 300, r: 20, bx: 370, by: 332, label: 'hanging lantern' },
    ],
  },
  {
    name: 'Cozy Bookstore',
    sub: 'Toko Buku',
    draw: drawBookstore,
    diffs: [
      { id: 0, x: 122, y: 118, r: 18, label: 'book spine' },
      { id: 1, x: 512, y: 388, r: 28, label: 'cat' },
      { id: 2, x: 308, y: 245, r: 28, label: 'clock' },
      { id: 3, x: 202, y: 228, r: 18, label: 'missing book' },
      { id: 4, x: 385, y: 272, r: 26, label: 'lamp' },
      { id: 5, x: 328, y: 324, r: 18, label: 'extra book' },
      { id: 6, x: 75, y: 372, r: 14, label: 'flower' },
    ],
  },
  {
    name: 'Garden at Dusk',
    sub: 'Taman Senja',
    draw: drawGarden,
    diffs: [
      { id: 0, x: 300, y: 120, r: 12, label: 'firefly' },
      { id: 1, x: 480, y: 385, r: 14, label: 'lily flower' },
      { id: 2, x: 330, y: 165, r: 28, label: 'birdhouse' },
      { id: 3, x: 460, y: 445, r: 26, label: 'stepping stone' },
      { id: 4, x: 205, y: 100, r: 22, label: 'blossoms' },
      { id: 5, x: 305, y: 354, r: 20, label: 'cushion' },
      { id: 6, x: 141, y: 300, r: 20, label: 'butterfly' },
    ],
  },
  {
    name: 'Train Station',
    sub: 'Stasiun',
    draw: drawStation,
    diffs: [
      { id: 0, x: 308, y: 118, r: 36, label: 'clock' },
      { id: 1, x: 290, y: 246, r: 30, label: 'train window' },
      { id: 2, x: 177, y: 446, r: 22, label: 'suitcase' },
      { id: 3, x: 495, y: 91, r: 24, label: 'platform number' },
      { id: 4, x: 360, y: 296, r: 20, label: 'extra lamp' },
      { id: 5, x: 280, y: 436, r: 18, label: 'pigeon' },
      { id: 6, x: 510, y: 384, r: 22, label: 'bench slats' },
    ],
  },
];
