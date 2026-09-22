import assert from "node:assert/strict";
import test from "node:test";
import { clearProjectTree,loadProjectTree,projectTreeStorageKey,saveProjectTree,type ProjectTreeStorage } from "./project-tree-store.ts";

class MemoryStorage implements ProjectTreeStorage{
 data=new Map<string,string>();
 getItem(k:string){return this.data.get(k)??null}
 setItem(k:string,v:string){this.data.set(k,v)}
 removeItem(k:string){this.data.delete(k)}
}

test("persists and deterministically reloads a multi-file project tree",async()=>{
 const storage=new MemoryStorage();
 await saveProjectTree("p1",{schemaVersion:"2",generationId:"generation_cache_1",files:[{path:"src/z.ts",content:"z"},{path:"index.html",content:"html"}]},storage);
 assert.deepEqual((await loadProjectTree("p1",storage))?.files.map(f=>f.path),["index.html","src/z.ts"]);
});

test("rejects unsafe or duplicate cached paths",async()=>{
 const storage=new MemoryStorage();
 storage.setItem(projectTreeStorageKey("p1"),JSON.stringify({schemaVersion:"2",generationId:"generation_cache_1",files:[{path:"../secret",content:"x"}]}));
 assert.equal(await loadProjectTree("p1",storage),null);
 storage.setItem(projectTreeStorageKey("p1"),JSON.stringify({schemaVersion:"2",generationId:"generation_cache_1",files:[{path:"src/a.ts",content:"1"},{path:"src/a.ts",content:"2"}]}));
 assert.equal(await loadProjectTree("p1",storage),null);
});

test("clears a cached project tree",async()=>{
 const storage=new MemoryStorage();
 await saveProjectTree("p1",{schemaVersion:"2",generationId:"generation_cache_1",files:[{path:"index.html",content:"x"}]},storage);
 clearProjectTree("p1",storage);
 assert.equal(await loadProjectTree("p1",storage),null);
});

test("rejects tampered authenticated cache entries",async()=>{
 const storage=new MemoryStorage();
 await saveProjectTree("p2",{schemaVersion:"2",generationId:"generation_cache_2",files:[{path:"index.html",content:"safe"}]},storage);
 const key=projectTreeStorageKey("p2");
 const raw=JSON.parse(storage.getItem(key)!);
 raw.files[0].content="tampered";
 storage.setItem(key,JSON.stringify(raw));
 assert.equal(await loadProjectTree("p2",storage),null);
});

test("rejects invalid project ids for cache keys",()=>{
 assert.throws(()=>projectTreeStorageKey("../other"),/Invalid project id/);
});

test("rejects invalid generation ids in cached trees",async()=>{
 const storage=new MemoryStorage();
 await assert.rejects(()=>saveProjectTree("p3",{schemaVersion:"2",generationId:"bad",files:[{path:"index.html",content:"x"}]},storage),/Invalid generation id/);
 storage.setItem(projectTreeStorageKey("p3"),JSON.stringify({schemaVersion:"2",generationId:"bad",files:[{path:"index.html",content:"x"}],treeSha256:"a".repeat(64)}));
 assert.equal(await loadProjectTree("p3",storage),null);
});
