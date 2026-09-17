# Changelog

All notable changes to QR Snap are documented here. The version numbers match
`manifest.json`, which is what the Chrome Web Store shows.

## 1.0.0 - unreleased

First public version.

- Scan the visible tab for QR codes, with an optional full-page scroll-through scan
- Snip any region of the screen and decode the code inside it
- Right-click menu entries for the page and for a single image
- Keyboard shortcuts: `Alt+Shift+Q` opens the popup, `Alt+Shift+S` starts a snip
- Found codes are outlined on the page and listed in the popup
- Recognises links, Wi-Fi cards, contacts, calendar events, email, phone, SMS,
  locations and authenticator codes
- Warns about plain http, punycode and non-ASCII hosts, raw IP hosts and
  `user:password@host` phishing URLs; refuses to open anything but http and https
- Optional local history of the last 50 codes
