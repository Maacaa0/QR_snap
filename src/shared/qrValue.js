/**
 * Classification and safety analysis for decoded QR payloads.
 *
 * Kept free of DOM and extension APIs so it can run in the service worker,
 * in the popup and under `node --test`.
 */

export const QR_KIND = Object.freeze({
  URL: "url",
  WIFI: "wifi",
  CONTACT: "contact",
  EMAIL: "email",
  PHONE: "phone",
  SMS: "sms",
  GEO: "geo",
  CALENDAR: "calendar",
  OTP: "otp",
  TEXT: "text",
});

export const WARNING = Object.freeze({
  INSECURE: "insecure-http",
  NON_ASCII_HOST: "non-ascii-host",
  PUNYCODE_HOST: "punycode-host",
  IP_HOST: "ip-host",
  EMBEDDED_CREDENTIALS: "embedded-credentials",
  ASSUMED_SCHEME: "assumed-scheme",
  UNUSUAL_SCHEME: "unusual-scheme",
  DANGEROUS_SCHEME: "dangerous-scheme",
  SECRET: "contains-secret",
});

const WARNING_MESSAGES = Object.freeze({
  [WARNING.INSECURE]: "Uses plain http - traffic is not encrypted.",
  [WARNING.NON_ASCII_HOST]:
    "Host name contains non-ASCII characters and can imitate a known brand.",
  [WARNING.PUNYCODE_HOST]: "Host name is punycode-encoded (xn--) and can imitate a known brand.",
  [WARNING.IP_HOST]: "Points at a raw IP address instead of a domain name.",
  [WARNING.EMBEDDED_CREDENTIALS]:
    "Contains user:password before the host - a common phishing trick.",
  [WARNING.ASSUMED_SCHEME]: "No scheme in the code, https was assumed.",
  [WARNING.UNUSUAL_SCHEME]: "Uses an uncommon scheme, opened only by a matching app.",
  [WARNING.DANGEROUS_SCHEME]: "Uses a scheme that can execute code - opening is disabled.",
  [WARNING.SECRET]: "Contains a secret, hidden in the preview. Copy reveals the full value.",
});

const WEB_SCHEMES = new Set(["http:", "https:"]);
const DANGEROUS_SCHEMES = new Set(["javascript:", "data:", "vbscript:", "file:", "blob:"]);

const BARE_DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#].*)?$/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const ASCII_RE = /^[ -~]*$/;
const MECARD_NAME_RE = /N:([^;]*)/i;
const VCARD_NAME_RE = /(?:^|\n)FN:(.+)/i;
const VEVENT_SUMMARY_RE = /(?:^|\n)SUMMARY:(.+)/i;
const VCARD_RE = /^BEGIN:VCARD/i;
const WIFI_RE = /^WIFI:/i;
const CONTACT_RE = /^(BEGIN:VCARD|MECARD:)/i;
const CALENDAR_RE = /^BEGIN:(VEVENT|VCALENDAR)/i;
const LEADING_SLASHES_RE = /^\/+/;
const SCHEME_SLASHES_RE = /^\/{0,2}/;

const warning = (code) => ({ code, message: WARNING_MESSAGES[code] });

/** `WIFI:T:WPA;S:my net;P:secret;;` -> `{ T: 'WPA', S: 'my net', P: 'secret' }` */
function parseStructuredFields(body) {
  const fields = {};
  let key = "";
  let buffer = "";
  let readingKey = true;
  let index = 0;

  while (index < body.length) {
    const char = body[index];
    if (char === "\\" && index + 1 < body.length) {
      buffer += body[index + 1];
      index += 2;
      continue;
    }
    if (readingKey && char === ":") {
      key = buffer.toUpperCase();
      buffer = "";
      readingKey = false;
    } else if (!readingKey && char === ";") {
      if (key) {
        fields[key] = buffer;
      }
      key = "";
      buffer = "";
      readingKey = true;
    } else {
      buffer += char;
    }
    index += 1;
  }

  if (!readingKey && key) {
    fields[key] = buffer;
  }
  return fields;
}

function parseUrl(candidate) {
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function analyzeWebUrl(url, warnings) {
  if (url.protocol === "http:") {
    warnings.push(warning(WARNING.INSECURE));
  }
  if (url.username || url.password) {
    warnings.push(warning(WARNING.EMBEDDED_CREDENTIALS));
  }
  if (url.hostname.startsWith("xn--") || url.hostname.includes(".xn--")) {
    warnings.push(warning(WARNING.PUNYCODE_HOST));
  } else if (!ASCII_RE.test(url.hostname)) {
    warnings.push(warning(WARNING.NON_ASCII_HOST));
  }
  if (IPV4_RE.test(url.hostname) || url.hostname.startsWith("[")) {
    warnings.push(warning(WARNING.IP_HOST));
  }
}

function wifiResult(raw, warnings) {
  const fields = parseStructuredFields(raw.slice("WIFI:".length));
  const ssid = fields.S || "unknown network";
  if (fields.P) {
    warnings.push(warning(WARNING.SECRET));
  }
  return {
    kind: QR_KIND.WIFI,
    label: "Wi-Fi",
    title: ssid,
    preview: `Wi-Fi "${ssid}"${fields.T ? ` - ${fields.T}` : ""}${fields.P ? " - password hidden" : ""}`,
    openUrl: null,
    warnings,
  };
}

function contactResult(raw, warnings) {
  const isVcard = VCARD_RE.test(raw);
  const name = isVcard ? VCARD_NAME_RE.exec(raw)?.[1] : MECARD_NAME_RE.exec(raw)?.[1];
  const trimmed = name?.trim();
  return {
    kind: QR_KIND.CONTACT,
    label: "Contact",
    title: trimmed || "Contact card",
    preview: trimmed ? `Contact card for ${trimmed}` : "Contact card",
    openUrl: null,
    warnings,
  };
}

function calendarResult(raw, warnings) {
  const summary = VEVENT_SUMMARY_RE.exec(raw)?.[1]?.trim();
  return {
    kind: QR_KIND.CALENDAR,
    label: "Event",
    title: summary || "Calendar event",
    preview: summary ? `Calendar event: ${summary}` : "Calendar event",
    openUrl: null,
    warnings,
  };
}

function otpResult(url, warnings) {
  warnings.push(warning(WARNING.SECRET));
  const account = decodeURIComponent(url.pathname.replace(LEADING_SLASHES_RE, "")) || "account";
  return {
    kind: QR_KIND.OTP,
    label: "Authenticator",
    title: account,
    preview: `One-time-password setup for ${account} - secret hidden`,
    openUrl: null,
    warnings,
  };
}

function schemeResult(url, raw, warnings) {
  const body = raw.slice(url.protocol.length).replace(SCHEME_SLASHES_RE, "");
  switch (url.protocol) {
    case "mailto:":
      return {
        kind: QR_KIND.EMAIL,
        label: "Email",
        title: url.pathname || body,
        preview: `Email to ${url.pathname || body}`,
        openUrl: raw,
        warnings,
      };
    case "tel:":
      return {
        kind: QR_KIND.PHONE,
        label: "Phone",
        title: body,
        preview: `Call ${body}`,
        openUrl: raw,
        warnings,
      };
    case "sms:":
    case "smsto:":
      return {
        kind: QR_KIND.SMS,
        label: "SMS",
        title: body,
        preview: `Text message to ${body}`,
        openUrl: raw,
        warnings,
      };
    case "geo:":
      return {
        kind: QR_KIND.GEO,
        label: "Location",
        title: body,
        preview: `Map location ${body}`,
        openUrl: raw,
        warnings,
      };
    case "otpauth:":
      return otpResult(url, warnings);
    default:
      break;
  }

  if (DANGEROUS_SCHEMES.has(url.protocol)) {
    warnings.push(warning(WARNING.DANGEROUS_SCHEME));
    return {
      kind: QR_KIND.TEXT,
      label: "Blocked",
      title: raw,
      preview: raw,
      openUrl: null,
      warnings,
    };
  }

  warnings.push(warning(WARNING.UNUSUAL_SCHEME));
  return {
    kind: QR_KIND.TEXT,
    label: url.protocol.replace(":", ""),
    title: raw,
    preview: raw,
    openUrl: null,
    warnings,
  };
}

/**
 * @param {string} raw exact text decoded from the QR code
 * @returns {{kind: string, label: string, title: string, preview: string, value: string,
 *   openUrl: string | null, warnings: Array<{code: string, message: string}>}}
 */
export function classifyQrValue(raw) {
  const value = typeof raw === "string" ? raw : "";
  const trimmed = value.trim();
  const warnings = [];

  if (!trimmed) {
    return {
      kind: QR_KIND.TEXT,
      label: "Text",
      title: "",
      preview: "",
      value,
      openUrl: null,
      warnings,
    };
  }

  if (WIFI_RE.test(trimmed)) {
    return { ...wifiResult(trimmed, warnings), value };
  }
  if (CONTACT_RE.test(trimmed)) {
    return { ...contactResult(trimmed, warnings), value };
  }
  if (CALENDAR_RE.test(trimmed)) {
    return { ...calendarResult(trimmed, warnings), value };
  }

  const url = parseUrl(trimmed);
  if (url && WEB_SCHEMES.has(url.protocol)) {
    analyzeWebUrl(url, warnings);
    return {
      kind: QR_KIND.URL,
      label: "Link",
      title: url.hostname,
      preview: url.href,
      value,
      openUrl: url.href,
      warnings,
    };
  }
  if (url?.protocol) {
    return { ...schemeResult(url, trimmed, warnings), value };
  }

  if (BARE_DOMAIN_RE.test(trimmed)) {
    const assumed = parseUrl(`https://${trimmed}`);
    if (assumed) {
      warnings.push(warning(WARNING.ASSUMED_SCHEME));
      analyzeWebUrl(assumed, warnings);
      return {
        kind: QR_KIND.URL,
        label: "Link",
        title: assumed.hostname,
        preview: assumed.href,
        value,
        openUrl: assumed.href,
        warnings,
      };
    }
  }

  return {
    kind: QR_KIND.TEXT,
    label: "Text",
    title: trimmed,
    preview: trimmed,
    value,
    openUrl: null,
    warnings,
  };
}

/** Keeps the first hit per decoded value, collecting every place it was found. */
export function dedupeResults(results) {
  const byValue = new Map();
  for (const result of results) {
    const existing = byValue.get(result.value);
    if (existing) {
      byValue.set(result.value, {
        ...existing,
        regions: [...existing.regions, ...(result.regions ?? [])],
      });
      continue;
    }
    byValue.set(result.value, {
      ...result,
      regions: [...(result.regions ?? [])],
    });
  }
  return [...byValue.values()];
}

const PREVIEW_LIMIT = 220;

export function truncateForDisplay(text, limit = PREVIEW_LIMIT) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit - 1)}…`;
}
