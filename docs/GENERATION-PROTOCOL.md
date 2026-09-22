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
