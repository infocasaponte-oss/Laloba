import assert from "node:assert/strict";
import test from "node:test";
import { createProjectSnapshot } from "./project-files.ts";
import { loadProjectHistory, recordProjectGeneration, restoreProjectGeneration, saveProjectHistory } from "./project-history-store.ts";

class MemoryStorage {
  private data = new Map<string,string>();
  getItem(key:string){return this.data.get(key)??null}
  setItem(key:string,value:string){this.data.set(key,value)}
  removeItem(key:string){this.data.delete(key)}
  clear(){this.data.clear()}
  key(index:number){return [...this.data.keys()][index]??null}
  get length(){return this.data.size}
}

test("persists and restores a verified generation", async () => {
  Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});
  const snapshot=await createProjectSnapshot("gen_test_1",[{path:"index.html",content:"<!doctype html><html><body>ok</body></html>"}]);
  recordProjectGeneration("project-1",{id:"gen_test_1",summary:"Initial",snapshot});
  assert.equal(loadProjectHistory("project-1").generations.length,1);
  const restored=await restoreProjectGeneration("project-1","gen_test_1");
  assert.equal(restored.currentGenerationId,"gen_test_1");
});

test("rejects tampered persisted content on restore", async () => {
  Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});
  const snapshot=await createProjectSnapshot("gen_test_2",[{path:"index.html",content:"<!doctype html><html><body>safe</body></html>"}]);
  recordProjectGeneration("project-2",{id:"gen_test_2",summary:"Safe",snapshot});
  const history=loadProjectHistory("project-2");
  history.generations[0].snapshot.files[0].content="<!doctype html><html><body>tampered</body></html>";
  localStorage.setItem("laloba:project-history:project-2",JSON.stringify(history));
  await assert.rejects(()=>restoreProjectGeneration("project-2","gen_test_2"),/integrity/i);
});

test("fails closed on malformed or structurally inconsistent persisted history",async()=>{
 const store=new MemoryStorage();
 Object.defineProperty(globalThis,"localStorage",{value:store,configurable:true});
 store.setItem("laloba:project-history:project-3",JSON.stringify({schemaVersion:"1",currentGenerationId:"missing",generations:[]}));
 assert.equal(loadProjectHistory("project-3").generations.length,0);
 const snapshot=await createProjectSnapshot("gen_test_3",[{path:"index.html",content:"safe"}]);
 store.setItem("laloba:project-history:project-4",JSON.stringify({schemaVersion:"1",currentGenerationId:"other",generations:[{id:"other",summary:"x",snapshot}]}));
 assert.equal(loadProjectHistory("project-4").generations.length,0);
});

test("rejects duplicate persisted generation ids",async()=>{
 const store=new MemoryStorage();
 Object.defineProperty(globalThis,"localStorage",{value:store,configurable:true});
 const snapshot=await createProjectSnapshot("gen_test_4",[{path:"index.html",content:"safe"}]);
 const generation={id:"gen_test_4",summary:"x",snapshot};
 store.setItem("laloba:project-history:project-5",JSON.stringify({schemaVersion:"1",currentGenerationId:"gen_test_4",generations:[generation,generation]}));
 assert.equal(loadProjectHistory("project-5").generations.length,0);
});


test("rejects structurally inconsistent history before persisting",async()=>{
 Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});
 const snapshot=await createProjectSnapshot("gen_test_5",[{path:"index.html",content:"safe"}]);
 const invalid={schemaVersion:"1" as const,currentGenerationId:"gen_test_5",generations:[{id:"generation_other",summary:"x",snapshot}]};
 assert.throws(()=>saveProjectHistory("project-6",invalid),/Invalid project history/);
});

test("persists the normalized history representation",async()=>{
 Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});
 const snapshot=await createProjectSnapshot("gen_test_6",[{path:"index.html",content:"safe"}]);
 saveProjectHistory("project-7",{schemaVersion:"1",currentGenerationId:"gen_test_6",generations:[{id:"gen_test_6",summary:"  normalized  ",snapshot}]});
 assert.equal(loadProjectHistory("project-7").generations[0].summary,"normalized");
});
