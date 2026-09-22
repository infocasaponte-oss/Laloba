import assert from "node:assert/strict";
import test from "node:test";
import { entrypointHtml,projectTreeFromGeneration,replaceProjectTreeGeneration,snapshotProjectTree } from "./project-tree.ts";

test("promotes a v2 generation into a deterministic project tree",async()=>{
 const tree=projectTreeFromGeneration("generation_tree_1",{schemaVersion:"2",summary:"app",files:[
  {path:"src/app.ts",content:"export default 1"},
  {path:"index.html",content:"<!doctype html><html></html>"},
 ]});
 assert.deepEqual(tree.files.map(f=>f.path),["index.html","src/app.ts"]);
 assert.equal(entrypointHtml(tree),"<!doctype html><html></html>");
 const snapshot=await snapshotProjectTree(tree,"2026-01-01T00:00:00.000Z");
 assert.equal(snapshot.files.length,2);
 assert.equal(snapshot.generationId,"generation_tree_1");
});

test("replaces the tree generation after an authorized patch",()=>{
 const tree={schemaVersion:"2" as const,generationId:"generation_tree_1",files:[{path:"index.html",content:"old"}]};
 const next=replaceProjectTreeGeneration(tree,"generation_tree_2",[{path:"src/z.ts",content:"z"},{path:"index.html",content:"new"}]);
 assert.equal(next.generationId,"generation_tree_2");
 assert.deepEqual(next.files.map(f=>f.path),["index.html","src/z.ts"]);
});
