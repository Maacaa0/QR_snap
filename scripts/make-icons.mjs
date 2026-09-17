/**
 * Generates the extension icon set and the Chrome Web Store promo tile.
 *
 * Pure Node (zlib only) so the extension folder needs no dependencies:
 * run `node scripts/make-icons.mjs` after changing the artwork constants.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, crc32 as zlibCrc32 } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BACKGROUND = [15, 23, 42, 255];
const MODULE = [248, 250, 252, 255];
const ACCENT = [20, 184, 166, 255];
const ICON_SIZES = [16, 32, 48, 128];

function crc32(buffer) {
  return zlibCrc32(buffer) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function createCanvas(width, height, fill = [0, 0, 0, 0]) {
  const data = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    data.set(fill, index * 4);
  }
  return { width, height, data };
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
    return;
  }
  canvas.data.set(color, (y * canvas.width + x) * 4);
}

function fillRect(canvas, x, y, width, height, color) {
  for (let row = Math.round(y); row < Math.round(y + height); row += 1) {
    for (let column = Math.round(x); column < Math.round(x + width); column += 1) {
      setPixel(canvas, column, row, color);
    }
  }
}

function fillRoundedRect(canvas, x, y, width, height, radius, color) {
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const dx = Math.min(column, width - 1 - column);
      const dy = Math.min(row, height - 1 - row);
      if (dx < radius && dy < radius) {
        const distance = Math.hypot(radius - dx, radius - dy);
        if (distance > radius) {
          continue;
        }
      }
      setPixel(canvas, x + column, y + row, color);
    }
  }
}

/** Deterministic QR-looking module matrix: three finders, timing line, filler. */
function buildMatrix(size) {
  const matrix = Array.from({ length: size }, () => new Array(size).fill(false));
  const finder = size >= 17 ? 7 : 3;

  const drawFinder = (originX, originY) => {
    for (let y = 0; y < finder; y += 1) {
      for (let x = 0; x < finder; x += 1) {
        const onBorder = x === 0 || y === 0 || x === finder - 1 || y === finder - 1;
        const inCore = finder >= 7 ? x > 1 && y > 1 && x < finder - 2 && y < finder - 2 : false;
        matrix[originY + y][originX + x] = finder >= 7 ? onBorder || inCore : true;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - finder, 0);
  drawFinder(0, size - finder);

  const reserved = (x, y) =>
    (x < finder + 1 && y < finder + 1) ||
    (x >= size - finder - 1 && y < finder + 1) ||
    (x < finder + 1 && y >= size - finder - 1);

  if (finder >= 7) {
    for (let index = finder + 1; index < size - finder - 1; index += 1) {
      matrix[6][index] = index % 2 === 0;
      matrix[index][6] = index % 2 === 0;
    }
  }

  let seed = 0x2_f6_e2_b1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (reserved(x, y) || (finder >= 7 && (x === 6 || y === 6))) {
        continue;
      }
      seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
      matrix[y][x] = (seed >>> 16) % 100 < 46;
    }
  }
  return matrix;
}

/** Below 48px a full matrix turns to mush, so the small icons keep the finders only. */
function renderSmallIcon(size) {
  const canvas = createCanvas(size, size);
  fillRoundedRect(canvas, 0, 0, size, size, Math.max(2, Math.round(size * 0.2)), BACKGROUND);

  const pad = Math.max(2, Math.round(size * 0.14));
  const block = Math.max(3, Math.round((size - pad * 2) * 0.36));
  const far = size - pad - block;

  fillRect(canvas, pad, pad, block, block, MODULE);
  fillRect(canvas, far, pad, block, block, ACCENT);
  fillRect(canvas, pad, far, block, block, MODULE);

  const dot = Math.max(1, Math.round(block / 3));
  fillRect(canvas, far, far, dot, dot, MODULE);
  fillRect(canvas, far + dot * 2, far + dot * 2, dot, dot, MODULE);
  return encodePng(size, size, canvas.data);
}

function renderIcon(size) {
  if (size < 48) {
    return renderSmallIcon(size);
  }

  const canvas = createCanvas(size, size);
  fillRoundedRect(canvas, 0, 0, size, size, Math.max(2, Math.round(size * 0.18)), BACKGROUND);

  const modules = 21;
  const quiet = 2;
  const matrix = buildMatrix(modules);
  const scale = size / (modules + quiet * 2);
  const offset = scale * quiet;

  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (!matrix[y][x]) {
        continue;
      }
      fillRect(
        canvas,
        offset + x * scale,
        offset + y * scale,
        Math.max(1, Math.ceil(scale)),
        Math.max(1, Math.ceil(scale)),
        x >= modules - 7 && y < 7 ? ACCENT : MODULE,
      );
    }
  }
  return encodePng(size, size, canvas.data);
}

function renderPromoTile(width, height) {
  const canvas = createCanvas(width, height, BACKGROUND);
  const badge = Math.round(height * 0.62);
  const matrix = buildMatrix(21);
  const scale = badge / 25;
  const originX = Math.round(height * 0.19);
  const originY = Math.round((height - badge) / 2);

  fillRoundedRect(
    canvas,
    originX,
    originY,
    badge,
    badge,
    Math.round(badge * 0.18),
    [30, 41, 59, 255],
  );
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      if (!matrix[y][x]) {
        continue;
      }
      fillRect(
        canvas,
        originX + scale * 2 + x * scale,
        originY + scale * 2 + y * scale,
        Math.ceil(scale),
        Math.ceil(scale),
        x >= 14 && y < 7 ? ACCENT : MODULE,
      );
    }
  }

  const textX = originX + badge + Math.round(height * 0.12);
  fillRect(canvas, textX, originY + badge * 0.32, Math.round(width * 0.36), 10, MODULE);
  fillRect(canvas, textX, originY + badge * 0.52, Math.round(width * 0.24), 8, ACCENT);
  return encodePng(width, height, canvas.data);
}

for (const size of ICON_SIZES) {
  writeFileSync(join(ROOT, "icons", `icon${size}.png`), renderIcon(size));
}
writeFileSync(join(ROOT, "store", "promo-tile-440x280.png"), renderPromoTile(440, 280));

process.stdout.write(`icons written: ${ICON_SIZES.join(", ")} + store promo tile\n`);
