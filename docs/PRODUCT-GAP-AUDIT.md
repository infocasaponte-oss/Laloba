# Laloba product gap audit

Updated: 2026-09-22

> For the expanded September 2026 feature-by-feature comparison against the current Lovable platform, see [LOVABLE-PARITY-AUDIT-2026.md](./LOVABLE-PARITY-AUDIT-2026.md).

## Target

Laloba should be a professional AI application engineering platform, not only an HTML generator. The product loop is:

specification -> plan -> isolated generation -> validation -> human approval -> versioned artifact -> preview -> publish approval -> deployment -> observability -> rollback.

Generated code is untrusted throughout the loop.

## Current implemented foundation

- Structured v1 generation contract with strict raw-JSON parsing.
- Generated HTML validation and network-denied sandboxed preview.
- Path confinement, manifests, SHA-256 snapshots and verified rollback history.
- Explicit, state-bound human authorization before generated fixes are applied.
- Auth foundation, same-origin mutation protection and per-instance generation rate limiting.
- Plan/build chat modes and editor preview/code/files surfaces.
- CI generator-security test gate and repository/security engineering documentation.

## Competitive baseline observed in Lovable (September 2026)

Public Lovable material currently describes chat/agent building, dev mode, visual edits, workspaces/multiplayer, drafts, GitHub sync, managed backend/auth/storage/realtime/functions, custom domains and one-click publishing, connectors, per-user connector authorization, security scanning, enterprise RBAC/SSO/SCIM/audit controls, regional data residency, publishing approvals and production security controls.

This document uses that as a feature baseline, not as an architecture to copy.

## Gaps and implementation priority

### P0 — required before Laloba can be called an app generator

1. Canonical multi-file project model. Promote generation protocol v2 from staged code to the default. Projects must persist an arbitrary validated file tree rather than one index.html.
2. Isolated build/test runtime. Materialize each candidate in an ephemeral sandbox with CPU, memory, time, filesystem and network policy; run install/typecheck/lint/test/build without host secrets.
3. Deterministic patch engine. Existing apps should receive typed file operations (create/update/delete) with base hashes and conflicts, not whole-project replacement.
4. Validation pipeline. Block approval when typecheck/build/security checks fail. Return machine-readable diagnostics to the repair agent.
5. Agent repair loop. Allow bounded generate -> validate -> diagnose -> repair iterations; require human authorization for the final diff.
6. Server-side project persistence. Move projects, generation history, authorization records and audit events out of browser localStorage into PostgreSQL with tenant ownership checks.
7. Deployment boundary. Publishing must be a separate server-authorized capability from generation and must never expose deployment credentials to generated code.

### P1 — professional product parity

8. Git provider integration: repository create/link, branches, commits, pull requests, bidirectional sync, conflict handling and protected-branch policy.
9. Managed backend: PostgreSQL schema/migrations, auth, object storage, realtime/eventing, server functions and row-level authorization. Keep a provider abstraction so Laloba is not coupled to one vendor.
10. Secrets vault: encrypted secrets, environment scopes, RBAC, rotation/revocation, redacted logs and short-lived execution injection.
11. Preview environments: immutable per-generation URLs, server-side preview lifecycle, logs and safe network egress.
12. Publishing: staging/production environments, approval policy, custom domains, TLS, DNS verification, rollbacks and deployment history.
13. Security center: dependency/SAST/secret/config scans, RLS/data-access checks, severity gates, signed findings and optional bounded auto-fix.
14. Workspaces and collaboration: organization/workspace/project membership, owner/admin/editor/viewer/approver/publisher roles, invitations, comments and presence.
15. Drafts/branches: parallel experiments with merge/diff rather than browser-only drafts.
16. Visual editing: DOM-to-source selection, design-token/style editing, responsive breakpoints and accessibility feedback.
17. Connectors: OAuth broker, scoped connector registry, builder-vs-app-user credentials, per-user authorization and auditable proxy calls.
18. Billing/quotas: workspace budgets, model/runtime usage ledger, limits and abuse controls shared across instances.

### P2 — surpass the baseline

19. Model-independent orchestration: capability-based routing, fallback, cost/latency budgets and reproducible evaluation sets.
20. Evidence-based agent: every proposed fix links diagnostics to exact changed files; approval UI shows why each change exists.
21. Policy-as-code: organization rules for dependencies, licenses, network destinations, data residency, models and deploy targets.
22. Supply-chain provenance: lockfile enforcement, dependency allow/deny rules, SBOM, signed build attestations and artifact signatures.
23. Production observability: logs, traces, metrics, frontend errors, release health and agent-assisted incident diagnosis with read-only-by-default access.
24. Database change safety: migration plans, destructive-change detection, backups, shadow validation and explicit production approval.
25. Accessibility/performance/SEO gates: automated WCAG checks, budgets, metadata/site-map generation and regression tracking.
26. Reusable templates/components/design systems with versioning and organization governance.
27. MCP/tool runtime with capability grants and prompt-injection boundaries.
28. Export/portability: complete source, database migrations, assets, environment manifest and deployment instructions without platform lock-in.
29. Trust center per deployed app and auditable security posture.
30. Enterprise governance: SAML/OIDC SSO, SCIM, audit export, retention policies and regional data placement.

## Architecture decisions

- A generation is immutable. A patch references a base generation hash.
- Approval and publish are different permissions and different records.
- Generated applications never receive Laloba control-plane credentials.
- Browser state is a cache, never the authorization source of truth.
- Every external connector is least-privilege and revocable.
- Network access is denied in build/preview unless policy grants destinations.
- Production mutations require server-side authorization and an audit event.
- Rollback targets immutable, verified artifacts.
- All AI output crosses a versioned schema boundary before it can affect state.
- Model retries are bounded by cost, time and iteration budgets.

## Next implementation sequence

Milestone A: v2 multi-file projects + patch/diff contract + conflict-safe authorization.
Milestone B: ephemeral runner + validation diagnostics + bounded repair loop.
Milestone C: PostgreSQL persistence + workspace RBAC + audit log + shared quotas.
Milestone D: GitHub sync + preview environments + secrets vault.
Milestone E: managed backend + connectors + publish/deployment pipeline.
Milestone F: security center + observability + domains + enterprise governance.

The current repository is in Milestone A. Do not expand deployment surface before the runner and server-side authorization boundary exist.
