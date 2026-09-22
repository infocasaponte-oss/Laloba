import { getRequest } from "@tanstack/react-start/server";
import { gateIdentityEnabled,verifyGateIdentity } from "./gate-identity.server";
import { auth,authConfigured } from "./server";

const databaseConfigured=Boolean(process.env.DATABASE_URL?.trim());
const developmentFallbackAllowed=process.env.NODE_ENV!=="production"&&!databaseConfigured;

export { authConfigured };
export const DEV_USER_ID="dev-user";
export class UnauthorizedError extends Error{readonly status=401;constructor(){super("Unauthorized");this.name="UnauthorizedError"}}
export type VerifiedUser={id:string;email:string|null};

export async function getSessionUser(bearerToken?:string):Promise<VerifiedUser|null>{
 if(!authConfigured&&!gateIdentityEnabled())return null;
 const request=getRequest();if(!request)return null;
 const authorization=bearerToken?`Bearer ${bearerToken}`:request.headers.get("authorization");
 if(gateIdentityEnabled()&&authorization?.startsWith("Bearer ")){
  const identity=await verifyGateIdentity(authorization.slice(7).trim());
  if(identity)return{id:identity.subject,email:identity.email};
 }
 if(!authConfigured)return null;
 const headers=new Headers(request.headers);
 if(bearerToken)headers.set("Authorization",`Bearer ${bearerToken}`);
 const session=await auth.api.getSession({headers});
 if(!session?.user)return null;
 return{id:session.user.id,email:session.user.email??null};
}

export async function requireUserId(bearerToken?:string):Promise<string>{
 if(!authConfigured&&!gateIdentityEnabled()){
  if(developmentFallbackAllowed)return DEV_USER_ID;
  throw new Error("Authentication must be configured outside local development");
 }
 const user=await getSessionUser(bearerToken);
 if(!user)throw new UnauthorizedError();
 return user.id;
}
