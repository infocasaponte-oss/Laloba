# Source normalization

The repository is being migrated from a historical transfer snapshot to normal Git source control.

## Rules

1. Canonical source files are committed as ordinary files.
2. `package.json` and `package-lock.json` must be imported as a pair from the same snapshot.
3. CI must use `npm ci`; lockfile regeneration is not accepted as normalization.
4. Historical Base64 fragments are migration evidence only and are not an executable source of truth.
5. Application checks become required only after the canonical lockfile and complete runtime source are present.
6. Generator-security changes must be replayed as explicit diffs on top of canonical source, not by replacing unrelated application code.

## Completion gate

Normalization is complete when a clean checkout can run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build:dev` without relying on the historical transfer directory.
