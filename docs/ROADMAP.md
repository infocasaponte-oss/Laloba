# Laloba Roadmap

## Phase 0 — Repository integrity

- Normalize the source tree.
- Establish a reproducible dependency install.
- Add formatting, lint, typecheck, tests and build to CI.
- Remove the temporary transfer payload after verification.

## Phase 1 — Application specification

Define a versioned schema for an application request: metadata, pages, data model, integrations, permissions, environment requirements and deployment target. Reject unknown or unsafe capabilities by default.

## Phase 2 — Deterministic planner

Translate the validated specification into an explicit generation plan. The plan must enumerate files, dependencies, migrations, commands and expected outputs before execution.

## Phase 3 — Generator

Generate files through constrained primitives/templates. Normalize every path, prevent traversal, enforce project-root confinement and emit a manifest containing hashes and provenance.

## Phase 4 — Isolated validation

Build and test generated projects in disposable sandboxes with resource limits, an environment allowlist and denied-by-default networking. Never expose platform/deployment credentials.

## Phase 5 — Product experience

Provide generation progress, inspectable plans, file diffs, validation errors, retry/cancel behavior and downloadable/exportable application artifacts.

## Phase 6 — Deployment

Deployment is an explicit, separately authorized operation. Add provider adapters with least-privilege credentials, preview environments, audit logs and rollback metadata.

## Definition of done for generated applications

A successful generation produces a validated specification, deterministic plan, source tree, dependency manifest, file hashes, build/test result and provenance record. Failure leaves no privileged process or workspace behind.
