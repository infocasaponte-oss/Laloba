import { z } from "zod";
import type { ProjectGeneration,ProjectHistory } from "./project-history";
import { appendGeneration,emptyProjectHistory,restoreGeneration } from "./project-history";

const STORAGE_PREFIX="laloba:project-history:";
const MAX_SERIALIZED_BYTES=2_500_000;
const LEGACY_MIGRATION_MARKER="legacy-migrated";
const fileSchema=z.object({path:z.string(),content:z.string(),sha256:z.string()}).strict();
const snapshotSchema=z.object({schemaVersion:z.literal("1"),generationId:z.string(),createdAt:z.string(),files:z.array(fileSchema),treeSha256:z.string().optional()}).strict();
const generationSchema=z.object({id:z.string(),summary:z.string(),snapshot:snapshotSchema}).strict();
const historySchema=z.object({schemaVersion:z.literal("1"),currentGenerationId:z.string().nullable(),generations:z.array(generationSchema).max(50)}).strict();

function storageKey(projectId:string){if(!/^[A-Za-z0-9._:-]{1,128}$/.test(projectId))throw new Error("Invalid project id");return STORAGE_PREFIX+projectId}
function storage(){return typeof localStorage==="undefined"?null:localStorage}

export function loadProjectHistory(projectId:string):ProjectHistory{
 const store=storage();if(!store)return emptyProjectHistory();
 const raw=store.getItem(storageKey(projectId));if(!raw)return emptyProjectHistory();
 if(new TextEncoder().encode(raw).byteLength>MAX_SERIALIZED_BYTES)return emptyProjectHistory();
 try{
  const parsed=historySchema.safeParse(JSON.parse(raw));if(!parsed.success)return emptyProjectHistory();
  const value=parsed.data as ProjectHistory;
  const ids=new Set<string>();
  for(const generation of value.generations){
   if(ids.has(generation.id)||generation.id!==generation.snapshot.generationId||!generation.summary.trim())return emptyProjectHistory();
   ids.add(generation.id);
  }
  if(value.currentGenerationId!==null&&!ids.has(value.currentGenerationId))return emptyProjectHistory();
  return value;
 }catch{return emptyProjectHistory()}
}

export function saveProjectHistory(projectId:string,history:ProjectHistory){
 const store=storage();if(!store)return;
 const parsed=historySchema.safeParse(history);if(!parsed.success)throw new Error("Invalid project history");
 const raw=JSON.stringify(history);
 if(new TextEncoder().encode(raw).byteLength>MAX_SERIALIZED_BYTES)throw new Error("Project history exceeds local storage safety limit");
 store.setItem(storageKey(projectId),raw);
}
export function recordProjectGeneration(projectId:string,generation:ProjectGeneration){const history=appendGeneration(loadProjectHistory(projectId),generation);saveProjectHistory(projectId,history);return history}
export async function restoreProjectGeneration(projectId:string,generationId:string){const history=await restoreGeneration(loadProjectHistory(projectId),generationId);saveProjectHistory(projectId,history);return history}
export function hasGenerationHistory(projectId:string){return loadProjectHistory(projectId).generations.length>0}
export function markLegacyHistoryMigrated(projectId:string){storage()?.setItem(storageKey(projectId)+":"+LEGACY_MIGRATION_MARKER,"1")}
export function legacyHistoryWasMigrated(projectId:string){return storage()?.getItem(storageKey(projectId)+":"+LEGACY_MIGRATION_MARKER)==="1"}
