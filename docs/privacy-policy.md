# QR Snap privacy policy

Last updated: 2026-09-17

QR Snap ("the extension") decodes QR codes that are visible in your browser.

## What the extension collects

Nothing. The extension has no server, no account and no analytics. No data is transmitted
anywhere.

## What happens locally

- When you start a scan or a snip, the extension takes a screenshot of the visible area of
  the current tab, decodes it in your browser's memory and then discards the image. The
  screenshot is never written to disk and never uploaded.
- If the local history option is on (default), the decoded text, the page title and the page
  URL of the last 50 codes are stored on your computer using Chrome's local extension
  storage. This data never leaves your machine and is not synced between devices.
- You can delete this history at any time from the extension popup, or by removing the
  extension.

## Permissions

The extension requests `activeTab`, `scripting`, `contextMenus`, `storage` and
`clipboardWrite`. They are used only to capture the current tab when you ask for a scan, to
draw the selection rectangle and the result panel in the page, to provide the right-click
menu entries, to store your settings and optional history locally, and to copy a decoded
value to your clipboard.

The extension requests no host permissions and loads no remote code. The QR decoding library
(jsQR, Apache-2.0) is bundled inside the extension package.

## Contact

Open an issue in the repository that ships this extension.
