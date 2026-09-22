import type { ProjectGeneration, ProjectHistory } from "./project-history";
import { appendGeneration, emptyProjectHistory, restoreGeneration } from "./project-history";

const STORAGE_PREFIX = "laloba:project-history:";
const MAX_SERIALIZED_BYTES = 2_500_000;

function storageKey(projectId: string) {
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(projectId)) throw new Error("Invalid project id");
  return STORAGE_PREFIX + projectId;
}

export function loadProjectHistory(projectId: string): ProjectHistory {
  if (typeof localStorage === "undefined") return emptyProjectHistory();
  const raw = localStorage.getItem(storageKey(projectId));
  if (!raw) return emptyProjectHistory();
  try {
    const value = JSON.parse(raw) as ProjectHistory;
    if (value?.schemaVersion !== "1" || !Array.isArray(value.generations)) return emptyProjectHistory();
    return value;
  } catch {
    return emptyProjectHistory();
  }
}

export function saveProjectHistory(projectId: string, history: ProjectHistory) {
  if (typeof localStorage === "undefined") return;
  const raw = JSON.stringify(history);
  if (new TextEncoder().encode(raw).byteLength > MAX_SERIALIZED_BYTES) {
    throw new Error("Project history exceeds local storage safety limit");
  }
  localStorage.setItem(storageKey(projectId), raw);
}

export function recordProjectGeneration(projectId: string, generation: ProjectGeneration): ProjectHistory {
  const history = appendGeneration(loadProjectHistory(projectId), generation);
  saveProjectHistory(projectId, history);
  return history;
}

export async function restoreProjectGeneration(projectId: string, generationId: string): Promise<ProjectHistory> {
  const history = await restoreGeneration(loadProjectHistory(projectId), generationId);
  saveProjectHistory(projectId, history);
  return history;
}
