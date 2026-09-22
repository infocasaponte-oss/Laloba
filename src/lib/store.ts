import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CONNECTORS, INBOX_SEED, NEWS_SEED, TEMPLATES } from "@/lib/catalog";
import { demoHtml } from "@/lib/html-apps";
import { createGenerationId } from "@/lib/generation-id";
import { entrypointHtml, replaceProjectTreeGeneration } from "@/lib/project-tree";
import { canonicalizeProjectTree, projectTreeFromLegacyProject, projectTreeProjection } from "@/lib/project-state";
import type { ProjectSourceFile } from "@/lib/generation-patch";
import type {
  ApiKey,
  AppState,
  Draft,
  Folder,
  Mode,
  Project,
  ThemePref,
} from "@/lib/types";
import { slugify, uid } from "@/lib/utils";

const now = Date.now();

function makeProject(partial: Partial<Project> & Pick<Project, "name" | "html">): Project {
  const id=partial.id ?? uid("p");
  const createdAt=partial.createdAt ?? now;
  const tree=partial.tree
    ? canonicalizeProjectTree(partial.tree)
    : projectTreeFromLegacyProject(id,partial.html,partial.files);
  const projection=projectTreeProjection(tree);
  return {
    id,
    name: partial.name,
    description: partial.description ?? "",
    html: projection.html,
    files: projection.files,
    tree: projection.tree,
    currentGenerationId: projection.currentGenerationId,
    messages: partial.messages ?? [],
    versions: partial.versions ?? [
      { id: uid("v"), createdAt, label: "Versión inicial", html: partial.html },
    ],
    drafts: partial.drafts ?? [],
    starred: partial.starred ?? false,
    folderId: partial.folderId ?? null,
    published: partial.published ?? false,
    publishedAt: partial.publishedAt,
    hue: partial.hue ?? 200,
    createdAt,
    updatedAt: partial.updatedAt ?? createdAt,
    knowledge: partial.knowledge ?? "",
    comments: partial.comments ?? [],
    collaborators: partial.collaborators ?? [
      { id: "me", name: "Alex Ríos", role: "owner" },
    ],
    visibility: partial.visibility ?? "private",
    seoTitle: partial.seoTitle ?? partial.name,
    seoDescription: partial.seoDescription ?? partial.description,
  };
}

const seedProjects: Project[] = [
  makeProject({
    id: "p_cafe",
    name: "Café Lobo",
    description: "Web del café con carta y reservas.",
    html: demoHtml.cafe,
    starred: true,
    published: true,
    publishedAt: now - 86400_000 * 4,
    hue: 32,
    folderId: "f_clientes",
    createdAt: now - 86400_000 * 12,
    updatedAt: now - 3600_000 * 5,
  }),
  makeProject({
    id: "p_crm",
    name: "Pipeline",
    description: "CRM interno de ventas.",
    html: demoHtml.crm,
    starred: true,
    hue: 200,
    folderId: "f_interno",
    createdAt: now - 86400_000 * 9,
    updatedAt: now - 3600_000 * 2,
  }),
  makeProject({
    id: "p_habits",
    name: "Hábitos",
    description: "Rachas personales.",
    html: demoHtml.habits,
    hue: 140,
    createdAt: now - 86400_000 * 6,
    updatedAt: now - 86400_000,
  }),
  makeProject({
    id: "p_folio",
    name: "Estudio Norte",
    description: "Portfolio del estudio.",
    html: demoHtml.portfolio,
    published: true,
    publishedAt: now - 86400_000 * 20,
    hue: 250,
    folderId: "f_clientes",
    createdAt: now - 86400_000 * 20,
    updatedAt: now - 86400_000 * 3,
  }),
  makeProject({
    id: "p_caja",
    name: "Caja",
    description: "Facturas freelance.",
    html: demoHtml.invoices,
    hue: 48,
    folderId: "f_interno",
    createdAt: now - 86400_000 * 3,
    updatedAt: now - 1800_000,
  }),
  makeProject({
    id: "p_focus",
    name: "Reloj Focus",
    description: "Temporizador pomodoro.",
    html: demoHtml.focus,
    hue: 12,
    createdAt: now - 86400_000 * 2,
    updatedAt: now - 600_000,
  }),
];

const seedFolders: Folder[] = [
  { id: "f_clientes", name: "Clientes" },
  { id: "f_interno", name: "Interno" },
];

type Actions = {
  createProject: (input: { name?: string; prompt: string; html?: string; mode: Mode }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  remixProject: (id: string) => Project;
  renameProject: (id: string, name: string) => void;
  toggleStar: (id: string) => void;
  moveToFolder: (id: string, folderId: string | null) => void;
  addFolder: (name: string) => Folder;
  appendMessage: (projectId: string, msg: Project["messages"][number]) => void;
  setHtml: (projectId: string, html: string, label?: string) => void;
  setProjectFiles: (projectId: string, generationId: string, files: ProjectSourceFile[], label?: string) => void;
  addDraft: (projectId: string, name: string) => Draft;
  applyDraft: (projectId: string, draftId: string) => void;
  deleteDraft: (projectId: string, draftId: string) => void;
  restoreVersion: (projectId: string, versionId: string) => void;
  addComment: (projectId: string, text: string) => void;
  toggleConnector: (id: string) => void;
  markInbox: (id: string, read: boolean) => void;
  resolveInbox: (id: string) => void;
  setTheme: (theme: ThemePref) => void;
  setWorkspace: (name: string) => void;
  setProfile: (displayName: string, email: string) => void;
  setKnowledge: (knowledge: string) => void;
  spendCredits: (n: number) => void;
  addApiKey: (name: string) => ApiKey;
  revokeApiKey: (id: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
  resetWorkspace: () => void;
};

const initial: AppState = {
  projects: seedProjects,
  folders: seedFolders,
  connectors: CONNECTORS,
  inbox: INBOX_SEED,
  news: NEWS_SEED,
  templates: TEMPLATES,
  members: [
    { id: "me", name: "Alex Ríos", email: "alex@laloba.app", role: "admin" },
    { id: "marta", name: "Marta Vidal", email: "marta@nortelabs.es", role: "member" },
    { id: "iago", name: "Iago Freire", email: "iago@nortelabs.es", role: "guest" },
  ],
  apiKeys: [
    { id: "k1", name: "CI de previews", prefix: "lb_live_7f3a", createdAt: now - 86400_000 * 30 },
  ],
  workspaceName: "Laloba Studio",
  displayName: "Alex Ríos",
  email: "alex@laloba.app",
  theme: "dark",
  credits: 87,
  creditsCap: 100,
  knowledge: "Somos un estudio pequeño. Preferimos tipografía serif contenida, paletas oscuras y copy en español de España. No uses emojis.",
  sidebarCollapsed: false,
  hasOnboarded: true,
};

export const useLaloba = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      createProject: ({ name, prompt, html, mode }) => {
        const title = name || prompt.slice(0, 42).trim() || "Proyecto nuevo";
        const empty = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>${title}</title>
<style>body{margin:0;background:#0e0e10;color:#f4f0e7;font:16px/1.5 Figtree,system-ui;display:grid;place-items:center;min-height:100dvh}
.card{max-width:420px;padding:28px;border-radius:24px;box-shadow:0 0 0 1px #2a2a2e;text-align:center}
h1{font-family:Syne,sans-serif;letter-spacing:-.03em}</style></head>
<body><div class="card"><h1>${title}</h1><p>Laloba está construyendo esta app…</p></div></body></html>`;
        const project = makeProject({
          name: title,
          description: prompt,
          html: html ?? empty,
          hue: Math.floor(Math.random() * 360),
          messages: prompt
            ? [
                {
                  id: uid("m"),
                  role: "user",
                  content: prompt,
                  mode,
                  createdAt: Date.now(),
                },
              ]
            : [],
        });
        set({ projects: [project, ...get().projects] });
        return project;
      },
      updateProject: (id, patch) => {
        if ("html" in patch || "files" in patch || "tree" in patch || "currentGenerationId" in patch) {
          throw new Error("Source mutations must use setHtml or setProjectFiles");
        }
        set({
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
          ),
        });
      },
      deleteProject: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),
      remixProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) throw new Error("Proyecto no encontrado");
        const copy = makeProject({
          name: `Remix de ${src.name}`,
          description: src.description,
          html: src.html,
          hue: src.hue,
          files: src.files.map((f) => ({ ...f })),
        });
        set({ projects: [copy, ...get().projects] });
        return copy;
      },
      renameProject: (id, name) => get().updateProject(id, { name }),
      toggleStar: (id) =>
        set({
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, starred: !p.starred, updatedAt: Date.now() } : p,
          ),
        }),
      moveToFolder: (id, folderId) => get().updateProject(id, { folderId }),
      addFolder: (name) => {
        const folder = { id: uid("f"), name };
        set({ folders: [...get().folders, folder] });
        return folder;
      },
      appendMessage: (projectId, msg) =>
        set({
          projects: get().projects.map((p) =>
            p.id === projectId
              ? { ...p, messages: [...p.messages, msg], updatedAt: Date.now() }
              : p,
          ),
        }),
      setHtml: (projectId, html, label) => {
        const project=get().projects.find((p)=>p.id===projectId);
        if(!project)throw new Error("Proyecto no encontrado");
        const files=project.tree.files.map((file)=>file.path==="index.html"?{...file,content:html}:file);
        get().setProjectFiles(projectId,createGenerationId(),files,label);
      },
      setProjectFiles: (projectId, generationId, files, label) =>
        set({
          projects: get().projects.map((p) => {
            if (p.id !== projectId) return p;
            const tree=replaceProjectTreeGeneration(p.tree,generationId,files);
            const html=entrypointHtml(tree);
            if(!html)throw new Error("Project tree is missing index.html");
            const version={
              id:uid("v"),
              createdAt:Date.now(),
              label:label ?? `Cambio ${p.versions.length+1}`,
              html,
            };
            return {
              ...p,
              tree,
              currentGenerationId:tree.generationId,
              html,
              files:tree.files.map((file)=>({...file})),
              versions:[...p.versions,version],
              updatedAt:Date.now(),
            };
          }),
        }),
      addDraft: (projectId, name) => {
        const p = get().projects.find((x) => x.id === projectId);
        if (!p) throw new Error("Proyecto no encontrado");
        const draft: Draft = { id: uid("d"), name, html: p.html, createdAt: Date.now() };
        get().updateProject(projectId, { drafts: [...p.drafts, draft] });
        return draft;
      },
      applyDraft: (projectId, draftId) => {
        const p = get().projects.find((x) => x.id === projectId);
        const draft = p?.drafts.find((d) => d.id === draftId);
        if (!p || !draft) return;
        get().setHtml(projectId, draft.html, `Aceptar ${draft.name}`);
      },
      deleteDraft: (projectId, draftId) => {
        const p = get().projects.find((x) => x.id === projectId);
        if (!p) return;
        get().updateProject(projectId, { drafts: p.drafts.filter((d) => d.id !== draftId) });
      },
      restoreVersion: (projectId, versionId) => {
        const p = get().projects.find((x) => x.id === projectId);
        const v = p?.versions.find((x) => x.id === versionId);
        if (!p || !v) return;
        get().setHtml(projectId, v.html, `Restaurar ${v.label}`);
      },
      addComment: (projectId, text) => {
        const p = get().projects.find((x) => x.id === projectId);
        if (!p) return;
        get().updateProject(projectId, {
          comments: [
            ...p.comments,
            { id: uid("c"), author: get().displayName, text, createdAt: Date.now() },
          ],
        });
      },
      toggleConnector: (id) =>
        set({
          connectors: get().connectors.map((c) =>
            c.id === id ? { ...c, connected: !c.connected } : c,
          ),
        }),
      markInbox: (id, read) =>
        set({ inbox: get().inbox.map((i) => (i.id === id ? { ...i, read } : i)) }),
      resolveInbox: (id) => set({ inbox: get().inbox.filter((i) => i.id !== id) }),
      setTheme: (theme) => set({ theme }),
      setWorkspace: (workspaceName) => set({ workspaceName }),
      setProfile: (displayName, email) => set({ displayName, email }),
      setKnowledge: (knowledge) => set({ knowledge }),
      spendCredits: (n) => set({ credits: Math.max(0, get().credits - n) }),
      addApiKey: (name) => {
        const key: ApiKey = {
          id: uid("k"),
          name,
          prefix: `lb_live_${slugify(name).slice(0, 4)}${Math.random().toString(36).slice(2, 6)}`,
          createdAt: Date.now(),
        };
        set({ apiKeys: [key, ...get().apiKeys] });
        return key;
      },
      revokeApiKey: (id) => set({ apiKeys: get().apiKeys.filter((k) => k.id !== id) }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      resetWorkspace: () => set({ ...initial, hasOnboarded: true }),
    }),
    {
      name:"laloba-v1",
      version:2,
      migrate:(persisted)=>{
        const state=persisted as Partial<AppState>;
        return {
          ...state,
          projects:(state.projects ?? []).map((project)=>makeProject({
            ...project,
            name:project.name,
            html:project.html,
          })),
        };
      },
    },
  ),
);

export function useHasHydrated(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
