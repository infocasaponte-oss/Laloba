const LOOPBACK_HOSTS=new Set(["localhost","127.0.0.1","[::1]","::1"]);

function parsedUrl(value:string,label:string){
 let url:URL;
 try{url=new URL(value)}catch{throw new Error(`Invalid ${label} URL`)}
 if(url.username||url.password)throw new Error(`${label} URL must not contain credentials`);
 return url;
}

function assertTransport(url:URL,label:string,nodeEnv:string|undefined){
 if(url.protocol==="https:")return;
 if(url.protocol==="http:"&&nodeEnv!=="production"&&LOOPBACK_HOSTS.has(url.hostname))return;
 throw new Error(`${label} URL must use HTTPS`);
}

export function resolveIdentityEndpoints(input:{
 issuer:string;
 jwksUrl?:string;
 nodeEnv?:string;
}){
 const issuer=parsedUrl(input.issuer,"identity issuer");
 assertTransport(issuer,"Identity issuer",input.nodeEnv);
 const jwks=parsedUrl(input.jwksUrl??new URL("/.well-known/jwks.json",issuer).toString(),"identity JWKS");
 assertTransport(jwks,"Identity JWKS",input.nodeEnv);
 if(jwks.origin!==issuer.origin)throw new Error("Identity JWKS URL must share the issuer origin");
 return{issuer:issuer.toString().replace(/\/$/,""),jwksUrl:jwks};
}
