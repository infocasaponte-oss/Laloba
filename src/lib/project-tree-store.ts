import { z } from "zod";
import { validateGeneratedPath } from "./generated-path";
import type { ProjectTree } from "./project-tree";
import { projectTreeSha256 } from "./project-files";

const KEY_PREFIX="laloba:project-tree:v2:";
const MAX_STORAGE_BYTES=2_500_000;
const encoder=new TextEncoder();

const treeSchema=z.object({
 schemaVersion:z.literal("2"),
 generationId:z.string().min(1).max(120),
 files:z.array(z.object({path:z.string().min(1).max(180),content:z.string().max(512_000)}).strict()).min(1).max(80),
}).strict();

export interface ProjectTreeStorage{
 getItem(key:string):string|null;
 setItem(key:string,value:string):void;
 removeItem(key:string):void;
}

function browserStorage():ProjectTreeStorage|null{
 return typeof localStorage==="undefined"?null:localStorage;
}

function validateProjectId(projectId:string){if(!/^[A-Za-z0-9._:-]{1,128}$/.test(projectId))throw new Error("Invalid project id");return projectId}
export function projectTreeStorageKey(projectId:string){return `${KEY_PREFIX}${validateProjectId(projectId)}`}

export async function saveProjectTree(projectId:string,tree:ProjectTree,storage:ProjectTreeStorage|null=browserStorage()){
 if(!storage)return;
 const seen=new Set<string>();
 for(const file of tree.files){
  const path=validateGeneratedPath(file.path);
  if(!path.ok)throw new Error(path.reason);
  if(seen.has(path.path))throw new Error(`Duplicate project path: ${path.path}`);
  seen.add(path.path);
 }
 const value=JSON.stringify({...tree,treeSha256:await projectTreeSha256(tree.files)});
 if(encoder.encode(value).byteLength>MAX_STORAGE_BYTES)throw new Error("Project tree exceeds browser cache limit");
 storage.setItem(projectTreeStorageKey(projectId),value);
}

export async function loadProjectTree(projectId:string,storage:ProjectTreeStorage|null=browserStorage()):Promise<ProjectTree|null>{
 if(!storage)return null;
 const value=storage.getItem(projectTreeStorageKey(projectId));
 if(!value)return null;
 try{
  const raw=JSON.parse(value) as unknown;
  const cacheSchema=treeSchema.extend({treeSha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
  const parsed=cacheSchema.safeParse(raw);
  if(!parsed.success)return null;
  const seen=new Set<string>();
  for(const file of parsed.data.files){
   const path=validateGeneratedPath(file.path);
   if(!path.ok||seen.has(path.path))return null;
   seen.add(path.path);
  }
  if(await projectTreeSha256(parsed.data.files)!==parsed.data.treeSha256)return null;
  return{schemaVersion:parsed.data.schemaVersion,generationId:parsed.data.generationId,files:[...parsed.data.files].sort((a,b)=>a.path.localeCompare(b.path))};
 }catch{return null}
}

export function clearProjectTree(projectId:string,storage:ProjectTreeStorage|null=browserStorage()){
 storage?.removeItem(projectTreeStorageKey(projectId));
}
