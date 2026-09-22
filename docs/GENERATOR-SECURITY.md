# Generator trust boundaries

Laloba treats every model response, project knowledge field, existing generated document and user prompt as untrusted input.

## API boundary

The generation endpoint must:

- validate the request with a closed schema;
- cap request, message, context and generated-output sizes;
- retain only a bounded conversation window;
- never return upstream provider response bodies to the browser;
- enforce an upstream timeout;
- keep provider credentials server-only;
- mark contextual knowledge and existing generated code as data, not instructions.

## Preview boundary

Generated HTML is not application code trusted by Laloba. Before persistence it must pass generated-document validation. Preview execution must use a sandboxed iframe without same-origin privileges and without referrer leakage.

## Next boundary

The current HTML-document generator is an intermediate architecture. The target generator emits a versioned application specification and a deterministic file plan before producing files. Execution/build steps happen in a disposable sandbox and deployment requires separate authorization.
