import assert from "node:assert/strict";
import test from "node:test";
import { validateProjectArtifact } from "./project-artifact.ts";

const html="<!doctype html><html><body>ok</body></html>";

test("accepts and canonicalizes an executable multi-file artifact",()=>{
 const result=validateProjectArtifact([{path:"src/z.ts",content:"z"},{path:"index.html",content:"  "+html+"  "}]);
 assert.equal(result.ok,true);
 if(result.ok){
  assert.deepEqual(result.files.map(file=>file.path),["index.html","src/z.ts"]);
  assert.equal(result.files[0].content,html);
 }
});

test("requires a valid safe index.html entrypoint",()=>{
 assert.equal(validateProjectArtifact([{path:"src/app.ts",content:"x"}]).ok,false);
 assert.equal(validateProjectArtifact([{path:"index.html",content:"<!doctype html><html><iframe></iframe></html>"}]).ok,false);
});

test("enforces per-file byte limits for multibyte content",()=>{
 const multibyte="€".repeat(200_000);
 const result=validateProjectArtifact([{path:"index.html",content:html},{path:"src/data.txt",content:multibyte}]);
 assert.equal(result.ok,false);
});

test("enforces final project total bytes",()=>{
 const chunk="x".repeat(400_000);
 const result=validateProjectArtifact([
  {path:"index.html",content:html},
  {path:"src/a.txt",content:chunk},
  {path:"src/b.txt",content:chunk},
  {path:"src/c.txt",content:chunk},
  {path:"src/d.txt",content:chunk},
  {path:"src/e.txt",content:chunk},
 ]);
 assert.equal(result.ok,false);
});
