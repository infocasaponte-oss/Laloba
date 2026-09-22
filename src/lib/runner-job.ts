import { z } from "zod";
import { assertGenerationId } from "./generation-id";
import { assertProjectId } from "./project-id";
import { validateProjectArtifact } from "./project-artifact";
import { projectTreeSha256 } from "./project-files";
import type { ProjectSourceFile } from "./generation-patch";
import { validationStageSchema,type ValidationStage } from "./validation-result";

export const RUNNER_MAX_WALL_MS=10*60*1000;
export const RUNNER_MAX_MEMORY_MB=1024;
export const RUNNER_MAX_DISK_MB=2048;
export const RUNNER_MAX_PROCESSES=64;
export const RUNNER_MAX_LOG_BYTES=2_000_000;

const runnerIdSchema=z.string().regex(/^runner_[A-Za-z0-9_-]{8,100}$/);

export const runnerJobSchema=z.object({
 schemaVersion:z.literal("1"),
 jobId:runnerIdSchema,
 projectId:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/),
 generationId:z.string().regex(/^generation_[A-Za-z0-9_-]{4,100}$/),
 treeSha256:z.string().regex(/^[a-f0-9]{64}$/),
 runtime:z.literal("node22"),
 steps:z.array(validationStageSchema).min(1).max(8),
 network:z.object({
  mode:z.literal("deny"),
 }).strict(),
 environment:z.object({
  allowedNames:z.array(z.string().regex(/^[A-Z][A-Z0-9_]{0,99}$/)).max(40),
 }).strict(),
 limits:z.object({
  wallMs:z.number().int().min(1_000).max(RUNNER_MAX_WALL_MS),
  memoryMb:z.number().int().min(64).max(RUNNER_MAX_MEMORY_MB),
  diskMb:z.number().int().min(64).max(RUNNER_MAX_DISK_MB),
  processes:z.number().int().min(1).max(RUNNER_MAX_PROCESSES),
  logBytes:z.number().int().min(1_024).max(RUNNER_MAX_LOG_BYTES),
 }).strict(),
 files:z.array(z.object({
  path:z.string().min(1).max(180),
  content:z.string().max(512_000),
 }).strict()).min(1).max(80),
}).strict().superRefine((value,ctx)=>{
 const steps=new Set<string>();
 for(let index=0;index<value.steps.length;index++){
  const step=value.steps[index];
  if(steps.has(step))ctx.addIssue({code:"custom",message:`Duplicate runner step: ${step}`,path:["steps",index]});
  steps.add(step);
 }
});

export type RunnerJob=z.infer<typeof runnerJobSchema>;

export async function createRunnerJob(input:{
 jobId:string;
 projectId:string;
 generationId:string;
 files:ProjectSourceFile[];
 steps?:ValidationStage[];
 allowedEnvironmentNames?:string[];
}):Promise<RunnerJob>{
 assertProjectId(input.projectId);
 assertGenerationId(input.generationId);
 if(!runnerIdSchema.safeParse(input.jobId).success)throw new Error("Invalid runner job id");
 const artifact=validateProjectArtifact(input.files);
 if(!artifact.ok)throw new Error(`Invalid runner artifact: ${artifact.reason}`);
 const job:RunnerJob={
  schemaVersion:"1",
  jobId:input.jobId,
  projectId:input.projectId,
  generationId:input.generationId,
  treeSha256:await projectTreeSha256(artifact.files),
  runtime:"node22",
  steps:input.steps??["contract","artifact","dependencies","typecheck","test","build","security"],
  network:{mode:"deny"},
  environment:{allowedNames:input.allowedEnvironmentNames??[]},
  limits:{
   wallMs:10*60*1000,
   memoryMb:1024,
   diskMb:2048,
   processes:64,
   logBytes:2_000_000,
  },
  files:artifact.files,
 };
 const parsed=runnerJobSchema.safeParse(job);
 if(!parsed.success)throw new Error("Invalid runner job");
 return parsed.data;
}
