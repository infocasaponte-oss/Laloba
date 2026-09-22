import { createHash } from "node:crypto";
import { access, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const PARTS_DIR=".canonical-source/package-lock.json.gz.b64";
const OUTPUT="package-lock.json";
const EXPECTED_PARTS=10;
const EXPECTED_GZIP_SHA256="4898151e78e29848aee2491fc9b5ae5a4c4bf3a811ca3f6c984fb457a957039f";
const EXPECTED_LOCK_SHA256="fc81314ce9ca4b6be0300e35a223455005daf314253a131134bf089a5b2ba4af";

function sha256(buffer){
 return createHash("sha256").update(buffer).digest("hex");
}

async function existingCanonicalLock(){
 try{
  const data=await readFile(OUTPUT);
  return sha256(data)===EXPECTED_LOCK_SHA256;
 }catch{return false}
}

async function main(){
 if(await existingCanonicalLock()){
  console.log(`Canonical ${OUTPUT} already present (${EXPECTED_LOCK_SHA256}).`);
  return;
 }

 try{
  await access(OUTPUT);
  throw new Error(`${OUTPUT} exists but does not match the canonical SHA-256; refusing to overwrite it`);
 }catch(error){
  if(error instanceof Error&&error.message.includes("refusing to overwrite"))throw error;
 }

 const entries=(await readdir(PARTS_DIR))
  .filter((name)=>/^part-\d{2}$/.test(name))
  .sort();

 if(entries.length!==EXPECTED_PARTS){
  throw new Error(`Expected ${EXPECTED_PARTS} canonical lockfile fragments, found ${entries.length}`);
 }
 entries.forEach((name,index)=>{
  const expected=`part-${String(index).padStart(2,"0")}`;
  if(name!==expected)throw new Error(`Missing canonical lockfile fragment: ${expected}`);
 });

 const chunks=await Promise.all(entries.map((name)=>readFile(join(PARTS_DIR,name),"utf8")));
 const encoded=chunks.join("");
 if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)||encoded.length%4!==0){
  throw new Error("Canonical lockfile transfer is not valid Base64");
 }

 const compressed=Buffer.from(encoded,"base64");
 const gzipSha=sha256(compressed);
 if(gzipSha!==EXPECTED_GZIP_SHA256){
  throw new Error(`Compressed canonical lockfile SHA-256 mismatch: ${gzipSha}`);
 }

 const lock=gunzipSync(compressed);
 const lockSha=sha256(lock);
 if(lockSha!==EXPECTED_LOCK_SHA256){
  throw new Error(`Canonical package-lock.json SHA-256 mismatch: ${lockSha}`);
 }

 const parsed=JSON.parse(lock.toString("utf8"));
 if(parsed?.name!=="app-builder-workspace"||parsed?.lockfileVersion!==3){
  throw new Error("Canonical package-lock.json metadata is invalid");
 }

 const tmp=`${OUTPUT}.tmp-${process.pid}`;
 try{
  await writeFile(tmp,lock,{flag:"wx"});
  await rename(tmp,OUTPUT);
 }finally{
  await rm(tmp,{force:true}).catch(()=>{});
 }

 console.log(`Restored canonical ${OUTPUT} (${lockSha}).`);
}

main().catch((error)=>{
 console.error("[restore-canonical-lockfile]",error instanceof Error?error.message:error);
 process.exit(1);
});
