# Generation protocol v1

Build mode returns one JSON object. Markdown prose is not part of the machine contract.

```json
{
  "schemaVersion": "1",
  "summary": "Descripción breve del cambio",
  "files": [
    {
      "path": "index.html",
      "content": "<!doctype html>..."
    }
  ]
}
```

The v1 protocol deliberately permits only `index.html`. This is a migration boundary: it gives Laloba a structured, validated response today without pretending the current runtime can safely build arbitrary projects.

The client validates the JSON schema and then validates the generated HTML before replacing project state. Unknown fields, paths or malformed HTML are rejected.

Future protocol versions can add multiple files only after path confinement, dependency policy, provenance hashes and isolated build execution are implemented.


## Protocol v2 — staged Milestone A contract

Protocol v2 introduces a bounded multi-file result and conflict-safe patch flow. It is not yet the editor's canonical runtime source of truth, but its generation, artifact, snapshot and approval invariants are implemented and gated by tests.

Safety invariants:

- at most 80 files;
- at most 2 MB for the final executable project artifact, not merely the patch payload;
- POSIX-relative paths only;
- no absolute, Windows-drive, empty, dot or parent segments;
- no hidden files;
- no duplicate normalized paths;
- a required `index.html` entrypoint;
- `index.html` must pass the generated-HTML safety validator;
- per-file limits are enforced in encoded bytes, including multibyte Unicode;
- patches are rejected if their final tree removes or invalidates the executable entrypoint or exceeds final artifact limits;
- approved snapshots require a canonical `treeSha256` binding paths to content hashes;
- no dependency installation or shell execution implied by generated files.

Editor activation still requires canonical runtime source normalization plus an isolated build runner. Until those integration boundaries exist, v1 remains the active editor execution contract and v2 remains the hardened target contract.


## Editor integration status — 2026-09-22

The live editor now uses `ProjectTree v2` as its canonical in-memory source model while retaining `project.html` and `project.files` only as compatibility projections.

Build behavior is split deliberately:

- the first autostart generation still uses the strict v1 full-document result for compatibility;
- subsequent build requests use the v2 patch contract;
- patch requests carry the current validated project files as untrusted context;
- the server computes SHA-256 hashes for the base files and instructs the model to copy exact hashes into update/delete operations;
- the client parses the response with `parseGenerationPatch`;
- `preparePatchAuthorization` binds the proposal to the complete base tree;
- approval UI lists every create/update/delete operation;
- `authorizePatch` rejects stale/tampered proposals and produces a coherent snapshot + manifest;
- the approved generation ID becomes the project's `currentGenerationId`.

The autostart path also reuses the already persisted initial user message instead of appending it a second time.

Remaining protocol migration work: promote initial creation from v1 to `GenerationResultV2`, then remove the v1 generation contract after migration compatibility is no longer needed.


### Verified approval change sets

Patch approval now derives a deterministic `ProjectChangeSet` from the validated base and candidate trees before showing the approval dialog. The change set contains only paths, operation type, byte counts and SHA-256 identities; generated file contents are not duplicated into approval metadata. The dialog displays the actual validated create/update/delete delta plus shortened base/next tree identities.

This separates three concerns explicitly:

1. the model proposes a patch;
2. Laloba computes and displays the resulting verified tree delta;
3. authorization re-checks the original base tree before commit.

Remix and draft capture also read their source from `ProjectTree` rather than the legacy `project.html/files` projections.
