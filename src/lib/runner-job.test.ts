import assert from "node:assert/strict";
import test from "node:test";
import { createRunnerJob,runnerJobSchema } from "./runner-job.ts";

const files=[
 {path:"src/app.ts",content:"export default 1"},
 {path:"index.html",content:"<!doctype html><html><body>ok</body></html>"},
];

test("creates a bounded deny-network runner job",async()=>{
 const job=await createRunnerJob({
  jobId:"runner_12345678",
  projectId:"project-a",
  generationId:"generation_1234",
  files,
  allowedEnvironmentNames:["CI"],
 });
 assert.equal(job.network.mode,"deny");
 assert.deepEqual(job.environment.allowedNames,["CI"]);
 assert.deepEqual(job.files.map((file)=>file.path),["index.html","src/app.ts"]);
 assert.match(job.treeSha256,/^[a-f0-9]{64}$/);
 assert.equal(job.steps.includes("build"),true);
});

test("runner contract contains no arbitrary command or environment values",async()=>{
 const job=await createRunnerJob({
  jobId:"runner_abcdefgh",
  projectId:"project-a",
  generationId:"generation_1235",
  files,
 });
 const raw=JSON.stringify(job);
 assert.equal(raw.includes('"command"'),false);
 assert.equal(raw.includes('"value"'),false);
 assert.equal(raw.includes("XAI_API_KEY"),false);
});

test("rejects invalid artifacts duplicate steps and unsafe environment names",async()=>{
 await assert.rejects(()=>createRunnerJob({
  jobId:"runner_invalid1",
  projectId:"project-a",
  generationId:"generation_1236",
  files:[{path:"src/app.ts",content:"x"}],
 }),/Invalid runner artifact/);

 await assert.rejects(()=>createRunnerJob({
  jobId:"runner_invalid2",
  projectId:"project-a",
  generationId:"generation_1237",
  files,
  steps:["build","build"],
 }),/Invalid runner job/);

 await assert.rejects(()=>createRunnerJob({
  jobId:"runner_invalid3",
  projectId:"project-a",
  generationId:"generation_1238",
  files,
  allowedEnvironmentNames:["secret-lowercase"],
 }),/Invalid runner job/);
});

test("schema rejects network grants and excessive resource limits",async()=>{
 const job=await createRunnerJob({
  jobId:"runner_87654321",
  projectId:"project-a",
  generationId:"generation_1239",
  files,
 });
 assert.equal(runnerJobSchema.safeParse({...job,network:{mode:"allow"}}).success,false);
 assert.equal(runnerJobSchema.safeParse({...job,limits:{...job.limits,memoryMb:4096}}).success,false);
});
