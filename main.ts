// Spot the Difference — entry program (Node 22, standard library only).
//
// The game lives in game/ beside this file: plain static files a desktop
// browser loads offline (game/index.html plus its own scripts, no library,
// no network request). This program hands the entry in: it copies game/ and
// screenshots/ into the output directory and writes the dossier the judge
// reads, using the vendored make.fun library. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Scorer caps for this bounty (game files, screenshots, dossier text).
const DOSSIER_TEXT_BYTES = 163840;
const SHOT_LIMIT = 4;
const SHOT_MAX_BYTES = 262144;
const GAME_MAX_FILES = 993;
const GAME_MAX_BYTES = 50331648;
const GAME_PATH_MAX_BYTES = 1000;

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const INDEX_HTML_MAX_BYTES = 1024 * 1024;

function repoRoot(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

function fail(message: string): never {
  throw new Error(`main.ts: ${message}`);
}

function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    total += statSync(full).isDirectory() ? countFiles(full) : 1;
  }
  return total;
}

function listShots(shotsDir: string): string[] {
  if (!existsSync(shotsDir)) return [];
  return readdirSync(shotsDir)
    .filter((name) => {
      const lower = name.toLowerCase();
      const dot = lower.lastIndexOf('.');
      return dot > 0 && IMAGE_EXTENSIONS.has(lower.slice(dot));
    })
    .sort();
}

function checkEntry(root: string): string[] {
  const indexPage = join(root, 'game', 'index.html');
  if (!existsSync(indexPage)) fail('game/index.html is missing');
  const indexBytes = statSync(indexPage).size;
  if (indexBytes > INDEX_HTML_MAX_BYTES) {
    fail(`game/index.html is ${indexBytes} bytes, over the ${INDEX_HTML_MAX_BYTES} byte cap`);
  }
  const shots = listShots(join(root, 'screenshots'));
  if (shots.length < 3 || shots.length > SHOT_LIMIT) {
    fail(`screenshots/ must hold 3 to ${SHOT_LIMIT} images, found ${shots.length}`);
  }
  return shots;
}

function copyTree(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function writeDossier(out: string): number {
  const bytes = buildDossier(out, {
    text_max_bytes: DOSSIER_TEXT_BYTES,
    screenshots: { max: SHOT_LIMIT, max_bytes: SHOT_MAX_BYTES },
    game_max_files: GAME_MAX_FILES,
    game_max_bytes: GAME_MAX_BYTES,
    game_path_max_bytes: GAME_PATH_MAX_BYTES,
  });
  writeFileSync(join(out, 'dossier.json'), bytes);
  return bytes.length;
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();
  const shots = checkEntry(root);

  mkdirSync(out, { recursive: true });
  copyTree(join(root, 'game'), join(out, 'game'));
  copyTree(join(root, 'screenshots'), join(out, 'screenshots'));

  const gameFiles = countFiles(join(out, 'game'));
  const dossierBytes = writeDossier(out);

  console.log(`spot-the-difference: wrote ${out}`);
  console.log(`  game files: ${gameFiles}`);
  console.log(`  screenshots: ${shots.length} (${shots[0]} is the cover)`);
  console.log(`  dossier.json: ${dossierBytes} bytes`);
}

main();
