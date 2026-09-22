import type { GenerationResultV2 } from "./generation-result-v2";
import type { ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot, type ProjectSnapshot } from "./project-files";

export type ProjectTree={
 schemaVersion:"2";
 generationId:string;
 files:ProjectSourceFile[];
};

export function projectTreeFromGeneration(generationId:string,result:GenerationResultV2):ProjectTree{
 return{schemaVersion:"2",generationId,files:[...result.files].sort((a,b)=>a.path.localeCompare(b.path))};
}

export async function snapshotProjectTree(tree:ProjectTree,createdAt?:string):Promise<ProjectSnapshot>{
 return createProjectSnapshot(tree.generationId,tree.files,createdAt);
}

export function entrypointHtml(tree:ProjectTree):string|null{
 return tree.files.find((file)=>file.path==="index.html")?.content??null;
}

export function replaceProjectTreeGeneration(tree:ProjectTree,generationId:string,files:ProjectSourceFile[]):ProjectTree{
 return{schemaVersion:"2",generationId,files:[...files].sort((a,b)=>a.path.localeCompare(b.path))};
}
