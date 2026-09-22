import assert from "node:assert/strict";
import test from "node:test";
import { entrypointHtml,projectTreeFromGeneration,projectTreeIdentity,replaceProjectTreeGeneration,snapshotProjectTree } from "./project-tree.ts";

const html="<!doctype html><html><body>ok</body></html>";

test("promotes a v2 generation into a deterministic project tree",async()=>{
 const tree=projectTreeFromGeneration("generation_tree_1",{schemaVersion:"2",summary:"app",files:[
  {path:"src/app.ts",content:"export default 1"},
  {path:"index.html",content:html},
 ]});
 assert.deepEqual(tree.files.map(f=>f.path),["index.html","src/app.ts"]);
 assert.equal(entrypointHtml(tree),html);
 const snapshot=await snapshotProjectTree(tree,"2026-01-01T00:00:00.000Z");
 assert.equal(snapshot.files.length,2);
 assert.equal(snapshot.generationId,"generation_tree_1");
});

test("replaces the tree generation after an authorized patch",()=>{
 const tree={schemaVersion:"2" as const,generationId:"generation_tree_1",files:[{path:"index.html",content:html}]};
 const next=replaceProjectTreeGeneration(tree,"generation_tree_2",[{path:"src/z.ts",content:"z"},{path:"index.html",content:html.replace("ok","new")}]);
 assert.equal(next.generationId,"generation_tree_2");
 assert.deepEqual(next.files.map(f=>f.path),["index.html","src/z.ts"]);
});

test("project tree identity is deterministic and path-sensitive",async()=>{
 const a=projectTreeFromGeneration("generation_tree_3",{schemaVersion:"2",summary:"x",files:[{path:"index.html",content:html},{path:"src/b.ts",content:"b"},{path:"src/a.ts",content:"a"}]});
 const b=projectTreeFromGeneration("generation_tree_4",{schemaVersion:"2",summary:"x",files:[...a.files].reverse()});
 assert.equal(await projectTreeIdentity(a),await projectTreeIdentity(b));
 const renamed=replaceProjectTreeGeneration(a,"generation_tree_5",[{path:"index.html",content:html},{path:"src/c.ts",content:"a"},{path:"src/b.ts",content:"b"}]);
 assert.notEqual(await projectTreeIdentity(a),await projectTreeIdentity(renamed));
});

test("rejects invalid, duplicate, or non-executable project trees",()=>{
 assert.throws(()=>projectTreeFromGeneration("generation_tree_6",{schemaVersion:"2",summary:"x",files:[{path:"../secret",content:"x"}]}));
 assert.throws(()=>replaceProjectTreeGeneration({schemaVersion:"2",generationId:"generation_tree_6",files:[{path:"index.html",content:html}]},"generation_tree_7",[{path:"src/a.ts",content:"1"},{path:"src/a.ts",content:"2"},{path:"index.html",content:html}]),/Duplicate/);
 assert.throws(()=>replaceProjectTreeGeneration({schemaVersion:"2",generationId:"generation_tree_6",files:[{path:"index.html",content:html}]},"generation_tree_8",[{path:"src/a.ts",content:"1"}]),/index\.html/);
});

test("entrypointHtml fails closed for invalid trees",()=>{
 const invalid={schemaVersion:"2" as const,generationId:"generation_tree_9",files:[{path:"index.html",content:"<!doctype html><html><iframe></iframe></html>"}]};
 assert.equal(entrypointHtml(invalid),null);
});
