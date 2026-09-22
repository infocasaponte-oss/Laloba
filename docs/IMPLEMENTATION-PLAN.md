# Laloba implementation plan

Updated: 2026-09-22

## Executive assessment

Laloba has a meaningful security and provenance foundation for generated applications, but it is not yet a complete production app-generation platform.

The strongest implemented area is the generation trust boundary:

- strict versioned generation contracts;
- path confinement;
- executable artifact validation;
- deterministic project-tree hashing;
- immutable snapshots and manifests;
- conflict-aware patches;
- state-bound human authorization;
- sandboxed browser preview;
- origin/auth/rate-limit protections on the generation API.

The largest blockers are outside that core:

1. canonical runtime source is incomplete;
2. the editor still uses legacy single-file `project.html`;
3. there is no isolated build/test runner;
4. browser storage is still used for important project/history state;
5. there is no real preview/deployment control plane;
6. CI cannot currently execute because GitHub Actions jobs are failing before runner steps begin;
7. Git, secrets, workspaces/RBAC, connectors, managed backend, security scanning and observability are not yet implemented as production services.

The implementation order must preserve trust boundaries. Do not build production publishing before isolated execution and server-side authorization exist.

---

## Target platform architecture

The target control flow is:

```
user intent
  -> application specification
  -> deterministic plan
  -> generation / patch proposal
  -> schema + artifact validation
  -> isolated build/test/security runner
  -> bounded repair loop
  -> human approval
  -> immutable generation artifact
  -> preview environment
  -> publish approval
  -> deployment
  -> observability
  -> rollback
```

Control-plane credentials must never enter generated code, preview documents or build sandboxes.

The browser is a presentation/cache layer. Project truth, approvals, audit records, quotas, deployments and secrets belong server-side.

---

# P0 — unblock the real application

## A. Canonical source normalization

### Goal
Make a clean checkout the authoritative, reproducible source of Laloba.

### Implement
- Recover/import the authoritative missing runtime modules:
  - `src/lib/store.ts`
  - `src/lib/types.ts`
  - `src/lib/html-apps.ts`
  - `src/lib/stream-chat.ts`
  - `src/lib/utils.ts`
  - any missing UI/runtime dependencies referenced by routes.
- Import the authoritative `package-lock.json` paired with the current `package.json`.
- Compare manually reconstructed scripts/configuration against canonical source and replace them where authoritative originals exist.
- Remove historical Base64 transfer payload only after source equivalence is verified.
- Keep `scripts/check-runtime-source.mjs` as a permanent provenance gate until normalization is complete.

### Acceptance gate
A clean checkout runs:

```
npm ci
npm run typecheck
npm run test:generator
npm test
npm run build:dev
```

without transfer fragments or local-only files.

### Dependency
Everything that touches the live editor/store depends on this phase.

---

## B. ProjectTree v2 becomes the source of truth

### Goal
Retire single-file HTML as the project model.

### Implement
- Extend the canonical project type with:
  - `tree: ProjectTree`
  - `currentGenerationId`
  - optional compatibility `html` projection during migration.
- Add one-way migration:
  - legacy `project.html`
  - -> validated `ProjectTree v2` with `index.html`.
- Update the editor so preview derives from `entrypointHtml(tree)`.
- Update Files and Code surfaces to operate on the complete file tree.
- Persist the full tree atomically.
- Remove direct mutations that update only `project.html`.
- Make history restore replace the complete tree, not just `index.html`.
- Make every mutation create a generation ID, snapshot and manifest.

### Acceptance gate
No build-mode mutation path can change project source without producing a validated ProjectTree, immutable snapshot and provenance manifest.

---

## C. v2 generation + patch orchestration

### Goal
Use the multi-file protocol in the live product.

### Implement
- Add request mode/capability for:
  - full initial generation;
  - incremental patch generation.
- Promote `GenerationResultV2` to initial application creation.
- Promote `GenerationPatch` for existing projects.
- Include base tree hash with patch requests.
- Reject stale patch proposals deterministically.
- Add file-level proposed-change model:
  - create;
  - update;
  - delete;
  - unchanged.
- Add approval UI with per-file diff before application.
- Display generation ID and validation/provenance status in the approval UI.
- Preserve v1 only as an explicit migration fallback, then remove it after v2 stabilization.

### Acceptance gate
An existing project is never replaced wholesale for a normal edit; Laloba proposes a conflict-safe patch against the exact base tree.

---

# P0 — execution safety

## D. Ephemeral sandbox runner

### Goal
Build and test generated applications without trusting them.

### Architecture
Create a separate runner service/process boundary. It must not share Laloba control-plane credentials.

### Implement
- Define `RunnerJob` schema:
  - generation/tree hash;
  - source artifact;
  - allowed runtime;
  - allowed commands;
  - resource limits;
  - network policy;
  - environment allowlist.
- Materialize source into a fresh temporary workspace.
- Enforce:
  - CPU limit;
  - memory limit;
  - process limit;
  - disk quota;
  - wall-clock timeout;
  - output/log limits;
  - cleanup on success/failure/cancel.
- Deny network by default.
- Do not allow arbitrary model-supplied shell.
- Start with predefined command pipelines for supported templates.
- Run:
  - dependency integrity/install;
  - typecheck;
  - lint;
  - tests;
  - build.
- Return structured diagnostics, not raw unrestricted logs.

### Acceptance gate
Generated code cannot read host secrets, contact the network unless explicitly granted, survive cleanup, or execute arbitrary host commands.

---

## E. Validation pipeline and repair loop

### Goal
Do not ask humans to approve broken code.

### Implement
- Define versioned `ValidationResult`.
- Aggregate:
  - contract checks;
  - artifact checks;
  - dependency policy;
  - typecheck;
  - lint;
  - tests;
  - build;
  - security checks.
- Convert diagnostics to machine-readable file/range/error records.
- Add bounded repair loop:
  - generate;
  - validate;
  - diagnose;
  - patch;
  - validate again.
- Set hard limits:
  - maximum iterations;
  - token budget;
  - runtime budget;
  - cost budget.
- Final human approval sees:
  - exact diff;
  - validation evidence;
  - residual warnings.

### Acceptance gate
Only a candidate that passes mandatory gates can become an approvable generation.

---

# P0 — server-side trust boundary

## F. PostgreSQL persistence

### Goal
Move project truth out of browser storage.

### Minimum data model
- users
- workspaces
- workspace_members
- projects
- project_generations
- project_files / artifact references
- generation_runs
- generation_approvals
- audit_events
- usage_ledger
- deployment_records

### Implement
- Tenant/workspace ownership on every query.
- Transactional generation commit.
- Immutable generation records.
- Tree hash unique/reference constraints.
- Optimistic concurrency using current generation/tree hash.
- Server-side history and rollback.
- Browser cache becomes disposable acceleration only.
- Migration from local browser projects after explicit user confirmation.

### Acceptance gate
Deleting localStorage does not delete the authoritative project, history, approvals or rollback state.

---

## G. Server-side authorization and audit

### Goal
Human approval must be an authenticated server action, not a mutable browser object.

### Implement
- Replace client-only pending authorization with server records.
- Bind approval to:
  - user;
  - workspace;
  - project;
  - generation;
  - base tree hash;
  - candidate tree hash;
  - expiry;
  - action type.
- Make approvals one-time-use.
- Record actor, timestamp and request metadata.
- Separate permissions:
  - edit;
  - approve;
  - publish.
- Add append-only audit events.
- Remove development authentication fallback whenever production/database configuration is active.
- Remove fallback production auth secret entirely.
- Restrict configurable JWKS/identity URLs to approved HTTPS endpoints, with explicit localhost development exception.

### Acceptance gate
Replaying, modifying or transferring a browser approval object cannot authorize a server mutation.

---

# P1 — professional development platform

## H. GitHub integration

### Implement
- OAuth/GitHub App installation model.
- Link or create repository per project.
- Branch per draft/generation.
- Commit immutable approved generations.
- PR creation and review status.
- Pull remote changes and calculate conflicts against tree hash.
- Protected-branch awareness.
- Webhook-driven synchronization.
- Never place GitHub installation tokens inside generated applications.

### Acceptance gate
A project can round-trip Laloba -> GitHub -> external edit -> Laloba without silent overwrite.

---

## I. Real preview environments

### Implement
- Build immutable preview artifact from approved generation.
- Deploy to isolated preview environment.
- Stable generation-specific URL.
- Expiration/cleanup lifecycle.
- Restricted runtime secrets.
- Restricted network egress.
- Runtime logs/errors tied to generation ID.
- Preview access policy: private/workspace/public.

### Acceptance gate
Preview URL executes the exact tree hash recorded in its generation manifest.

---

## J. Deployment control plane

### Implement
- Deployment provider abstraction.
- Explicit environments:
  - preview;
  - staging;
  - production.
- Separate publish approval.
- Deployment credential vault.
- Immutable deployment record:
  - generation ID;
  - artifact/tree hash;
  - actor;
  - target;
  - provider result.
- Rollback to verified prior artifacts.
- Custom domains, DNS verification and TLS lifecycle.

### Acceptance gate
Generation alone can never cause a production deployment.

---

## K. Secrets vault

### Implement
- Envelope encryption / managed KMS.
- Workspace/project/environment scopes.
- RBAC for create/use/reveal/rotate/revoke.
- Default no-reveal UI behavior.
- Short-lived injection only into approved runner/deployment processes.
- Redaction in logs, diagnostics and model context.
- Secret reference identifiers in generated configuration instead of plaintext.

### Acceptance gate
No application source, model prompt, browser state, logs or build artifact contains platform secret plaintext.

---

# P1 — collaboration and product parity

## L. Workspaces + RBAC

Roles should initially support:

- owner
- admin
- editor
- viewer
- approver
- publisher

Implement invitations, membership lifecycle, server enforcement, project sharing, comments and attribution.

Later add SAML/OIDC SSO and SCIM.

Current market baseline includes server-enforced role separation for viewing/editing/approving/publishing, SSO/SAML, SCIM and audit logs; Laloba should design the permission model now even if enterprise identity ships later.

---

## M. Drafts and branches

Replace local-only drafts with server-side branches:

- base generation;
- independent generation history;
- compare;
- merge;
- conflict resolution;
- discard/archive.

Use the same patch/tree primitives already implemented.

---

## N. Visual editor

The current contenteditable preview is only a prototype.

Implement:
- element selection protocol from preview -> editor;
- stable source mapping;
- text/style/property edits as typed source operations;
- responsive breakpoint controls;
- design tokens;
- component-aware editing;
- accessibility feedback;
- generated patch preview before commit.

Do not grant same-origin iframe privileges merely to simplify selection.

---

## O. Managed backend abstraction

Define interfaces before choosing/locking a vendor:

- database;
- auth;
- storage;
- realtime;
- server functions;
- migrations.

Generated apps receive app-scoped credentials, never Laloba control-plane credentials.

Add migration planning and destructive-change approval before production database changes.

---

## P. Connectors

Implement an OAuth broker and connector registry.

Separate:
- builder credentials;
- workspace-managed credentials;
- deployed-app end-user credentials.

Each connector needs scopes, revocation, audit, server proxying and prompt-injection boundaries.

Current competitive baseline includes centrally configured connectors with role-based access and enterprise systems/data sources, so this is product-critical rather than optional.

---

## Q. Shared quotas and billing ledger

Replace the in-process Map rate limiter for production use.

Implement:
- shared Redis/Postgres rate limits;
- workspace/user/model quotas;
- runner minutes;
- storage;
- deployment consumption;
- cost ledger;
- hard budget caps;
- abuse detection.

Keep the current in-memory limiter only for local development/tests.

---

# P1/P2 — security and governance

## R. Security Center

Run on every candidate build:

- dependency vulnerability scan;
- secret scan;
- SAST;
- license policy;
- unsafe configuration checks;
- backend/RLS checks where supported;
- generated HTML/browser security checks.

Findings must be versioned and tied to tree hash.

Support severity-based approval/publish policy.

Current market baseline advertises security scanning on every build plus workspace-level visibility, so Laloba should make security findings a first-class domain object, not only a CI log.

---

## S. Supply-chain provenance

Implement:
- lockfile requirement;
- approved package registries;
- dependency allow/deny policy;
- SBOM;
- build artifact digest;
- signed provenance/attestations;
- artifact signatures;
- runtime/toolchain version capture.

A deployment must reference the exact signed artifact that passed validation.

---

## T. Observability

For Laloba control plane:
- structured logs;
- metrics;
- traces;
- alerting;
- generation/runner/deploy dashboards.

For deployed apps:
- frontend/runtime errors;
- release health;
- app logs;
- deployment correlation;
- optional read-only agent incident diagnosis.

Never give an incident-analysis agent production mutation authority by default.

---

# P2 — differentiate beyond baseline

## U. Model-independent orchestration

Create provider adapters and route by capability instead of provider name.

Record:
- provider/model;
- prompt/schema version;
- tool versions;
- latency;
- token usage;
- cost;
- validation outcome.

Support policy-based fallback and reproducible eval suites.

---

## V. Evidence-based coding agent

Every proposed change should expose:

- why the change exists;
- diagnostic/evidence that triggered it;
- files changed;
- tests expected to improve;
- validation result after the change.

This becomes part of the approval UX and audit history.

---

## W. Policy-as-code

Workspace rules should cover:

- allowed dependencies/licenses;
- allowed network destinations;
- model/provider allowlists;
- data region;
- connector permissions;
- deployment targets;
- required reviewers;
- security severity thresholds.

Evaluate policies server-side before build, approval and publish.

---

## X. Accessibility, performance and SEO gates

Add automated:
- accessibility checks;
- performance budgets;
- responsive checks;
- metadata validation;
- sitemap/robots checks;
- regression baselines.

Expose results in the same validation evidence model.

---

## Y. Portability

Export must include:

- full source tree;
- lockfile;
- database migrations;
- assets;
- environment-variable manifest without secret values;
- build instructions;
- deployment instructions;
- provenance manifest.

Avoid platform lock-in by design.

---

# Immediate implementation queue

The next work should be executed in this exact dependency order:

1. **Normalize canonical runtime source and lockfile.**
2. **Get CI actually running on a GitHub runner and establish a real green baseline.**
3. **Integrate ProjectTree v2 into canonical store/types/editor.**
4. **Replace editor build path with v2 initial-generation + patch flow.**
5. **Add file diff + approval UI.**
6. **Build the isolated runner and structured validation result.**
7. **Add bounded repair loop.**
8. **Move project/generation/approval truth to PostgreSQL.**
9. **Move approval enforcement server-side with RBAC/audit.**
10. **Add immutable preview environments.**
11. **Add GitHub sync and secrets vault.**
12. **Add explicit deployment/publish pipeline.**
13. **Add managed backend + connectors.**
14. **Add Security Center + shared quotas/usage ledger.**
15. **Add enterprise workspace governance and observability.**

Do not invert steps 6-9 with deployment work. Shipping deployment before isolated validation and server authorization would expand the highest-risk surface first.

---

# Current risk register

## Critical
- Canonical runtime source missing from Git branch.
- Authoritative lockfile absent.
- Editor still depends on missing modules and legacy HTML project state.
- No isolated execution boundary.
- Important state/approval flows remain browser-side.
- No real deployment authorization service.

## High
- Auth has a development fallback secret in the Better Auth configuration.
- Rate limiting is process-local.
- No shared tenant-aware persistence/RBAC.
- No secret vault.
- No dependency/security scanner.
- GitHub Actions currently fails before executing steps.

## Medium
- Preview is browser-sandboxed but not a server-managed immutable preview environment.
- Visual editing is DOM contenteditable without source mapping.
- Publish UI is informational only.
- Drafts/comments are not yet a collaborative server model.
- Generation remains tied to one model/provider route.

---

# Definition of platform-ready v1

Laloba can be called a production app-generation platform when all of the following are true:

1. A clean checkout installs, typechecks, tests and builds reproducibly.
2. ProjectTree v2 is the only authoritative source model.
3. Every candidate is built/tested in an isolated runner.
4. Broken candidates cannot reach human approval.
5. Approvals are server-side, authenticated, one-time and audited.
6. Project/history truth is server-side and tenant-scoped.
7. Preview artifacts are immutable and tied to tree hashes.
8. Publishing is a separate authorized action.
9. Secrets are never exposed to generated code or browser state.
10. Rollback targets verified immutable artifacts.
11. Git sync cannot silently overwrite external changes.
12. Security findings and deployment events are auditable.

Only after this gate should enterprise/governance expansion be treated as product scaling rather than foundational remediation.


## Progress update — 2026-09-22

Implemented since this plan was written:

- recovered the canonical `store.ts`, `types.ts`, `html-apps.ts`, `stream-chat.ts`, `utils.ts` and `catalog.ts` from the user-provided workspace archive with recorded SHA-256 provenance;
- restored the editor components needed by the active project route;
- promoted `ProjectTree v2` into the canonical Zustand project state;
- added persisted-state migration from legacy HTML/files to validated ProjectTree;
- blocked generic `updateProject` from mutating source fields;
- changed generation, preview, Files and Code surfaces to read from ProjectTree;
- made manual code saves create snapshot + manifest + verified generation history;
- connected v2 patch generation and conflict-safe approval to the live editor;
- centralized and tested the HTTP generation request boundary;
- fixed duplicate initial prompt insertion during autostart.

Still blocking Phase A completion:

- authoritative `package-lock.json` is recovered and hash-verified locally but not yet committed byte-for-byte;
- additional canonical application entrypoint/auth/server files from the recovered workspace still need restoration;
- a clean `npm ci -> typecheck -> tests -> build` proof is still required;
- GitHub Actions continues to fail before runner steps start, independently of application code.
