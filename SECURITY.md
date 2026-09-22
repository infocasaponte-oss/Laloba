# Security Policy

## Reporting

Do not publish credentials, tokens, private keys, customer data or exploitable security details in public issues. Report sensitive findings privately to the repository maintainers.

## Security baseline

Laloba generates software, so generated content and generated code are untrusted by default.

- Never expose platform secrets to generated applications.
- Never execute generated code directly on the host.
- Use isolated, disposable execution environments with explicit CPU, memory, process, filesystem and network limits.
- Deny outbound network access by default and allowlist only required destinations.
- Validate project names, paths, templates, URLs and structured model output before use.
- Prevent path traversal and symlink escapes during generation and archive extraction.
- Pin dependencies and use lockfiles.
- Keep credentials out of Git history and logs.
- Apply least privilege to CI/CD tokens and deployment credentials.
- Treat prompts, uploaded files, templates and generated artifacts as untrusted input.

## Supported versions

Until the first stable release, security fixes target the current default branch.
