import type { GenerationResultV2 } from "./generation-result-v2";
import type { ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot, projectTreeSha256, type ProjectSnapshot } from "./project-files";
import { validateGeneratedPath } from "./generated-path";
import { assertGenerationId } from "./generation-id";

export type ProjectTree={schemaVersion:"2";generationId:string;files:ProjectSourceFile[]};

function canonicalFiles(files:ProjectSourceFile[]){
 const seen=new Set<string>();
 const normalized=files.map(file=>{
  const path=validateGeneratedPath(file.path);
  if(!path.ok)throw new Error(path.reason);
  if(seen.has(path.path))throw new Error(`Duplicate path: ${path.path}`);
  seen.add(path.path);
  return{path:path.path,content:file.content};
 });
 return normalized.sort((a,b)=>a.path.localeCompare(b.path));
}

export function projectTreeFromGeneration(generationId:string,result:GenerationResultV2):ProjectTree{
 return{schemaVersion:"2",generationId:assertGenerationId(generationId),files:canonicalFiles(result.files)};
}
export async function snapshotProjectTree(tree:ProjectTree,createdAt?:string):Promise<ProjectSnapshot>{
 return createProjectSnapshot(tree.generationId,tree.files,createdAt);
}
export async function projectTreeIdentity(tree:ProjectTree){return projectTreeSha256(tree.files)}
export function entrypointHtml(tree:ProjectTree):string|null{return tree.files.find(file=>file.path==="index.html")?.content??null}
export function replaceProjectTreeGeneration(tree:ProjectTree,generationId:string,files:ProjectSourceFile[]):ProjectTree{
 void tree;
 return{schemaVersion:"2",generationId:assertGenerationId(generationId),files:canonicalFiles(files)};
}
