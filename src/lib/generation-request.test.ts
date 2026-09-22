import assert from "node:assert/strict";
import test from "node:test";
import { generationChatRequestSchema } from "./generation-request.ts";

const message={role:"user" as const,content:"cambia el título"};

test("accepts initial build and strict patch requests",()=>{
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"initial",messages:[message],currentHtml:"<!doctype html><html></html>"}).success,true);
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"patch",messages:[message],currentFiles:[{path:"index.html",content:"<!doctype html><html></html>"}]}).success,true);
});

test("requires project files for patch generation",()=>{
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"patch",messages:[message]}).success,false);
});

test("rejects unsafe and duplicate patch context paths",()=>{
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"patch",messages:[message],currentFiles:[{path:"../secret",content:"x"}]}).success,false);
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"patch",messages:[message],currentFiles:[{path:"index.html",content:"x"},{path:"index.html",content:"y"}]}).success,false);
});

test("rejects oversized patch context and build state in plan mode",()=>{
 const content="x".repeat(30_000);
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",buildKind:"patch",messages:[message],currentFiles:[{path:"index.html",content},{path:"src/app.ts",content}]}).success,false);
 assert.equal(generationChatRequestSchema.safeParse({mode:"plan",buildKind:"initial",messages:[message],currentHtml:"x"}).success,false);
});

test("rejects unknown request fields",()=>{
 assert.equal(generationChatRequestSchema.safeParse({mode:"build",messages:[message],unexpected:true}).success,false);
});
