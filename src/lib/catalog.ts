import { demoHtml } from "@/lib/html-apps";
import type { Connector, InboxItem, NewsItem, Template } from "@/lib/types";

export const CONNECTORS: Connector[] = [
  { id: "github", name: "GitHub", description: "Sincroniza el repositorio y abre PRs desde el editor.", category: "trabajo", connected: true },
  { id: "supabase", name: "Supabase", description: "Auth, Postgres y storage para tus apps.", category: "datos", connected: true },
  { id: "stripe", name: "Stripe", description: "Cobros, suscripciones y portal de cliente.", category: "pagos", connected: false },
  { id: "paddle", name: "Paddle", description: "Pagos con impuestos gestionados.", category: "pagos", connected: false },
  { id: "google", name: "Google", description: "Inicio de sesión, Drive y Calendar.", category: "auth", connected: false },
  { id: "slack", name: "Slack", description: "Avisos de publicación y comentarios.", category: "trabajo", connected: true },
  { id: "notion", name: "Notion", description: "Importa specs y bases como contexto.", category: "trabajo", connected: false },
  { id: "figma", name: "Figma", description: "Arranca un proyecto desde un archivo de diseño.", category: "trabajo", connected: false },
  { id: "linear", name: "Linear", description: "Crea issues cuando Laloba detecta un fallo.", category: "trabajo", connected: false },
  { id: "resend", name: "Resend", description: "Correo transaccional desde tu dominio.", category: "trabajo", connected: false },
  { id: "openai", name: "OpenAI", description: "Modelos extra para funciones de tu app.", category: "ia", connected: false },
  { id: "xai", name: "xAI", description: "Grok dentro de las apps que construyes.", category: "ia", connected: true },
  { id: "hubspot", name: "HubSpot", description: "CRM y formularios de captación.", category: "datos", connected: false },
  { id: "shopify", name: "Shopify", description: "Catálogo y checkout para tiendas.", category: "pagos", connected: false },
  { id: "postgres", name: "Postgres", description: "Base propia, fuera de Laloba Cloud.", category: "datos", connected: false },
  { id: "custom-mcp", name: "MCP propio", description: "Conecta un servidor MCP con herramientas tuyas.", category: "mcp", connected: false },
];

export const TEMPLATES: Template[] = [
  { id: "tpl-saas", name: "SaaS Nimbus", description: "Landing con precios y CTA de prueba.", category: "sitios", html: demoHtml.saas, hue: 210 },
  { id: "tpl-cafe", name: "Café de barrio", description: "Carta, reserva y foto hero.", category: "sitios", html: demoHtml.cafe, hue: 32 },
  { id: "tpl-crm", name: "Pipeline CRM", description: "Kanban de tratos y etapas.", category: "apps", html: demoHtml.crm, hue: 200 },
  { id: "tpl-habits", name: "Hábitos", description: "Rachas, calor y tres métricas.", category: "apps", html: demoHtml.habits, hue: 140 },
  { id: "tpl-folio", name: "Estudio Norte", description: "Portfolio editorial de estudio.", category: "sitios", html: demoHtml.portfolio, hue: 250 },
  { id: "tpl-caja", name: "Facturas Caja", description: "Listado de facturas con estados.", category: "apps", html: demoHtml.invoices, hue: 48 },
  { id: "tpl-focus", name: "Reloj Focus", description: "Pomodoro con temporizador vivo.", category: "apps", html: demoHtml.focus, hue: 12 },
  { id: "tpl-wait", name: "Lista de espera", description: "Countdown y captura de email.", category: "sitios", html: demoHtml.waitlist, hue: 190 },
  { id: "tpl-book", name: "Reservas Taller", description: "Huecos de la semana y precios.", category: "comercio", html: demoHtml.booking, hue: 28 },
  { id: "tpl-store", name: "Tienda Lana", description: "Colección con tres productos.", category: "comercio", html: demoHtml.store, hue: 18 },
  { id: "tpl-journal", name: "Cuaderno", description: "Notas de producto y viaje.", category: "apps", html: demoHtml.journal, hue: 160 },
  { id: "tpl-okr", name: "OKR T3", description: "Objetivo con barras de progreso.", category: "dashboards", html: demoHtml.okr, hue: 230 },
];

export const INBOX_SEED: InboxItem[] = [
  { id: "in1", kind: "invite", title: "Invitación al workspace Norte Labs", body: "Marta Vidal te invita como editora. Caduca en 5 días.", createdAt: Date.now() - 3600_000, read: false, actionable: true },
  { id: "in2", kind: "access", title: "Iago pide acceso a Pipeline", body: "Quiere rol de visor en el proyecto Pipeline.", createdAt: Date.now() - 86400_000 * 2, read: false, actionable: true },
  { id: "in3", kind: "system", title: "Publicación de Café Lobo", body: "Tu sitio quedó en cafe-lobo.laloba.app. El análisis de seguridad no encontró hallazgos altos.", createdAt: Date.now() - 86400_000 * 4, read: true, actionable: false },
];

export const NEWS_SEED: NewsItem[] = [
  { id: "n1", date: "16 sep 2026", tag: "Chat", title: "Menú de contexto unificado", body: "El botón + agrupa skills, proyectos, conectores, diseños y archivos en un solo sitio." },
  { id: "n2", date: "7 sep 2026", tag: "Colaboración", title: "Borradores en paralelo", body: "Explora layout y copy en un borrador sin tocar la versión publicada. Acepta cuando encaje." },
  { id: "n3", date: "28 ene 2026", tag: "Agente", title: "Modo Plan y colas", body: "Discute el enfoque sin generar código, y apila tareas mientras Laloba trabaja." },
];
