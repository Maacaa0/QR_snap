/** Static preflight: manifest sanity plus every file the extension references. */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

const required = [
  "manifest_version",
  "name",
  "version",
  "description",
  "icons",
  "action",
  "background",
];
for (const key of required) {
  if (!manifest[key]) {
    problems.push(`manifest is missing "${key}"`);
  }
}
if (manifest.manifest_version !== 3) {
  problems.push("manifest_version must be 3 for the Chrome Web Store");
}
if (manifest.description.length > 132) {
  problems.push(`description is ${manifest.description.length} chars, the store allows 132`);
}
if (manifest.host_permissions?.length) {
  problems.push("host_permissions are set - activeTab alone keeps the store review simple");
}

const referenced = [
  ...Object.values(manifest.icons),
  ...Object.values(manifest.action.default_icon ?? {}),
  manifest.action.default_popup,
  manifest.background.service_worker,
  "src/content/overlay.js",
  "src/popup/popup.css",
  "src/popup/popup.js",
  "src/shared/decode.js",
  "src/shared/history.js",
  "src/shared/qrValue.js",
  "src/shared/scanner.js",
  "vendor/jsQR.js",
  "vendor/jsQR-LICENSE.txt",
];

for (const file of referenced) {
  if (!existsSync(join(ROOT, file))) {
    problems.push(`missing file: ${file}`);
  }
}

const popupHtml = readFileSync(join(ROOT, "src/popup/popup.html"), "utf8");
for (const match of popupHtml.matchAll(/(?:src|href)="(?!https?:)([^"]+)"/g)) {
  const target = join(ROOT, "src/popup", match[1]);
  if (!existsSync(target)) {
    problems.push(`popup.html references a missing file: ${match[1]}`);
  }
}

if (
  /\bfetch\(|eval\(|new Function\(/.test(readFileSync(join(ROOT, "src/content/overlay.js"), "utf8"))
) {
  problems.push("overlay.js must not fetch or evaluate code - store reviewers reject remote code");
}

const PLACEHOLDERS = ["YOUR_HANDLE", "YOUR_GITHUB"];
const placeholderFiles = ["src/popup/popup.html", "manifest.json", "store/listing.md"];
const stillPlaceholder = placeholderFiles.filter((file) => {
  const content = readFileSync(join(ROOT, file), "utf8");
  return PLACEHOLDERS.some((token) => content.includes(token));
});

if (stillPlaceholder.length > 0) {
  process.stdout.write(
    `warning: replace the support link placeholders in ${stillPlaceholder.join(", ")} before publishing\n`,
  );
}

if (problems.length > 0) {
  process.stdout.write(`${problems.map((problem) => `  - ${problem}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(
  `ok: ${manifest.name} v${manifest.version}, ${referenced.length} referenced files present\n`,
);
