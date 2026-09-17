/**
 * In-page overlay: region snipping, result toast and result highlighting.
 *
 * Injected on demand by the service worker. Everything lives in a shadow root
 * with a constructed stylesheet, so the host page cannot style it and the page
 * CSP cannot block it. Decoded QR text is untrusted input and is only ever put
 * into the DOM through textContent.
 */

const WEB_URL_RE = /^https?:\/\//i;

(() => {
  if (window.qrSnapOverlay) {
    return;
  }

  const HOST_ID = "qr-snap-overlay-host";
  const TOAST_TIMEOUT_MS = 14_000;
  const HIGHLIGHT_TIMEOUT_MS = 4000;
  const MIN_SNIP_SIDE = 8;
  const PREVIEW_LIMIT = 180;

  const STYLES = `
    :host { all: initial; }
    .layer { position: fixed; inset: 0; pointer-events: none; }
    .layer.snipping { pointer-events: auto; cursor: crosshair; background: rgba(15, 23, 42, 0.25); }
    .hint {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: #0f172a; color: #f8fafc; font: 500 13px/1.4 system-ui, sans-serif;
      padding: 8px 14px; border-radius: 999px; box-shadow: 0 8px 24px rgba(0,0,0,.35);
    }
    .selection {
      position: fixed; border: 2px solid #22d3ee; border-radius: 4px;
      box-shadow: 0 0 0 100vmax rgba(15, 23, 42, 0.45); background: transparent;
    }
    .box {
      position: fixed; border: 3px solid #22c55e; border-radius: 6px;
      box-shadow: 0 0 0 2px rgba(255,255,255,.7); animation: qr-pulse .9s ease-in-out 3;
    }
    @keyframes qr-pulse { 50% { border-color: #a3e635; } }
    .toast {
      position: fixed; right: 18px; bottom: 18px; width: 360px; max-width: calc(100vw - 36px);
      max-height: 60vh; overflow-y: auto; pointer-events: auto;
      background: #0f172a; color: #e2e8f0; border-radius: 14px; padding: 14px;
      font: 400 13px/1.5 system-ui, sans-serif; box-shadow: 0 18px 48px rgba(0,0,0,.45);
    }
    .toast header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .toast h2 { font: 600 13px/1.2 system-ui, sans-serif; margin: 0; flex: 1; color: #f8fafc; }
    .close {
      border: 0; background: transparent; color: #94a3b8; font-size: 18px; line-height: 1;
      cursor: pointer; padding: 2px 6px; border-radius: 6px;
    }
    .close:hover { background: #1e293b; color: #f8fafc; }
    .item { border-top: 1px solid #1e293b; padding: 10px 0 4px; }
    .item:first-of-type { border-top: 0; }
    .chip {
      display: inline-block; background: #134e4a; color: #5eead4; border-radius: 999px;
      padding: 2px 9px; font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .04em; margin-bottom: 6px;
    }
    .value { word-break: break-all; color: #f1f5f9; margin: 0 0 8px; }
    .warn { color: #fbbf24; margin: 0 0 8px; font-size: 12px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    button.action {
      border: 1px solid #334155; background: #1e293b; color: #e2e8f0; border-radius: 8px;
      padding: 6px 12px; font: 500 12px system-ui, sans-serif; cursor: pointer;
    }
    button.action:hover { background: #334155; }
    button.action.primary { background: #0d9488; border-color: #0d9488; color: #f0fdfa; }
    button.action.primary:hover { background: #0f766e; }
    .empty { margin: 0; color: #cbd5e1; }
  `;

  const state = {
    snipping: false,
    toastTimer: 0,
    highlightTimer: 0,
    onScroll: null,
  };

  function createRoot() {
    const existing = document.getElementById(HOST_ID);
    if (existing?.shadowRoot) {
      return existing.shadowRoot;
    }
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText =
      "all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;";
    const shadow = host.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    shadow.adoptedStyleSheets = [sheet];
    (document.body ?? document.documentElement).append(host);
    return shadow;
  }

  function clear(selector) {
    for (const node of createRoot().querySelectorAll(selector)) {
      node.remove();
    }
  }

  function frameInfo() {
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      url: window.location.href,
      title: document.title,
    };
  }

  function truncate(text) {
    return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT - 1)}…` : text;
  }

  function button(label, className, onClick) {
    const element = document.createElement("button");
    element.className = `action${className ? ` ${className}` : ""}`;
    element.type = "button";
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }

  function renderResult(result) {
    const item = document.createElement("div");
    item.className = "item";

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = result.label ?? "Result";
    item.append(chip);

    const value = document.createElement("p");
    value.className = "value";
    value.textContent = truncate(result.preview ?? result.value ?? "");
    item.append(value);

    for (const warning of result.warnings ?? []) {
      const note = document.createElement("p");
      note.className = "warn";
      note.textContent = `Warning: ${warning.message}`;
      item.append(note);
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    const copy = button("Copy", "", async () => {
      try {
        await navigator.clipboard.writeText(result.value ?? "");
        copy.textContent = "Copied";
      } catch {
        copy.textContent = "Copy failed";
      }
    });
    actions.append(copy);

    if (result.openUrl && WEB_URL_RE.test(result.openUrl)) {
      actions.append(
        button("Open link", "primary", () => {
          window.open(result.openUrl, "_blank", "noopener,noreferrer");
        }),
      );
    }
    item.append(actions);
    return item;
  }

  function showResults(payload) {
    const root = createRoot();
    clear(".toast");
    clearTimeout(state.toastTimer);

    const toast = document.createElement("div");
    toast.className = "toast";

    const header = document.createElement("header");
    const heading = document.createElement("h2");
    const count = payload.results?.length ?? 0;
    heading.textContent =
      count > 0 ? `QR Snap - ${count} code${count === 1 ? "" : "s"} found` : "QR Snap";
    const close = document.createElement("button");
    close.className = "close";
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close results");
    close.addEventListener("click", () => toast.remove());
    header.append(heading, close);
    toast.append(header);

    if (count === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = payload.emptyText ?? "No QR code found.";
      toast.append(empty);
    } else {
      for (const result of payload.results) {
        toast.append(renderResult(result));
      }
    }

    root.append(toast);
    const dismiss = () => toast.remove();
    state.toastTimer = setTimeout(dismiss, TOAST_TIMEOUT_MS);
    toast.addEventListener("mouseenter", () => clearTimeout(state.toastTimer));
    toast.addEventListener("mouseleave", () => {
      state.toastTimer = setTimeout(dismiss, TOAST_TIMEOUT_MS / 2);
    });
  }

  function highlight(regions) {
    const root = createRoot();
    clear(".box");
    clearTimeout(state.highlightTimer);
    if (state.onScroll) {
      window.removeEventListener("scroll", state.onScroll, true);
    }

    const boxes = regions.map((region) => {
      const box = document.createElement("div");
      box.className = "box";
      root.append(box);
      return { box, region };
    });

    const place = () => {
      for (const { box, region } of boxes) {
        box.style.left = `${region.x - window.scrollX - 4}px`;
        box.style.top = `${region.y - window.scrollY - 4}px`;
        box.style.width = `${region.w + 8}px`;
        box.style.height = `${region.h + 8}px`;
      }
    };
    place();
    state.onScroll = place;
    window.addEventListener("scroll", place, true);
    state.highlightTimer = setTimeout(() => {
      window.removeEventListener("scroll", place, true);
      state.onScroll = null;
      clear(".box");
    }, HIGHLIGHT_TIMEOUT_MS);
  }

  function startSnip() {
    if (state.snipping) {
      return;
    }
    state.snipping = true;
    const root = createRoot();
    clear(".layer");

    const layer = document.createElement("div");
    layer.className = "layer snipping";
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "Drag across the QR code - Esc to cancel";
    const selection = document.createElement("div");
    selection.className = "selection";
    selection.style.display = "none";
    layer.append(hint, selection);
    root.append(layer);

    let origin = null;

    const stop = () => {
      state.snipping = false;
      layer.remove();
      document.removeEventListener("keydown", onKeyDown, true);
    };

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        stop();
      }
    }

    const rectFrom = (event) => ({
      x: Math.min(origin.x, event.clientX),
      y: Math.min(origin.y, event.clientY),
      w: Math.abs(event.clientX - origin.x),
      h: Math.abs(event.clientY - origin.y),
    });

    layer.addEventListener("mousedown", (event) => {
      origin = { x: event.clientX, y: event.clientY };
      selection.style.display = "block";
      event.preventDefault();
    });

    layer.addEventListener("mousemove", (event) => {
      if (!origin) {
        return;
      }
      const rect = rectFrom(event);
      selection.style.left = `${rect.x}px`;
      selection.style.top = `${rect.y}px`;
      selection.style.width = `${rect.w}px`;
      selection.style.height = `${rect.h}px`;
    });

    layer.addEventListener("mouseup", (event) => {
      if (!origin) {
        return;
      }
      const rect = rectFrom(event);
      stop();
      if (rect.w < MIN_SNIP_SIDE || rect.h < MIN_SNIP_SIDE) {
        return;
      }
      const info = frameInfo();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chrome.runtime.sendMessage({ cmd: "snipRegion", rect, frameInfo: info }, (response) => {
            if (chrome.runtime.lastError) {
              showResults({
                results: [],
                emptyText: chrome.runtime.lastError.message,
              });
              return;
            }
            if (!response?.ok) {
              showResults({
                results: [],
                emptyText: response?.error ?? "Scan failed",
              });
            }
          });
        });
      });
    });

    document.addEventListener("keydown", onKeyDown, true);
  }

  function locateImage(srcUrl) {
    const candidates = [...document.querySelectorAll("img, image, canvas, picture, video")];
    const match = candidates.find(
      (element) =>
        element.currentSrc === srcUrl ||
        element.src === srcUrl ||
        element.getAttribute("src") === srcUrl,
    );
    const element =
      match ??
      [...document.querySelectorAll("*")].find((node) =>
        getComputedStyle(node).backgroundImage?.includes(srcUrl),
      );
    if (!element) {
      return null;
    }
    const rect = element.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({ block: "center", behavior: "instant" });
    }
    const placed = element.getBoundingClientRect();
    return {
      rect: {
        x: placed.left,
        y: placed.top,
        w: placed.width,
        h: placed.height,
      },
      frameInfo: frameInfo(),
    };
  }

  window.qrSnapOverlay = { startSnip, showResults, highlight, locateImage };
})();
