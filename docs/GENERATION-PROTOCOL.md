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
