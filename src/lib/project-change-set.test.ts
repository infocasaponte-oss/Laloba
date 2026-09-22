import assert from "node:assert/strict";
import test from "node:test";
import { createProjectChangeSet } from "./project-change-set.ts";

const html=(body:string)=>`<!doctype html><html><body>${body}</body></html>`;

test("describes create update and delete without embedding file contents",async()=>{
 const changeSet=await createProjectChangeSet(
  [{path:"index.html",content:html("old")},{path:"src/remove.ts",content:"old"}],
  [{path:"index.html",content:html("new")},{path:"src/add.ts",content:"new"}],
 );
 assert.deepEqual(changeSet.changes.map((change)=>[change.op,change.path]),[
  ["update","index.html"],
  ["create","src/add.ts"],
  ["delete","src/remove.ts"],
 ]);
 assert.equal(JSON.stringify(changeSet).includes(html("new")),false);
 assert.match(changeSet.baseTreeSha256,/^[a-f0-9]{64}$/);
 assert.match(changeSet.nextTreeSha256,/^[a-f0-9]{64}$/);
 assert.notEqual(changeSet.baseTreeSha256,changeSet.nextTreeSha256);
});

test("is deterministic regardless of source file ordering",async()=>{
 const base=[{path:"index.html",content:html("old")},{path:"src/a.ts",content:"a"}];
 const next=[{path:"index.html",content:html("new")},{path:"src/a.ts",content:"b"}];
 assert.deepEqual(
  await createProjectChangeSet(base,next),
  await createProjectChangeSet([...base].reverse(),[...next].reverse()),
 );
});

test("reports no changes for identical project trees",async()=>{
 const files=[{path:"index.html",content:html("same")}];
 const changeSet=await createProjectChangeSet(files,files);
 assert.deepEqual(changeSet.changes,[]);
 assert.equal(changeSet.baseTreeSha256,changeSet.nextTreeSha256);
});

test("rejects invalid artifacts on either side",async()=>{
 await assert.rejects(()=>createProjectChangeSet([{path:"../secret",content:"x"}],[{path:"index.html",content:html("ok")}]),/Invalid base project/);
 await assert.rejects(()=>createProjectChangeSet([{path:"index.html",content:html("ok")}],[{path:"src/app.ts",content:"x"}]),/Invalid next project/);
});
