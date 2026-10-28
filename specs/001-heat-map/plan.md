# Plan de implementación — Spec 001: Mapa de calor

> Estado: **aprobado e implementado el 2026-10-03** por el usuario (y con él, la decisión 12: identificadores y comentarios nuevos en inglés; ids y clases HTML, según el esquema de la sección 5). Este documento decide el CÓMO —archivos, nombres, algoritmo, estilos y pruebas—; el QUÉ y el POR QUÉ siguen siendo de la spec (`spec.md`). Las 5 fases de la sección 9 quedaron en verde: `node --check`, `node --test` (16/16) y verificación completa en DevTools (`file://`, ambos temas, 375 px, contraste 20/20).

## 1. Cómo cumple la constitución

- **Principio 1 — Simplicidad**: `logica.js` es un `<script>` normal (sin ES modules, sin build) y las pruebas usan solo lo que trae Node. — *RNF-1, CF-6*.
- **Principio 2 — La spec manda**: solo se cubren RF-1 a RF-7 y RNF-1 a RNF-8; nada de lo que la spec deja «fuera de alcance» (sin etiquetas de fila, sin marcador de hoy, sin sincronización entre pestañas). — *CF-1*.
- **Principio 3 — Lógica separada**: todos los cálculos (ventana, sumas, niveles, textos AT) viven en `logica.js`, sin DOM ni localStorage y con «hoy» como parámetro. — *RNF-3, CF-3*.
- **Principio 4 — Tests como puerta**: `tests/mapa.test.js` en verde antes de tocar la interfaz; nada avanza con rojos. — *CF-3*.
- **Principio 5 — Datos sagrados**: el mapa solo lee; fechas en hora local (`fechaATexto`, `textoAFecha`, `setDate`; nunca `toISOString`); `sanitizeSessions` solo descarta elementos que no son objetos —ninguna sesión real se pierde—. — *RNF-2, CA1.2, CL-8*.
- **Principio 6 — Idioma**: identificadores y comentarios nuevos en inglés; interfaz, textos y documentación en español. — *RNF-7, CF-7*; ver decisión 12 de la sección 6.

## 2. Qué se crea y qué se modifica

- **`logica.js` (nuevo)** — la lógica pura: funciones nuevas del mapa más las utilidades de fecha trasladadas desde `app.js`. Se carga con `<script>` **antes** que `app.js`; su última línea es una guardia de 2 líneas que solo hace `module.exports` cuando el fichero lo corre Node (los tests), nunca en el navegador. — *Cubre: RF-1, RF-2, RF-3, RF-5 (texto), RNF-3, RNF-5, CL-1 a CL-13*.
- **`index.html` (modifica)** — sección «Mapa de calor» entre la tarjeta de racha y el formulario (título, contenedor de la rejilla, párrafo del detalle y leyenda estática de 5 ítems), más `<script src="logica.js">` antes que `app.js`. — *Cubre: RF-4, RF-5 y RNF-5 (estructura), RF-7/CA7.1, RNF-7*.
- **`styles.css` (modifica)** — tokens de color de nivel por tema, rejilla de 12×7, aspecto de celda (reseteando la piel genérica de `button`), leyenda, línea de detalle y ajuste a 375 px. — *Cubre: RF-3 y RF-4 (representación visual, CA4.2), RNF-4, RNF-6, RNF-7*.
- **`app.js` (modifica)** — capa de interfaz: `renderHeatmap()` construye las 84 celdas; los gestos del detalle con listeners delegados; caché en memoria del último pintado; `leerSesiones()` filtra por `sanitizeSessions()`. Además se **quitan** de aquí las funciones de fecha que pasan a `logica.js` (cuerpos intactos) y se actualiza su única llamada afectada: `etiquetaFecha(sesion.fecha, hoy())`. — *Cubre: RF-2 (pintado), RF-5 (gestos), RF-6/CA6.1-CA6.3, CL-8, CL-10*.
- **`tests/mapa.test.js` (nuevo)** — pruebas de `node --test` sobre `logica.js`, sin DOM. — *Cubre: CF-3, la parte lógica de CF-2 y CF-4, y los CL verificables por lógica*.
- **No se toca**: formato de localStorage ni sus claves (*RNF-2*), la lógica de racha y minutos de las tarjetas (salvo el traslado de utilidades) ni nada del fuera de alcance de la spec. *Nota*: al existir pruebas, la frase de `AGENTS.md` «No hay tests automáticos» quedará desactualizada; cambiarla depende de tu aprobación (es tu fichero).

## 3. Funciones puras necesarias (`logica.js`)

**Nuevas** (nombres en inglés por principio 6; las cadenas que devuelven están en español porque son interfaz):

- `levelFromMinutes(minutes)` → entero `0..4` (0 = vacío), umbrales fijos por desigualdad. — *RF-3, CA3.1-CA3.5, CL-2, CL-11*.
- `buildHeatmap(sessions, today)` → array de **84** celdas `{ date, minutes, level, future }` en orden columna a columna. Única puerta al cálculo y siempre con «hoy» como parámetro (principio 3). — *RF-1, RF-2, RNF-3, CL-1, CL-3 a CL-13*.
- `describeCell(cell, today)` → texto para tecnologías de apoyo y detalle: `«Hoy · 45 min»`, `«1 oct 2026 · sin sesiones»`, `«4 oct 2026 · día futuro»`. — *RF-5, RNF-5, CL-12*.
- `sanitizeSessions(raw)` → el array sin los elementos que no son objetos (o `[]` si la entrada no era array). — *CL-8, principio 5*.
- `addDays(dateText, days)` → fecha local ± días con `setDate` (cantidad negativa suma días). — *RF-1 (ventana), principio 5*.

**Trasladadas desde `app.js` con el cuerpo sin tocar** (la skill `local-dates` manda reutilizar lo existente y la spec exige «el mismo formato legible que la lista»): `fechaATexto`, `textoAFecha`, `esFechaValida`, `diasAntes`, `lunesDeLaSemana` y `etiquetaFecha`. Duplicarlas haría que lista y mapa pudieran divergir. Único cambio de forma: `etiquetaFecha(texto, hoyTexto)` — antes consultaba el reloj por su cuenta; ahora recibe «hoy» (principio 3) y su llamada en `app.js` pasa `hoy()`.

**Se quedan en `app.js`** (leen el reloj o tocan la interfaz): `hoy()`, `ayer()`, `leerSesiones`, `guardarSesiones`, `pintar()` y las estadísticas de la tarjeta.

## 4. Algoritmo en pseudocódigo

```text
CONSTRUIR MAPA (sesiones, hoy)                  -> 84 celdas
  // Paso 1: suma de minutos validos por dia - un solo recorrido (RNF-8)
  totales <- mapa vacio
  para cada sesion en sesiones:
      si no es objeto --------------------------- CL-8  -> continuar
      si fechaInvalida(sesion.fecha) ------------ CL-6  -> continuar
      si sesion.fecha > hoy --------------------- CL-5, CA2.2 -> continuar
      m <- Numero(sesion.minutos)
      si no es finito o m <= 0 ------------------ CL-7  -> continuar
      totales[sesion.fecha] <- (totales[...] o 0) + m   <- CL-3 (la suma manda)

  // Paso 2: las 84 celdas, de la semana mas antigua a la en curso (RF-1)
  lunes   <- lunesDeLaSemana(hoy)                -> CA1.2 (fecha local)
  primera <- addDays(lunes, -77)                 -> CL-9 (11 semanas atras)
  celdas  <- []
  para semana <- 0 .. 11:                        -> CA1.1 (siempre 12)
      lunesSemana <- addDays(primera, 7 * semana)
      para fila <- 0 .. 6:                       -> lunes ... domingo
          fecha   <- addDays(lunesSemana, fila)
          minutos <- totales[fecha] o 0          -> CL-1 y CL-13 (sin datos = vacio)
          anadir a celdas { fecha, minutos,
                            level: levelFromMinutes(minutos),
                            future: fecha > hoy } -> CA1.3, CL-12
  devolver celdas                                -> siempre 84

NIVEL DESDE MINUTOS (total)                      -> 0 .. 4   (CA3.1-CA3.5)
  si total <= 0  -> 0 (vacio)        si total <= 60   -> 2
  si total <= 30 -> 1                 si total <= 120 -> 3
  en otro caso (121, 500, ...) -> 4                (CL-2, CL-11)

DESCRIBIR CELDA (celda, hoy)                     -> texto   (RNF-5)
  e <- etiquetaFecha(celda.fecha, hoy)   -> "Hoy", "Ayer" o "3 oct 2026"
  si celda.future     -> e + " . dia futuro"       (CL-12)
  si celda.level = 0  -> e + " . sin sesiones"     (vacias pasadas; CL-13)
  en otro caso        -> e + " . " + celda.minutes + " min"   (RF-5)
```

Notas: las fechas futuras se descartan en el paso 1, así que una celda `future` siempre queda vacía (CA2.2); un día con solo sesiones inválidas nunca entra en `totales`, luego es vacío sin lógica especial (CL-13 sale solo). Toda la aritmética es de días con `setDate`: ni `toISOString()` ni `new Date("AAAA-MM-DD")` ni 86400000 ms (skill `local-dates`).

## 5. Cómo se pinta en la interfaz

**Estructura en `index.html`** (esquema, no código final — la sección va entre la tarjeta de racha y el formulario):

```html
<section class="tarjeta mapa" aria-labelledby="mapaTitulo">
  <h2 id="mapaTitulo">Mapa de calor</h2>
  <div class="mapa__rejilla" id="mapaRejilla"><!-- 84 botones: los pinta JS --></div>
  <p class="mapa__detalle" id="mapaDetalle" aria-hidden="true"></p>
  <ul class="mapa__leyenda">
    <li><span class="mapa__muestra mapa__muestra--nivel-0"></span> Sin sesiones</li>
    <li><span class="mapa__muestra mapa__muestra--nivel-1"></span> 1–30 min</li>
    <li><span class="mapa__muestra mapa__muestra--nivel-2"></span> 31–60 min</li>
    <li><span class="mapa__muestra mapa__muestra--nivel-3"></span> 61–120 min</li>
    <li><span class="mapa__muestra mapa__muestra--nivel-4"></span> Más de 120 min</li>
  </ul>
</section>
```

**Pintado** — `renderHeatmap()` en `app.js`, llamada desde `pintar()`, que ya corre al cargar y al guardar (*RF-6, CA6.1 y CL-10* cumplidos sin temporizadores):

1. `todayText <- hoy()` una sola vez.
2. `cells <- buildHeatmap(sesiones, todayText)`; guardarlas en `cellsByDate` (objeto en memoria, **sin** escribir nada en localStorage: RNF-3 prohíbe guardar derivados).
3. Vaciar el contenedor y añadir un `DocumentFragment` con 84 `<button type="button">`:
   - clase `mapa__celda mapa__celda--nivel-N` (N de 0 a 4) → el color lo pone CSS;
   - `dataset.fecha = cell.date`;
   - `aria-label = describeCell(cell, todayText)` → *RF-5/HU-4 y RNF-5*, sin depender del detalle visible;
   - sin texto visible (HU-1: «sin leer cifras»).

**Los tres gestos del detalle** (*RF-5, CA5.1-CA5.3*), todos delegados en la rejilla y usando `cellsByDate`:

- `mouseover` → si el objetivo es `.mapa__celda` con `level > 0`, el detalle muestra `describeCell(...)`; si está vacía, se oculta (CA5.3). Se usa `mouseover` y no `mouseenter`: solo el primero burbujea.
- `focusin` / `focusout` → mismo comportamiento con el Tabulador (CA5.1; decisión del informe QA).
- `click` en una celda → es el **toque** de móvil: el navegador ya dispara `click`, sin gestos propios ni `touchstart` (que chocaría con el scroll) → mostrar; `click` fuera de cualquier celda → ocultar (CA5.2).
- `mouseleave` sobre la rejilla → ocultar.
- El `<p>` del detalle lleva `aria-hidden`: es el espejo visual del `aria-label`; un lector de pantalla ya recibe el dato al enfocar la celda y no debe oírlo dos veces.

**Estilos** (*RF-3, RF-4, RNF-4, RNF-6, RNF-7*):

- Tokens nuevos en `:root` y en `[data-tema="oscuro"]`: `--mapa-nivel-1` … `--mapa-nivel-4`, con `--mapa-filete: var(--borde-fuerte)`. **Celdas y leyenda leen las mismas variables** → CA4.2 («exactamente los mismos colores») se cumple por construcción.
- Rejilla: `grid-template-columns: repeat(12, 1fr)`, `grid-template-rows: repeat(7, 1fr)`, `grid-auto-flow: column`, `gap: 3px`; con las celdas en orden columna a columna, cada columna es una semana (*RF-1*).
- `.mapa__celda` debe **neutralizar la piel genérica de `button`** (fondo `--tinta`, `min-height: 44px`, `padding`, `width: 100%`, radio y `:hover` en tinta): fondo = color del nivel, filete 1 px `--mapa-filete`, `aspect-ratio: 1` y radio pequeño. El `:focus-visible` global (fuego) **se mantiene**: es justo el foco del teclado que pide CA5.1.
- 375 px (*RNF-6*): `.mapa` con `padding` horizontal de 10 px → rejilla ≈ 323 px → celda ≈ **24 × 24 px** con `gap: 3px` (12 × 24 + 11 × 3 = 321 ≤ 323): sin scroll horizontal y con objetivo táctil cómodo.
- Leyenda en fila (`flex`, con hueco y textos en español) y línea de detalle con `min-height` reservado: al ocultarse, la leyenda no salta.

**Paleta — grises puros (S = 0), «gama neutra».** Verificada hoy con la fórmula WCAG (script en Temp, exit 0). Cada fila: `claro / oscuro`.

| Nivel | Color claro | Color oscuro | Vs. tarjeta   | Vs. anterior |
|-------|-------------|--------------|---------------|--------------|
| 1     | #949494     | #6e6e6e      | 3,03 / 3,27   | 3,03 / 3,27  |
| 2     | #757575     | #8c8c8c      | 4,61 / 4,96   | 1,52 / 1,52  |
| 3     | #585858     | #b0b0b0      | 7,11 / 7,69   | 1,54 / 1,55  |
| 4     | #3d3d3d     | #d8d8d8      | 10,86 / 11,71 | 1,53 / 1,52  |

La celda vacía es el propio fondo de la tarjeta (CA4.2) y se distingue por su filete `--borde-fuerte`, que ya pasa 3:1: **3,80:1** en claro y **3,48:1** en oscuro. En tema claro la intensidad oscurece y en oscuro aclara: «más intenso» = más distancia con la tarjeta en los dos temas.

## 6. Decisiones técnicas (y su alternativa descartada)

1. **`logica.js` aparte con guardia de export.** Los tests lo cargan con `require("../logica.js")` y la lógica queda sin DOM. — *Descartado*: dejarlo todo en `app.js` protegiendo el arranque (mezcla interfaz y lógica y toca el código que funciona); recortar el código de `app.js` desde los tests con `fs`/`vm` (frágil y difícil de entender); ES modules (prohibidos en `file://`, RNF-1).
2. **Mover las utilidades de fecha en lugar de duplicarlas.** Fuente única: el detalle y la lista deben coincidir (RF-5). — *Descartado*: copiarlas (pueden divergir); aprovechar para dejar puras también las estadísticas de la tarjeta (la spec no lo pide, principio 2).
3. **Cada celda es un `<button>`.** Foco con Tabulador, rol de control y clic/toque vienen gratis (CA5.1, RF-5). — *Descartado*: `div` + `tabindex` manejando la tecla a mano (más código); «una sola parada de Tabulador» con flechas (mejor UX, bastante más código: mejora futura, fuera de esta spec).
4. **Detalle en línea fija bajo la rejilla.** Nunca desborda el viewport ni lo tapa el dedo (RNF-6) y la leyenda no salta. — *Descartado*: bocadillo flotante junto al puntero (hay que recolocarlo en los bordes, en móvil lo tapa el dedo y puede provocar scroll).
5. **Un listener por evento, delegado en la rejilla** (`mouseover`, `focusin`, `focusout`, `click`, `mouseleave`, más un `click` global para «tocar fuera»). — *Descartado*: 84 × 3 listeners sobre cada celda (más código y se recrean en cada pintado).
6. **CSS Grid con `grid-auto-flow: column`** y celdas generadas columna a columna. — *Descartado*: flex con el ancho de las 12 columnas calculado a mano (frágil al redimensionar); `grid-column`/`grid-row` en línea (84 estilos inline).
7. **Colores en variables CSS por tema, compartidas por celdas y leyenda.** CA4.2 por construcción y la paleta se cambia en un solo sitio. — *Descartado*: color fijo por clase (hay que repetirlo en la leyenda y en los dos temas); colorear desde JS (mezcla capas y no se tematiza limpio).
8. **Pintar desde `pintar()`** (que ya se llama al cargar y al guardar). RF-6 y CL-10 cubiertos sin temporizadores. — *Descartado*: `setInterval` para la medianoche y listener de `storage` para otras pestañas (fuera de alcance en la spec; más código).
9. **`describeCell` puro en `logica.js`.** Los textos de RNF-5 se prueban sin navegador. — *Descartado*: componerlos en `app.js` (no se podrían probar con `node --test`).
10. **Caché en memoria `cellsByDate`, reconstruida en cada pintado.** RNF-3 prohíbe *guardar* derivados: aquí no se escribe nada en localStorage. — *Descartado*: recalcular las 84 celdas en cada pasada de ratón (trabajo inútil); guardarlas en localStorage (viola RNF-3 y el principio 5).
11. **`sanitizeSessions` al leer.** Hoy un `[null, …]` rompe `calcularRacha` (`sesiones.map`) y el CL-8 exige que «el resto de la app» siga funcionando; solo se filtran los elementos que no son objetos —ninguna sesión real se pierde (principio 5)—. — *Descartado*: blindar consumidor por consumidor (más sitios que olvidar).
12. **Nuevos nombres y comentarios en inglés; lo existente, sin renombrar.** Lo pide el principio 6; renombrar `app.js` no lo cubre ninguna spec (principio 2) y rompería referencias de `MEMORY.md`. — ⚠️ *Decisión a revisar*: conviven inglés (lo nuevo) y español (lo viejo) en un proyecto didáctico; si quieres un idioma único, pide una tarea aparte (renombrar `app.js` o enmendar la constitución). Los **textos de interfaz** van en español siempre: HTML, leyenda y `describeCell`.
13. **Pruebas con `node:test` + `node:assert`** (incluidos en Node, cero paquetes). — *Descartado*: Jest o Mocha (dependencias, principio 1); «aquí no hay tests» (lo era antes; CF-3 ya lo exige).

## 7. Estrategia de tests con `node --test`

- **Fichero**: `tests/mapa.test.js`; importa con `require("../logica.js")` (la guardia final solo exporta cuando corre en Node).
- **Ejecución**: `node --test` desde la raíz del proyecto — **verificado hoy**: descubre `tests/*.test.js` sin pasar rutas (prueba en Temp: 1 test, exit 0). Si la salida no llega a listar ningún test, no está verde de verdad: un `node --test` que no prueba nada no cuenta.
- **Sin dependencias** y con «hoy» **fijo** en cada prueba (principio 3): mismas entradas, mismas salidas. Solo una familia de tests mueve «hoy» al lunes siguiente, para CL-10.
- **Qué cubre**:
  - `levelFromMinutes`: 0, 1, 30, 31, 60, 61, 120, 121, 500 y decimales 0,5 · 30,5 · 120,5 → *CA3.1-CA3.5, CL-2, CL-11*.
  - `buildHeatmap` (ventana): 84 celdas siempre (*CL-1*), primera columna = lunes de hace 11 semanas (*CL-9*), última = semana de «hoy» con domingo futuro (*CL-12*), orden lunes→domingo (*RF-1, CA1.1*), «hoy» = lunes siguiente mueve la ventana (*CL-10*).
  - `buildHeatmap` (datos): 20 + 40 → 60 → nivel 2 (*CL-3*); válida + inválida suma solo la válida (*CL-4*); futuras no pintan (*CL-5, CA2.2*); «2026-02-30» se ignora sin lanzar (*CL-6*); «45» de texto cuenta y 0 no (*CL-7*); día con solo inválidos → vacío (*CL-13*); `[null, 42, sesión válida]` no rompe nada (*CL-8*); sin sesiones → 84 en nivel 0 (*CL-1*).
  - `describeCell`: «Hoy · 45 min», «Ayer · …», «… · sin sesiones», «… · día futuro» (*RF-5, RNF-5*); la fecha larga se comprueba con patrón, para no depender de la versión de ICU.
  - `sanitizeSessions`: array se mantiene, no-array → `[]`, `null`/`42`/`"x"` fuera y objetos dentro (*CL-8, principio 5*).
  - Pureza: dos llamadas iguales con la misma entrada → resultados idénticos (*principio 3*).
- **Qué no cubre** (y se verifica a mano): DOM, estilos, gestos y contraste.

**Verificación al implementar** (una vez escrito el código):

1. `node --check app.js` y `node --check logica.js` → exit 0.
2. `node --test` → todos en verde (principio 4: no se avanza con rojos).
3. Chrome DevTools con `index.html`: posición y título (*RF-7/CA7.1*); guardar una sesión y ver cambiar la celda sin recargar (*RF-6, CA6.1-CA6.3*); ratón, Tabulador y toque (*RF-5*); leyenda con los mismos colores que las celdas (*CA4.2*); ambos temas; casos *CL-1 a CL-13* a mano (*CF-4*); 375 px sin scroll horizontal (*RNF-6*); contraste con el script WCAG (*CF-5*); `file://` con doble clic (*RNF-1, CF-6*); consola limpia pegando `[null,{"fecha":"2026-10-01","minutos":5}]` en localStorage (*CL-8*).
4. **Checklist de la skill `local-dates`**: sin `toISOString()` ni `new Date("AAAA-MM-DD")` (todo con `fechaATexto`/`textoAFecha`); sin 86400000 ms (`setDate` suma días); una sesión a las 00:30 no cambia nada (la fecha es texto y se compara como texto); el cambio de hora no descuadra la ventana (`setDate` en hora local); fechas futuras excluidas en el paso 1 del algoritmo.

## 8. Qué RF cubre cada parte

- **RF-1 (rejilla 12×7)** → `logica.js: buildHeatmap` + `styles.css: mapa__rejilla` — tests (84 celdas y ventana) y DevTools.
- **RF-2 (celda = día con suma)** → `logica.js: buildHeatmap` — tests de sumas y exclusiones (CL-3 a CL-7, CL-13).
- **RF-3 (escala fija)** → `logica.js: levelFromMinutes` + tokens de `styles.css` — tests de fronteras 30/31, 60/61, 120/121 y decimales.
- **RF-4 (leyenda)** → `index.html` (estática) + `styles.css` (mismas variables que las celdas) — DevTools en ambos temas (CA4.2).
- **RF-5 (detalle)** → `logica.js: describeCell` + `app.js` (gestos) — tests del texto; DevTools con ratón, foco y toque.
- **RF-6 (actualizar sin recargar)** → `app.js: pintar()` llama a `renderHeatmap()` — DevTools: guardar sesión y comprobar CA6.1-CA6.3.
- **RF-7 (ubicación)** → `index.html` (sección entre racha y formulario) — DevTools: título y posición (CA7.1).
- **RNF-1** → `logica.js` como `<script>` simple, cero dependencias — doble clic en `index.html`.
- **RNF-2** → el mapa solo lee: `buildHeatmap` no escribe nada — DevTools: localStorage intacto antes y después de pintar.
- **RNF-3** → `logica.js` puro con `today` como parámetro; caché no persistida — tests con «hoy» fijo; ninguna clave nueva.
- **RNF-4** → paleta en variables por tema, ya verificada con fórmula (3:1 vs tarjeta y 1,5:1 adyacentes) — script WCAG + DevTools en los dos temas.
- **RNF-5** → `aria-label = describeCell` en cada celda — tests del texto + lector de pantalla.
- **RNF-6** → grid + `padding` de 10 px → celdas ≈ 24 px — DevTools a 375 px sin scroll horizontal.
- **RNF-7** → textos nuevos en español (HTML y `describeCell`) — revisión visual de título, leyenda y detalle.
- **RNF-8** → un recorrido de agrupación + 84 nodos en un `DocumentFragment` — DevTools: pintar al guardar sin retardo.
- **CF-1** → spec con dudas cerradas + este plan aprobado — proceso: aprobación antes de tocar código.
- **CF-2** → tests + DevTools por CA — apartado «Verificación al implementar».
- **CF-3** → `tests/mapa.test.js` — `node --test` en verde.
- **CF-4** → tests (parte lógica) + DevTools (parte visual) — CL-1 a CL-13 en ambos temas.
- **CF-5** → paleta verificada con fórmula — script WCAG + DevTools en ambos temas y a 375 px.
- **CF-6** → sin dependencias ni build — doble clic + `node --check`.
- **CF-7** → textos en español; `MEMORY.md` al terminar la tarea — revisar textos y memoria.

## 9. Orden de trabajo (una fase en verde antes de pasar a la siguiente)

1. **Aprobar este plan** (y con él, la corrección del RNF-4 ya aplicada en la spec).
2. **Lógica**: crear `logica.js` y `tests/mapa.test.js` → `node --test` en verde. `app.js` no se toca: la página no cambia.
3. **Interfaz**: `index.html` (sección + script) y `styles.css` (tokens, rejilla, detalle, leyenda, 375 px). Como `app.js` sigue intacto, la página sigue funcionando igual y el mapa aparece con su leyenda; verificación visual en DevTools.
4. **Integración**: `app.js` — quitar las funciones trasladadas, actualizar la llamada de `etiquetaFecha`, `sanitizeSessions` en `leerSesiones`, `renderHeatmap()` + gestos + caché → `node --check`, `node --test` otra vez y DevTools completo.
5. **Cierre**: verificación final (sección 7), `MEMORY.md` actualizado y, si lo apruebas, actualizar en `AGENTS.md` la nota «No hay tests automáticos».
