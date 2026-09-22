import type { GenerationResultV2 } from "./generation-result-v2";
import type { ProjectSourceFile } from "./generation-patch";
import { createProjectSnapshot,projectTreeSha256,type ProjectSnapshot } from "./project-files";
import { assertGenerationId } from "./generation-id";
import { validateProjectArtifact } from "./project-artifact";

export type ProjectTree={schemaVersion:"2";generationId:string;files:ProjectSourceFile[]};

function executableFiles(files:ProjectSourceFile[]){
 const artifact=validateProjectArtifact(files);
 if(!artifact.ok)throw new Error(`Invalid project artifact: ${artifact.reason}`);
 return artifact.files;
}

export function projectTreeFromGeneration(generationId:string,result:GenerationResultV2):ProjectTree{
 return{schemaVersion:"2",generationId:assertGenerationId(generationId),files:executableFiles(result.files)};
}

export async function snapshotProjectTree(tree:ProjectTree,createdAt?:string):Promise<ProjectSnapshot>{
 const files=executableFiles(tree.files);
 return createProjectSnapshot(assertGenerationId(tree.generationId),files,createdAt);
}

export async function projectTreeIdentity(tree:ProjectTree){
 return projectTreeSha256(executableFiles(tree.files));
}

export function entrypointHtml(tree:ProjectTree):string|null{
 const artifact=validateProjectArtifact(tree.files);
 return artifact.ok?artifact.files.find(file=>file.path==="index.html")?.content??null:null;
}

export function replaceProjectTreeGeneration(tree:ProjectTree,generationId:string,files:ProjectSourceFile[]):ProjectTree{
 void tree;
 return{schemaVersion:"2",generationId:assertGenerationId(generationId),files:executableFiles(files)};
}
