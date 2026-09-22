import { z } from "zod";
import { validationApprovalDecision,validationResultSchema,type ValidationResult } from "./validation-result";

export const MAX_REPAIR_ITERATIONS=3;
export const MAX_REPAIR_ELAPSED_MS=15*60*1000;
export const MAX_REPAIR_DIAGNOSTICS=50;

export const repairLoopStateSchema=z.object({
 schemaVersion:z.literal("1"),
 runId:z.string().regex(/^repair_[A-Za-z0-9_-]{8,100}$/),
 iteration:z.number().int().min(0).max(MAX_REPAIR_ITERATIONS),
 startedAt:z.string().datetime({offset:true}),
 candidateTreeSha256:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export type RepairLoopState=z.infer<typeof repairLoopStateSchema>;

export type RepairDecision=
 |{action:"approve";validation:ValidationResult}
 |{action:"repair";nextIteration:number;evidence:RepairEvidence[]}
 |{action:"reject";reason:string;evidence:RepairEvidence[]};

export type RepairEvidence={
 stage:string;
 code?:string;
 message:string;
 path?:string;
 line?:number;
 column?:number;
};

export function validationRepairEvidence(validation:ValidationResult):RepairEvidence[]{
 return validation.stages
  .flatMap((stage)=>stage.diagnostics)
  .filter((diagnostic)=>diagnostic.severity==="error"||diagnostic.severity==="warning")
  .slice(0,MAX_REPAIR_DIAGNOSTICS)
  .map(({stage,code,message,path,line,column})=>({
   stage,
   ...(code?{code}:{}),
   message,
   ...(path?{path}:{}),
   ...(line?{line}:{}),
   ...(column?{column}:{}),
  }));
}

export function repairLoopDecision(input:{
 state:RepairLoopState;
 validation:unknown;
 now?:Date;
}):RepairDecision{
 const state=repairLoopStateSchema.parse(input.state);
 const parsed=validationResultSchema.safeParse(input.validation);
 if(!parsed.success)return{action:"reject",reason:"Validation result is malformed",evidence:[]};

 if(parsed.data.treeSha256!==state.candidateTreeSha256){
  return{action:"reject",reason:"Validation result belongs to another project tree",evidence:[]};
 }

 const approval=validationApprovalDecision(parsed.data);
 if(approval.approvable)return{action:"approve",validation:approval.result};

 const evidence=validationRepairEvidence(parsed.data);
 const now=input.now??new Date();
 const startedAt=Date.parse(state.startedAt);
 if(!Number.isFinite(startedAt)||now.getTime()<startedAt){
  return{action:"reject",reason:"Repair loop clock is invalid",evidence};
 }
 if(now.getTime()-startedAt>MAX_REPAIR_ELAPSED_MS){
  return{action:"reject",reason:"Repair loop time budget exhausted",evidence};
 }
 if(state.iteration>=MAX_REPAIR_ITERATIONS){
  return{action:"reject",reason:"Repair iteration budget exhausted",evidence};
 }
 if(!evidence.some((item)=>item.stage&&item.message)){
  return{action:"reject",reason:"Validation failed without actionable diagnostics",evidence};
 }
 return{action:"repair",nextIteration:state.iteration+1,evidence};
}
