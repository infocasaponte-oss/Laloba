import assert from "node:assert/strict";
import test from "node:test";
import { MAX_REPAIR_ITERATIONS,repairLoopDecision,validationRepairEvidence } from "./repair-loop.ts";

const tree="a".repeat(64);
const state={schemaVersion:"1" as const,runId:"repair_12345678",iteration:0,startedAt:"2026-01-01T00:00:00.000Z",candidateTreeSha256:tree};
const stages=["contract","artifact","dependencies","typecheck","test","build","security"] as const;
const passed={
 schemaVersion:"1" as const,
 jobId:"runner_12345678",
 generationId:"generation_1234",
 treeSha256:tree,
 startedAt:"2026-01-01T00:00:00.000Z",
 completedAt:"2026-01-01T00:00:01.000Z",
 stages:stages.map((stage)=>({stage,status:"passed" as const,durationMs:10,diagnostics:[]})),
};

test("approves candidates only after validation passes",()=>{
 assert.equal(repairLoopDecision({state,validation:passed,now:new Date("2026-01-01T00:00:02.000Z")}).action,"approve");
});

test("returns bounded structured evidence for a repairable failure",()=>{
 const failed=structuredClone(passed);
 failed.stages[3]={stage:"typecheck",status:"failed",durationMs:10,diagnostics:[{stage:"typecheck",severity:"error",code:"TS2322",message:"Type mismatch",path:"src/app.ts",line:4,column:2}]};
 const decision=repairLoopDecision({state,validation:failed,now:new Date("2026-01-01T00:00:02.000Z")});
 assert.equal(decision.action,"repair");
 if(decision.action!=="repair")throw new Error("expected repair");
 assert.equal(decision.nextIteration,1);
 assert.deepEqual(decision.evidence,[{stage:"typecheck",code:"TS2322",message:"Type mismatch",path:"src/app.ts",line:4,column:2}]);
});

test("rejects stale validation bound to another tree",()=>{
 assert.equal(repairLoopDecision({state,validation:{...passed,treeSha256:"b".repeat(64)}}).action,"reject");
});

test("stops after iteration or wall-clock budget",()=>{
 const failed=structuredClone(passed);
 failed.stages[5]={stage:"build",status:"failed",durationMs:10,diagnostics:[{stage:"build",severity:"error",message:"Build failed"}]};
 const exhausted={...state,iteration:MAX_REPAIR_ITERATIONS};
 const iterationDecision=repairLoopDecision({state:exhausted,validation:failed,now:new Date("2026-01-01T00:00:02.000Z")});
 assert.equal(iterationDecision.action,"reject");
 const timeDecision=repairLoopDecision({state,validation:failed,now:new Date("2026-01-01T00:16:00.000Z")});
 assert.equal(timeDecision.action,"reject");
});

test("does not retry failures without actionable diagnostics",()=>{
 const missing={...passed,stages:passed.stages.filter((stage)=>stage.stage!=="build")};
 const decision=repairLoopDecision({state,validation:missing,now:new Date("2026-01-01T00:00:02.000Z")});
 assert.equal(decision.action,"reject");
});

test("repair evidence never includes successful informational diagnostics",()=>{
 const validation=structuredClone(passed);
 validation.stages[0].diagnostics=[{stage:"contract",severity:"info",message:"ok"}];
 assert.deepEqual(validationRepairEvidence(validation),[]);
});
