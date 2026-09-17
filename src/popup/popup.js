/** Popup controller. All scanning happens in the service worker. */

import { truncateForDisplay } from "../shared/qrValue.js";

const WEB_URL_RE = /^https?:\/\//i;

const dom = {
  scan: document.getElementById("scan"),
  snip: document.getElementById("snip"),
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  empty: document.getElementById("empty"),
  history: document.getElementById("history"),
  historyBox: document.getElementById("history-box"),
  clearHistory: document.getElementById("clear-history"),
  fullPage: document.getElementById("full-page"),
  highlight: document.getElementById("highlight"),
  saveHistory: document.getElementById("save-history"),
};

function send(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response ?? { ok: false, error: "No response from the extension" });
    });
  });
}

function setStatus(text, isError = false) {
  dom.status.textContent = text;
  dom.status.classList.toggle("error", isError);
}

function setBusy(busy) {
  dom.scan.disabled = busy;
  dom.snip.disabled = busy;
}

function actionButton(label, onClick, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (variant) {
    button.className = variant;
  }
  button.addEventListener("click", onClick);
  return button;
}

function renderItem(result, { showPage = false } = {}) {
  const item = document.createElement("li");
  item.className = "item";

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = result.label ?? "Result";
  item.append(chip);

  const value = document.createElement("p");
  value.className = "value";
  value.textContent = truncateForDisplay(result.preview ?? result.value ?? "");
  item.append(value);

  for (const warning of result.warnings ?? []) {
    const note = document.createElement("p");
    note.className = "warn";
    note.textContent = `Warning: ${warning.message}`;
    item.append(note);
  }

  if (showPage && result.pageUrl) {
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `Found on ${result.pageTitle || result.pageUrl}`;
    item.append(meta);
  }

  const row = document.createElement("div");
  row.className = "row";
  const copy = actionButton("Copy", async () => {
    try {
      await navigator.clipboard.writeText(result.value ?? "");
      copy.textContent = "Copied";
      setTimeout(() => {
        copy.textContent = "Copy";
      }, 1500);
    } catch {
      setStatus("Could not write to the clipboard", true);
    }
  });
  row.append(copy);

  if (result.openUrl && WEB_URL_RE.test(result.openUrl)) {
    row.append(
      actionButton(
        "Open",
        async () => {
          const response = await send({ cmd: "openUrl", url: result.openUrl });
          if (!response.ok) {
            setStatus(response.error, true);
          }
        },
        "primary",
      ),
    );
  }

  item.append(row);
  return item;
}

function renderResults(results) {
  dom.results.replaceChildren(...results.map((result) => renderItem(result)));
  dom.empty.hidden = results.length > 0;
  if (results.length === 0) {
    dom.empty.textContent =
      'No QR code found. Try "Snip a region" around the code, or zoom the page in.';
  }
}

function renderHistory(history) {
  dom.history.replaceChildren(...history.map((entry) => renderItem(entry, { showPage: true })));
  dom.historyBox.hidden = history.length === 0;
}

async function refreshState() {
  const state = await send({ cmd: "getState" });
  if (!state.ok) {
    setStatus(state.error, true);
    return;
  }
  dom.fullPage.checked = state.settings.fullPageScan;
  dom.highlight.checked = state.settings.highlightOnPage;
  dom.saveHistory.checked = state.settings.saveHistory;
  renderHistory(state.history);
}

async function onScan() {
  setBusy(true);
  setStatus(
    dom.fullPage.checked ? "Scrolling and scanning the page..." : "Scanning the visible page...",
  );
  const response = await send({
    cmd: "scanPage",
    fullPage: dom.fullPage.checked,
  });
  setBusy(false);

  if (!response.ok) {
    setStatus(response.error, true);
    return;
  }
  renderResults(response.results);
  const frames = response.scannedFrames;
  const suffix = response.truncated ? " (stopped at the capture limit)" : "";
  setStatus(
    `${response.results.length} code${response.results.length === 1 ? "" : "s"} from ${frames} screen${frames === 1 ? "" : "s"}${suffix}`,
  );
  await refreshState();
}

async function onSnip() {
  const response = await send({ cmd: "startSnip" });
  if (!response.ok) {
    setStatus(response.error, true);
    return;
  }
  window.close();
}

function bindSetting(input, key) {
  input.addEventListener("change", async () => {
    const response = await send({
      cmd: "updateSettings",
      patch: { [key]: input.checked },
    });
    if (!response.ok) {
      setStatus(response.error, true);
    }
  });
}

dom.scan.addEventListener("click", onScan);
dom.snip.addEventListener("click", onSnip);
dom.clearHistory.addEventListener("click", async () => {
  await send({ cmd: "clearHistory" });
  renderHistory([]);
});
bindSetting(dom.fullPage, "fullPageScan");
bindSetting(dom.highlight, "highlightOnPage");
bindSetting(dom.saveHistory, "saveHistory");

refreshState();
