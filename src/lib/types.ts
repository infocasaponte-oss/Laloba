import type { ProjectTree } from "./project-tree";

export type Mode = "build" | "plan";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: Mode;
  createdAt: number;
  credits?: number;
  durationMs?: number;
  filesChanged?: string[];
};

export type ProjectFile = {
  path: string;
  content: string;
};

export type Version = {
  id: string;
  createdAt: number;
  label: string;
  html: string;
};

export type Draft = {
  id: string;
  name: string;
  html: string;
  createdAt: number;
};

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: number;
};

export type Collaborator = {
  id: string;
  name: string;
  role: "owner" | "editor" | "viewer";
};

export type Project = {
  id: string;
  name: string;
  description: string;
  /** Compatibility projection. ProjectTree is the source of truth. */
  html: string;
  /** Compatibility projection. ProjectTree is the source of truth. */
  files: ProjectFile[];
  tree: ProjectTree;
  currentGenerationId: string;
  messages: ChatMessage[];
  versions: Version[];
  drafts: Draft[];
  starred: boolean;
  folderId: string | null;
  published: boolean;
  publishedAt?: number;
  hue: number;
  createdAt: number;
  updatedAt: number;
  knowledge: string;
  comments: Comment[];
  collaborators: Collaborator[];
  visibility: "private" | "workspace" | "public";
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Folder = {
  id: string;
  name: string;
};

export type Connector = {
  id: string;
  name: string;
  description: string;
  category: "datos" | "pagos" | "ia" | "trabajo" | "auth" | "mcp";
  connected: boolean;
};

export type InboxItem = {
  id: string;
  kind: "invite" | "access" | "system";
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  actionable: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  tag: string;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  category: "apps" | "sitios" | "dashboards" | "comercio";
  html: string;
  hue: number;
};

export type ThemePref = "dark" | "light" | "system";

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "guest";
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
};

export type AppState = {
  projects: Project[];
  folders: Folder[];
  connectors: Connector[];
  inbox: InboxItem[];
  news: NewsItem[];
  templates: Template[];
  members: WorkspaceMember[];
  apiKeys: ApiKey[];
  workspaceName: string;
  displayName: string;
  email: string;
  theme: ThemePref;
  credits: number;
  creditsCap: number;
  knowledge: string;
  sidebarCollapsed: boolean;
  hasOnboarded: boolean;
};
