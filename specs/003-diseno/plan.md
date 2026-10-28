# Plan — Spec 003: cabecera, todo el ancho, mapa en cintas y lista plegada

> Estado: **aprobado e implementado el 2026-10-05 por el usuario** —incluido el cambio de RF-3 aprobado con diff el mismo día (figura del tarjetero; decisión 13)—. Las 8 tareas de `tasks.md` quedaron en verde: `node --check`, `node --test` (29/29) y verificación en DevTools (`file://`, ambos temas, 1200/900/768/375 px, consola vacía).

## Alcance: archivos y responsabilidades

- **`index.html`** — cabecera fuera del contenedor, tarjetero de 4 tarjetas, envoltorio `.rejilla` y botón «Cargar más sesiones» (RF-1, RF-2, RF-3, RF-6).
- **`styles.css`** — cabecera-barra a todo el ancho, contenedor sin `max-width`, tarjetero y rejilla de 3 columnas, cintas (8 columnas) con letras de día y fechas de semana, tokens de paleta nuevos, botón de la lista y media queries (RF-1 a RF-5, RNF-4, RNF-5).
- **`app.js`** — `pintar()` con lista plegada y su botón, `renderHeatmap()` en filas con letras y fechas, listener del botón (RF-4, RF-6, CA3.2, CA6.x).
- **`specs/003-diseno/tasks.md`** — tareas de implementación, fase siguiente (CF-1).
- **No se tocan**: `logica.js`, `tests/` (29/29), `localStorage` ni los textos existentes, salvo los nuevos del RF-4 y RF-6 (RNF-2, RNF-3).

## Interfaz: estructura objetivo

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Diario de Estudio                                          🌙 / ☀️        │  header (hermano, barra con filete)
│ Registra tus sesiones y mantén la racha viva                             │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────┐ ┌────────────────┐ ┌────────────────┐      │  .tarjetero (grid, aria-live)
│ │🔥 3       │ │      🏆 3    │ │   ⏱️ 135 min   │ │      📅 3      │      │
│ │días seg.  │ │  Mejor racha │ │  Esta semana   │ │  Días este mes │      │
│ └──────────┘ └──────────────┘ └────────────────┘ └────────────────┘      │
│ ┌───────────────────────────┬─────────────────┬───────────────────────┐  │  .rejilla (≥1024: 3 columnas)
│ │ Mapa de calor             │ Nueva sesión    │ Sesiones              │  │
│ │      L   M   X   J  V S D │ Fecha           │ Prácticas        45min│  │
│ │ 28 sep ░░ ▓▓ ██ ░░ ██ ░░░ │ Tema            │ [Editar] [Borrar]    │  │
│ │  5 oct ██ ░░ ██ ▓▓ ░░ ░░░ │ Minutos         │ Repaso          30min│  │
│ │  …12 semanas…             │ [Guardar sesión]│ [Cargar más sesiones]│  │
│ │ Leyenda                   │                 │                      │  │
│ └───────────────────────────┴─────────────────┴───────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
   <1024 px: .rejilla pasa a 1 columna (mapa, alta, sesiones en ese orden)
```

`index.html` (esqueleto; los textos existentes se copian literalmente):

```html
<body>
  <header class="cabecera">            <!-- se mueve FUERA de .contenedor (RF-1) -->
    <div class="cabecera__fila"> …h1 + subtítulo… botón #botonTema… </div>
  </header>

  <div class="contenedor">             <!-- se le quita max-width: 640px (RF-2) -->
    <div class="tarjetero" aria-live="polite">          <!-- CA3.2: una sola región -->
      <section class="tarjeta racha">…🔥 + «días seguidos estudiando»…</section>
      <section class="tarjeta dato"><p class="dato__cifra">🏆 <span id="mejorRacha">0</span></p><p class="dato__texto">Mejor racha</p></section>
      <section class="tarjeta dato"><p class="dato__cifra">⏱️ <span id="minutosSemana">0</span><span class="dato__unidad"> min</span></p><p class="dato__texto">Esta semana</p></section>
      <section class="tarjeta dato"><p class="dato__cifra">📅 <span id="diasMes">0</span></p><p class="dato__texto">Días este mes</p></section>
    </div>

    <div class="rejilla">                               <!-- RF-2: 3 columnas ≥1024 -->
      <section class="tarjeta mapa">…sin cambios de contenido…</section>
      <section class="tarjeta">…formulario idéntico…</section>
      <section class="tarjeta">…<ul id="listaSesiones">… y
        <button id="botonMasSesiones" class="lista__mas" type="button"
                aria-expanded="false" hidden>Cargar más sesiones</button>…</section>
    </div>
  </div>
</body>
```

Los `<span id="mejorRacha|minutosSemana|diasMes|rachaNumero">` conservan sus ids: `app.js` no cambia en esas referencias. `aria-live` se traslada de la tarjeta 🔥 al envoltorio `.tarjetero` (anuncia las 4 cifras, una sola región).

## Algoritmo (pseudocódigo)

```text
// Estado nuevo de módulo (app.js); solo lo cambia el botón → CA6.2 y CA6.4
// se cumplen de forma natural (no se resetea en pintar()).
let listaDesplegada = false

function pintar() {
    … cuatro cifras, igual que hoy …
    ordenadas = sesionesOrdenadas()
    listaVacia.hidden = ordenadas.length > 0
    visibles = listaDesplegada ? ordenadas : ordenadas.slice(0, 2)      // RF-6
    for sesión de visibles: mismo <li> de hoy (Editar/Borrar incluidos)
    botonMasSesiones.hidden          = ordenadas.length <= 2            // CA6.1
    botonMasSesiones.textContent     = listaDesplegada
                                         ? "Mostrar menos" : "Cargar más sesiones"   // CA6.3
    botonMasSesiones.setAttribute("aria-expanded", String(listaDesplegada))
    renderHeatmap()
}

al pulsar botonMasSesiones → listaDesplegada = !listaDesplegada; pintar()   // CA6.3

function renderHeatmap() {
    todayText = hoy();  cells = buildHeatmap(sesiones, todayText)       // SIN CAMBIOS (RNF-2)
    cellsByDate = índice por fecha (como hoy)
    limpiar heatmapGrid; fragment = createDocumentFragment()
    fragment += <span class="mapa__esquina" aria-hidden>                // esquina vacía
    para letra de ["L","M","X","J","V","S","D"]:
        fragment += <span class="mapa__dia" aria-hidden>letra</span>    // cabecera RF-4
    para fila de 0 a 11:                                                // cells es semana-major
        fragment += <span class="mapa__etiqueta" aria-hidden>
                        etiquetaFecha(cells[fila*7].date, todayText)    // CA4.4, MISMA fuente
                    </span>
        para día de 0 a 6:
            celda = cells[fila*7 + día]
            fragment += botón EXACTO de hoy (clase --nivel-N, dataset.fecha,
                        aria-label = describeCell(...))                // CA4.3
    heatmapGrid += fragment
}
```

Los 5 listeners delegados de `heatmapGrid` y el de `document` **no cambian**: las letras y fechas no son `.mapa__celda`, `showHeatmapDetail` las ignora (`dataset.fecha` indefinido) y al tocarlas se cierra el detalle (CA5.2 sigue valiendo).

## Funciones puras

Ninguna nueva y ninguna tocada: `buildHeatmap`, `levelFromMinutes`, `describeCell`, `etiquetaFecha`, rachas y totales quedan tal cual en `logica.js`. Las etiquetas de semana **reutilizan `etiquetaFecha`** (misma fuente de formato: «Hoy»/«Ayer»/«28 sep 2026»), de modo que el mapa y la lista nunca divergen en el formato de fecha.

## Decisiones (con su alternativa descartada)

1. **Cabecera fuera del `.contenedor`** — así su filete inferior y su fondo llegan de borde a borde (RF-1). *Descartado*: dejarla dentro, que el filete se quedaría corto por el padding del contenedor.
2. **`aria-live` único en `.tarjetero`** — una región que anuncia las 4 cifras (CA3.2). *Descartado*: 4 regiones vivas (el lector anunciaría de más).
3. **`listaDesplegada` solo la toca el botón** — cumple CA6.2 (arranca a false) y CA6.4 (se conserva al guardar/editar/borrar) sin tocar los flujos de la spec 002. *Descartado*: resetearla dentro de `pintar()` (rompería CA6.4).
4. **`slice(0, 2)` en el pintado (no ocultar con CSS)** — el DOM solo contiene las visibles: el teclado no llega a filas ocultas y hay menos nodos. *Descartado*: `max-height` con CSS (las filas ocultas seguirían tabulables).
5. **Letras de día en JS dentro del mismo `renderHeatmap`** — la rejilla se vacía en cada pintado; todo se reconstruye en un solo fragmento (una fuente, sin cabecera huérfana). *Descartado*: cabecera estática en HTML (se borraría con `innerHTML = ""`).
6. **`aria-hidden` en letras y fechas de fila** — la información completa ya está en el `aria-label` de cada celda (RNF-5 de la spec 001); sin esto el lector repetiría la fecha 13 veces. *Descartado*: dejarlas legibles (ruido al leer el mapa).
7. **Rejilla de 8 columnas `auto repeat(7, minmax(0,1fr))` con 104 elementos** (1 esquina + 7 letras + 12 × (fecha + 7 celdas)) — la columna `auto` se dimensiona por las fechas y letras y cabecera/celdas quedan alineadas por construcción. *Descartado*: cabecera en un elemento aparte (las columnas `auto` de dos rejillas no se sincronizan).
8. **Proporción de columnas `minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr)`** (mapa · alta · sesiones) con `gap`; `minmax(0,…)` evita desbordes. Se ajustará en la validación visual si alguna tarjeta queda estrecha. *Descartado*: porcentajes fijos (no se adaptan al contenido).
9. **Celdas sin `aspect-ratio: 1` y con `min-height: 32px`** — de cuadradas a cintas horizontales; a 375 px cada celda queda ≈30 px de ancho (≥24 px del precedente de la spec 001). *Descartado*: mantener cuadrados (el formato que el usuario rechazó).
10. **Paleta en los tokens `--mapa-nivel-1..4`** (bloque `:root` y bloque `[data-tema="oscuro"]`): celdas y leyenda siguen compartiendo `--nivel-color`, imposible que se desincronicen (CA5.1). *Descartado*: hex sueltos por regla.
11. **Botón de la lista con estilo secundario (filete, ancho completo)** — no compite con «Guardar sesión» ni con la tarjeta 🔥 (identidad de color). *Descartado*: reutilizar el botón naranja principal.
12. **Identificadores nuevos en español** (`tarjetero`, `rejilla`, `botonMasSesiones`, `listaDesplegada`, `mapa__etiqueta`…) siguiendo el esquema de cada fichero, igual que la spec 002 hizo con `crearBotonSesion`/`borrarSesion`; nada existente se renombra. *Descartado*: inglés para lo nuevo (rompería el patrón de `app.js`, `styles.css` e `index.html`). Si prefieres inglés para lo nuevo, se cambia aquí antes de las tareas.
13. **Figura de las tres tarjetas de dato** (cambio de RF-3 aprobado el 2026-10-05): `.dato__cifra` con `clamp(1.9rem, 5vw, 2.5rem)` (30–40 px, siempre por debajo de la 🔥: 44–56 px ≥600 y 52–76 px <600, cumpliendo CA3.1) con el emoji dentro de la misma línea, `.dato__unidad` («min») al 50 % de la cifra y `.dato__texto` pequeño debajo en `--texto-suave`; superficie = papel de tarjeta, solo 🔥 es llama. *Descartado*: fondo de llama en las cuatro tarjetas (la fila sería una banda naranja y la racha dejaría de destacarse; el diff aprobado interpreta «como la tarjeta de la racha» = la figura) y cifras de dato al mismo tamaño que la 🔥 (rompería la jerarquía del héroe de la fila).

## Estrategia de tests y verificación

- **Sin pruebas nuevas**: todo lo nuevo es DOM y estilo; la lógica no cambia (RNF-2). Puerta en cada tarea: `node --check app.js` y `node --test` → **29/29** sin tocar `logica.js` ni `tests/` (CF-2).
- **Contraste (CF-3)**: reutilizar el script de ratios de Temp (`paletas-buscar.js`) sobre los valores ya medidos del RF-5; mide en una llamada aparte de la que cambia el tema (aprendizaje de MEMORY).
- **DevTools en `file://`** (CF-4, CF-5, CF-6): 1200 px → cabecera, tarjetero en fila y 3 columnas; 900 px → apilado; `emulate` 375 px → sin scroll horizontal con la fecha de semana visible; ambos temas con celdas = leyenda; estados del botón de lista (CA6.1 a CA6.5, CL-10 a CL-13); recorrido de teclado con foco visible y `aria-expanded`; consola vacía; persistencia de sesiones y tema tras recargar.
- **Lint (CF-7)**: `npx -y markdownlint-cli --disable MD013 MD036 --` sobre spec, plan y tasks; textos en español; `MEMORY.md` al cerrar la fase.

## Mapeo RF → verificación

- **RF-1** → DevTools: barra a todo el ancho, textos literal, cambio de tema sin recarga.
- **RF-2** → DevTools a 1200 / 900 / 375 px: columnas, apilado y sin scroll.
- **RF-3** → 4 tarjetas con los textos exactos; anuncio de cifras al guardar (aria-live).
- **RF-4** → 104 elementos en orden de filas; fechas = lunes de su fila; detalle y `aria-label` idénticos a hoy (RNF-5).
- **RF-5** → tokens nuevos; ratios con la fórmula en ambos temas; leyenda = celdas.
- **RF-6** → CA6.1 a CA6.5 y CL-10 a CL-13 en DevTools (guardar, editar, borrar, recargar).

## Riesgos a vigilar en la validación

- Ancho de la columna de fechas frente al de las celdas a 375 px (si aprieta: bajar la letra de la etiqueta, no quitar la fecha).
- `font-size: clamp(3.25rem, 16vw, 4.75rem)` del número 🔥 dentro de una tarjeta estrecha → reescalar para que no domine la fila.
- `.tarjeta { margin-bottom: 16px }` conviviendo con los `gap` de los grids nuevos → anular ese margen dentro de `.tarjetero` y `.rejilla` (cuidado con la especificidad: usar `.tarjetero .tarjeta` / `.rejilla > .tarjeta`).
- Transición de fondo de las celdas: medir colores en una llamada posterior al cambio de tema.
