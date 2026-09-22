import assert from "node:assert/strict";
import test from "node:test";
import { assertGenerationId, createGenerationId, isValidGenerationId } from "./generation-id.ts";

test("accepts canonical generation ids and rejects malformed values",()=>{
 assert.equal(isValidGenerationId("generation_1234"),true);
 assert.equal(isValidGenerationId("gen_0123456789abcdef0123456789abcdef"),true);
 for(const value of ["bad","../generation"," generation_1","generation:1","a".repeat(81)]){
  assert.equal(isValidGenerationId(value),false,value);
  assert.throws(()=>assertGenerationId(value),/Invalid generation id/);
 }
});

test("creates secure canonical generation ids",()=>{
 const id=createGenerationId();
 assert.equal(isValidGenerationId(id),true);
 assert.match(id,/^gen_[a-f0-9]{32}$/);
});
