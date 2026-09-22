import assert from "node:assert/strict";
import test from "node:test";
import { validationApprovalDecision,validationResultSchema } from "./validation-result.ts";

const stages=["contract","artifact","dependencies","typecheck","test","build","security"] as const;
const base={
 schemaVersion:"1" as const,
 jobId:"runner_12345678",
 generationId:"generation_1234",
 treeSha256:"a".repeat(64),
 startedAt:"2026-01-01T00:00:00.000Z",
 completedAt:"2026-01-01T00:00:01.000Z",
 stages:stages.map((stage)=>({
  stage,
  status:"passed" as const,
  durationMs:10,
  diagnostics:[],
 })),
};

test("allows approval only after every required validation stage passes",()=>{
 const decision=validationApprovalDecision(base);
 assert.equal(decision.approvable,true);
});

test("blocks missing failed and skipped required stages",()=>{
 assert.equal(validationApprovalDecision({...base,stages:base.stages.slice(1)}).approvable,false);
 const failed=structuredClone(base);
 failed.stages[3]={...failed.stages[3],status:"failed",diagnostics:[{stage:"typecheck",severity:"error",message:"type error"}]};
 assert.equal(validationApprovalDecision(failed).approvable,false);
 const skipped=structuredClone(base);
 skipped.stages[4]={...skipped.stages[4],status:"skipped"};
 assert.equal(validationApprovalDecision(skipped).approvable,false);
});

test("rejects internally inconsistent stage results",()=>{
 const invalid=structuredClone(base);
 invalid.stages[0].diagnostics=[{stage:"contract",severity:"error",message:"bad"}];
 assert.equal(validationResultSchema.safeParse(invalid).success,false);
 const failedWithoutError=structuredClone(base);
 failedWithoutError.stages[0].status="failed";
 assert.equal(validationResultSchema.safeParse(failedWithoutError).success,false);
});

test("rejects duplicate stages and impossible timestamps",()=>{
 const duplicate={...base,stages:[...base.stages,base.stages[0]]};
 assert.equal(validationResultSchema.safeParse(duplicate).success,false);
 assert.equal(validationResultSchema.safeParse({...base,completedAt:"2025-12-31T23:59:59.000Z"}).success,false);
});

test("rejects malformed runner identities and tree hashes",()=>{
 assert.equal(validationApprovalDecision({...base,jobId:"bad"}).approvable,false);
 assert.equal(validationApprovalDecision({...base,treeSha256:"bad"}).approvable,false);
});
