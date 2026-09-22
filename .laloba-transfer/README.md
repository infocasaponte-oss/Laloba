# Temporary source transfer

This directory contains historical Base64 fragments used to move a compressed source snapshot into GitHub.

## Important

The repository currently has fragments from more than one upload batch and no committed canonical manifest proving the intended concatenation order. Do not concatenate files based only on their names.

Each fragment can be checked for Base64 syntax independently, but restoration of the complete archive requires one of:

1. the original archive and its SHA-256 digest; or
2. a manifest listing every fragment in exact order plus the expected SHA-256 digest of the reconstructed archive.

## Canonical transfer format

Future transfers must include `manifest.sha256` and `manifest.txt`.

`manifest.txt` contains one fragment path per line in exact concatenation order. The reconstructed binary must match the SHA-256 value stored in `manifest.sha256` before decompression or extraction.

Once the real source tree is committed normally, remove this directory.
