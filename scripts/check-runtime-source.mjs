import { access } from "node:fs/promises";

const required=[
 "src/lib/catalog.ts",
 "src/lib/store.ts",
 "src/lib/types.ts",
 "src/lib/html-apps.ts",
 "src/lib/stream-chat.ts",
 "src/lib/utils.ts",
];

const missing=[];
for(const path of required){
 try{await access(path)}catch{missing.push(path)}
}

if(missing.length){
 console.error("Canonical runtime source is incomplete.");
 for(const path of missing)console.error(`- missing: ${path}`);
 console.error("Import the authoritative source files; do not reconstruct them from unauthenticated transfer fragments.");
 process.exit(1);
}
console.log("Canonical runtime source is present.");
