const LOOPBACK_HOSTS=new Set(["localhost","127.0.0.1","[::1]","::1"]);

function parsedUrl(value:string,label:string){
 let url:URL;
 try{url=new URL(value)}catch{throw new Error(`Invalid ${label} URL`)}
 if(url.username||url.password)throw new Error(`${label} URL must not contain credentials`);
 return url;
}

function assertSecureTransport(url:URL,label:string,nodeEnv:string|undefined){
 if(url.protocol==="https:")return;
 if(url.protocol==="http:"&&nodeEnv!=="production"&&LOOPBACK_HOSTS.has(url.hostname))return;
 throw new Error(`${label} URL must use HTTPS`);
}

export function resolveAuthBrokerIssuer(value:string,nodeEnv=process.env.NODE_ENV){
 const url=parsedUrl(value,"auth broker issuer");
 assertSecureTransport(url,"Auth broker issuer",nodeEnv);
 url.hash="";
 url.search="";
 return url.toString().replace(/\/$/,"");
}

export function resolveBetterAuthOrigin(value:string|undefined,nodeEnv=process.env.NODE_ENV){
 if(!value)return undefined;
 const url=parsedUrl(value,"Better Auth");
 assertSecureTransport(url,"Better Auth",nodeEnv);
 return url.origin;
}
