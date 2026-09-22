#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRANSFER="$ROOT/.laloba-transfer"
OUT="${1:-$ROOT/.laloba-restored}"

command -v base64 >/dev/null || { echo "base64 is required" >&2; exit 1; }
command -v xz >/dev/null || { echo "xz is required" >&2; exit 1; }
command -v tar >/dev/null || { echo "tar is required" >&2; exit 1; }

mapfile -t PARTS < <(find "$TRANSFER" -maxdepth 1 -type f -name '*.b64' -print | sort)
(("${#PARTS[@]}" > 0)) || { echo "No transfer fragments found" >&2; exit 1; }

if [[ -e "$OUT" ]]; then
  echo "Refusing to overwrite existing output: $OUT" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

cat "${PARTS[@]}" | tr -d '\r\n' | base64 --decode > "$TMP/payload.xz"
xz --test "$TMP/payload.xz"
xz --decompress --stdout "$TMP/payload.xz" > "$TMP/payload.tar"

# Reject unsafe archive entries before extraction.
while IFS= read -r entry; do
  [[ "$entry" != /* ]] || { echo "Unsafe absolute archive path: $entry" >&2; exit 1; }
  [[ "/$entry/" != *"/../"* ]] || { echo "Unsafe traversal archive path: $entry" >&2; exit 1; }
done < <(tar -tf "$TMP/payload.tar")

tar -xf "$TMP/payload.tar" -C "$OUT" --no-same-owner --no-same-permissions
echo "Restored source snapshot to: $OUT"
echo "Review it before copying files into the repository root."
