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


## Canonical runtime blocker discovered during Milestone A

The editor currently imports application modules such as `@/lib/store`, `@/lib/types`, `@/lib/html-apps`, `@/lib/stream-chat`, and `@/lib/utils`, but those canonical files are not present in the normalized Git branch. The historical transfer fragments do not provide a cryptographically authenticated ordering manifest, so reconstructing and committing guessed runtime source would create an unverifiable codebase.

Therefore the migration rule is strict:

1. Do not invent replacements for missing canonical runtime modules merely to satisfy imports.
2. Do not treat historical Base64 fragments as authoritative without an ordered manifest and checksum.
3. Generator/security modules may be developed independently only when their dependencies are present and testable.
4. Integration into the editor/store is blocked until the canonical runtime source is imported as ordinary files.
5. Once imported, the first integration change must preserve the legacy `project.html` field as a compatibility projection of `ProjectTree v2`, not as the source of truth.

This blocker is intentional: provenance is part of the security boundary for a system that generates and executes code.
