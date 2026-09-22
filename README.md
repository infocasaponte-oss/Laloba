# Laloba

Laloba is an application-generation platform under active development.

## Repository status

The current source snapshot is staged in `.laloba-transfer/` as Base64-encoded compressed payload fragments. This is a temporary transport format and is **not** the intended long-term repository layout.

Before feature development, restore the source tree with:

```bash
./scripts/restore-source.sh
```

The restoration script validates the transfer layout, decodes the concatenated payload and extracts it into a temporary directory without overwriting the working tree.

## Engineering principles

- Generated applications must be reproducible and inspectable.
- Untrusted generated code must never execute with host secrets or unrestricted host access.
- Inputs crossing trust boundaries must be validated.
- Secrets belong in environment variables or a secret manager, never source control.
- Generation, build, test and deployment are separate stages.
- Changes land through reviewable pull requests with automated checks.

## Development workflow

1. Restore the source snapshot.
2. Install dependencies using the lockfile-defined package manager.
3. Run formatting, linting, type checks and tests.
4. Make changes on a feature branch.
5. Open a pull request and require CI before merge.

See `docs/ENGINEERING.md`, `SECURITY.md` and `CONTRIBUTING.md` for the baseline standards.
