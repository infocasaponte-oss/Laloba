import assert from "node:assert/strict";
import test from "node:test";
import { clearProjectTree,loadProjectTree,projectTreeStorageKey,saveProjectTree,type ProjectTreeStorage } from "./project-tree-store.ts";

class MemoryStorage implements ProjectTreeStorage{
 data=new Map<string,string>();
 getItem(k:string){return this.data.get(k)??null}
 setItem(k:string,v:string){this.data.set(k,v)}
 removeItem(k:string){this.data.delete(k)}
}

test("persists and deterministically reloads a multi-file project tree",()=>{
 const storage=new MemoryStorage();
 saveProjectTree("p1",{schemaVersion:"2",generationId:"g1",files:[{path:"src/z.ts",content:"z"},{path:"index.html",content:"html"}]},storage);
 assert.deepEqual(loadProjectTree("p1",storage)?.files.map(f=>f.path),["index.html","src/z.ts"]);
});

test("rejects unsafe or duplicate cached paths",()=>{
 const storage=new MemoryStorage();
 storage.setItem(projectTreeStorageKey("p1"),JSON.stringify({schemaVersion:"2",generationId:"g1",files:[{path:"../secret",content:"x"}]}));
 assert.equal(loadProjectTree("p1",storage),null);
 storage.setItem(projectTreeStorageKey("p1"),JSON.stringify({schemaVersion:"2",generationId:"g1",files:[{path:"src/a.ts",content:"1"},{path:"src/a.ts",content:"2"}]}));
 assert.equal(loadProjectTree("p1",storage),null);
});

test("clears a cached project tree",()=>{
 const storage=new MemoryStorage();
 saveProjectTree("p1",{schemaVersion:"2",generationId:"g1",files:[{path:"index.html",content:"x"}]},storage);
 clearProjectTree("p1",storage);
 assert.equal(loadProjectTree("p1",storage),null);
});
