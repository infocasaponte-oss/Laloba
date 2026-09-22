function page(title: string, css: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  :root { --bg:#0e0e10; --card:#17171a; --fg:#f4f0e7; --mut:#9a9994; --line:#2a2a2e; --acc:#c9c3b6; --ink:#0e0e10; }
  * { box-sizing:border-box; }
  html,body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.5 Figtree, ui-sans-serif, system-ui, sans-serif; }
  a { color:inherit; text-decoration:none; }
  h1,h2,h3 { font-family: Syne, ui-sans-serif, system-ui; letter-spacing:-.03em; margin:0 0 .4em; }
  .wrap { max-width:1080px; margin:0 auto; padding:28px 20px 64px; }
  header.top { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 20px; border-bottom:1px solid var(--line); }
  .brand { font-weight:650; letter-spacing:-.03em; font-family:Syne,sans-serif; }
  .nav { display:flex; gap:18px; color:var(--mut); font-size:14px; flex-wrap:wrap; }
  .btn { display:inline-flex; align-items:center; gap:8px; background:var(--acc); color:var(--ink); border:0; border-radius:999px; padding:10px 16px; font-weight:600; cursor:pointer; }
  .btn.ghost { background:transparent; color:var(--fg); box-shadow:0 0 0 1px var(--line); }
  .grid { display:grid; gap:16px; }
  .cards { grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); }
  .card { background:var(--card); border-radius:20px; padding:18px; box-shadow:0 0 0 1px var(--line); }
  .mut { color:var(--mut); }
  .hero { padding:56px 0 28px; }
  .hero h1 { font-size:clamp(2rem,5vw,3.4rem); line-height:1.08; }
  input, textarea, select { width:100%; background:#121214; color:var(--fg); border:1px solid var(--line); border-radius:12px; padding:10px 12px; font:inherit; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th,td { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); }
  .pill { display:inline-flex; padding:4px 10px; border-radius:999px; font-size:12px; box-shadow:0 0 0 1px var(--line); color:var(--mut); }
  ${css}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export const demoHtml = {
  cafe: page(
    "Café Lobo",
    `.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center}
     @media(max-width:720px){.hero{grid-template-columns:1fr}}
     .photo{height:280px;border-radius:28px;background:linear-gradient(160deg,#2a2620,#141412 55%,#3a3328);}`,
    `<header class="top"><div class="brand">Café Lobo</div><nav class="nav"><a>Carta</a><a>Horario</a><a>Reservar</a></nav><button class="btn">Reservar mesa</button></header>
    <div class="wrap">
      <section class="hero">
        <div>
          <p class="pill">Barrio Salamanca · desde 2014</p>
          <h1>Pan de masa madre y café de tueste propio.</h1>
          <p class="mut">Desayunos lentos, mediodías rápidos y una barra que no cierra hasta que se acaba el filtro.</p>
          <div style="display:flex;gap:10px;margin-top:18px"><button class="btn">Ver carta</button><button class="btn ghost">Cómo llegar</button></div>
        </div>
        <div class="photo"></div>
      </section>
      <section class="grid cards">
        <article class="card"><h3>Espresso de finca</h3><p class="mut">Notas de cacao y naranja. 2,40 €</p></article>
        <article class="card"><h3>Tostada de tomate</h3><p class="mut">Pan de masa, AOVE y sal en escamas. 4,80 €</p></article>
        <article class="card"><h3>Combo mediodía</h3><p class="mut">Plato del día + filtro. 12,50 €</p></article>
      </section>
    </div>`,
  ),
  crm: page(
    "Pipeline",
    `.kanban{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
     @media(max-width:800px){.kanban{grid-template-columns:1fr}}
     .deal{background:#121214;border-radius:14px;padding:12px;margin:8px 0;box-shadow:0 0 0 1px var(--line)}`,
    `<header class="top"><div class="brand">Pipeline</div><nav class="nav"><a>Tablero</a><a>Contactos</a><a>Informes</a></nav><button class="btn">Nuevo trato</button></header>
    <div class="wrap">
      <h1>Tablero de ventas</h1>
      <p class="mut">Tres etapas, 184.000 € en juego este trimestre.</p>
      <div class="kanban" style="margin-top:20px">
        <section class="card"><h3>Prospecto</h3>
          <div class="deal"><strong>Norte Labs</strong><div class="mut">12.000 € · Marta</div></div>
          <div class="deal"><strong>Atelier Sur</strong><div class="mut">6.400 € · Iago</div></div>
        </section>
        <section class="card"><h3>Negociación</h3>
          <div class="deal"><strong>Caja Verde</strong><div class="mut">48.000 € · Marta</div></div>
        </section>
        <section class="card"><h3>Cerrado</h3>
          <div class="deal"><strong>Estudio Lumen</strong><div class="mut">22.500 € · Iago</div></div>
        </section>
      </div>
    </div>`,
  ),
  habits: page(
    "Hábitos",
    `.heat{display:grid;grid-template-columns:repeat(14,1fr);gap:6px}
     .cell{aspect-ratio:1;border-radius:6px;background:#1f1f22}
     .cell.on{background:#8aa58c}`,
    `<header class="top"><div class="brand">Hábitos</div><button class="btn">Nuevo hábito</button></header>
    <div class="wrap">
      <h1>Racha 14 días</h1>
      <p class="mut">Leer 20 minutos · Caminar · Sin azúcar</p>
      <div class="heat" style="margin:22px 0">${Array.from({ length: 28 }, (_, i) => `<div class="cell${i % 3 ? " on" : ""}"></div>`).join("")}</div>
      <div class="grid cards">
        <article class="card"><h3>Leer</h3><p class="mut">20 / 20 min</p></article>
        <article class="card"><h3>Caminar</h3><p class="mut">6.2 km</p></article>
        <article class="card"><h3>Agua</h3><p class="mut">1.8 / 2.5 L</p></article>
      </div>
    </div>`,
  ),
  portfolio: page(
    "Estudio Norte",
    `.masonry{columns:3;gap:14px} .masonry .card{break-inside:avoid;margin:0 0 14px}
     @media(max-width:800px){.masonry{columns:1}}`,
    `<header class="top"><div class="brand">Estudio Norte</div><nav class="nav"><a>Trabajos</a><a>Estudio</a><a>Contacto</a></nav></header>
    <div class="wrap">
      <section class="hero"><h1>Diseño de producto para marcas silenciosas.</h1><p class="mut">Identidad, web y sistemas. Sede en A Coruña.</p></section>
      <div class="masonry">
        <article class="card"><h3>Marca Lumen</h3><p class="mut">Sistema tipográfico y packaging.</p></article>
        <article class="card"><h3>Web Caja</h3><p class="mut">Editorial commerce.</p></article>
        <article class="card"><h3>App Reloj</h3><p class="mut">Producto nativo, 2025.</p></article>
      </div>
    </div>`,
  ),
  invoices: page(
    "Caja",
    ``,
    `<header class="top"><div class="brand">Caja</div><button class="btn">Nueva factura</button></header>
    <div class="wrap">
      <h1>Facturas</h1>
      <table>
        <thead><tr><th>Nº</th><th>Cliente</th><th>Estado</th><th>Total</th></tr></thead>
        <tbody>
          <tr><td>2026-014</td><td>Norte Labs</td><td><span class="pill">Pagada</span></td><td>2.400 €</td></tr>
          <tr><td>2026-015</td><td>Atelier Sur</td><td><span class="pill">Pendiente</span></td><td>860 €</td></tr>
          <tr><td>2026-016</td><td>Caja Verde</td><td><span class="pill">Borrador</span></td><td>1.120 €</td></tr>
        </tbody>
      </table>
    </div>`,
  ),
  focus: page(
    "Reloj Focus",
    `.clock{font-size:72px;font-variant-numeric:tabular-nums;letter-spacing:-.04em;font-family:Syne,sans-serif}`,
    `<header class="top"><div class="brand">Reloj Focus</div></header>
    <div class="wrap" style="text-align:center">
      <p class="pill">Pomodoro · 25:00</p>
      <div class="clock" id="t">24:12</div>
      <p class="mut">Sesión 3 de 4 · escribir el plan de producto</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
        <button class="btn">Pausa</button>
        <button class="btn ghost">Saltar</button>
      </div>
    </div>
    <script>
      let s=1452; setInterval(()=>{s=Math.max(0,s-1); const m=String(Math.floor(s/60)).padStart(2,'0'); const c=String(s%60).padStart(2,'0'); document.getElementById('t').textContent=m+':'+c;},1000);
    </script>`,
  ),
  saas: page(
    "Nimbus",
    ``,
    `<header class="top"><div class="brand">Nimbus</div><nav class="nav"><a>Producto</a><a>Precios</a><a>Docs</a></nav><button class="btn">Empezar</button></header>
    <div class="wrap">
      <section class="hero"><h1>Observabilidad sin ruido.</h1><p class="mut">Métricas, trazas y logs en una sola vista. Para equipos que no quieren otro panel.</p>
      <div style="display:flex;gap:10px;margin-top:16px"><button class="btn">Probar 14 días</button><button class="btn ghost">Ver demo</button></div></section>
      <div class="grid cards">
        <article class="card"><h3>Gratis</h3><p class="mut">3 proyectos · 20k eventos</p></article>
        <article class="card"><h3>Pro · 29 €</h3><p class="mut">Alertas, SSO, retención 90 días</p></article>
        <article class="card"><h3>Empresa</h3><p class="mut">VPC, auditoría, SLA</p></article>
      </div>
    </div>`,
  ),
  waitlist: page(
    "Espera",
    ``,
    `<div class="wrap" style="max-width:560px;padding-top:80px;text-align:center">
      <p class="pill">Lanzamiento en 18 días</p>
      <h1>Una bandeja para equipos que odian el correo.</h1>
      <p class="mut">Deja tu email. Te avisamos el día uno, sin newsletter eterna.</p>
      <form style="display:flex;gap:8px;margin-top:22px" onsubmit="event.preventDefault();this.querySelector('button').textContent='Apuntado';">
        <input type="email" required placeholder="tú@empresa.com"/>
        <button class="btn" type="submit">Unirme</button>
      </form>
    </div>`,
  ),
  booking: page(
    "Taller",
    ``,
    `<header class="top"><div class="brand">Taller</div><button class="btn">Reservar</button></header>
    <div class="wrap">
      <h1>Huecos esta semana</h1>
      <div class="grid cards">
        ${["Mar 10:00","Mar 12:30","Mié 9:00","Jue 16:00","Vie 11:15","Vie 18:00"].map((t)=>`<article class="card"><h3>${t}</h3><p class="mut">Corte y barba · 38 €</p><button class="btn ghost">Elegir</button></article>`).join("")}
      </div>
    </div>`,
  ),
  store: page(
    "Lana",
    ``,
    `<header class="top"><div class="brand">Lana</div><nav class="nav"><a>Hombre</a><a>Mujer</a><a>Casa</a></nav><button class="btn ghost">Bolsa (2)</button></header>
    <div class="wrap">
      <h1>Colección otoño</h1>
      <div class="grid cards">
        <article class="card"><div style="height:140px;border-radius:14px;background:#2a2622;margin-bottom:12px"></div><h3>Jersey merino</h3><p class="mut">128 €</p></article>
        <article class="card"><div style="height:140px;border-radius:14px;background:#1f2420;margin-bottom:12px"></div><h3>Manta nido</h3><p class="mut">86 €</p></article>
        <article class="card"><div style="height:140px;border-radius:14px;background:#262028;margin-bottom:12px"></div><h3>Calcetines pack</h3><p class="mut">24 €</p></article>
      </div>
    </div>`,
  ),
  journal: page(
    "Cuaderno",
    ``,
    `<header class="top"><div class="brand">Cuaderno</div><button class="btn">Nueva nota</button></header>
    <div class="wrap">
      <h1>Septiembre</h1>
      <article class="card" style="margin-top:16px"><h3>Notas de producto</h3><p class="mut">El editor necesita un modo plan que no toque código. Probar colas.</p></article>
      <article class="card" style="margin-top:12px"><h3>Viaje a Vigo</h3><p class="mut">Llevar el prototipo en el tren. Fotos del puerto al atardecer.</p></article>
    </div>`,
  ),
  okr: page(
    "Norte OKR",
    ``,
    `<header class="top"><div class="brand">Norte OKR</div></header>
    <div class="wrap">
      <h1>T3 2026</h1>
      <article class="card"><h3>Objetivo: lanzar Laloba en público</h3>
        <p class="mut">KR1 · 200 proyectos creados — 142</p>
        <div style="height:8px;background:#222;border-radius:99px;overflow:hidden"><div style="width:71%;height:100%;background:var(--acc)"></div></div>
        <p class="mut" style="margin-top:10px">KR2 · NPS 45 — 38</p>
        <div style="height:8px;background:#222;border-radius:99px;overflow:hidden"><div style="width:84%;height:100%;background:var(--acc)"></div></div>
      </article>
    </div>`,
  ),
};

export function extractHtml(text: string): string | null {
  const fenced = text.match(/```html\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const doc = text.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
  if (doc?.[0]) return doc[0].trim();
  return null;
}

export function stripHtmlBlock(text: string): string {
  return text
    .replace(/```html[\s\S]*?```/gi, "")
    .replace(/<!DOCTYPE html[\s\S]*<\/html>/gi, "")
    .trim();
}
