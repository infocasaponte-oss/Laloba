import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizeProjectTree,legacyProjectGenerationId,projectTreeFromLegacyProject,projectTreeProjection } from "./project-state.ts";

const html="<!doctype html><html><body>ok</body></html>";

test("migrates legacy html into a deterministic canonical project tree",()=>{
 const tree=projectTreeFromLegacyProject("p_cafe",html);
 assert.equal(tree.generationId,legacyProjectGenerationId("p_cafe"));
 assert.deepEqual(tree.files,[{path:"index.html",content:html}]);
 const projection=projectTreeProjection(tree);
 assert.equal(projection.html,html);
 assert.equal(projection.currentGenerationId,tree.generationId);
});

test("preserves multi-file legacy projects while canonicalizing file order",()=>{
 const tree=projectTreeFromLegacyProject("p_files",html,[
  {path:"src/z.ts",content:"z"},
  {path:"index.html",content:html},
  {path:"src/a.ts",content:"a"},
 ]);
 assert.deepEqual(tree.files.map((file)=>file.path),["index.html","src/a.ts","src/z.ts"]);
});

test("rejects unsafe legacy projects instead of silently hydrating them",()=>{
 assert.throws(()=>projectTreeFromLegacyProject("p_bad","<!doctype html><html><iframe></iframe></html>"),/Invalid project artifact/);
});

test("canonicalization rejects project trees that are no longer executable",()=>{
 assert.throws(()=>canonicalizeProjectTree({schemaVersion:"2",generationId:"generation_tree_123",files:[{path:"src/app.ts",content:"x"}]}),/index\.html/);
});
