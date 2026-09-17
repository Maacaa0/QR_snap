#!/usr/bin/env bash
# Builds the Chrome Web Store upload zip from the shipping files only.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node scripts/verify.mjs
node --test 'tests/*.test.mjs' >/dev/null

VERSION="$(node -p "require('./manifest.json').version")"
OUT="$ROOT/dist"
ZIP="$OUT/qr-snap-${VERSION}.zip"

mkdir -p "$OUT"
rm -f "$ZIP"
zip -r -q "$ZIP" manifest.json icons src vendor -x '*.DS_Store' -x '__MACOSX/*'

echo "built ${ZIP} ($(du -h "$ZIP" | cut -f1))"
