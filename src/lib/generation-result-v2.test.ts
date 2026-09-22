import assert from "node:assert/strict";
import test from "node:test";
import { generationResultV2Sha256,parseGenerationResultV2 } from "./generation-result-v2.ts";

test("parses a strict multi-file generation result",()=>{
 const parsed=parseGenerationResultV2(JSON.stringify({
  schemaVersion:"2",
  summary:"app",
  files:[
   {path:"index.html",content:"<!doctype html><html></html>"},
   {path:"src/app.ts",content:"export default 1"},
  ],
 }));
 assert.equal(parsed.ok,true);
 if(parsed.ok)assert.equal(parsed.result.files.length,2);
});

test("rejects wrappers, unsafe paths and duplicate paths",()=>{
 assert.equal(parseGenerationResultV2('{"schemaVersion":"2","summary":"x","files":[] } trailing').ok,false);
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files:[{path:"../secret",content:"x"}]})).ok,false);
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files:[{path:"src/a.ts",content:"1"},{path:"src/a.ts",content:"2"}]})).ok,false);
});

test("enforces aggregate generation size",()=>{
 const content="x".repeat(500_000);
 const files=Array.from({length:5},(_,i)=>({path:`src/file-${i}.txt`,content}));
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files})).ok,false);
});

test("requires a safe executable entrypoint",()=>{
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files:[{path:"src/app.ts",content:"export default 1"}]})).ok,false);
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files:[{path:"index.html",content:"<!doctype html><html><iframe></iframe></html>"}]})).ok,false);
});

test("enforces per-file byte limits for multibyte generated files",()=>{
 const files=[
  {path:"index.html",content:"<!doctype html><html></html>"},
  {path:"src/data.txt",content:"€".repeat(200_000)},
 ];
 assert.equal(parseGenerationResultV2(JSON.stringify({schemaVersion:"2",summary:"x",files})).ok,false);
});


test("v2 fingerprint is deterministic across file ordering and binds content",async()=>{
 const a={schemaVersion:"2" as const,summary:"app",files:[
  {path:"src/app.ts",content:"export default 1"},
  {path:"index.html",content:"<!doctype html><html><body>a</body></html>"},
 ]};
 const b={...a,files:[...a.files].reverse()};
 assert.equal(await generationResultV2Sha256(a),await generationResultV2Sha256(b));
 const changed={...a,files:a.files.map((file)=>file.path==="src/app.ts"?{...file,content:"export default 2"}:file)};
 assert.notEqual(await generationResultV2Sha256(a),await generationResultV2Sha256(changed));
});
