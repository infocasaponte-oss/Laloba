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
 "src/lib/catalog.ts",
 "src/lib/store.ts",
 "src/lib/types.ts",
 "src/lib/html-apps.ts",
 "src/lib/stream-chat.ts",
 "src/lib/utils.ts",
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
