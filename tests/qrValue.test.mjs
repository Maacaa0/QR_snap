import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classifyQrValue,
  dedupeResults,
  QR_KIND,
  truncateForDisplay,
  WARNING,
} from "../src/shared/qrValue.js";

const codesOf = (result) => result.warnings.map((warning) => warning.code);

test("https link is classified as an openable url without warnings", () => {
  const result = classifyQrValue("https://example.com/menu?table=7");
  assert.equal(result.kind, QR_KIND.URL);
  assert.equal(result.title, "example.com");
  assert.equal(result.openUrl, "https://example.com/menu?table=7");
  assert.deepEqual(codesOf(result), []);
});

test("plain http link is flagged as insecure", () => {
  assert.ok(codesOf(classifyQrValue("http://example.com")).includes(WARNING.INSECURE));
});

test("punycode host is flagged as possible spoofing", () => {
  assert.ok(codesOf(classifyQrValue("https://xn--pple-43d.com")).includes(WARNING.PUNYCODE_HOST));
});

test("raw ip host is flagged", () => {
  assert.ok(codesOf(classifyQrValue("https://192.168.1.10/pay")).includes(WARNING.IP_HOST));
});

test("credentials in the url are flagged as a phishing pattern", () => {
  const codes = codesOf(classifyQrValue("https://paypal.com@evil.example/login"));
  assert.ok(codes.includes(WARNING.EMBEDDED_CREDENTIALS));
});

test("bare domain gets https assumed and is marked as such", () => {
  const result = classifyQrValue("example.com/deals");
  assert.equal(result.kind, QR_KIND.URL);
  assert.equal(result.openUrl, "https://example.com/deals");
  assert.ok(codesOf(result).includes(WARNING.ASSUMED_SCHEME));
});

test("wifi payload exposes the ssid but hides the password", () => {
  const result = classifyQrValue("WIFI:T:WPA;S:Cafe Guest;P:hunter2;H:false;;");
  assert.equal(result.kind, QR_KIND.WIFI);
  assert.equal(result.title, "Cafe Guest");
  assert.ok(result.preview.includes("Cafe Guest"));
  assert.ok(!result.preview.includes("hunter2"));
  assert.equal(result.value, "WIFI:T:WPA;S:Cafe Guest;P:hunter2;H:false;;");
  assert.ok(codesOf(result).includes(WARNING.SECRET));
});

test("wifi ssid keeps escaped separators", () => {
  assert.equal(classifyQrValue("WIFI:S:my\\;net;P:x;;").title, "my;net");
});

test("vcard and mecard are recognised as contacts", () => {
  assert.equal(classifyQrValue("BEGIN:VCARD\nFN:Ada Lovelace\nEND:VCARD").title, "Ada Lovelace");
  assert.equal(classifyQrValue("MECARD:N:Ada Lovelace;;").kind, QR_KIND.CONTACT);
});

test("calendar event keeps its summary", () => {
  const result = classifyQrValue("BEGIN:VEVENT\nSUMMARY:Standup\nEND:VEVENT");
  assert.equal(result.kind, QR_KIND.CALENDAR);
  assert.equal(result.title, "Standup");
});

test("communication schemes stay openable", () => {
  assert.equal(classifyQrValue("mailto:hi@example.com").kind, QR_KIND.EMAIL);
  assert.equal(classifyQrValue("tel:+420123456789").kind, QR_KIND.PHONE);
  assert.equal(classifyQrValue("smsto:+420123456789").kind, QR_KIND.SMS);
  assert.equal(classifyQrValue("geo:50.08,14.43").kind, QR_KIND.GEO);
});

test("otpauth secret is never previewed and cannot be opened", () => {
  const raw = "otpauth://totp/ACME:ada?secret=JBSWY3DPEHPK3PXP&issuer=ACME";
  const result = classifyQrValue(raw);
  assert.equal(result.kind, QR_KIND.OTP);
  assert.equal(result.openUrl, null);
  assert.ok(!result.preview.includes("JBSWY3DPEHPK3PXP"));
  assert.equal(result.value, raw);
});

test("script-capable schemes are blocked from opening", () => {
  const result = classifyQrValue("javascript:alert(document.cookie)");
  assert.equal(result.openUrl, null);
  assert.ok(codesOf(result).includes(WARNING.DANGEROUS_SCHEME));
});

test("unknown scheme is surfaced but not openable", () => {
  const result = classifyQrValue("weirdapp://do/something");
  assert.equal(result.openUrl, null);
  assert.ok(codesOf(result).includes(WARNING.UNUSUAL_SCHEME));
});

test("plain text stays text", () => {
  const result = classifyQrValue("table 12, order 3");
  assert.equal(result.kind, QR_KIND.TEXT);
  assert.equal(result.openUrl, null);
});

test("empty payload does not throw", () => {
  assert.equal(classifyQrValue("").kind, QR_KIND.TEXT);
  assert.equal(classifyQrValue(undefined).value, "");
});

test("dedupe keeps one entry per value and merges the regions", () => {
  const merged = dedupeResults([
    { value: "a", regions: [{ x: 0 }] },
    { value: "a", regions: [{ x: 10 }] },
    { value: "b", regions: [] },
  ]);
  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0].regions, [{ x: 0 }, { x: 10 }]);
});

test("display truncation keeps the limit", () => {
  assert.equal(truncateForDisplay("abcdef", 4), "abc…");
  assert.equal(truncateForDisplay("abc", 4), "abc");
});
