# Plan 004 — Objetivo mensual de estudio y felicitación

> Estado: **aprobado e implementado el 2026-10-05** (8/8 tareas cerradas).

## Alcance: archivos y responsabilidades

- `logica.js` — 4 funciones puras nuevas con `today`/valor inyectado: `minutesInMonth`, `crossesGoal`, `activeGoalForMonth`, `validateGoal`, más su export (RF-1, RF-2, RF-4, RF-5 · RNF-1).
- `tests/objetivo.test.js` — **fichero nuevo** de pruebas (CA-4); lo crea el flujo SDD. Si prefieres meterlo en `sesiones.test.js`, dilo antes de las tareas.
- `index.html` — sección de objetivo entre cabecera y tarjetero, quinta tarjeta «🎯 Objetivo» con botón «Cambiar», y el modal de felicitación (RF-1, RF-3, RF-5, RF-6).
- `styles.css` — banda `.objetivo`, la quinta tarjeta con su botón secundario, el modal con fondo de llama y todo a 375 px (RNF-4).
- `app.js` — leer/guardar la meta, orquestar `pintar()`, detectar el cruce en el guardado de sesiones (alta y edición), abrir/cerrar el modal; renombre `minutosSemana`→`minutosMes` y borrado de `minutosDeLaSemana` (RF-1…RF-6).
- `AGENTS.md` — el bullet de verificación «Casos de minutos de la semana» pasa a «Casos de minutos del mes» (ya no existe la tarjeta semanal). Solo si lo apruebas (RNF-5).

## Interfaz: estructura objetivo

```text
┌───────────────────────────────────────────────────────────────────┐
│ Diario de Estudio                                           🌙/☀️  │  header (fuera del contenedor)
├───────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Objetivo de octubre · Quiero estudiar [ 1000 ] min [Guardar]│ │  .objetivo (1ª hija del .contenedor;
│ └───────────────────────────────────────────────────────────────┘ │   solo se ve sin meta o editando)
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │  .tarjetero: 4 o 5 tarjetas (auto-fit)
│ │🔥 3     │ │🏆 3    │ │⏱️ 510  │ │📅 3    │ │🎯 1000 │           │
│ │días seg.│ │Mejor ra│ │Este mes│ │Días mes│ │Objetivo│           │
│ │         │ │        │ │        │ │        │ │[Cambiar]│          │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│ ┌───────────────────────────┬─────────────┬──────────────────┐    │
│ │ Mapa de calor             │ Nueva sesión│ Sesiones         │    │  .rejilla (sin cambios)
│ └───────────────────────────┴─────────────┴──────────────────┘    │
├───────────────────────────────────────────────────────────────────┤
│        ▓▓▓▓▓▓ overlay fijo ▓▓▓▓▓▓                                │
│        ┌─────────────────────────────┐                            │  modal (hidden por defecto)
│        │  🎉  ¡Objetivo cumplido!    │                            │  role="dialog" aria-modal
│        │ Has estudiado 1.000 min     │                            │  fondo --fuego, marfil
│        │ en octubre. ¡Sigue así!     │                            │
│        │         [ ¡Gracias! ]       │                            │
│        └─────────────────────────────┘                            │
└───────────────────────────────────────────────────────────────────┘
```

Esqueletos nuevos (marcador de posición; el texto final en español se afina en las tareas):

```html
<section class="objetivo" id="seccionObjetivo" hidden>
  <form id="formularioObjetivo">
    <p class="objetivo__titulo">🎯 Objetivo de <span id="objetivoMesTexto">octubre</span></p>
    <label for="objetivoMinutos">Quiero estudiar</label>
    <input type="number" id="objetivoMinutos" min="1" step="1" placeholder="Ej.: 1000" required>
    <span class="objetivo__unidad">min</span>
    <button type="submit" id="botonObjetivo">Guardar objetivo</button>
  </form>
  <p class="objetivo__aviso" id="avisoObjetivo" role="alert" hidden></p>
</section>

<section class="tarjeta dato objetivo-tarjeta" id="tarjetaObjetivo" hidden>
  <p class="dato__cifra"><span aria-hidden="true">🎯</span> <span id="metaMinutos">0</span><span class="dato__unidad"> min</span></p>
  <p class="dato__texto">Objetivo</p>
  <button type="button" class="objetivo__cambiar" id="botonCambiarObjetivo">Cambiar</button>
</section>

<div class="felicitacion" id="felicitacion" hidden>
  <div class="felicitacion__caja" role="dialog" aria-modal="true"
       aria-labelledby="felicitacionTitulo" aria-describedby="felicitacionTexto">
    <p class="felicitacion__emoji" aria-hidden="true">🎉</p>
    <h2 id="felicitacionTitulo">¡Objetivo cumplido!</h2>
    <p id="felicitacionTexto"></p>
    <button type="button" id="botonCerrarFelicitacion">¡Gracias!</button>
  </div>
</div>
```

La tarjeta de minutos solo cambia de id y etiqueta: `<span id="minutosMes">` + «Este mes» (RF-4).

## Algoritmo (pseudocódigo)

```text
al cargar:
  objetivoGuardado ← leer localStorage (JSON o null; solo lectura, nunca tira la página)
  pintar()

pintar():
  minutosMes ← minutesInMonth(sesiones, hoy)
  meta ← activeGoalForMonth(objetivoGuardado, hoy)     // null si no hay meta de ESTE mes
  seccionObjetivo.visible ← (meta = null) O editandoObjetivo
  tarjetaObjetivo.visible ← meta ≠ null                // su cifra ← meta
  …resto del pintar actual…

al enviar el formulario de sesión (alta O edición):
  minutosAntes ← minutesInMonth(sesiones, hoy)
  mutar sesiones · guardarSesiones() · pintar()
  si meta ≠ null Y crossesGoal(minutosAntes, minutesInMonth(sesiones, hoy), meta):
      felicitacionTexto ← "Has estudiado <meta> minutos en <mes>. ¡Sigue así!"
      mostrar modal · guardar foco anterior · enfocar «¡Gracias!»

al enviar el formulario de objetivo:
  error ← validateGoal(valor)                          // mensaje en español o null
  si error: mostrar aviso (role=alert) y parar
  objetivoGuardado ← { mes: hoy.slice(0,7), minutos: valor } · escribir en localStorage
  editandoObjetivo ← false · pintar()

al pulsar «Cambiar»:
  editandoObjetivo ← true · precargar input con la meta actual · pintar() · enfocar el input

al cerrar el modal (botón o Esc):
  ocultar · devolver el foco a donde estaba
```

## Funciones puras

- `minutesInMonth(sessions, today)` → número (RF-4, RNF-1): suma minutos con prefijo `today.slice(0,7)`; fecha inválida, futura o minutos no numéricos > 0 no cuentan; no-array → 0. Mismo criterio que `diasEstudiadosEsteMes`, pero sumando minutos en vez de contar días.
- `crossesGoal(before, after, goal)` → booleano (RF-5): `before < goal && after >= goal`. Un guardado que no sube el acumulado o que parte ya de la meta no felicita.
- `activeGoalForMonth(goal, today)` → número o null (RF-2): devuelve `goal.minutos` solo si `goal.mes === today.slice(0,7)` y el valor es entero ≥ 1; cualquier forma rara → null (defensa, como `sanitizeSessions`).
- `validateGoal(value)` → null o mensaje en español (RF-1): patrón idéntico a `validateSession` (los textos de interfaz van en español, decisión de la spec 002).

## Decisiones (con su alternativa descartada)

1. **Meta única por mes, guardada como `{ mes, minutos }`** (una sola clave nueva `diario-estudio-objetivo`; mes distinto → la sección vuelve a pedir). *Descartado*: mapa `{ "2026-10": 1000, … }` por mes — sería historial, fuera de alcance.
2. **El cruce se detecta en memoria, comparando antes/después en cada guardado (alta y edición); no se persiste ningún booleano de «ya felicitado».** *Descartado*: guardar un sello «mes felicitado» — dato que puede quedar obsoleto y que impediría volver a celebrar un cruce legítimo (RF-5).
3. **La sección la gobierna un único estado `editandoObjetivo`** (patrón `listaDesplegada` de la spec 003: un solo escritor). *Descartado*: mostrar/ocultar desde varios sitios — parpadeos y estados imposibles de describir.
4. **Renombrar `minutosSemana` → `minutosMes`** (id, referencia y etiqueta «Este mes»): el nombre viejo mentiría después del RF-4. Es el único renombre, y es semántico, no de idioma. *Descartado*: conservar el id `minutosSemana` — código que miente sobre sus datos.
5. **Borrar `minutosDeLaSemana()`** (queda sin uso) **y cambiar el bullet de AGENTS.md** a «Casos de minutos del mes». *Descartado*: dejarla viva sin llamadas (código muerto) o que AGENTS siga exigiendo casos semanales que ya no existen (regla falsa). Toque de AGENTS.md solo con tu aprobación del plan.
6. **Modal propio con fondo `--fuego`**: la celebración es el momento de la llama («la llama manda») y solo en ese momento se extiende el color a un elemento grande. Accesible: `role="dialog"`, `aria-modal`, foco al botón de cierre, Esc cierra y devuelve el foco. *Descartado*: `alert()` (ya vetado), fondo papel (demasiado sobrio para una fiesta) y trampa de foco completa (código extra sin beneficio tangible; `aria-modal` cubre el lector de pantalla).
7. **Botón secundario «Cambiar» dentro de la quinta tarjeta** que reabre la sección precargada (confirmado contigo). *Descartado*: edición inline en la tarjeta o sección siempre visible — tú elegiste «pide y se oculta».
8. **Validación de la meta con `validateGoal` y aviso `role="alert"` en español** (mismo patrón que la edición de sesiones). *Descartado*: apoyarse solo en la validación nativa del navegador — mensajes fuera de nuestro control.
9. **Identificadores nuevos en inglés** (`seccionObjetivo`, `metaMinutos`, `minutesInMonth`…) por la decisión 12 de la spec 001; textos de interfaz en español. *Descartado*: español para lo nuevo — rompería el patrón de `logica.js`/`app.js`.
10. **La felicitación no se comprueba al cargar** (solo en el guardado que cruza), tal como respondiste en la entrevista. *Descartado*: revisar al cargar — dispararía el modal con la página recién abierta, que dijiste que no.

## Estrategia de tests

- `tests/objetivo.test.js` (CommonJS, `node:test` + `assert`, igual que los otros): `hoy` inyectado para simular meses.
  - `minutesInMonth`: mes actual suma · otro mes no cuenta · fecha futura no cuenta · minutos inválidos no cuentan · fecha corrupta se ignora · dos sesiones el mismo día suman · no-array → 0.
  - `crossesGoal`: 999→1000 con meta 1000 = sí · 1000→1050 = no (ya estaba) · 0→999 = no · meta ya superada antes de guardar = no.
  - `activeGoalForMonth`: mes vigente devuelve el entero · mes siguiente → null · forma rara (`null`, `{}`, 0, 1.5, `"1000"`) → null.
  - `validateGoal`: 1000 → null · 0 / -5 / 1.5 / `"abc"` / `""` → mensaje en español.
- Puerta de cada tarea: `node --check app.js` + `node --test` (29 actuales + los nuevos). Cierre: `markdownlint` en spec/plan/tasks y verificación DevTools (1200/375 px, ambos temas, teclado y consola vacía).
