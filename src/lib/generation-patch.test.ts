import assert from "node:assert/strict";
import test from "node:test";
import { applyGenerationPatch, generationPatchSha256, parseGenerationPatch } from "./generation-patch.ts";
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

test("rejects delete of a missing file",async()=>{
 const patch={schemaVersion:"2" as const,summary:"x",operations:[{op:"delete" as const,path:"src/missing.ts",baseSha256:await sha256("old")}]};
 await assert.rejects(()=>applyGenerationPatch([],patch),/no longer exists/);
});

test("does not mutate the input when a later operation conflicts",async()=>{
 const input=[{path:"src/a.ts",content:"a"},{path:"src/b.ts",content:"b"}];
 const before=structuredClone(input);
 const patch={schemaVersion:"2" as const,summary:"x",operations:[
  {op:"update" as const,path:"src/a.ts",baseSha256:await sha256("a"),content:"changed"},
  {op:"update" as const,path:"src/b.ts",baseSha256:await sha256("stale"),content:"never"},
 ]};
 await assert.rejects(()=>applyGenerationPatch(input,patch),/changed after generation/);
 assert.deepEqual(input,before);
});

test("rejects malformed hashes and oversized aggregate patch content",()=>{
 const malformed=parseGenerationPatch(JSON.stringify({schemaVersion:"2",summary:"x",operations:[{op:"delete",path:"src/a.ts",baseSha256:"nope"}]}));
 assert.equal(malformed.ok,false);
 const content="x".repeat(400_001);
 const operations=Array.from({length:5},(_,i)=>({op:"create",path:`src/file-${i}.txt`,content}));
 assert.equal(parseGenerationPatch(JSON.stringify({schemaVersion:"2",summary:"x",operations})).ok,false);
});

test("rejects unsafe or duplicate paths already present in the base tree",async()=>{
 const patch={schemaVersion:"2" as const,summary:"x",operations:[{op:"create" as const,path:"src/new.ts",content:"new"}]};
 await assert.rejects(()=>applyGenerationPatch([{path:"../secret",content:"x"}],patch));
 await assert.rejects(()=>applyGenerationPatch([{path:"src/a.ts",content:"1"},{path:"src/a.ts",content:"2"}],patch),/Duplicate project path/);
});

test("canonical patch fingerprint is stable across operation and object key ordering",async()=>{
 const h=await sha256("old");
 const a={schemaVersion:"2" as const,summary:"fix",operations:[
  {op:"update" as const,path:"src/b.ts",baseSha256:h,content:"b"},
  {op:"create" as const,path:"src/a.ts",content:"a"},
 ]};
 const b={summary:"fix",operations:[
  {content:"a",path:"src/a.ts",op:"create" as const},
  {content:"b",baseSha256:h,path:"src/b.ts",op:"update" as const},
 ],schemaVersion:"2" as const};
 assert.equal(await generationPatchSha256(a),await generationPatchSha256(b));
});

test("canonical patch fingerprint changes when authorized content changes",async()=>{
 const a={schemaVersion:"2" as const,summary:"fix",operations:[{op:"create" as const,path:"src/a.ts",content:"a"}]};
 const b={schemaVersion:"2" as const,summary:"fix",operations:[{op:"create" as const,path:"src/a.ts",content:"b"}]};
 assert.notEqual(await generationPatchSha256(a),await generationPatchSha256(b));
});
