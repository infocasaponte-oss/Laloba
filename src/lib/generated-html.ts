const MAX_GENERATED_HTML_BYTES = 512_000;

export type GeneratedHtmlValidation =
  | { ok: true; html: string }
  | { ok: false; reason: string };

export function validateGeneratedHtml(input: string): GeneratedHtmlValidation {
  const html = input.trim();
  if (!html) return { ok: false, reason: "El generador devolvió HTML vacío." };
  if (new TextEncoder().encode(html).byteLength > MAX_GENERATED_HTML_BYTES) {
    return { ok: false, reason: "El HTML generado supera el límite permitido." };
  }
  if (!/^<!doctype html>/i.test(html) || !/<html[\s>]/i.test(html) || !/<\/html>\s*$/i.test(html)) {
    return { ok: false, reason: "El generador no devolvió un documento HTML5 completo." };
  }
  const blocked = [
    [/<iframe\b/i, "iframes"],
    [/<object\b/i, "objetos embebidos"],
    [/<embed\b/i, "contenido embebido"],
    [/<base\b/i, "etiquetas base"],
    [/\bwindow\.parent\b/i, "acceso a la ventana padre"],
    [/\bwindow\.top\b/i, "acceso a la ventana superior"],
    [/\bparent\.location\b/i, "navegación de la ventana padre"],
  ] as const;
  for (const [pattern, label] of blocked) {
    if (pattern.test(html)) return { ok: false, reason: `El HTML generado contiene ${label}, que no está permitido.` };
  }
  return { ok: true, html };
}
