/**
 * Image decoding layer: turns a captured tab screenshot into QR results.
 *
 * Runs inside the service worker, so it uses OffscreenCanvas / createImageBitmap
 * and never touches the DOM.
 */

/** Regions smaller than this get upscaled before decoding - jsQR needs pixels. */
const MIN_DECODE_SIDE = 420;
const MAX_UPSCALE = 4;
const TILE_GRID = 3;
const TILE_OVERLAP = 0.15;
const JSQR_OPTIONS = { inversionAttempts: "attemptBoth" };

function getDecoder() {
  const decoder = globalThis.jsQR;
  if (typeof decoder !== "function") {
    throw new Error("QR decoding library failed to load");
  }
  return decoder;
}

export async function bitmapFromDataUrl(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

function clampRegion(region, bitmap) {
  const x = Math.max(0, Math.min(Math.round(region.x), bitmap.width - 1));
  const y = Math.max(0, Math.min(Math.round(region.y), bitmap.height - 1));
  const w = Math.max(1, Math.min(Math.round(region.w), bitmap.width - x));
  const h = Math.max(1, Math.min(Math.round(region.h), bitmap.height - y));
  return { x, y, w, h };
}

function upscaleFor(region) {
  const shortest = Math.min(region.w, region.h);
  if (shortest >= MIN_DECODE_SIDE) {
    return 1;
  }
  return Math.min(MAX_UPSCALE, Math.max(1, Math.round((MIN_DECODE_SIDE / shortest) * 10) / 10));
}

function decodeRegion(bitmap, rawRegion, source) {
  const region = clampRegion(rawRegion, bitmap);
  const scale = upscaleFor(region);
  const width = Math.max(1, Math.round(region.w * scale));
  const height = Math.max(1, Math.round(region.h * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Could not create a drawing context for decoding");
  }
  context.imageSmoothingEnabled = false;
  context.drawImage(bitmap, region.x, region.y, region.w, region.h, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const found = getDecoder()(imageData.data, width, height, JSQR_OPTIONS);
  if (!found?.data) {
    return null;
  }
  const corners = Object.values(found.location).filter((point) => typeof point?.x === "number");
  const xs = corners.map((point) => region.x + point.x / scale);
  const ys = corners.map((point) => region.y + point.y / scale);
  return {
    value: found.data,
    source,
    region: {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    },
  };
}

function tileRegions(bitmap) {
  const tiles = [];
  const stepX = bitmap.width / TILE_GRID;
  const stepY = bitmap.height / TILE_GRID;
  const padX = stepX * TILE_OVERLAP;
  const padY = stepY * TILE_OVERLAP;
  for (let row = 0; row < TILE_GRID; row += 1) {
    for (let column = 0; column < TILE_GRID; column += 1) {
      tiles.push({
        x: column * stepX - padX,
        y: row * stepY - padY,
        w: stepX + padX * 2,
        h: stepY + padY * 2,
      });
    }
  }
  return tiles;
}

/**
 * Decodes one captured frame.
 *
 * @param {ImageBitmap} bitmap screenshot of the visible tab, in device pixels
 * @param {Array<{x: number, y: number, w: number, h: number}>} elementRegions
 *   candidate boxes (images, canvases, svg) already converted to device pixels
 * @returns {Array<{value: string, source: string, region: object}>}
 */
export function decodeFrame(bitmap, elementRegions = []) {
  const hits = [];
  const seen = new Set();

  const collect = (hit) => {
    if (!hit || seen.has(hit.value)) {
      return;
    }
    seen.add(hit.value);
    hits.push(hit);
  };

  collect(decodeRegion(bitmap, { x: 0, y: 0, w: bitmap.width, h: bitmap.height }, "frame"));

  for (const region of elementRegions) {
    if (region.w < 8 || region.h < 8) {
      continue;
    }
    const padding = Math.max(4, Math.min(region.w, region.h) * 0.06);
    collect(
      decodeRegion(
        bitmap,
        {
          x: region.x - padding,
          y: region.y - padding,
          w: region.w + padding * 2,
          h: region.h + padding * 2,
        },
        "element",
      ),
    );
  }

  if (hits.length === 0) {
    for (const tile of tileRegions(bitmap)) {
      collect(decodeRegion(bitmap, tile, "tile"));
    }
  }

  return hits;
}

/** Decodes an explicit crop, used by the snipping tool. */
export function decodeRegionOnly(bitmap, region) {
  const hit = decodeRegion(bitmap, region, "snip");
  return hit ? [hit] : [];
}
