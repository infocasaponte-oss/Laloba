import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// @ts-expect-error JS plugin alongside the TS vite config
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";
// @ts-expect-error JS plugin alongside the TS vite config
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

function hasGlobbedMigrations(root: string): boolean {
  try { return readdirSync(join(root, "migrations")).some(isMigrationFile); } catch { return false; }
}
function pgliteBootstrapPlugin(): Plugin {
  return { name:"app-builder:pglite-bootstrap", apply:"serve", async configureServer(server) {
    if (!hasGlobbedMigrations(server.config.root)) return;
    const mod = await server.ssrLoadModule("/src/lib/db.ts") as {ensureDbReady?:()=>Promise<void>};
    if (typeof mod.ensureDbReady === "function") await mod.ensureDbReady();
  }};
}
function authPopupPlugin(): Plugin {
  return { name:"app-builder:auth-popup", apply:"serve", configureServer(server) {
    server.middlewares.use(async (req,res,next)=>{
      const rawUrl=req.url??""; if ((rawUrl.split("?",1)[0]??"")!=="/auth/popup"){next();return;}
      if ((req.method??"GET").toUpperCase()!=="GET"){res.statusCode=405;res.end("Method Not Allowed");return;}
      try {
        const host=String(req.headers["x-forwarded-host"]??req.headers.host??"localhost:8080");
        const proto=String(req.headers["x-forwarded-proto"]??((req.socket as {encrypted?:boolean}|undefined)?.encrypted?"https":"http"));
        const headers=new Headers();
        for(const [k,v] of Object.entries(req.headers)){if(v===undefined)continue;if(Array.isArray(v))v.forEach(x=>headers.append(k,x));else headers.set(k,v)}
        if(!headers.has("host"))headers.set("host",host);
        const mod=await server.ssrLoadModule("/src/lib/auth/popup.server.ts") as {handleAuthPopupRequest:(r:Request)=>Promise<Response>};
        const response=await mod.handleAuthPopupRequest(new Request(`${proto}://${host}${rawUrl}`,{method:"GET",headers}));
        res.statusCode=response.status;
        const cookies=typeof response.headers.getSetCookie==="function"?response.headers.getSetCookie():[];
        response.headers.forEach((v,k)=>{if(k.toLowerCase()!=="set-cookie")res.setHeader(k,v)});
        cookies.forEach(c=>res.appendHeader("set-cookie",c)); res.end(Buffer.from(await response.arrayBuffer()));
      } catch(err){console.error("[app-builder] /auth/popup handler failed:",err);if(!res.headersSent){res.statusCode=500;res.end("auth popup failed")}}
    });
  }};
}
export default defineConfig(({command,isPreview})=>({
  server:{host:"0.0.0.0",port:8080,strictPort:true}, preview:{host:"127.0.0.1",port:8081,strictPort:true}, resolve:{tsconfigPaths:true},
  plugins:[pgliteBootstrapPlugin(),authPopupPlugin(),appEnvPlugin(),grokPwaPlugin(),tailwindcss(),tanstackStart(),...(command==="build"||isPreview?[nitro({preset:"vercel",serverDir:"./server"})]:[]),viteReact()],
}));
