/**
 * Single source of truth for platform head chrome (PWA, extensions.js, OG),
 * shared by the Vite plugin and Nitro middleware.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
export const DEFAULT_APP_NAME="Grok App";
export const OG_SERVICE_URL_DEFAULT="https://og.grok.me";
export const OG_SITE_REL_PATH="src/lib/og/site.json";
export function escapeHtml(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}
export function appNameFromHost(hostHeader){const host=String(hostHeader??"").split(",")[0].trim().split(":")[0].toLowerCase();if(!host.endsWith(".grok.me"))return DEFAULT_APP_NAME;const slug=host.split(".")[0]??"";if(!slug||slug==="www"||!/^[a-z0-9-]{1,63}$/.test(slug))return DEFAULT_APP_NAME;return slug.split("-").filter(Boolean).map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(" ")||DEFAULT_APP_NAME}
export function publicAppHost(hostHeader){const host=String(hostHeader??"").split(",")[0].trim().split(":")[0].toLowerCase();if(!host||!/^[a-z0-9.-]+$/.test(host)||!host.includes(".")||/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)||host.endsWith(".vercel.app")||host.endsWith(".vercel.com"))return "";return host}
export function resolvePublicHost(hostHeader){return publicAppHost(process.env?.VITE_PUBLIC_HOSTNAME)||publicAppHost(hostHeader)}
export function isInstallQuery(url){const q=String(url??"").split("?",2)[1]??"";const p=new URLSearchParams(q);return ["1","true"].includes(p.get("install")??"")&&(p.get("platform")??"").toLowerCase()==="ios"}
export function isDocumentPath(pathname){const p=String(pathname??"");return !p.startsWith("/__grok/")&&!p.startsWith("/api/")&&!p.startsWith("/@")&&!p.startsWith("/node_modules")&&!/\.[a-z0-9]+$/i.test(p)}
export function acceptsHtml(accept){const v=String(accept??"");return v===""||v.includes("text/html")||v.includes("*/*")}
export function stripInstallParams(url){const [path="/",query=""]=String(url??"/").split("?",2);const p=new URLSearchParams(query);p.delete("install");p.delete("platform");const rest=p.toString();return rest?`${path}?${rest}`:path}
export function renderInstallPageHtml(template,{host,url}={}){return String(template).replaceAll("{{APP_NAME}}",escapeHtml(appNameFromHost(host))).replaceAll("{{APP_URL}}",escapeHtml(stripInstallParams(url)))}
export function renderWebManifest(hostHeader){const name=appNameFromHost(hostHeader);return JSON.stringify({name,short_name:name,id:"/",start_url:"/",scope:"/",display:"standalone",background_color:"#000000",theme_color:"#000000",icons:[{src:"/__grok/icon-180.png",sizes:"180x180",type:"image/png"}]},null,2)}
export function grokPwaHeadTags(appName=DEFAULT_APP_NAME){return [["manifest",'<link rel="manifest" href="/__grok/manifest.webmanifest">'],["apple-touch-icon",'<link rel="apple-touch-icon" href="/__grok/icon-180.png">'],["apple-mobile-web-app-title",`<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`],["theme-color",'<meta name="theme-color" content="#000000">']]}
export const GROK_EXTENSIONS_SCRIPT_SRC="https://grok.com/grok-app-builder/extensions.js";
export function readGrokProjectId(){return String(process.env?.VITE_PROJECT_ID??"").trim()}
export function grokExtensionsHeadTags(projectId=readGrokProjectId()){const id=escapeHtml(projectId);return [projectId?`<meta name="grok-project-id" content="${id}">`:"",`<script src="${GROK_EXTENSIONS_SCRIPT_SRC}"${projectId?` data-project-id="${id}"`:""} defer></script>`].filter(Boolean)}
export function snapshotOgIdentity(cwd=process.cwd()){const path=join(cwd,OG_SITE_REL_PATH);if(!existsSync(path))return {};try{return JSON.parse(readFileSync(path,"utf8"))}catch{return {}}}
export function injectGrokPwaHead(html,{host,cwd=process.cwd()}={}){const tags=[...grokPwaHeadTags(appNameFromHost(host)).map(x=>x[1]),...grokExtensionsHeadTags()].join("\n");return /<\/head>/i.test(html)?html.replace(/<\/head>/i,`${tags}\n</head>`):tags+html}
export function createHeadInjector(options={}){let buffered=Buffer.alloc(0),done=false;return{push(chunk){if(done)return[chunk];buffered=Buffer.concat([buffered,chunk]);const s=buffered.toString("utf8");const i=s.search(/<\/head>/i);if(i<0&&buffered.length<65536)return[];done=true;const out=Buffer.from(injectGrokPwaHead(s,options),"utf8");buffered=Buffer.alloc(0);return[out]},flush(){if(!buffered.length)return[];const out=Buffer.from(injectGrokPwaHead(buffered.toString("utf8"),options),"utf8");buffered=Buffer.alloc(0);done=true;return[out]}}}
