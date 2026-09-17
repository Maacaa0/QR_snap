/** Persisted settings and scan history (chrome.storage.local, never synced). */

const HISTORY_KEY = "history";
const SETTINGS_KEY = "settings";
const HISTORY_LIMIT = 50;

export const DEFAULT_SETTINGS = Object.freeze({
  saveHistory: true,
  fullPageScan: false,
  highlightOnPage: true,
});

export async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] ?? {}) };
}

export async function updateSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function getHistory() {
  const stored = await chrome.storage.local.get(HISTORY_KEY);
  return stored[HISTORY_KEY] ?? [];
}

export async function addToHistory(entries) {
  if (entries.length === 0) {
    return getHistory();
  }
  const settings = await getSettings();
  if (!settings.saveHistory) {
    return [];
  }
  const previous = await getHistory();
  const seen = new Set();
  const merged = [...entries, ...previous].filter((entry) => {
    const key = `${entry.value}::${entry.pageUrl ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  const trimmed = merged.slice(0, HISTORY_LIMIT);
  await chrome.storage.local.set({ [HISTORY_KEY]: trimmed });
  return trimmed;
}

export async function clearHistory() {
  await chrome.storage.local.set({ [HISTORY_KEY]: [] });
}
