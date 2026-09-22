import assert from "node:assert/strict";
import test from "node:test";
import { createGenerationManifest } from "./generation-manifest.ts";
import { sha256 } from "./project-files.ts";

const html="<!doctype html><html><body>abc</body></html>";

test("creates deterministic file and tree hashes",async()=>{
 const result={schemaVersion:"1" as const,summary:"x",files:[{path:"index.html" as const,content:html}]};
 const manifest=await createGenerationManifest("generation_1234",result,"2026-01-01T00:00:00.000Z");
 assert.equal(manifest.schemaVersion,"2");
 assert.equal(manifest.generationId,"generation_1234");
 assert.equal(manifest.files[0].bytes,new TextEncoder().encode(html).byteLength);
 assert.equal(manifest.files[0].sha256,await sha256(html));
 assert.match(manifest.treeSha256,/^[a-f0-9]{64}$/);
});

test("manifest is deterministic regardless of source file ordering",async()=>{
 const a={schemaVersion:"2" as const,summary:"x",files:[
  {path:"src/b.ts",content:"b"},
  {path:"index.html",content:html},
  {path:"src/a.ts",content:"a"},
 ]};
 const b={...a,files:[...a.files].reverse()};
 const ma=await createGenerationManifest("generation_5678",a,"2026-01-01T00:00:00.000Z");
 const mb=await createGenerationManifest("generation_5678",b,"2026-01-01T00:00:00.000Z");
 assert.equal(ma.treeSha256,mb.treeSha256);
 assert.deepEqual(ma.files,mb.files);
});

test("rejects invalid generation identities and non-executable artifacts",async()=>{
 const valid={schemaVersion:"1" as const,summary:"x",files:[{path:"index.html" as const,content:html}]};
 await assert.rejects(()=>createGenerationManifest("bad",valid),/Invalid generation id/);
 const invalid={schemaVersion:"2" as const,summary:"x",files:[{path:"src/app.ts",content:"export default 1"}]};
 await assert.rejects(()=>createGenerationManifest("generation_9999",invalid),/Invalid generation artifact/);
});
