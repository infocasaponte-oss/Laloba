# Laloba vs Lovable — product parity audit

Updated: 2026-09-22

## Executive conclusion

Laloba already has a credible security-oriented generation core: strict generation contracts, multi-file project trees, path confinement, immutable snapshots, manifests, state-bound approval, conflict-aware patches, browser preview hardening, same-origin mutation checks, auth groundwork, quota checks and a bounded repair-loop policy.

The gap is no longer "can Laloba generate code?". The gap is that most surrounding product surfaces are still browser-local prototypes or demos, while the current Lovable product operates them as real platform services.

The implementation goal should not be a pixel-for-pixel clone. Laloba should preserve its stricter trust boundaries and implement equivalent product capabilities with stronger reproducibility, approval, provenance and portability.

## Repository state discovered in this audit

- The default `main` branch is not the functional application source. It currently contains only staged transfer fragments.
- The actual working application is on `chore/professionalize-repository`, currently exposed through PR #1.
- `main` is not protected.
- The latest Repository baseline workflow for the working branch failed before any step ran: both jobs report `runner_id=0` and an empty `steps` array. There is therefore no executed CI evidence for the current head.
- The working branch already contains a product-gap audit and implementation plan, but the competitive baseline has moved materially during 2026 and needs to be expanded.

This branch is therefore an audit branch stacked on the working source branch, not on the incomplete default branch.

## Current Laloba strengths

### Generation trust boundary

Implemented or materially present:

- v2 multi-file generation contract;
- deterministic project-tree hashing;
- project snapshots and manifests;
- safe generated-path validation;
- conflict-aware patch operations using base hashes;
- human authorization bound to the exact project state;
- immutable generation history with integrity verification;
- network-denied iframe preview CSP;
- request-origin checks;
- request-size limits;
- per-instance generation quota;
- authentication gate;
- bounded runner-job schema;
- bounded repair-loop policy;
- generator-focused test suite.

This is a good foundation to keep.

### Editor foundation

Partially implemented:

- preview, files, code and more panels;
- Build and Plan modes;
- file-level code editing;
- version history;
- draft UI;
- comments UI;
- responsive preview sizes;
- project knowledge;
- connector catalog UI;
- settings/billing/team/API-key/domain surfaces.

The key limitation is that much of this state remains local to Zustand/localStorage and several panels intentionally display demo data.

## Competitive baseline: current Lovable

As of September 2026, Lovable publicly documents the following production capabilities:

### Agent and generation

- Chat, Plan and Build modes;
- autonomous multi-step Build mode;
- visible execution timeline and file diffs;
- follow-up messages while work is running;
- long-running goals;
- subagents for parallel research/code exploration/review;
- reusable workspace skills;
- workspace and project knowledge;
- cross-project referencing;
- file generation and data analysis;
- image/video generation and editing.

### Editing and project lifecycle

- multi-file code editor;
- preview editing and comments;
- design guidance before generation;
- design templates and design systems;
- drafts for parallel experiments;
- automatic version history/bookmarks;
- project remixing;
- project folders and search;
- Figma import;
- SSR projects based on TanStack Start.

### Backend and application runtime

- built-in database;
- authentication;
- storage;
- realtime;
- edge functions;
- scheduled jobs;
- logs;
- secrets;
- backend usage/cost controls;
- managed AI features.

### Testing and verification

- browser testing with navigation/click/form interaction;
- screenshots;
- console and network inspection;
- frontend tests using Vitest/React Testing Library/jsdom;
- edge-function verification and tests;
- build/test error inspection by the agent.

### Security

- dependency scanning;
- database schema and access-control review;
- RLS linting;
- secret protection;
- API/auth checks;
- code-level security scanning;
- deeper security scans;
- workspace security center;
- recurring enterprise scans;
- third-party integrations such as Wiz/Aikido;
- published-app trust center.

### Connectors and external systems

- app + chat connectors;
- personal chat/MCP connectors;
- app-user connectors with per-user delegated authorization;
- custom REST connectors;
- custom MCP servers and MCP registries;
- connector admin controls and security policies;
- broad integration catalog across data, CRM, messaging, ecommerce, analytics, finance and infrastructure.

### Git, collaboration and enterprise

- two-way GitHub/GitLab/Bitbucket sync;
- workspace/project collaboration;
- protected preview sharing;
- element comments;
- project access controls;
- workspace groups;
- SSO;
- SCIM;
- verified domains;
- audit logs;
- workspace security insights;
- sensitive-data scanning;
- API keys with scopes/limits;
- workspace analytics/insights.

### Hosting, growth and operation

- managed hosting and HTTPS;
- publish workflow;
- custom domains and branded app URLs;
- external hosting/portability;
- analytics;
- SEO/AEO tooling;
- payments via Stripe/Paddle;
- branded email;
- scheduled application monitoring;
- app exposure as an MCP server;
- platform API for workspaces/projects/publishing/security/analytics.

### Platform surfaces

- web;
- desktop app;
- iOS/Android;
- Slack;
- Telegram;
- ChatGPT;
- MCP server/API-driven automation.

## Feature-by-feature Laloba gap matrix

Legend:

- **Implemented** — substantive working capability exists.
- **Foundation** — core data/contracts exist but end-to-end product path is incomplete.
- **Prototype** — visible UI/local behavior exists but is not a production service.
- **Missing** — no meaningful implementation found.

| Capability | Laloba | Main gap |
|---|---|---|
| Multi-file generation | Implemented | Move all live flows to v2 only |
| Patch generation | Implemented | Needs runner validation before approval |
| State-bound approval | Implemented | Must move authorization server-side |
| Immutable history | Foundation | Still browser-local |
| Build mode | Foundation | No real isolated execution/tool loop |
| Plan mode | Implemented | Persist plans and approval state server-side |
| Chat-only mode | Missing | Add non-mutating project discussion mode |
| Goals / long-running tasks | Missing | Durable orchestration, pause/resume/cancel/budgets |
| Subagents | Missing | Parallel read-only investigations and review workers |
| Skills | Missing | Versioned workspace skill registry |
| Cross-project reference | Missing | Permissioned read-only project retrieval |
| Workspace/project knowledge | Prototype | Browser-local, no governance/versioning |
| File/data generation | Missing | Artifact service for docs/data/files |
| Visual editing | Prototype | Current contenteditable does not source-map or persist edits |
| Element comments | Prototype | Local-only comments; no anchors/presence |
| Drafts | Prototype | HTML-only local drafts, no full-tree branch/merge |
| Design guidance | Missing | Pre-build design alternatives and token system |
| Design systems/templates | Prototype | Static catalog, no governed versioned components |
| Figma import | Missing | Import pipeline and token/component mapping |
| Code editor | Foundation | Textarea, no language services/search/refactors |
| SSR template | Laloba shell only | Generated apps are still HTML-first |
| Built-in DB | Prototype UI | No project-scoped managed DB service |
| App authentication | Prototype UI | Laloba control-plane auth exists, generated-app auth does not |
| Storage | Prototype UI | No project storage service |
| Realtime | Missing | No managed event/realtime backend |
| Edge/server functions | Prototype UI | No isolated application function runtime |
| Scheduled jobs | Prototype UI | No durable scheduler |
| Secrets vault | Prototype UI | No encrypted scoped secret service |
| Logs | Prototype UI | No app/runtime log pipeline |
| AI for generated apps | Prototype UI | No app-scoped AI gateway/usage enforcement |
| Browser testing | Missing | Playwright dependency exists but no agent verification service |
| Frontend tests | Foundation | Generator tests exist, generated-app test orchestration missing |
| Backend verification | Missing | No app function runtime to verify |
| Security scan | Prototype UI | Findings are hard-coded |
| Dependency audit | Missing product path | Add scanner and gating |
| SAST/secret/config scans | Missing | Add normalized finding service |
| RLS/data-access checks | Missing | Depends on managed backend |
| Trust center | Missing | Publish signed machine-readable posture |
| Connectors catalog | Prototype | Toggle-only local state |
| OAuth connector broker | Missing | Credentials, scopes, revoke, audit, proxy |
| App-user connectors | Missing | Per-user delegated credentials/gateway |
| Custom REST connectors | Missing | Schema, auth methods, policy and testing |
| MCP chat connectors | Foundation | Existing Grok connector client is environment-specific |
| MCP registry | Missing | Workspace registry/governance |
| GitHub sync | Missing | No repo lifecycle/webhooks/conflict sync |
| GitLab/Bitbucket sync | Missing | Provider abstraction first |
| Workspaces | Prototype | Team/workspace values are local demo data |
| RBAC | Missing product enforcement | Auth exists, project/workspace roles do not |
| SSO/SCIM/groups | Missing | Enterprise identity layer |
| Audit log | Missing | Need append-only server event model |
| Sensitive-data scan | Missing | Scan prompts/files/uploads/backend data |
| Publish | Prototype | Dialog only; intentionally no deploy credential |
| Preview environments | Missing | iframe only, no immutable hosted preview |
| Hosting | Missing | Deployment provider abstraction needed |
| Custom domains/TLS | Prototype UI | No DNS verification/cert lifecycle |
| Analytics | Demo | Hard-coded chart data |
| SEO/AEO | Prototype | Metadata fields only |
| Payments | Demo | Buttons only |
| Branded email | Missing | Domain/DNS/sender runtime |
| Monitoring | Missing | Scheduled synthetic/error monitoring |
| Project API | Missing | No stable external platform API |
| MCP server for deployed apps | Missing | Need generated capability manifest/auth |
| Desktop/mobile/Slack/Telegram | Missing | Later distribution surfaces |
| Billing/usage | Demo | Local credit decrement only |

## Critical architecture gaps

### 1. Default branch does not contain the application

Before product development accelerates, make the normalized source the canonical protected default branch. Transfer fragments should be historical/recovery material, not the production development model.

### 2. Browser-local state is still authoritative

`src/lib/store.ts`, project-tree cache and history still rely on Zustand/localStorage for core project state. This blocks reliable collaboration, access control, drafts, auditability, server approvals and multi-device use.

Required fix:

- PostgreSQL-backed workspaces/projects/generations;
- optimistic concurrency by tree hash/generation id;
- append-only audit;
- one-time server approvals;
- browser state becomes a cache only.

### 3. Runner and repair logic are schemas/policies, not an execution service

`runner-job.ts`, `validation-result.ts` and `repair-loop.ts` establish useful contracts, but there is no separate isolated runner that actually installs, typechecks, tests, builds and scans generated code.

Required fix:

- separate worker/container boundary;
- no control-plane secrets;
- read-only base image;
- ephemeral workspace;
- CPU/memory/PID/disk/time limits;
- deny egress by default;
- allowlisted dependency fetch phase;
- normalized diagnostics;
- artifact hash/provenance;
- bounded repair orchestration.

### 4. Agent mode is still a single upstream chat completion

`/api/chat` calls one model endpoint and expects one JSON result. It cannot search the codebase selectively, run tools, test, inspect logs, use subagents, resume durable work or react to mid-run follow-ups.

Required fix:

Create a durable agent-run state machine:

`queued -> planning -> exploring -> editing -> validating -> repairing -> awaiting_approval -> applied/failed/cancelled`.

Persist every step and tool call. Separate read tools from mutating tools and require capability grants.

### 5. Product panels advertise services that do not exist

The More panel currently presents Cloud, payments, analytics, connectors and security with hard-coded/demo information. That is useful as design scaffolding but dangerous if treated as implemented parity.

Required fix:

Each panel needs a server capability contract and should show an explicit unavailable/setup state until the backend service exists.

## Recommended implementation order

### Phase 0 — repository and CI normalization

1. Merge/normalize the real source onto the canonical branch after review.
2. Remove transfer artifacts from the normal build path.
3. Restore the canonical lockfile as a real tracked lockfile.
4. Enable branch protection and required checks.
5. Fix the GitHub Actions execution/runner-account issue.
6. Require signed/reviewed protected-branch changes where practical.

### Phase 1 — server-side project truth

Implement:

- workspaces;
- members/roles;
- projects;
- generations;
- file blobs/artifacts;
- chats/messages;
- plans;
- approvals;
- drafts;
- comments;
- audit events;
- usage ledger.

Move local Zustand persistence to a disposable cache.

### Phase 2 — execution platform

Implement:

- queue;
- isolated runner;
- validation service;
- browser-test worker;
- repair orchestration;
- cancellation;
- budgets;
- logs;
- artifacts;
- provenance.

This unlocks real Build mode.

### Phase 3 — agent parity

Implement three explicit modes:

- Chat: read-only discussion/investigation;
- Plan: structured plan requiring approval;
- Build: durable mutating agent.

Then add:

- goals;
- follow-ups while running;
- execution timeline;
- subagents;
- skills;
- cross-project references;
- model routing/fallback.

### Phase 4 — collaboration and Git

Implement:

- server drafts/branches;
- tree-level compare/merge/conflicts;
- comments anchored to source/DOM;
- presence/activity;
- Git provider abstraction;
- GitHub first, then GitLab/Bitbucket;
- webhooks and protected-branch awareness.

### Phase 5 — managed app backend

Implement a provider-neutral backend control plane for:

- Postgres;
- migrations;
- auth;
- RLS;
- storage;
- realtime;
- server functions;
- scheduled jobs;
- secrets;
- logs.

Use app-scoped credentials and exportable migration/configuration manifests.

### Phase 6 — preview, publish and operations

Implement:

- immutable preview builds;
- isolated preview URLs;
- staging/production targets;
- publish approvals;
- custom domains/DNS/TLS;
- rollback;
- analytics;
- monitoring;
- logs/traces/errors.

### Phase 7 — connectors

Implement:

- connector registry;
- OAuth broker;
- secret/token vault;
- shared app connections;
- per-user delegated connections;
- custom REST connectors;
- custom MCP connectors;
- policy/allowlists;
- audit and revocation.

### Phase 8 — security center

Implement:

- dependency scanning;
- SAST;
- secret scanning;
- config/IaC scanning;
- data-access/RLS checks;
- normalized signed findings;
- severity gates;
- optional bounded auto-fix;
- workspace posture;
- published-app trust center.

### Phase 9 — growth and commercial surfaces

Implement real:

- usage/billing;
- Stripe/Paddle adapters;
- branded email;
- SEO/AEO audits;
- project analytics;
- monitoring;
- API keys;
- platform API.

### Phase 10 — differentiated surfaces

Only after the web control plane is durable:

- desktop;
- mobile;
- Slack/Telegram/ChatGPT;
- Laloba MCP server;
- deployed-app MCP exposure.

## Areas where Laloba should deliberately exceed Lovable

### Evidence-bound changes

Every automated fix should carry:

- triggering diagnostic;
- affected file/range;
- before/after hash;
- validation evidence;
- model/tool identity;
- human approval when policy requires it.

### Stronger execution isolation

Treat generated code as hostile. Build/test/browser workers should never have access to Laloba control-plane credentials and should use deny-by-default network policy.

### Reproducible generations

Persist:

- model/provider/version;
- system policy version;
- normalized input;
- dependency lock;
- tool results;
- tree hash;
- validation report;
- artifact digest.

### Policy-as-code

Workspace policy should be machine-readable and enforceable for:

- models;
- dependencies/licenses;
- allowed domains;
- secrets;
- data residency;
- deployment targets;
- required tests;
- security severity gates.

### Portable backend

Generated apps should be exportable with source, migrations, assets, runtime manifest, secrets-reference manifest and deployment instructions so a customer can leave Laloba without reconstructing the application.

## Immediate next engineering slice

The best next code slice is not another demo panel.

Implement these together:

1. server-side project/generation persistence;
2. server-side one-time generation approval;
3. durable agent-run records;
4. real isolated validation runner;
5. automatic validation before the approval dialog;
6. browser-test verification as an optional validation stage.

After that slice, Laloba can safely convert its existing Build UI from "model returns JSON" into a genuine autonomous app-engineering loop.

## Official Lovable references used for this baseline

- https://docs.lovable.dev/introduction/welcome
- https://docs.lovable.dev/llms.txt
- https://docs.lovable.dev/features/agent-mode
- https://docs.lovable.dev/features/goal-runs
- https://docs.lovable.dev/features/subagents
- https://docs.lovable.dev/features/drafts
- https://docs.lovable.dev/features/cloud
- https://docs.lovable.dev/features/testing
- https://docs.lovable.dev/features/security
- https://docs.lovable.dev/integrations/introduction
