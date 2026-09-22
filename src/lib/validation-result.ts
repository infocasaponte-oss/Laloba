import { z } from "zod";

export const validationStageSchema=z.enum([
 "contract",
 "artifact",
 "dependencies",
 "typecheck",
 "lint",
 "test",
 "build",
 "security",
]);
export type ValidationStage=z.infer<typeof validationStageSchema>;

export const validationSeveritySchema=z.enum(["info","warning","error"]);
export type ValidationSeverity=z.infer<typeof validationSeveritySchema>;

export const validationDiagnosticSchema=z.object({
 stage:validationStageSchema,
 severity:validationSeveritySchema,
 code:z.string().trim().min(1).max(120).optional(),
 message:z.string().trim().min(1).max(2_000),
 path:z.string().min(1).max(180).optional(),
 line:z.number().int().min(1).max(10_000_000).optional(),
 column:z.number().int().min(1).max(10_000_000).optional(),
}).strict();

export const validationStageResultSchema=z.object({
 stage:validationStageSchema,
 status:z.enum(["passed","warning","failed","skipped"]),
 durationMs:z.number().int().min(0).max(30*60*1000),
 diagnostics:z.array(validationDiagnosticSchema).max(500),
}).strict().superRefine((value,ctx)=>{
 if(value.status==="passed"&&value.diagnostics.some((diagnostic)=>diagnostic.severity==="error")){
  ctx.addIssue({code:"custom",message:"Passed stages cannot contain error diagnostics",path:["diagnostics"]});
 }
 if(value.status==="failed"&&!value.diagnostics.some((diagnostic)=>diagnostic.severity==="error")){
  ctx.addIssue({code:"custom",message:"Failed stages require an error diagnostic",path:["diagnostics"]});
 }
});

export const validationResultSchema=z.object({
 schemaVersion:z.literal("1"),
 jobId:z.string().regex(/^runner_[A-Za-z0-9_-]{8,100}$/),
 generationId:z.string().regex(/^generation_[A-Za-z0-9_-]{4,100}$/),
 treeSha256:z.string().regex(/^[a-f0-9]{64}$/),
 startedAt:z.string().datetime({offset:true}),
 completedAt:z.string().datetime({offset:true}),
 stages:z.array(validationStageResultSchema).min(1).max(20),
}).strict().superRefine((value,ctx)=>{
 const names=new Set<string>();
 for(let index=0;index<value.stages.length;index++){
  const stage=value.stages[index].stage;
  if(names.has(stage))ctx.addIssue({code:"custom",message:`Duplicate validation stage: ${stage}`,path:["stages",index,"stage"]});
  names.add(stage);
 }
 if(Date.parse(value.completedAt)<Date.parse(value.startedAt)){
  ctx.addIssue({code:"custom",message:"Validation completed before it started",path:["completedAt"]});
 }
});

export type ValidationResult=z.infer<typeof validationResultSchema>;

export const REQUIRED_VALIDATION_STAGES:readonly ValidationStage[]=[
 "contract",
 "artifact",
 "dependencies",
 "typecheck",
 "test",
 "build",
 "security",
];

export function validationApprovalDecision(input:unknown){
 const parsed=validationResultSchema.safeParse(input);
 if(!parsed.success)return{approvable:false as const,reason:"Validation result is malformed"};
 const byStage=new Map(parsed.data.stages.map((stage)=>[stage.stage,stage]));
 for(const required of REQUIRED_VALIDATION_STAGES){
  const stage=byStage.get(required);
  if(!stage)return{approvable:false as const,reason:`Required validation stage missing: ${required}`};
  if(stage.status==="failed")return{approvable:false as const,reason:`Validation stage failed: ${required}`};
  if(stage.status==="skipped")return{approvable:false as const,reason:`Required validation stage skipped: ${required}`};
 }
 const errors=parsed.data.stages.flatMap((stage)=>stage.diagnostics).filter((diagnostic)=>diagnostic.severity==="error");
 if(errors.length)return{approvable:false as const,reason:"Validation contains error diagnostics"};
 return{approvable:true as const,result:parsed.data};
}
