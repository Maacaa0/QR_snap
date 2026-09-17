/** Orchestrates tab capture, decoding and result bookkeeping. */

import { bitmapFromDataUrl, decodeFrame, decodeRegionOnly } from "./decode.js";
import { addToHistory } from "./history.js";
import { classifyQrValue, dedupeResults } from "./qrValue.js";

/** chrome.tabs.captureVisibleTab is quota limited to 2 calls per second. */
const CAPTURE_INTERVAL_MS = 650;
const SCROLL_SETTLE_MS = 260;
const MAX_FULL_PAGE_CAPTURES = 12;
const SNIP_RETRY_PADDING = 0.25;

const OVERLAY_SCRIPT = "src/content/overlay.js";

let lastCaptureAt = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureVisible(windowId) {
  const elapsed = Date.now() - lastCaptureAt;
  if (elapsed < CAPTURE_INTERVAL_MS) {
    await wait(CAPTURE_INTERVAL_MS - elapsed);
  }
  lastCaptureAt = Date.now();
  return chrome.tabs.captureVisibleTab(windowId, { format: "png" });
}

/* Injected into the page - must stay self-contained. */
function pageProbe() {
  const CANDIDATE_SELECTOR =
    'img, canvas, svg, picture, video, object, [style*="background-image"]';
  const MIN_SIDE = 24;
  const MAX_REGIONS = 40;
  const regions = [];

  for (const element of document.querySelectorAll(CANDIDATE_SELECTOR)) {
    if (regions.length >= MAX_REGIONS) {
      break;
    }
    const rect = element.getBoundingClientRect();
    const visible =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;
    if (!visible || rect.width < MIN_SIDE || rect.height < MIN_SIDE) {
      continue;
    }
    regions.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
  }

  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    docHeight: Math.max(
      document.documentElement?.scrollHeight ?? 0,
      document.body?.scrollHeight ?? 0,
      window.innerHeight,
    ),
    regions,
    url: window.location.href,
    title: document.title,
  };
}

/* Injected into the page - must stay self-contained. */
function pageScrollTo(targetY) {
  window.scrollTo({ top: targetY, left: window.scrollX, behavior: "instant" });
  return window.scrollY;
}

export async function runInTab(tabId, func, args = []) {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args,
  });
  return injection?.result;
}

export async function ensureOverlay(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [OVERLAY_SCRIPT],
  });
}

function scaleRegion(region, scale) {
  return {
    x: region.x * scale,
    y: region.y * scale,
    w: region.w * scale,
    h: region.h * scale,
  };
}

function toDocumentRegion(region, frameInfo, scale) {
  return {
    x: region.x / scale + frameInfo.scrollX,
    y: region.y / scale + frameInfo.scrollY,
    w: region.w / scale,
    h: region.h / scale,
  };
}

function toEntry(hit, frameInfo, scale, tab) {
  const classification = classifyQrValue(hit.value);
  return {
    ...classification,
    source: hit.source,
    regions: [toDocumentRegion(hit.region, frameInfo, scale)],
    pageUrl: frameInfo?.url ?? tab?.url ?? "",
    pageTitle: frameInfo?.title ?? tab?.title ?? "",
    foundAt: Date.now(),
  };
}

function buildScrollPositions(probe) {
  const step = Math.max(200, probe.innerHeight * 0.85);
  const maxScroll = Math.max(0, probe.docHeight - probe.innerHeight);
  const positions = [];
  for (let y = 0; y <= maxScroll && positions.length < MAX_FULL_PAGE_CAPTURES; y += step) {
    positions.push(Math.round(y));
  }
  if (positions.length === 0) {
    positions.push(0);
  }
  const last = positions.at(-1);
  if (maxScroll - last > 8 && positions.length < MAX_FULL_PAGE_CAPTURES) {
    positions.push(Math.round(maxScroll));
  }
  return positions;
}

async function persist(entries) {
  const deduped = dedupeResults(entries);
  if (deduped.length > 0) {
    await addToHistory(deduped);
  }
  return deduped;
}

/**
 * Screenshots the tab (optionally scrolling through the whole document) and
 * decodes every QR code it can find.
 */
export async function scanPage(tab, { fullPage = false } = {}) {
  const probe = await runInTab(tab.id, pageProbe);
  if (!probe) {
    throw new Error("This page cannot be scanned");
  }

  const positions = fullPage ? buildScrollPositions(probe) : [probe.scrollY];
  const truncated = fullPage && positions.length >= MAX_FULL_PAGE_CAPTURES;
  const frames = [];

  for (const position of positions) {
    let frameInfo = probe;
    if (fullPage) {
      await runInTab(tab.id, pageScrollTo, [position]);
      await wait(SCROLL_SETTLE_MS);
      frameInfo = (await runInTab(tab.id, pageProbe)) ?? probe;
    }
    frames.push({ frameInfo, dataUrl: await captureVisible(tab.windowId) });
  }

  if (fullPage) {
    await runInTab(tab.id, pageScrollTo, [probe.scrollY]);
  }

  const entries = [];
  for (const frame of frames) {
    const bitmap = await bitmapFromDataUrl(frame.dataUrl);
    const scale = bitmap.width / frame.frameInfo.innerWidth;
    const deviceRegions = frame.frameInfo.regions.map((region) => scaleRegion(region, scale));
    for (const hit of decodeFrame(bitmap, deviceRegions)) {
      entries.push(toEntry(hit, frame.frameInfo, scale, tab));
    }
    bitmap.close();
  }

  return {
    results: await persist(entries),
    scannedFrames: frames.length,
    truncated,
    pageUrl: probe.url,
  };
}

/**
 * Decodes one rectangle of the visible viewport, in CSS pixels.
 *
 * @param {chrome.tabs.Tab} tab
 * @param {{x: number, y: number, w: number, h: number}} rect viewport CSS pixels
 * @param {{innerWidth: number, scrollX: number, scrollY: number, url: string, title: string}} frameInfo
 */
export async function scanRegion(tab, rect, frameInfo) {
  const dataUrl = await captureVisible(tab.windowId);
  const bitmap = await bitmapFromDataUrl(dataUrl);
  const scale = bitmap.width / frameInfo.innerWidth;
  let hits = decodeRegionOnly(bitmap, scaleRegion(rect, scale));

  if (hits.length === 0) {
    const padX = rect.w * SNIP_RETRY_PADDING;
    const padY = rect.h * SNIP_RETRY_PADDING;
    hits = decodeRegionOnly(
      bitmap,
      scaleRegion(
        {
          x: rect.x - padX,
          y: rect.y - padY,
          w: rect.w + padX * 2,
          h: rect.h + padY * 2,
        },
        scale,
      ),
    );
  }

  const entries = hits.map((hit) => toEntry(hit, frameInfo, scale, tab));
  bitmap.close();
  return { results: await persist(entries) };
}
