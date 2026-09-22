# Laloba Master Implementation Plan

Updated: 2026-09-22
Status: canonical and mandatory
Scope: product, application architecture, AI orchestration, security, data, collaboration, deployment, operations and governance.

This document is the single source of truth for Laloba development priorities. ROADMAP.md, IMPLEMENTATION-PLAN.md and PRODUCT-GAP-AUDIT.md are compatibility entry points only and must not define independent priorities.

There is no product release label such as "V1" in this plan. Readiness is defined by objective capability gates, not by a marketing version name.

## Current execution status

- **F0 — Canonical repository and identity:** implemented on the normalization change set. Runtime source is complete, the canonical lockfile is tracked and historical transfer/recovery payloads have been removed.
- **F1 — Reproducible CI and repository protection:** in progress. CI now validates the normalized repository directly; the remaining gate is evidence from a GitHub runner executing the complete clean-checkout pipeline successfully.
- **F2 and later:** blocked until the F1 gate is proven green.

## 1. Non-negotiable rules

1. Phases are dependency ordered. A dependent phase cannot be declared complete while its prerequisite gate is red.
2. Existing working functionality must not be removed unless a replacement is implemented, migrated and covered by tests.
3. A visible screen, button, toggle, toast, local mock or TypeScript contract is not a completed feature when the real service is absent.
4. Generated code is untrusted.
5. Every AI output that can change project state crosses a versioned schema boundary and deterministic validation.
6. Browser state is a cache and presentation layer, never the authorization or persistence source of truth for projects, approvals, quotas, secrets, deployments or audit.
7. Generation, validation, approval, preview and publication are separate capabilities.
8. Laloba control-plane credentials must never enter generated applications, previews or build sandboxes.
9. Arbitrary model-supplied shell commands are forbidden.
10. Runner and preview networking is denied by default and granted only by explicit policy.
11. Critical mutations must record actor, time, resource, previous state reference and resulting state reference.
12. Main must remain reproducibly installable, testable and buildable.
13. New capabilities require authorization, error handling, tests, documentation and migration strategy when applicable.
14. Security gates fail closed.
15. Rollback targets immutable verified artifacts, not a rebuild of old source.
16. Every provider-specific integration must sit behind a Laloba-owned abstraction when a second provider is reasonably foreseeable.

## 2. Existing capabilities that must be preserved

The following foundations already exist and are protected from regression:

- multi-file ProjectTree project representation;
- strict generation-result and patch schemas;
- safe generated path validation and project-root confinement;
- SHA-256 tree, snapshot and manifest verification;
- conflict-aware create/update/delete patches with base hashes;
- state-bound human approval logic;
- generation history and verified rollback primitives;
- sandboxed browser preview hardening;
- same-origin mutation protection;
- authentication foundation;
- request size and generation-rate controls;
- Plan and Build surfaces;
- Preview, Files, Code and More editor surfaces;
- manual source editing with generation snapshots;
- runner-job contract;
- validation-result contract;
- bounded repair-loop policy;
- generator-focused test suite;
- responsive preview modes;
- drafts, comments, knowledge, connector, team, billing, domain, analytics, cloud, security and payments UI scaffolding.

When a prototype is replaced by a real service, its user-visible behavior must either continue working or be intentionally migrated with a documented replacement.

## 3. Canonical target flow

    user intent
      -> validated application specification
      -> contextual planning
      -> generation or patch proposal
      -> schema and artifact validation
      -> isolated execution
      -> tests and security checks
      -> bounded repair
      -> human approval
      -> immutable generation artifact
      -> preview environment
      -> publish approval
      -> deployment
      -> observability
      -> rollback

The full chain must be reconstructable for every production release.

# PHASE 0 — Canonical repository and identity

## Objective

Make the Git repository itself the authoritative source of Laloba and remove temporary recovery mechanisms from the normal development path.

## Mandatory work

- restore all authoritative runtime source files;
- track the authoritative lockfile normally;
- verify recovered files before deleting transfer fragments;
- remove Base64 transfer payloads after equivalence is confirmed;
- remove temporary source-recovery paths from the build;
- ensure documentation, comments, prompts and internal names describe Laloba requirements directly rather than through external product comparisons;
- keep provenance of recovered source where operationally useful;
- establish one canonical development branch and protected main branch;
- archive superseded audit-only branches after useful requirements have been merged.

## Gate F0

- a clean checkout contains readable source;
- no source restoration step is needed to develop the application;
- the lockfile is tracked;
- no duplicated canonical source exists;
- no temporary transfer payload is required by build or tests.

# PHASE 1 — Reproducible CI and repository protection

## Objective

Prove the repository before adding platform surface area.

## Mandatory CI gates

    npm ci
    npm run lint
    npm run typecheck
    npm run test:generator
    npm test
    npm run build:dev

Also implement:

- format check;
- dependency review;
- secret scanning;
- dependency vulnerability scanning;
- protected main;
- pull-request requirement;
- required checks;
- CODEOWNERS for security-sensitive areas;
- separate fast checks from integration/e2e checks;
- classification of pre-runner infrastructure failures separately from application test failures.

## Gate F1

- all required commands pass from a clean checkout;
- CI runs on an allocated runner and reaches actual steps;
- a failing test, build or security gate blocks merge;
- build output does not depend on local machine state.

# PHASE 2 — Canonical ProjectTree and complete history

## Objective

Make the full file tree the only authoritative source model.

## Mandatory work

- ProjectTree becomes the only source representation;
- any legacy HTML projection is read-only compatibility during migration;
- preview derives from the canonical tree;
- Files and Code operate on the complete tree;
- every source mutation creates a generation id, snapshot, manifest and next tree hash;
- drafts store the full tree or a generation reference;
- versions and rollback restore the complete tree;
- remix/duplicate operations copy complete project state;
- downloadable/exported project artifacts include the full tree, not only index.html;
- stale patch proposals are rejected using base tree hash;
- normal edits use typed file operations instead of whole-project replacement.

## Gate F2

No mutation path can change source without a validated tree, immutable history record and hash transition.

# PHASE 3 — Server-side project truth

## Objective

Remove localStorage and Zustand persistence as authoritative state.

## Minimum server model

- users;
- workspaces;
- workspace_members;
- projects;
- project_generations;
- project_files or content-addressed artifacts;
- generation_runs;
- generation_approvals;
- project_branches;
- plans;
- chats and messages;
- comments;
- knowledge_sources;
- audit_events;
- usage_ledger;
- preview_environments;
- deployment_records;
- api_keys;
- connector_connections;
- secrets;
- domains.

## Mandatory work

- tenant/workspace ownership on every query;
- transactional generation commits;
- immutable generation records;
- optimistic concurrency by generation/tree hash;
- server-side history and rollback;
- explicit migration path from browser-local projects;
- browser store reduced to UI cache/preferences;
- multi-device continuity.

## Gate F3

Deleting browser storage does not delete project truth, history, approvals or rollback data, and tenant isolation is covered by automated tests.

# PHASE 4 — Authorization, RBAC and audit

## Objective

Make permissions server-enforced and independently auditable.

## Initial roles

- owner;
- admin;
- editor;
- viewer;
- approver;
- publisher.

## Separate permissions

- view;
- edit;
- generate;
- approve;
- manage_secrets;
- manage_connectors;
- manage_members;
- publish;
- manage_billing;
- admin.

## Approval record

Must bind:

- approval id;
- authenticated user;
- workspace;
- project;
- generation;
- base tree hash;
- candidate tree hash;
- action;
- expiry;
- consumed time.

Approvals are one-time, expiring, non-transferable and server-side.

## Audit events

At minimum:

- authentication events;
- role and membership changes;
- generation;
- approval;
- source mutation;
- secret lifecycle;
- connector lifecycle;
- API key lifecycle;
- preview;
- publish;
- rollback;
- domain changes;
- administrative configuration.

## Authentication hardening

- no random fallback auth secret in production;
- production secrets fail closed when missing;
- configurable identity/JWKS endpoints restricted to approved HTTPS endpoints, with explicit development exceptions.

## Gate F4

Tampering with browser state cannot grant approval, role, publishing or secret access. Replay of a consumed approval fails.

# PHASE 5 — Durable AI orchestration

## Objective

Replace one-shot generation with a durable tool-using engineering agent while preserving Chat, Plan and Build as distinct modes.

## Run state machine

    queued
    planning
    exploring
    editing
    validating
    repairing
    awaiting_approval
    applied | failed | cancelled

Persist every state transition and tool call.

## Modes

### Chat

Read-only discussion, investigation and explanation. It may inspect authorized project context but cannot mutate source.

### Plan

May inspect the current project and produce a structured plan containing:

- objective;
- assumptions;
- affected areas;
- expected files;
- data model changes;
- security implications;
- migrations;
- test plan;
- execution steps.

Plan mode must not be prevented from reading current source.

### Build

Executes approved intent using controlled tools and produces typed candidate changes.

## Minimum tools

- list_files;
- read_file;
- search_code;
- read_symbol;
- read_dependencies;
- create_file;
- update_file;
- delete_file;
- get_diagnostics;
- run_typecheck;
- run_lint;
- run_tests;
- run_build;
- run_security;
- browser_test;
- read_logs.

Read and mutation capabilities must be distinct.

## Context retrieval

Do not dump the complete project into the model context by default. Support retrieval by:

- path;
- symbol;
- imports;
- references;
- diagnostic;
- changed files;
- project knowledge;
- cross-project reference with explicit permission.

## Provider abstraction

Create provider-neutral interfaces for model request, response, capability, tool support, usage, latency and cost. Record provider/model/version for provenance without coupling product logic to one provider.

## Gate F5

- Plan can inspect real current source;
- Build can work on projects larger than the model context window;
- every tool call is persisted;
- free-form model text cannot directly mutate source;
- cancellation is supported;
- retries are bounded.

# PHASE 6 — Goals, follow-ups, subagents and skills

## Objective

Support long-running work without sacrificing control.

## Mandatory work

- durable goals with pause/resume/cancel;
- follow-up instructions while a run is active;
- visible execution timeline;
- read-only parallel exploration workers;
- review worker for proposed changes;
- versioned workspace skill registry;
- skill permissions/capability grants;
- reusable project/workspace knowledge with versioning and access control;
- cross-project references with explicit source project permissions;
- budgets for time, tokens, cost and parallelism.

## Gate F6

A long-running task can resume after process restart from persisted state, and subagents cannot acquire mutation or secret capabilities unless explicitly granted.

# PHASE 7 — Isolated runner

## Objective

Turn the existing RunnerJob contract into a real execution service.

## Required isolation

Each job gets:

- fresh workspace;
- non-privileged identity;
- filesystem confinement;
- CPU limit;
- memory limit;
- PID/process limit;
- disk quota;
- wall-clock limit;
- log/output limit;
- guaranteed cleanup;
- denied network by default;
- explicit environment allowlist.

Runner workers must not access:

- Laloba control-plane secrets;
- deployment credentials;
- secrets of other projects;
- Docker socket;
- host filesystem;
- cloud metadata services.

Only Laloba-defined command pipelines are executable.

## Initial pipeline

- dependency integrity/install;
- typecheck;
- lint;
- unit tests;
- build;
- security checks.

## Gate F7

Hostile generated code cannot read host secrets, escape the workspace, retain processes after cleanup, access network without policy or execute arbitrary host commands.

# PHASE 8 — Validation and repair

## Objective

Prevent broken candidates from reaching final approval.

## Validation stages

- contract;
- artifact;
- dependencies;
- typecheck;
- lint;
- unit tests;
- build;
- browser tests;
- security;
- accessibility;
- performance where configured.

Diagnostics are structured by stage, severity, code, message, path, line and column.

## Repair loop

    generate
      -> validate
      -> diagnose
      -> repair patch
      -> validate again

Enforce hard limits for iterations, runtime, tokens, cost, patch size and diagnostics.

The agent cannot approve its own result.

## Gate F8

A candidate with a failed mandatory gate cannot become approvable.

# PHASE 9 — Browser and backend verification

## Objective

Verify behavior, not only compilation.

## Browser tools

- open_page;
- navigate;
- click;
- fill;
- select;
- submit;
- wait;
- screenshot;
- inspect_console;
- inspect_network;
- assert_text;
- assert_url.

Use Playwright inside the isolated validation boundary.

Capture:

- screenshots;
- console failures;
- network failures;
- assertion failures.

## Backend verification

When generated applications have server functions or jobs, provide test harnesses for those runtime surfaces as well.

## Gate F9

A project that compiles but fails its required user flow or backend acceptance tests is not considered valid.

# PHASE 10 — Professional code and file editor

## Objective

Replace prototype editing surfaces with a real multi-file development environment.

## Code editor

Use Monaco or an equivalent language-capable editor with:

- syntax highlighting;
- diagnostics;
- search/replace;
- file and symbol navigation;
- rename support where available;
- keyboard shortcuts;
- dirty state;
- source diff;
- create/rename/delete.

## Files

Support:

- directories;
- upload;
- drag/drop;
- assets;
- previews;
- metadata;
- rename;
- delete;
- type and size limits.

## Diff

Approval view must show line-level additions, modifications and deletions plus base/next hashes and validation evidence.

## Gate F10

Every generated source mutation can be inspected precisely before application.

# PHASE 11 — Visual editing and design system

## Objective

Persist visual changes as source changes.

## Flow

    DOM element
      -> stable element identity
      -> source mapping
      -> file/component/range
      -> typed edit operation
      -> patch
      -> validation
      -> commit

Replace temporary contenteditable behavior with source-mapped operations.

Support:

- element selection;
- text;
- styles;
- props;
- responsive breakpoints;
- design tokens;
- component-aware editing;
- accessibility feedback;
- design guidance before build;
- governed component and template libraries;
- optional design-import pipeline with token/component mapping.

Do not weaken iframe origin isolation to make selection easier.

## Gate F11

A visual edit survives reload/export, appears in source diff, creates history and can be rolled back.

# PHASE 12 — Git provider subsystem

## Objective

Provide lossless round-trip development with external repositories.

## Provider abstraction

Support repository providers through a common interface.

Initial implementation:

- repository create/link;
- installation/OAuth model;
- branches;
- commits;
- pull requests;
- fetch/pull;
- push;
- webhooks;
- conflict detection;
- protected branch awareness.

After the first provider is stable, additional providers can reuse the abstraction.

Each Laloba branch records base generation, head generation, external ref and sync state.

## Gate F12

Laloba -> external repository -> external edit -> Laloba can round-trip without silent overwrite.

# PHASE 13 — Secrets vault

## Objective

Keep credentials out of code, prompts, logs and browser state.

## Mandatory work

- envelope encryption or managed KMS;
- workspace/project/environment scopes;
- create/use/rotate/revoke permissions;
- no-reveal by default;
- short-lived injection;
- automatic redaction;
- secret reference identifiers in generated configuration;
- audit all lifecycle events.

## Gate F13

Plaintext secrets are absent from source, model context, browser state, logs and build artifacts except inside the minimal authorized execution boundary.

# PHASE 14 — Connectors, REST integrations and MCP

## Objective

Replace local connector toggles with real delegated integration services.

## Credential classes

- builder connection;
- workspace-managed connection;
- deployed-app end-user connection.

## Mandatory work

- connector registry;
- OAuth broker;
- scopes;
- consent;
- refresh;
- revoke;
- server-side proxy;
- audit;
- rate limiting;
- custom REST connector schemas and auth policies;
- MCP registry;
- capability grants;
- timeout and size limits;
- prompt-injection boundaries;
- destination/network policy.

Tokens are never exposed directly to the model or generated frontend.

## Gate F14

Every connector call is authorized, scoped, revocable and attributable.

# PHASE 15 — Managed application backend

## Objective

Allow generated projects to be real full-stack applications.

## Provider-neutral interfaces

- DatabaseProvider;
- AuthProvider;
- StorageProvider;
- RealtimeProvider;
- FunctionProvider;
- JobProvider;
- MigrationProvider;
- AppAIGatewayProvider.

## Capabilities

- PostgreSQL;
- schema and migrations;
- application authentication;
- row-level authorization;
- object storage;
- realtime/eventing;
- server/edge functions;
- scheduled jobs;
- application logs;
- app-scoped AI access and usage limits.

Generated apps receive app-scoped credentials, never control-plane credentials.

## Database safety

Production migrations require:

- plan;
- diff;
- destructive-change detection;
- backup/snapshot;
- validation;
- explicit approval when policy requires it.

## Gate F15

A project can implement frontend, backend, database, application authentication, storage and server logic end to end without sharing Laloba credentials.

# PHASE 16 — Immutable preview environments

## Objective

Replace iframe-only preview as the final preview model.

Each preview records:

- preview id;
- project;
- generation;
- tree hash;
- artifact digest;
- URL;
- access policy;
- status;
- actor;
- expiry.

Requirements:

- immutable artifact;
- isolated URL;
- restricted secrets;
- restricted egress;
- logs;
- lifecycle and cleanup;
- private/workspace/public sharing policy.

## Gate F16

A preview URL executes exactly the artifact and tree hash registered for that preview.

# PHASE 17 — Publishing and deployment

## Objective

Build a separate server-authorized deployment control plane.

## Environments

- preview;
- staging;
- production.

## Deployment record

Stores:

- deployment id;
- environment;
- generation;
- artifact digest;
- actor;
- approver when required;
- provider;
- status;
- timestamps.

## Mandatory work

- deployment provider abstraction;
- publish approval;
- deployment credential isolation;
- rollback;
- deployment history;
- custom domains;
- DNS verification;
- TLS lifecycle;
- unpublish.

## Gate F17

Generation cannot cause production deployment automatically. Rollback reuses a previously verified artifact.

# PHASE 18 — Security Center

## Objective

Make security findings first-class product data.

## Minimum scans

- dependency vulnerabilities;
- secrets;
- SAST;
- licenses;
- unsafe configuration;
- generated browser security;
- backend authorization and data-access policy;
- RLS checks where applicable;
- exposed credentials;
- sensitive-data checks where policy requires them.

Every finding is tied to the exact tree/artifact and scanner version.

Policy examples:

- critical: block;
- high: block production;
- medium: approval required;
- low: warning.

Support bounded auto-fix only through the normal generation, validation and approval path.

## Gate F18

A production deployment references a security report for the same artifact digest.

# PHASE 19 — Supply-chain provenance

## Objective

Make every artifact reproducible and attributable.

## Mandatory work

- lockfile enforcement;
- approved registries;
- dependency allow/deny policies;
- SBOM;
- toolchain versions;
- source tree hash;
- build digest;
- signed provenance;
- artifact signatures;
- dependency and tool provenance.

## Gate F19

Laloba can demonstrate source -> dependencies -> runner -> tests -> artifact -> deployment without identity gaps.

# PHASE 20 — Workspaces and collaboration

## Objective

Replace local/demo teamwork with real collaborative state.

## Mandatory work

- invitations;
- membership lifecycle;
- groups;
- project sharing;
- comments;
- mentions;
- activity feed;
- attribution;
- presence;
- protected preview sharing;
- comments anchored to generation/file/range;
- visual comments anchored to generation/route/source-mapped element;
- project folders and search.

## Gate F20

Multiple authorized users can collaborate from different devices while preserving role enforcement and audit.

# PHASE 21 — Server-side branches and drafts

## Objective

Allow safe parallel experimentation.

Each branch records:

- branch id;
- base generation;
- head generation;
- owner;
- status.

Operations:

- create;
- compare;
- merge;
- resolve conflicts;
- archive;
- discard.

Use the same ProjectTree/patch primitives as generation and Git integration.

## Gate F21

Independent branches can diverge and merge without silent whole-project replacement.

# PHASE 22 — Knowledge, artifacts and cross-project reuse

## Objective

Turn contextual data and reusable project output into governed product capabilities.

## Mandatory work

- workspace/project knowledge sources;
- source versioning and permissions;
- uploads for supported context files;
- generated non-code files and data artifacts;
- cross-project read-only reference with explicit access control;
- provenance for retrieved context;
- lifecycle and deletion;
- size/format limits;
- prompt-injection treatment for untrusted knowledge.

## Gate F22

The agent can cite and retrieve authorized context without copying unrestricted data between workspaces or projects.

# PHASE 23 — Usage, quotas and billing

## Objective

Replace simulated credits with a shared authoritative usage ledger.

Measure:

- model input/output;
- agent runs;
- runner time;
- browser-test time;
- storage;
- bandwidth;
- previews;
- deployments;
- connector calls;
- managed backend resources;
- app AI usage.

Scopes:

- user;
- workspace;
- project.

Replace process-local rate limiting with shared Redis/PostgreSQL or equivalent enforcement.

Support:

- hard limits;
- soft warnings;
- budgets;
- abuse protection;
- billing provider adapters;
- invoices/subscription state where product policy requires them.

## Gate F23

Scaling from one to multiple application instances does not change a user's effective quota or budget.

# PHASE 24 — Observability and monitoring

## Objective

Trace platform and generated-application failures end to end.

## Laloba control plane

- structured logs;
- metrics;
- traces;
- error reporting;
- alerts;
- dashboards;
- run/runner/deployment correlation.

## Generated applications

- page/runtime errors;
- server logs;
- release health;
- performance signals;
- deployment correlation;
- scheduled synthetic monitoring;
- read-only incident diagnosis tools.

Every request should be correlatable where applicable by request, user, workspace, project, generation, runner and deployment identifiers.

## Gate F24

A production incident can be traced from deployment to artifact to generation to source change and actor.

# PHASE 25 — Accessibility, performance, responsive quality and SEO

## Objective

Make quality gates executable rather than settings-only UI.

## Accessibility

- automated WCAG-oriented checks;
- keyboard behavior;
- contrast;
- ARIA;
- form labels.

## Performance

- bundle budgets;
- page weight;
- request count;
- Core Web Vitals where measurable;
- image optimization;
- regression baselines.

## SEO

- title and description;
- canonical;
- robots;
- sitemap;
- structured data;
- social metadata;
- server-rendering/SSR-capable templates where required by project type.

## Gate F25

Quality results flow into ValidationResult and can be required by publish policy.

# PHASE 26 — Templates, components, imports and design governance

## Objective

Provide reusable, upgradeable building blocks.

## Mandatory work

- versioned project templates;
- component registry;
- workspace design tokens;
- governed design systems;
- approved dependencies;
- compatibility declarations;
- migration paths;
- template upgrades without silent modification of existing projects;
- optional design-file import pipeline;
- application remix/clone using complete source and metadata.

## Gate F26

A template or design-system update cannot silently mutate existing projects.

# PHASE 27 — Policy as Code

## Objective

Make organization rules machine-enforceable.

Policies may cover:

- dependencies;
- licenses;
- package registries;
- model providers;
- deployment providers;
- network destinations;
- connector permissions;
- data regions;
- required tests;
- security severities;
- reviewers;
- branch rules;
- secret scopes.

Evaluate policy during generation, runner execution, approval and deployment.

## Gate F27

Frontend manipulation cannot bypass organization policy.

# PHASE 28 — Enterprise identity and governance

## Objective

Support centrally managed organizations.

## Mandatory work

- SAML/OIDC SSO;
- SCIM;
- organization roles/groups;
- verified domains;
- audit export;
- retention policy;
- session policy;
- regional data placement;
- optional IP restrictions;
- sensitive-data scanning policy.

## Gate F28

Central identity provisioning and revocation is consistently enforced by every Laloba service.

# PHASE 29 — Public API and automation

## Objective

Expose Laloba capabilities without requiring the web UI.

Resources include:

- workspaces;
- projects;
- branches;
- generations;
- plans;
- runs;
- previews;
- deployments;
- connectors;
- security findings;
- audit;
- usage.

API keys must be CSPRNG-generated, displayed once, stored hashed, scoped, revocable, optionally expiring and audited.

UI and API must use the same service and authorization layer.

Also provide webhooks/event subscriptions for authorized automation.

## Gate F29

Any operation available through API is subject to the same authorization, policy and audit rules as the UI.

# PHASE 30 — Portability and export

## Objective

Avoid platform lock-in.

Complete export includes:

- source tree;
- lockfile;
- assets;
- database migrations;
- environment-variable manifest without secret values;
- backend/runtime manifest;
- build instructions;
- deployment instructions;
- provenance manifest;
- design tokens/templates needed by the project.

## Gate F30

An exported project can be built and operated independently of Laloba with documented external dependencies.

# PHASE 31 — Application trust information

## Objective

Expose machine-derived release posture for deployed applications.

Include:

- artifact digest;
- generation;
- dependency state;
- security scan summary;
- SBOM reference;
- accessibility/quality status;
- provenance;
- deployment history;
- last verified time.

Data must come from pipeline evidence, not editable UI flags.

## Gate F31

Trust information can be verified against immutable pipeline records.

# PHASE 32 — Communication, commerce and growth services

## Objective

Turn current scaffolding into optional real services after the platform trust boundary is mature.

Capabilities:

- application analytics;
- payments adapters;
- branded transactional email;
- verified sending domains;
- project/domain analytics;
- SEO quality reports;
- scheduled monitoring;
- usage and cost dashboards.

These services must use normal secret, connector, audit and policy boundaries.

## Gate F32

No commercial/growth integration bypasses secrets, connector authorization, usage accounting or deployment policy.

# PHASE 33 — Additional product surfaces

## Objective

Add distribution surfaces only after the web control plane is durable.

Possible surfaces:

- desktop client;
- mobile client;
- collaboration/chat integrations;
- Laloba tool/MCP server;
- deployed-application tool/MCP exposure.

All surfaces must call the same authenticated platform API and preserve policy/audit behavior.

## Gate F33

A new surface introduces no independent source of truth or bypass around platform authorization.

# PHASE 34 — Continuous readiness

There is no separate product "V1" gate. Laloba readiness is continuous and capability-based.

A production-capable Laloba installation must at minimum have:

- canonical source and green reproducible CI;
- ProjectTree-only authoritative source;
- server-side project/history truth;
- server-side RBAC, approvals and audit;
- durable Chat/Plan/Build orchestration;
- isolated runner;
- validation and bounded repair;
- browser acceptance testing;
- professional multi-file editor;
- immutable preview environments;
- separated deployment authorization;
- secrets vault;
- verified rollback;
- security findings tied to artifacts;
- usage enforcement;
- observability;
- complete export.

Advanced collaboration, enterprise, commercial and additional-client capabilities are additive readiness tiers, not reasons to weaken the foundational gates above.

# Mandatory execution order

    F0  Canonical repository
     ->
    F1  CI and protection
     ->
    F2  ProjectTree and history
     ->
    F3  Server-side project truth
     ->
    F4  RBAC, approvals and audit
     ->
    F5  Durable AI orchestration
     ->
    F6  Goals/subagents/skills
     ->
    F7  Isolated runner
     ->
    F8  Validation and repair
     ->
    F9  Browser/backend verification
     ->
    F10 Professional editor
     ->
    F11 Visual editing/design
     ->
    F12 Git providers
     ->
    F13 Secrets
     ->
    F14 Connectors/REST/MCP
     ->
    F15 Managed backend
     ->
    F16 Preview environments
     ->
    F17 Publishing/deployment
     ->
    F18 Security Center
     ->
    F19 Supply-chain provenance
     ->
    F20 Collaboration
     ->
    F21 Branches/drafts
     ->
    F22 Knowledge/artifacts
     ->
    F23 Usage/billing
     ->
    F24 Observability/monitoring
     ->
    F25 Accessibility/performance/SEO
     ->
    F26 Templates/imports/design governance
     ->
    F27 Policy as Code
     ->
    F28 Enterprise governance
     ->
    F29 Public API
     ->
    F30 Portability
     ->
    F31 Trust information
     ->
    F32 Commerce/growth
     ->
    F33 Additional product surfaces
     ->
    F34 Continuous readiness

Phases may have internal parallel work only when they do not violate prerequisite gates. Deployment, secrets-consuming integrations and managed backend execution must never be accelerated ahead of the runner and server-side authorization boundaries.

# Definition of Done for any feature

A feature may move to Done only when every applicable item exists:

- implementation;
- versioned types/schema;
- server-side authorization;
- persistence/migration;
- concurrency behavior;
- error handling;
- audit event;
- telemetry;
- security review;
- unit/integration/e2e tests;
- CI coverage;
- documentation;
- rollback or recovery strategy;
- backward compatibility or explicit migration;
- acceptance gate proof.

A screen is not a feature.
A toast is not a feature.
A local toggle is not a feature.
A contract without an executor is not a feature.
A browser-only implementation of multi-user state is not a feature.
A mutation without server authorization is not complete.

# Pull request contract

Every substantial pull request must state:

- phase;
- requirement being satisfied;
- existing behavior preserved;
- data-model changes;
- authorization changes;
- threat-model effect;
- tests;
- migrations;
- rollback strategy;
- acceptance-gate evidence.

Prefer small monothematic pull requests. Do not combine large refactors, new infrastructure, new UX and destructive migrations unless they are technically inseparable.

# Immediate mandatory queue

Before expanding demo panels or adding new visual surface area, complete this dependency queue:

1. normalize canonical runtime source and lockfile;
2. make GitHub Actions execute real steps and establish a green baseline;
3. finish ProjectTree migration for drafts, history, export and all source mutations;
4. add PostgreSQL workspaces/projects/generations/history;
5. move approvals and authorization server-side;
6. add append-only audit;
7. make Plan inspect current source;
8. introduce durable agent-run records and tool protocol;
9. implement the real RunnerJob executor;
10. connect ValidationResult to runner output;
11. connect bounded repair orchestration;
12. add Playwright validation in the runner;
13. replace textarea editor with a professional multi-file editor;
14. implement server-side branches/drafts;
15. implement secrets vault before any production connector/deploy credentials;
16. implement immutable preview environments;
17. implement explicit deployment authorization.

# Current risk register

## Critical

- canonical source and lockfile normalization are not yet fully proven on main;
- CI has had pre-runner failures, so green application evidence is incomplete;
- no isolated execution service exists;
- important project and approval state remains browser-side;
- no real deployment authorization service exists.

## High

- production authentication must not rely on a fallback runtime secret;
- rate limiting is process-local;
- tenant-aware persistence/RBAC is incomplete;
- no production secrets vault;
- no real security scanner service;
- connectors, cloud, payments, analytics and publish surfaces are largely scaffolding.

## Medium

- browser preview is hardened but is not an immutable hosted preview environment;
- visual editing is not source-mapped;
- drafts/comments are not yet true collaborative server state;
- code editing is still basic;
- generation remains coupled to a single upstream model route;
- export is incomplete because it does not yet produce the entire portable project bundle.

# Final engineering principle

For every production application Laloba must be able to reconstruct:

    who requested the change
    what authorized context was used
    what plan was produced
    what tools executed
    what source changed
    why each change existed
    what tests and scans ran
    what diagnostics remained
    who approved it
    what immutable artifact was built
    where it was deployed
    what usage/cost it incurred
    how it can be rolled back

If this chain cannot be reconstructed for a capability that requires it, that capability is not finished.
