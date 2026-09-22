import assert from "node:assert/strict";
import test from "node:test";
import { assertProjectId, isValidProjectId } from "./project-id.ts";

test("accepts canonical project ids and rejects unsafe values",()=>{
 for(const value of ["p1","project-a","workspace.project:123"])assert.equal(isValidProjectId(value),true,value);
 for(const value of ["","../other",":project",".hidden"," project","project/child","a".repeat(129)]){
  assert.equal(isValidProjectId(value),false,value);
  assert.throws(()=>assertProjectId(value),/Invalid project id/);
 }
});
