/** QR Snap service worker: menus, commands and message routing. */

import "../vendor/jsQR.js";
import { clearHistory, getHistory, getSettings, updateSettings } from "./shared/history.js";
import { ensureOverlay, runInTab, scanPage, scanRegion } from "./shared/scanner.js";

const MENU = Object.freeze({
  SCAN_PAGE: "qrsnap-scan-page",
  SNIP: "qrsnap-snip",
  SCAN_IMAGE: "qrsnap-scan-image",
});

const BADGE_CLEAR_MS = 4000;
const BADGE_OK_COLOR = "#0f766e";
const BADGE_EMPTY_COLOR = "#6b7280";
const BROWSER_PAGE_RE = /^(chrome|edge|about|chrome-extension|devtools):/i;
const WEB_URL_RE = /^https?:\/\//i;

function toMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : "Unexpected error";
}

async function flashBadge(tabId, results) {
  const text = results.length > 0 ? String(results.length) : "0";
  await chrome.action.setBadgeBackgroundColor({
    tabId,
    color: results.length > 0 ? BADGE_OK_COLOR : BADGE_EMPTY_COLOR,
  });
  await chrome.action.setBadgeText({ tabId, text });
  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {
      /* tab already gone */
    });
  }, BADGE_CLEAR_MS);
}

async function showOnPage(tabId, payload) {
  await ensureOverlay(tabId);
  await runInTab(tabId, (data) => window.qrSnapOverlay?.showResults(data), [payload]);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active tab");
  }
  if (BROWSER_PAGE_RE.test(tab.url ?? "")) {
    throw new Error("Browser pages cannot be scanned. Open a normal website and try again.");
  }
  return tab;
}

async function highlightOnPage(tabId, results) {
  const settings = await getSettings();
  if (!settings.highlightOnPage) {
    return;
  }
  const regions = results.flatMap((result) => result.regions ?? []);
  if (regions.length === 0) {
    return;
  }
  await ensureOverlay(tabId);
  await runInTab(tabId, (boxes) => window.qrSnapOverlay?.highlight(boxes), [regions]);
}

async function handleScanPage(tab, options) {
  const outcome = await scanPage(tab, options);
  await flashBadge(tab.id, outcome.results);
  await highlightOnPage(tab.id, outcome.results);
  return outcome;
}

async function startSnip(tab) {
  await ensureOverlay(tab.id);
  await runInTab(tab.id, () => window.qrSnapOverlay?.startSnip());
}

async function handleSnipRegion(tab, message) {
  const outcome = await scanRegion(tab, message.rect, message.frameInfo);
  await flashBadge(tab.id, outcome.results);
  await showOnPage(tab.id, {
    results: outcome.results,
    emptyText: "No QR code found in that region. Try selecting a slightly larger area.",
  });
  return outcome;
}

async function handleScanImage(tab, srcUrl) {
  await ensureOverlay(tab.id);
  const located = await runInTab(tab.id, (url) => window.qrSnapOverlay?.locateImage(url), [srcUrl]);
  if (!located) {
    throw new Error("That image is no longer on the page");
  }
  const outcome = await scanRegion(tab, located.rect, located.frameInfo);
  await flashBadge(tab.id, outcome.results);
  await showOnPage(tab.id, {
    results: outcome.results,
    emptyText: "No QR code found in that image.",
  });
  return outcome;
}

async function reportFailure(tabId, error) {
  try {
    await showOnPage(tabId, { results: [], emptyText: toMessage(error) });
  } catch {
    /* page refuses injection (store pages, PDFs) - nothing else we can do */
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU.SCAN_PAGE,
      title: "Scan this page for QR codes",
      contexts: ["page", "frame", "selection"],
    });
    chrome.contextMenus.create({
      id: MENU.SNIP,
      title: "Snip a region and read its QR code",
      contexts: ["page", "frame", "selection"],
    });
    chrome.contextMenus.create({
      id: MENU.SCAN_IMAGE,
      title: "Read QR code in this image",
      contexts: ["image"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) {
    return;
  }
  const run = async () => {
    if (info.menuItemId === MENU.SCAN_PAGE) {
      const settings = await getSettings();
      const outcome = await handleScanPage(tab, {
        fullPage: settings.fullPageScan,
      });
      await showOnPage(tab.id, {
        results: outcome.results,
        emptyText: "No QR code found on the visible part of this page.",
      });
      return;
    }
    if (info.menuItemId === MENU.SNIP) {
      await startSnip(tab);
      return;
    }
    if (info.menuItemId === MENU.SCAN_IMAGE && info.srcUrl) {
      await handleScanImage(tab, info.srcUrl);
    }
  };
  run().catch((error) => reportFailure(tab.id, error));
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "snip-region") {
    return;
  }
  getActiveTab()
    .then((tab) => startSnip(tab))
    .catch(() => {
      /* nothing to snip on browser pages */
    });
});

const ROUTES = {
  async scanPage(message) {
    const tab = await getActiveTab();
    return handleScanPage(tab, { fullPage: Boolean(message.fullPage) });
  },
  async startSnip() {
    const tab = await getActiveTab();
    await startSnip(tab);
    return { started: true };
  },
  async getState() {
    const [settings, history] = await Promise.all([getSettings(), getHistory()]);
    return { settings, history };
  },
  async updateSettings(message) {
    return { settings: await updateSettings(message.patch ?? {}) };
  },
  async clearHistory() {
    await clearHistory();
    return { history: [] };
  },
  async openUrl(message) {
    if (!WEB_URL_RE.test(message.url ?? "")) {
      throw new Error("Only http and https links can be opened");
    }
    await chrome.tabs.create({ url: message.url });
    return { opened: true };
  },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const respond = (promise) => {
    promise
      .then((data) => sendResponse({ ok: true, ...data }))
      .catch((error) => sendResponse({ ok: false, error: toMessage(error) }));
    return true;
  };

  if (message?.cmd === "snipRegion") {
    if (!sender.tab?.id) {
      sendResponse({ ok: false, error: "Missing tab context" });
      return false;
    }
    return respond(handleSnipRegion(sender.tab, message));
  }

  const route = ROUTES[message?.cmd];
  if (!route) {
    sendResponse({ ok: false, error: `Unknown command: ${message?.cmd}` });
    return false;
  }
  return respond(route(message));
});
