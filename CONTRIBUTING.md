# Contributing

## Changes

Use a dedicated branch and keep pull requests focused. Explain the problem, the approach, security implications and how the change was verified.

## Required checks

Changes should pass formatting, linting, type checking, tests and build checks when those scripts are available.

## Generated-code changes

Any change that affects application generation must include tests for deterministic output, invalid input, path traversal, secret isolation and failure cleanup where applicable.

## Commits

Prefer concise Conventional Commit messages such as `feat:`, `fix:`, `refactor:`, `test:`, `docs:` and `chore:`.

## Secrets

Never commit `.env` files, credentials, private keys, access tokens or production data.
