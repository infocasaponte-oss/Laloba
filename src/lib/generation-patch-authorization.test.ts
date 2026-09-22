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
