# Laloba

Laloba is an application-generation platform under active development.

## Repository status

The application source and authoritative npm lockfile are tracked directly in Git. Historical source-transfer payloads are no longer part of the development or CI path.

A clean checkout is expected to be sufficient for installation, verification and development.

## Engineering principles

- Generated applications must be reproducible and inspectable.
- Untrusted generated code must never execute with host secrets or unrestricted host access.
- Inputs crossing trust boundaries must be validated.
- Secrets belong in environment variables or a secret manager, never source control.
- Generation, build, test and deployment are separate stages.
- Changes land through reviewable pull requests with automated checks.
- Existing working behavior must be preserved until its replacement is implemented, migrated and tested.

## Development workflow

1. Install dependencies with `npm ci`.
2. Run `npm run check:runtime-source`.
3. Run formatting, linting, type checks and tests.
4. Make changes on a dedicated feature branch.
5. Open a pull request and require CI before merge.
6. Satisfy the mandatory phase gate that applies to the change.

## Canonical development plan

[docs/MASTER-IMPLEMENTATION-PLAN.md](docs/MASTER-IMPLEMENTATION-PLAN.md) is the single source of truth for development order, dependencies, acceptance gates and readiness.

See also `docs/ENGINEERING.md`, `SECURITY.md` and `CONTRIBUTING.md` for baseline engineering and security standards.
