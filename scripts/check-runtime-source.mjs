import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const EXPECTED_LOCK_SHA256 =
  "fc81314ce9ca4b6be0300e35a223455005daf314253a131134bf089a5b2ba4af";

const required = [
  "package.json",
  "package-lock.json",
  "src/router.tsx",
  "src/routeTree.gen.ts",
  "src/routes/__root.tsx",
  "src/routes/index.tsx",
  "src/routes/connectors.tsx",
  "src/routes/inbox.tsx",
  "src/routes/settings.tsx",
  "src/routes/templates.tsx",
  "src/routes/projects.$id.tsx",
  "src/routes/api/chat.ts",
  "src/styles.css",
  "src/components/app-shell.tsx",
  "src/components/command-palette.tsx",
  "src/components/preview-host-bridge.tsx",
  "src/components/theme-sync.tsx",
  "src/components/project-card.tsx",
  "src/components/prompt-box.tsx",
  "src/components/logo.tsx",
  "src/components/editor/chat-panel.tsx",
  "src/components/editor/code-pane.tsx",
  "src/components/editor/files-pane.tsx",
  "src/components/editor/more-panel.tsx",
  "src/components/editor/preview-pane.tsx",
  "src/components/ui/button.tsx",
  "src/components/ui/dialog.tsx",
  "src/components/ui/dropdown.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/sheet.tsx",
  "src/components/ui/switch.tsx",
  "src/components/ui/tabs.tsx",
  "src/components/ui/tooltip.tsx",
  "src/lib/auth/provider.tsx",
  "src/lib/auth/identity-config.server.ts",
  "src/lib/app-data/types.ts",
  "src/lib/preview-host-bridge.ts",
  "src/lib/preview-embedder-origin.ts",
  "src/lib/catalog.ts",
  "src/lib/store.ts",
  "src/lib/types.ts",
  "src/lib/html-apps.ts",
  "src/lib/stream-chat.ts",
  "src/lib/utils.ts",
  "src/lib/db.ts",
  "src/lib/auth/auth-config.server.ts",
  "src/lib/auth/pglite-dialect.ts",
  "src/lib/auth/popup.server.ts",
  "src/lib/app-data/client.server.ts",
  "src/lib/app-data/login.ts",
  "src/lib/app-data/errors.ts",
  "src/lib/app-data/readiness-schedule.ts",
  "src/lib/app-data/server-only.ts",
  "src/lib/auth/isolation.server.ts",
  "src/lib/auth/sign-in-gate.ts",
  ".grok/app-env.json",
  "migrations/auth/0001_auth.sql",
  "scripts/with-app-env.mjs",
  "scripts/migrate.mjs",
];

const forbiddenLegacyPaths = [
  ".laloba-transfer",
  ".canonical-source",
  "scripts/restore-source.sh",
  "scripts/restore-canonical-lockfile.mjs",
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const missing = [];
for (const file of required) {
  if (!(await exists(file))) missing.push(file);
}

if (missing.length) {
  console.error("Canonical repository source is incomplete.");
  for (const file of missing) console.error(`- missing: ${file}`);
  process.exit(1);
}

const legacy = [];
for (const path of forbiddenLegacyPaths) {
  if (await exists(path)) legacy.push(path);
}
if (legacy.length) {
  console.error("Legacy source-transfer paths must not remain in the normalized repository.");
  for (const path of legacy) console.error(`- legacy: ${path}`);
  process.exit(1);
}

const lock = await readFile("package-lock.json");
const lockSha = createHash("sha256").update(lock).digest("hex");
if (lockSha !== EXPECTED_LOCK_SHA256) {
  console.error(
    `Canonical package-lock.json SHA-256 mismatch: ${lockSha} (expected ${EXPECTED_LOCK_SHA256})`,
  );
  process.exit(1);
}

const parsedLock = JSON.parse(lock.toString("utf8"));
if (parsedLock?.name !== "app-builder-workspace" || parsedLock?.lockfileVersion !== 3) {
  console.error("Canonical package-lock.json metadata is invalid.");
  process.exit(1);
}

const pkg = JSON.parse(await readFile("package.json", "utf8"));
if (pkg?.name !== parsedLock.name) {
  console.error("package.json and package-lock.json package names do not match.");
  process.exit(1);
}

console.log(
  `Canonical repository gate passed (${required.length} required files, lock SHA-256 ${lockSha}).`,
);
