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


## Protocol v2 — staged, not active

Protocol v2 introduces a bounded multi-file result. It is intentionally not wired to execution yet.

Safety invariants:

- at most 80 files;
- at most 2 MB of generated text in total;
- POSIX-relative paths only;
- no absolute, Windows-drive, empty, dot or parent segments;
- no hidden files;
- no duplicate normalized paths;
- no dependency installation or shell execution implied by generated files.

Activation requires a project-files persistence model, provenance for every file and an isolated build runner. Until those exist, v1 remains the active execution contract.
