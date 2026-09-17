# Chrome Web Store listing - QR Snap

## Item details

- **Name**: QR Snap - QR code scanner for any page
- **Category**: Productivity / Tools
- **Language**: English
- **Version**: 1.0.0

## Short description (132 char limit)

Find QR codes on the page you are viewing, or snip any region of the screen, and read, copy or open the value.

## Detailed description

QR Snap reads QR codes that are already on your screen - no phone, no camera, no upload.

Two ways to use it:

SCAN THIS PAGE
One click screenshots the tab and decodes every QR code on it. Turn on the full-page option
and QR Snap scrolls through the document, scanning as it goes. Every code it finds is
outlined on the page so you can see which one is which.

SNIP A REGION
Drag a rectangle over anything on screen - a video call, a PDF preview, a canvas, a design
tool, a screenshot someone pasted into a chat. QR Snap upscales the selection and reads the
code inside it.

You also get a right-click menu on any page or image, and keyboard shortcuts
(Alt+Shift+Q to open, Alt+Shift+S to snip).

READS MORE THAN LINKS
Links, Wi-Fi network cards, contact cards (vCard and MECARD), calendar events, email,
phone, SMS, map locations and authenticator setup codes are all recognised and labelled.

BUILT TO BE CAREFUL WITH WHAT IT FINDS
A QR code is a link you cannot read with your eyes, so QR Snap checks it for you before you
open anything. It warns about plain http, look-alike domains (punycode and non-ASCII host
names), raw IP addresses and "user:password@host" phishing URLs. Only http and https links
can be opened at all. Wi-Fi passwords and one-time-password secrets stay hidden in the
preview - copying still gives you the exact value.

SUPPORT
QR Snap is free and open source. If it saved you a trip to your phone, there is a
"Buy me a coffee" link in the popup footer - entirely optional, nothing is gated behind it.

PRIVATE BY DESIGN
Nothing leaves your browser. Decoding happens locally, there is no account, no analytics and
no server. The optional history of the last 50 codes is stored on your machine and you can
clear it from the popup at any time.

## Listing URLs

- Homepage URL: https://github.com/Maacaa0/QR_snap
- Support URL: https://github.com/Maacaa0/QR_snap/issues
- Donation link shown in the popup footer: https://buymeacoffee.com/maacaa0

## Single purpose statement

QR Snap has a single purpose: decoding QR codes that are visible in the user's browser tab
and presenting the decoded value.

## Permission justifications

- **activeTab**: needed to capture the visible area of the tab the user is on when they
  click the toolbar button, the context menu or the keyboard shortcut. The capture is
  decoded in memory and never uploaded. No permanent host access is requested.
- **scripting**: needed to draw the snipping rectangle, outline found codes and show the
  result panel inside the current page, and to measure images before cropping the capture.
  Scripts are injected only in response to a user action.
- **contextMenus**: adds the "Scan this page", "Snip a region" and "Read QR code in this
  image" entries to the right-click menu.
- **storage**: stores the user's own settings and the optional local history of the last 50
  decoded codes. Local only, never synced or transmitted.
- **clipboardWrite**: the Copy button writes the decoded value to the clipboard.

No host permissions are requested and no remote code is loaded - the QR decoder
(jsQR, Apache-2.0) ships inside the package.

## Data usage disclosures

- Does this item collect or use personally identifiable information? **No**
- Health, financial, authentication, personal communications, location, web history,
  user activity, website content? **No** - captured pixels are decoded in memory and
  discarded; only what the user scans is stored locally if they keep history on.
- Is data sold to third parties? **No**
- Is data used for purposes unrelated to the single purpose? **No**
- Is data used to determine creditworthiness or for lending? **No**

Privacy policy URL: host the contents of `docs/privacy-policy.md` on a public URL and
paste that link into the dashboard.

## Upload checklist

1. `bash scripts/package.sh` -> upload `dist/qr-snap-<version>.zip`
2. Icon: taken from the package (`icons/icon128.png`)
3. Small promo tile: `store/promo-tile-440x280.png`
4. Screenshots: 1280x800 or 640x400, at least one, max five. Suggested set:
   popup with results, snipping rectangle in progress, found code outlined on a page.
5. Paste the short and detailed description above
6. Fill the permission justifications above into the privacy practices tab
7. Set the privacy policy URL
8. Distribution: public, all regions; the extension has no age-restricted content

Full walkthrough with the dashboard steps: `store/publishing.md`.
