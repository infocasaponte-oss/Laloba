import { access } from "node:fs/promises";

const required=[
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
 "scripts/restore-canonical-lockfile.mjs",
];

const missing=[];
for(const file of required){
 try{await access(file)}catch{missing.push(file)}
}

if(missing.length){
 console.error("Canonical runtime source is incomplete.");
 for(const file of missing)console.error(`- missing: ${file}`);
 console.error("Restore the authoritative workspace source; do not invent replacements.");
 process.exit(1);
}

console.log(`Canonical runtime source gate passed (${required.length} required files).`);
