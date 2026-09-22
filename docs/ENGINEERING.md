# Laloba Engineering Baseline

## Target architecture

Laloba separates the product into explicit trust boundaries:

1. **Specification** — converts user intent into a validated application specification.
2. **Planning** — produces an explicit build plan from that specification and authorized project context.
3. **Generation** — proposes source changes through versioned contracts.
4. **Validation** — checks paths, manifests, dependency policy and generated source.
5. **Execution** — builds/tests generated applications only inside an isolated sandbox.
6. **Artifact** — produces a reproducible project bundle and provenance metadata.
7. **Deployment** — is optional and separately authorized; never implicit in generation.

A generated application must be representable by versioned schemas rather than depending on free-form model output.

## Security invariants

- Generated paths are normalized and constrained to the project root.
- No arbitrary shell command is accepted from model/user output.
- Execution receives an explicit environment allowlist, not the host environment.
- Network access is denied by default in execution sandboxes.
- Resource and wall-clock limits are mandatory.
- Workspace cleanup occurs on success, failure and cancellation.
- Archive extraction rejects absolute paths, `..` traversal and unsafe links.
- Logs redact known secret patterns and never serialize complete environments.
- Deployment credentials are unavailable during generation/build/test.
- Browser state is not an authorization source of truth.
- Approval and publish are separate permissions and records.

## Generator contract

Each generation run should have:

- a unique run ID;
- schema version;
- normalized application intent/specification;
- plan;
- generated-file manifest with hashes;
- dependency manifest;
- validation result;
- build/test result;
- timestamps and tool/runtime versions.

This makes failures debuggable and generated applications reproducible.

## Quality gates

The default branch should require:

- canonical repository verification;
- formatting check;
- lint;
- static/type checks;
- unit tests;
- generator/security tests;
- build;
- dependency review where repository capabilities allow it.

## Repository normalization

Repository normalization is complete when all canonical application source and the authoritative `package-lock.json` are ordinary tracked files and no transfer/recovery payload is required by development or CI.

The canonical lockfile is verified by SHA-256 in `scripts/check-runtime-source.mjs`. Historical transfer fragments must not be reintroduced.

## Required application gates

CI runs these gates from a clean checkout:

1. `npm run check:runtime-source`
2. `npm ci`
3. `npm run format:check`
4. `npm run lint`
5. `npm run typecheck`
6. `npm run test:generator`
7. `npm test`
8. `npm run build:dev`

The focused generator suite is intentionally separate: failures in generation contracts, path confinement, preview isolation, rate limiting, snapshot integrity or generated HTML validation block changes even when unrelated application tests pass.

GitHub-hosted runner availability is infrastructure, not an application assertion. A workflow that never receives a runner must not be reported as a Laloba test failure.

## GitHub Actions failure classification

Treat a workflow conclusion of `failure` as an application failure only after at least one job step actually starts.

A run is classified as a **pre-runner / Actions infrastructure failure** when all of the following are true:

- GitHub creates the expected jobs;
- the jobs finish as `failure`;
- the jobs expose zero steps;
- job logs are unavailable / return a missing log blob;
- no checkout, shell command, Node command, test or build step ran.

Once a runner is allocated, the workflow fails closed: canonical repository verification must pass before dependency installation, tests or build.
