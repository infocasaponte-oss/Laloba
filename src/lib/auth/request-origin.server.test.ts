import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedMutationOrigin } from "./request-origin.server.ts";

function withEnv(values:Record<string,string|undefined>,fn:()=>void){
  const old=Object.fromEntries(Object.keys(values).map((k)=>[k,process.env[k]]));
  try{for(const [k,v] of Object.entries(values)){if(v===undefined)delete process.env[k];else process.env[k]=v}fn()}
  finally{for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
}

test("accepts matching request origin",()=>withEnv({APP_ORIGIN:undefined,BETTER_AUTH_URL:undefined,TRUST_PROXY:undefined},()=>{
  assert.equal(isTrustedMutationOrigin(new Request("https://laloba.example/api/chat",{method:"POST",headers:{origin:"https://laloba.example"}})),true);
}));

test("rejects a foreign browser origin",()=>withEnv({APP_ORIGIN:undefined,BETTER_AUTH_URL:undefined,TRUST_PROXY:undefined},()=>{
  assert.equal(isTrustedMutationOrigin(new Request("https://laloba.example/api/chat",{method:"POST",headers:{origin:"https://evil.example"}})),false);
}));

test("does not trust spoofed forwarded headers by default",()=>withEnv({APP_ORIGIN:undefined,BETTER_AUTH_URL:undefined,TRUST_PROXY:undefined},()=>{
  const request=new Request("http://127.0.0.1:8080/api/chat",{method:"POST",headers:{origin:"https://laloba.example","x-forwarded-host":"laloba.example","x-forwarded-proto":"https"}});
  assert.equal(isTrustedMutationOrigin(request),false);
}));

test("accepts forwarded origin only when proxy trust is explicit",()=>withEnv({APP_ORIGIN:undefined,BETTER_AUTH_URL:undefined,TRUST_PROXY:"true"},()=>{
  const request=new Request("http://127.0.0.1:8080/api/chat",{method:"POST",headers:{origin:"https://laloba.example","x-forwarded-host":"laloba.example","x-forwarded-proto":"https"}});
  assert.equal(isTrustedMutationOrigin(request),true);
}));

test("prefers a configured canonical public origin",()=>withEnv({APP_ORIGIN:"https://laloba.example",TRUST_PROXY:undefined},()=>{
  const request=new Request("http://127.0.0.1:8080/api/chat",{method:"POST",headers:{origin:"https://laloba.example"}});
  assert.equal(isTrustedMutationOrigin(request),true);
}));

test("allows requests without Origin for non-browser clients",()=>{
  assert.equal(isTrustedMutationOrigin(new Request("https://laloba.example/api/chat",{method:"POST"})),true);
});


test("rejects cross-site fetch metadata even without Origin",()=>{
 const request=new Request("https://app.example.com/api/chat",{method:"POST",headers:{"Sec-Fetch-Site":"cross-site"}});
 assert.equal(isTrustedMutationOrigin(request),false);
});

test("allows same-origin and server-to-server fetch metadata",()=>{
 assert.equal(isTrustedMutationOrigin(new Request("https://app.example.com/api/chat",{method:"POST",headers:{"Sec-Fetch-Site":"same-origin"}})),true);
 assert.equal(isTrustedMutationOrigin(new Request("https://app.example.com/api/chat",{method:"POST",headers:{"Sec-Fetch-Site":"none"}})),true);
});

test("rejects unknown fetch metadata values fail-closed",()=>{
 const request=new Request("https://app.example.com/api/chat",{method:"POST",headers:{"Sec-Fetch-Site":"unexpected"}});
 assert.equal(isTrustedMutationOrigin(request),false);
});
