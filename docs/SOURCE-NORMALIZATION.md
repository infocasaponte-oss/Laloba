# Source normalization

Updated: 2026-09-22

## Status

Canonical source normalization is complete on the normalization change set.

The repository now treats ordinary Git files as the only application source of truth:

- the runtime source tree is tracked directly;
- the authoritative `package-lock.json` is tracked directly;
- the lockfile is checked against its recorded SHA-256;
- historical Base64 transfer material is removed from the normal repository tree;
- CI no longer reconstructs source or dependencies before validation.

## Permanent rules

1. Canonical source files are committed as ordinary files.
2. `package.json` and `package-lock.json` must remain compatible and reviewed together when dependency declarations change.
3. CI uses `npm ci`; lockfile regeneration is never used as an implicit repair step.
4. Recovery/transfer payloads are not an executable source of truth and must not return to the repository.
5. Generator/security changes are explicit reviewable diffs.
6. `scripts/check-runtime-source.mjs` verifies the required runtime surface and the canonical lockfile digest.
7. New required runtime entry points must be added to the repository gate when they become architectural dependencies.

## Completion evidence

The canonical lockfile has:

- bytes: `262769`
- SHA-256: `fc81314ce9ca4b6be0300e35a223455005daf314253a131134bf089a5b2ba4af`
- lockfileVersion: `3`
- package name: `app-builder-workspace`

The runtime gate currently requires the complete application entry surface plus the canonical package pair.

The remaining F1 requirement is executed CI proof from a real GitHub runner:

    npm run check:runtime-source
    npm ci
    npm run format:check
    npm run lint
    npm run typecheck
    npm run test:generator
    npm test
    npm run build:dev
