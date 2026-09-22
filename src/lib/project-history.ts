import type { ProjectSnapshot } from "./project-files";
import { verifyProjectSnapshot } from "./project-files";

export type ProjectGeneration={id:string;summary:string;snapshot:ProjectSnapshot};
export type ProjectHistory={schemaVersion:"1";currentGenerationId:string|null;generations:ProjectGeneration[]};
export const emptyProjectHistory=():ProjectHistory=>({schemaVersion:"1",currentGenerationId:null,generations:[]});

function assertGenerationIdentity(generation:ProjectGeneration){
 if(generation.id!==generation.snapshot.generationId)throw new Error("Generation id does not match snapshot");
 if(!generation.summary.trim())throw new Error("Generation summary is required");
}

export function appendGeneration(history:ProjectHistory,generation:ProjectGeneration):ProjectHistory{
 assertGenerationIdentity(generation);
 if(history.generations.some(item=>item.id===generation.id))throw new Error("Duplicate generation id");
 const generations=[...history.generations,generation].slice(-50);
 const currentGenerationId=generations.some(item=>item.id===generation.id)?generation.id:null;
 return{schemaVersion:"1",currentGenerationId,generations};
}

export async function restoreGeneration(history:ProjectHistory,generationId:string):Promise<ProjectHistory>{
 const generation=history.generations.find(item=>item.id===generationId);
 if(!generation)throw new Error("Generation not found");
 assertGenerationIdentity(generation);
 if(!(await verifyProjectSnapshot(generation.snapshot)))throw new Error("Generation integrity check failed");
 return{...history,currentGenerationId:generationId};
}

export function currentSnapshot(history:ProjectHistory){
 const generation=history.generations.find(item=>item.id===history.currentGenerationId);
 if(!generation)return null;
 assertGenerationIdentity(generation);
 return generation.snapshot;
}
