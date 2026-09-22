import assert from "node:assert/strict";
import test from "node:test";
import { resolveIdentityEndpoints } from "./identity-config.server.ts";

test("accepts HTTPS issuer and same-origin JWKS",()=>{
 const result=resolveIdentityEndpoints({issuer:"https://auth.example.com",jwksUrl:"https://auth.example.com/keys",nodeEnv:"production"});
 assert.equal(result.issuer,"https://auth.example.com");
 assert.equal(result.jwksUrl.toString(),"https://auth.example.com/keys");
});

test("derives a same-origin default JWKS endpoint",()=>{
 const result=resolveIdentityEndpoints({issuer:"https://auth.example.com/base",nodeEnv:"production"});
 assert.equal(result.jwksUrl.toString(),"https://auth.example.com/.well-known/jwks.json");
});

test("rejects cross-origin JWKS endpoints",()=>{
 assert.throws(()=>resolveIdentityEndpoints({issuer:"https://auth.example.com",jwksUrl:"https://keys.example.net/jwks",nodeEnv:"production"}),/share the issuer origin/);
});

test("rejects insecure remote identity endpoints",()=>{
 assert.throws(()=>resolveIdentityEndpoints({issuer:"http://auth.example.com",nodeEnv:"development"}),/HTTPS/);
 assert.throws(()=>resolveIdentityEndpoints({issuer:"https://auth.example.com",jwksUrl:"http://auth.example.com/jwks",nodeEnv:"development"}),/HTTPS/);
});

test("allows loopback HTTP only outside production",()=>{
 assert.equal(resolveIdentityEndpoints({issuer:"http://localhost:8787",nodeEnv:"development"}).jwksUrl.origin,"http://localhost:8787");
 assert.throws(()=>resolveIdentityEndpoints({issuer:"http://localhost:8787",nodeEnv:"production"}),/HTTPS/);
});

test("rejects embedded URL credentials",()=>{
 assert.throws(()=>resolveIdentityEndpoints({issuer:"https://user:pass@auth.example.com",nodeEnv:"production"}),/credentials/);
});
