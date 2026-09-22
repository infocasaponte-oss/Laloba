const MAX_PATH_LENGTH = 180;
const SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function validateGeneratedPath(path: string):
  | { ok: true; path: string }
  | { ok: false; reason: string } {
  if (!path || path.length > MAX_PATH_LENGTH) return { ok: false, reason: "Ruta vacía o demasiado larga." };
  if (path.includes("\\") || path.startsWith("/") || /^[a-zA-Z]:/.test(path)) return { ok: false, reason: "La ruta debe ser relativa POSIX." };
  const parts = path.split("/");
  if (parts.some((p) => !p || p === "." || p === ".." || !SEGMENT.test(p))) return { ok: false, reason: "La ruta contiene segmentos no permitidos." };
  if (parts.some((p) => p.startsWith(".") && p !== ".well-known")) return { ok: false, reason: "No se permiten archivos ocultos." };
  return { ok: true, path: parts.join("/") };
}
