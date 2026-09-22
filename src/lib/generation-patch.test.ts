import assert from "node:assert/strict";
import test from "node:test";
import { applyGenerationPatch, parseGenerationPatch } from "./generation-patch.ts";
import { sha256 } from "./project-files.ts";

test("applies create update and delete operations",async()=>{
 const old="old"; const removable="remove";
 const patch={schemaVersion:"2" as const,summary:"multi-file fix",operations:[
  {op:"update" as const,path:"src/app.ts",baseSha256:await sha256(old),content:"new"},
  {op:"delete" as const,path:"src/old.ts",baseSha256:await sha256(removable)},
  {op:"create" as const,path:"src/new.ts",content:"created"},
 ]};
 const files=await applyGenerationPatch([{path:"src/app.ts",content:old},{path:"src/old.ts",content:removable}],patch);
 assert.deepEqual(files,[{path:"src/app.ts",content:"new"},{path:"src/new.ts",content:"created"}]);
});

test("rejects stale update hashes",async()=>{
 const patch={schemaVersion:"2" as const,summary:"fix",operations:[{op:"update" as const,path:"src/app.ts",baseSha256:await sha256("old"),content:"new"}]};
 await assert.rejects(()=>applyGenerationPatch([{path:"src/app.ts",content:"edited"}],patch),/changed after generation/);
});

test("rejects duplicate operations and unsafe paths",()=>{
 assert.equal(parseGenerationPatch(JSON.stringify({schemaVersion:"2",summary:"x",operations:[{op:"create",path:"src/a.ts",content:"1"},{op:"delete",path:"src/a.ts",baseSha256:"a".repeat(64)}]})).ok,false);
 assert.equal(parseGenerationPatch(JSON.stringify({schemaVersion:"2",summary:"x",operations:[{op:"create",path:"../secret",content:"x"}]})).ok,false);
});

test("rejects create over an existing file",async()=>{
 const patch={schemaVersion:"2" as const,summary:"x",operations:[{op:"create" as const,path:"src/app.ts",content:"new"}]};
 await assert.rejects(()=>applyGenerationPatch([{path:"src/app.ts",content:"old"}],patch),/already exists/);
});
