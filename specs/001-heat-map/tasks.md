# Tareas — Spec 001: Mapa de calor

> Generado el 2026-10-03 desde `spec.md` y `plan.md`, al terminar la implementación: cada tarea queda marcada con la comprobación que la cerró. Todas cerradas: T29 se resolvió el 2026-10-03 (la nota de `AGENTS.md` ya apunta a `node --test`). Tareas de 20-30 minutos como máximo, en orden de dependencia (misma columna vertebral que la sección 9 del plan). La línea «Hecho cuando:» es la prueba que cierra la tarea.

## Fase 0 — Compromiso

- [x] **T1. Cerrar la spec y aprobar el plan** — CF-1
  Hecho cuando: las cabeceras de `spec.md` y `plan.md` llevan fecha de aprobación y no existe ningún cambio de código anterior a esa fecha.

## Fase A — Lógica pura (`logica.js`)

- [x] **T2. Crear `logica.js` con las utilidades de fecha trasladadas** — RF-5, RNF-3
  Hecho cuando: `node --check logica.js` da exit 0, los cuerpos trasladados son idénticos a los de `app.js`, `etiquetaFecha` recibe «hoy» como parámetro y `app.js` sigue intacto.
- [x] **T3. `levelFromMinutes` con sus pruebas de frontera** — RF-3, CF-3
  Hecho cuando: `node --test` pasa con 0/1/30→1, 31/60→2, 61/120→3, 121/500→4, los decimales 0,5 · 30,5 · 120,5 y los negativos/NaN→0 (CL-2, CL-11, CA3.5).
- [x] **T4. Ventana de 12 semanas: `addDays` + `buildHeatmap` (paso 2) y sus pruebas** — RF-1, CF-3
  Hecho cuando: los tests dan 84 celdas siempre (CL-1), primera = lunes de hace 11 semanas (CL-9), última = domingo de la semana de «hoy» marcada futura (CL-12), orden lunes→domingo y ventana desplazada cuando «hoy» es lunes (CL-10).
- [x] **T5. Sumas por día y exclusiones de minutos (paso 1) y sus pruebas** — RF-2, CF-3
  Hecho cuando: los tests cubren 20+40→60 nivel 2 (CL-3), válidas+inválidas (CL-4), «45» de texto cuenta y 0 no (CL-7) y día solo con inválidos → vacío (CL-13).
- [x] **T6. Fechas futuras, imposibles y datos corruptos con sus pruebas** — RF-2, CF-3
  Hecho cuando: los tests cubren futuro que no pinta (CL-5), «2026-02-30» sin lanzar (CL-6) y `[null, 42, sesión válida]` sin romper nada (CL-8).
- [x] **T7. `describeCell` + `sanitizeSessions` y sus pruebas** — RF-5, RNF-5, CF-3
  Hecho cuando: los tests comprueban «Hoy · 45 min», «Ayer · …», «… · sin sesiones» y «… · día futuro» (fecha larga con patrón, CL-12) y que `sanitizeSessions` deja solo objetos (CL-8).
- [x] **T8. Guardia de export y puerta de la fase** — RNF-1, CF-3
  Hecho cuando: `node --test` termina con exit 0 listando todas las pruebas (una salida sin pruebas no cuenta) y `app.js` no se ha tocado todavía.

## Fase B — Interfaz (`index.html` y `styles.css`)

- [x] **T9. Sección «Mapa de calor» en `index.html`** — RF-7, RF-4, RNF-7
  Hecho cuando: la sección (título, contenedor de la rejilla, línea de detalle y leyenda de 5 ítems en español) está entre la tarjeta de racha y el formulario.
- [x] **T10. Cargar `logica.js` antes que `app.js`** — RNF-1, CF-6
  Hecho cuando: los dos `<script>` van sin `type="module"` y la página abre con doble clic (`file://`) sin errores de consola.
- [x] **T11. Tokens de nivel por tema en `styles.css`** — RF-3, RNF-4
  Hecho cuando: `:root` y `[data-tema="oscuro"]` definen `--mapa-nivel-1..4` con `--mapa-filete: var(--borde-fuerte)` y los valores son los de la paleta verificada de la sección 5 del plan.
- [x] **T12. Rejilla de 12 columnas × 7 filas** — RF-1, RNF-6
  Hecho cuando: `.mapa__rejilla` usa `grid-template-columns: repeat(12, 1fr)`, `grid-auto-flow: column` y `gap: 3px`, y cada columna es una semana.
- [x] **T13. Piel de la celda (neutraliza la genérica de `button`)** — RF-3, RNF-4
  Hecho cuando: `.mapa__celda` fija fondo del nivel, filete 1 px, `aspect-ratio: 1` y radio pequeño, anula `min-height`/`padding`/`width` de `button`, declara su propio `:hover` y conserva el `:focus-visible` de fuego.
- [x] **T14. Leyenda y línea de detalle** — RF-4, RF-5
  Hecho cuando: la leyenda muestra 5 ítems que leen las mismas variables que las celdas y el detalle reserva `min-height` para que la leyenda no salte al ocultarse.
- [x] **T15. Ajuste a 375 px** — RNF-6
  Hecho cuando: a 375 px `.mapa` tiene 10 px de padding lateral, la rejilla cabe sin scroll horizontal y las celdas miden ≥ 24 px.
- [x] **T16. Puerta visual de la fase en DevTools** — RF-7, RNF-7
  Hecho cuando: la página se ve igual que antes salvo la tarjeta nueva con su leyenda, la consola no tiene mensajes y los textos nuevos están en español.

## Fase C — Integración (`app.js`)

- [x] **T17. Quitar de `app.js` las funciones trasladadas** — RF-5, RNF-3
  Hecho cuando: `fechaATexto`, `textoAFecha`, `esFechaValida`, `diasAntes`, `lunesDeLaSemana` y `etiquetaFecha` ya no están en `app.js` (sí `hoy()` y `ayer()`), `node --check app.js` da exit 0 y la lista sigue mostrando «Hoy»/«Ayer»/fecha larga.
- [x] **T18. `sanitizeSessions` en `leerSesiones`** — RF-2, CF-4
  Hecho cuando: un localStorage con `[null, 42, …]` no rompe ninguna tarjeta ni el mapa y ninguna sesión real se pierde al volver a guardar (CL-8).
- [x] **T19. `renderHeatmap()` con `DocumentFragment` y caché `cellsByDate`** — RF-2, RNF-8, RNF-3
  Hecho cuando: el mapa pinta 84 botones de una sola pasada, cada celda lleva clase de nivel y `dataset.fecha`, la caché solo vive en memoria y `node --check` + `node --test` siguen en verde.
- [x] **T20. `aria-label` de cada celda** — RNF-5, RF-5
  Hecho cuando: cada botón expone exactamente el texto de `describeCell` (p. ej. «4 oct 2026 · día futuro») y no tiene texto visible dentro.
- [x] **T21. Gestos del detalle delegados en la rejilla** — RF-5
  Hecho cuando: `mouseover`, `focusin`, `focusout`, `click` y `mouseleave` más el clic global responden los 5 casos de CA5.1-CA5.3 (ratón, Tabulador y toque) y las celdas vacías nunca muestran detalle.
- [x] **T22. `pintar()` llama a `renderHeatmap()` y puerta de la fase** — RF-6, CF-2
  Hecho cuando: al guardar una sesión la celda cambia de nivel sin recargar (CA6.1-CA6.3, CL-10) y `node --check app.js` + `node --test` dan exit 0.

## Fase D — Verificación y cierre

- [x] **T23. Recorrido manual de CL-1 a CL-13 en DevTools** — CF-2, CF-4
  Hecho cuando: consta cada criterio CL en los dos temas (84 celdas, fronteras, sumas, exclusiones, textos y datos corruptos) sin mensajes en la consola.
- [x] **T24. Contraste con fórmula y celdas = leyenda** — RNF-4, CF-5, RF-4
  Hecho cuando: el script da exit 0 en los 20 controles (3:1 niveles vs tarjeta, 1,5:1 adyacentes, 3:1 filete, 4,5:1 textos) y el color calculado de celda y muestra coincide en los 5 niveles de los dos temas (CA4.2).
- [x] **T25. 375 px sin scroll y `file://` con doble clic** — RNF-6, RNF-1, CF-6
  Hecho cuando: con viewport de 375 px `scrollWidth == clientWidth`, la celda mide 24 px y todo funciona abierto con doble clic, sin servidor ni dependencias.
- [x] **T26. Datos corruptos con consola limpia y localStorage intacto** — RNF-2, CF-4
  Hecho cuando: tras pegar `[null, 42, {"fecha":"2026-06-30","minutos":"abc"}]`, el mapa se pinta vacío, la consola no tiene mensajes y la clave guardada no cambia tras pintar (CL-8).
- [x] **T27. Checklist de la skill `local-dates`** — RF-1
  Hecho cuando: el grep no encuentra `toISOString()`, `new Date("AAAA-MM-DD")` ni 86400000; los días se suman con `setDate` en hora local (CA1.2) y las futuras se excluyen en el paso 1.
- [x] **T28. `MEMORY.md` actualizado** — CF-7
  Hecho cuando: la memoria refleja el estado final y las decisiones con su porqué, y sigue por debajo de ~50 líneas.
- [x] **T29. Actualizar en `AGENTS.md` la nota «No hay tests automáticos»** — CF-3
  Hecho cuando: `AGENTS.md` indica `node --test` como forma de ejecutar las pruebas. *(Resuelta el 2026-10-03: la nota obsoleta se sustituyó por el comando y se añadió la regla de idioma.)*
