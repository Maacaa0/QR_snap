# Publishing QR Snap to the Chrome Web Store

Everything in this repo is already filled in for `Maacaa0/QR_snap`. What follows is the part that
happens outside the repo.

## 1. Developer account (one time)

1. Open https://chrome.google.com/webstore/devconsole with the Google account that should own the
   item. Moving an extension to another account later is painful - pick one you keep.
2. Pay the one-time developer registration fee (USD 5, card payment through Google Payments).
   This is the only payment involved in publishing. Your extension is free, so there is no
   merchant account and no Stripe involved on the store side.
3. Set the publisher display name and verify the publisher contact email. Publishing stays
   blocked until that email is verified.

## 2. Privacy policy URL (required before submitting)

The dashboard will not accept the item without a public privacy policy URL.

1. Push this repository to GitHub (public).
2. Repository **Settings** -> **Pages** -> Source: **Deploy from a branch**, branch `main`,
   folder `/docs` -> Save.
3. After a minute the policy is live at
   `https://maacaa0.github.io/QR_snap/privacy-policy` - paste that into the dashboard.

## 3. Buy Me a Coffee (optional, independent of the store)

The popup footer already links to https://buymeacoffee.com/maacaa0. The link works as soon as
that page exists. To actually receive money, Buy Me a Coffee asks you to connect a payout
provider - Stripe in most regions, PayPal in some. That is between you and Buy Me a Coffee; the
Chrome Web Store neither knows nor cares. You can publish first and finish payouts later.

## 4. Build the upload package

```bash
# bump "version" in manifest.json first - the store rejects a re-upload of the same version
bash scripts/package.sh     # runs verify + unit tests, writes dist/qr-snap-<version>.zip
```

Upload the zip, never the folder. It contains only `manifest.json`, `icons/`, `src/`, `vendor/`.

## 5. Create the item

Dashboard -> **Items** -> **Add new item** -> upload the zip, then fill the tabs.

**Store listing**
- Name, short description, detailed description: copy from `store/listing.md`
- Category: Productivity; language: English
- Icon: taken from the package automatically
- Screenshots: `docs/screenshots/page-scan.png`, `snip.png`, `popup.png` - already 1280x800
- Small promo tile: `store/promo-tile-440x280.png`
- Homepage URL: `https://github.com/Maacaa0/QR_snap`
- Support URL: `https://github.com/Maacaa0/QR_snap/issues`

**Privacy**
- Single purpose statement: copy from `store/listing.md`
- Permission justification for each of `activeTab`, `scripting`, `contextMenus`, `storage`,
  `clipboardWrite`: copy from `store/listing.md`
- Data usage: tick "does not collect user data" for every category, plus the two certification
  checkboxes
- Privacy policy URL: the GitHub Pages URL from step 2

**Distribution**
- Visibility: Public (or Unlisted while you test with friends)
- Regions: all; Pricing: free
- Trader / non-trader declaration (EU rules): the dashboard asks whether you publish as a trader.
  Answer honestly - a trader has to publish a contact address that becomes visible in the
  listing. Accepting voluntary donations is not the same as selling, but the dashboard's current
  wording is what counts. Read it there before ticking.

## 6. Submit

**Submit for review**. Expect a few hours to a few days. A first submission from a new developer
account, and anything that captures the screen, sits at the longer end. You get an email either
way; a rejection names the policy section, so fix and resubmit.

## 7. Updates

1. Bump `version` in `manifest.json` (e.g. `1.0.1`) and add a `CHANGELOG.md` entry
2. `bash scripts/package.sh`
3. Dashboard -> your item -> **Package** -> upload the new zip -> submit

Users get the update automatically within a few hours of approval.

## What is allowed around the donation link

- Linking out to a donation page is fine, and that is all this extension does: the popup footer
  opens the page in a new tab.
- Keep it a link. No payment flow inside the extension, no donation prompts injected into the
  pages the user visits.
- Do not gate existing features behind a donation later, and do not nag on a timer - "annoying or
  deceptive" behaviour is a rejection reason.
- Mention support once in the description and leave it there.
