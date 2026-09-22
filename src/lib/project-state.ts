import type { ProjectSourceFile } from "./generation-patch";
import { entrypointHtml,projectTreeFromGeneration,replaceProjectTreeGeneration,type ProjectTree } from "./project-tree";

export function legacyProjectGenerationId(projectId:string){
 const safe=projectId.replace(/[^A-Za-z0-9_-]/g,"_").slice(0,48)||"project";
 return `generation_legacy_${safe}`;
}

export function projectTreeFromLegacyProject(
 projectId:string,
 html:string,
 files?:ProjectSourceFile[],
):ProjectTree{
 const sourceFiles=files?.length?files:[{path:"index.html",content:html}];
 return projectTreeFromGeneration(
  legacyProjectGenerationId(projectId),
  {schemaVersion:"2",summary:"Legacy project migration",files:sourceFiles},
 );
}

export function canonicalizeProjectTree(tree:ProjectTree):ProjectTree{
 return replaceProjectTreeGeneration(tree,tree.generationId,tree.files);
}

export function projectTreeProjection(tree:ProjectTree){
 const canonical=canonicalizeProjectTree(tree);
 const html=entrypointHtml(canonical);
 if(!html)throw new Error("Project tree is missing index.html");
 return{
  html,
  files:canonical.files.map((file)=>({...file})),
  currentGenerationId:canonical.generationId,
  tree:canonical,
 };
}
