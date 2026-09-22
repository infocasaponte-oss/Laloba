import assert from "node:assert/strict";
import test from "node:test";
import { authorizePatch,preparePatchAuthorization } from "./generation-patch-authorization.ts";
import { sha256 } from "./project-files.ts";

const html="<!doctype html><html><body>ok</body></html>";
const baseFiles=()=>[
 {path:"index.html",content:html},
 {path:"src/app.ts",content:"old"},
 {path:"src/keep.ts",content:"keep"},
];

test("authorizes a patch against the exact project tree",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_1","p1","fix",patch,base);
 const applied=await authorizePatch(pending,"p1",base);
 assert.equal(applied.files.find(f=>f.path==="src/app.ts")?.content,"new");
 assert.equal(applied.snapshot.files.length,3);
 assert.equal(applied.snapshot.treeSha256,applied.manifest.treeSha256);
 assert.equal(applied.snapshot.createdAt,applied.manifest.generatedAt);
});

test("rejects approval if any file in the base tree changed",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_2","p1","fix",patch,base);
 const changed=base.map(file=>file.path==="src/keep.ts"?{...file,content:"edited"}:file);
 await assert.rejects(()=>authorizePatch(pending,"p1",changed),/tree changed/);
});

test("rejects a patch authorization used on another project",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_3","p1","fix",patch,base);
 await assert.rejects(()=>authorizePatch(pending,"p2",base),/another project/);
});

test("rejects tampering with a prepared patch",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await preparePatchAuthorization("generation_patch_4","p1","fix",patch,base,now);
 pending.patch.operations[0]={...pending.patch.operations[0],content:"tampered"} as typeof pending.patch.operations[0];
 await assert.rejects(()=>authorizePatch(pending,"p1",base,now),/payload changed/);
});

test("rejects expired or future-dated authorizations",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_5","p1","fix",patch,base,new Date("2026-01-01T00:00:00.000Z"));
 await assert.rejects(()=>authorizePatch(pending,"p1",base,new Date("2026-01-01T00:11:00.000Z")),/expired/);
 await assert.rejects(()=>authorizePatch(pending,"p1",base,new Date("2025-12-31T23:59:59.000Z")),/expired/);
});

test("rejects malformed generation ids before preparing patch approval",async()=>{
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 await assert.rejects(()=>preparePatchAuthorization("bad","p1","fix",patch,baseFiles()),/Invalid generation id/);
});

test("rejects invalid project ids before preparing patch approval",async()=>{
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 await assert.rejects(()=>preparePatchAuthorization("generation_patch_6","../project","fix",patch,baseFiles()),/Invalid project id/);
});

test("rejects patches that remove the executable entrypoint",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"remove entrypoint",operations:[{op:"delete" as const,path:"index.html",baseSha256:await sha256(html)}]};
 await assert.rejects(()=>preparePatchAuthorization("generation_patch_7","p1","remove",patch,base),/index\.html/);
});

test("rejects patches that make the entrypoint unsafe",async()=>{
 const base=baseFiles();
 const unsafe="<!doctype html><html><body><iframe></iframe></body></html>";
 const patch={schemaVersion:"2" as const,summary:"unsafe",operations:[{op:"update" as const,path:"index.html",baseSha256:await sha256(html),content:unsafe}]};
 await assert.rejects(()=>preparePatchAuthorization("generation_patch_8","p1","unsafe",patch,base),/invalid project/i);
});

test("rejects patches whose final project exceeds the artifact size limit",async()=>{
 const large="x".repeat(400_000);
 const base=[
  {path:"index.html",content:html},
  {path:"src/a.txt",content:large},
  {path:"src/b.txt",content:large},
  {path:"src/c.txt",content:large},
  {path:"src/d.txt",content:large},
 ];
 const patch={schemaVersion:"2" as const,summary:"too large",operations:[{op:"create" as const,path:"src/e.txt",content:"x".repeat(450_000)}]};
 await assert.rejects(()=>preparePatchAuthorization("generation_patch_9","p1","grow",patch,base),/tamaño total/i);
});

test("rejects mutation of patch approval metadata after preparation",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await preparePatchAuthorization("generation_patch_10","p1","fix",patch,base,now);
 pending.preparedAt="2026-01-01T00:05:00.000Z";
 await assert.rejects(()=>authorizePatch(pending,"p1",base,now),/envelope changed/);
});

test("rejects rebinding a prepared patch approval to another valid project",async()=>{
 const base=baseFiles();
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await preparePatchAuthorization("generation_patch_11","p1","fix",patch,base,now);
 pending.projectId="p2";
 await assert.rejects(()=>authorizePatch(pending,"p2",base,now),/envelope changed/);
});
