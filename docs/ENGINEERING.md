# Laloba Engineering Baseline

## Target architecture

Laloba should separate the product into explicit trust boundaries:

1. **Specification** — converts user intent into a validated application specification.
2. **Planning** — produces a deterministic build plan from that specification.
3. **Generation** — renders files from approved primitives/templates.
4. **Validation** — checks paths, manifests, dependency policy and generated source.
5. **Execution** — builds/tests generated applications only inside an isolated sandbox.
6. **Artifact** — exports a reproducible project bundle and provenance metadata.
7. **Deployment** — optional and separately authorized; never implicit in generation.

A generated application should be representable by a versioned schema rather than depending on free-form model output.

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

## Generator contract

Each generation run should have:

- a unique run ID;
- schema version;
- normalized app specification;
- deterministic plan;
- generated-file manifest with hashes;
- dependency manifest;
- validation result;
- build/test result;
- timestamps and tool/runtime versions.

This makes failures debuggable and generated applications reproducible.

## Quality gates

The default branch should require:

- formatting;
- lint;
- static/type checks;
- unit tests;
- generator golden/snapshot tests;
- security-oriented path/input tests;
- build;
- dependency review for pull requests.

## Repository normalization

The Base64 transfer payload under `.laloba-transfer/` is temporary. Restore and review the source before treating the repository as production-ready. Once the source tree has been committed normally, remove the transfer payload in a dedicated cleanup change.
