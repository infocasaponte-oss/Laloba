import assert from "node:assert/strict";
import test from "node:test";
import { preparePatchAuthorization,authorizePatch } from "./generation-patch-authorization.ts";
import { sha256 } from "./project-files.ts";

test("authorizes a patch against the exact project tree",async()=>{
 const base=[{path:"src/app.ts",content:"old"},{path:"src/keep.ts",content:"keep"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_1","p1","fix",patch,base);
 const applied=await authorizePatch(pending,"p1",base);
 assert.equal(applied.files.find(f=>f.path==="src/app.ts")?.content,"new");
 assert.equal(applied.snapshot.files.length,2);
});

test("rejects approval if any file in the base tree changed",async()=>{
 const base=[{path:"src/app.ts",content:"old"},{path:"src/keep.ts",content:"keep"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_2","p1","fix",patch,base);
 await assert.rejects(()=>authorizePatch(pending,"p1",[{path:"src/app.ts",content:"old"},{path:"src/keep.ts",content:"edited"}]),/tree changed/);
});

test("rejects a patch authorization used on another project",async()=>{
 const base=[{path:"src/app.ts",content:"old"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_3","p1","fix",patch,base);
 await assert.rejects(()=>authorizePatch(pending,"p2",base),/another project/);
});

test("rejects tampering with a prepared patch",async()=>{
 const base=[{path:"src/app.ts",content:"old"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const now=new Date("2026-01-01T00:00:00.000Z");
 const pending=await preparePatchAuthorization("generation_patch_4","p1","fix",patch,base,now);
 pending.patch.operations[0]={...pending.patch.operations[0],content:"tampered"} as typeof pending.patch.operations[0];
 await assert.rejects(()=>authorizePatch(pending,"p1",base,now),/payload changed/);
});

test("rejects expired or future-dated authorizations",async()=>{
 const base=[{path:"src/app.ts",content:"old"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 const pending=await preparePatchAuthorization("generation_patch_5","p1","fix",patch,base,new Date("2026-01-01T00:00:00.000Z"));
 await assert.rejects(()=>authorizePatch(pending,"p1",base,new Date("2026-01-01T00:11:00.000Z")),/expired/);
 await assert.rejects(()=>authorizePatch(pending,"p1",base,new Date("2025-12-31T23:59:59.000Z")),/expired/);
});

test("rejects malformed generation ids before preparing patch approval",async()=>{
 const base=[{path:"src/app.ts",content:"old"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 await assert.rejects(()=>preparePatchAuthorization("bad","p1","fix",patch,base),/Invalid generation id/);
});


test("rejects invalid project ids before preparing patch approval",async()=>{
 const base=[{path:"src/app.ts",content:"old"}];
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 await assert.rejects(()=>preparePatchAuthorization("generation_patch_6","../project","fix",patch,base),/Invalid project id/);
});
