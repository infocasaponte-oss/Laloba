import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthBrokerIssuer,resolveBetterAuthOrigin } from "./auth-config.server.ts";

test("accepts HTTPS auth endpoints and strips query/hash",()=>{
 assert.equal(
  resolveAuthBrokerIssuer("https://auth.example.com/base?x=1#frag","production"),
  "https://auth.example.com/base",
 );
 assert.equal(
  resolveBetterAuthOrigin("https://app.example.com/auth/path","production"),
  "https://app.example.com",
 );
});

test("rejects remote HTTP and embedded credentials",()=>{
 assert.throws(()=>resolveAuthBrokerIssuer("http://auth.example.com","development"),/HTTPS/);
 assert.throws(()=>resolveBetterAuthOrigin("https://user:pass@app.example.com","production"),/credentials/);
});

test("allows loopback HTTP only outside production",()=>{
 assert.equal(resolveAuthBrokerIssuer("http://localhost:8787","development"),"http://localhost:8787");
 assert.equal(resolveBetterAuthOrigin("http://127.0.0.1:8080/path","test"),"http://127.0.0.1:8080");
 assert.throws(()=>resolveAuthBrokerIssuer("http://localhost:8787","production"),/HTTPS/);
});

test("rejects invalid URLs",()=>{
 assert.throws(()=>resolveAuthBrokerIssuer("not-a-url","production"),/Invalid/);
 assert.throws(()=>resolveBetterAuthOrigin("also-not-a-url","production"),/Invalid/);
});
