# Tareas — Spec 003: cabecera, todo el ancho, mapa en cintas y lista plegada

> Estado: **aprobadas el 2026-10-05 y cerradas el mismo día (8/8 con «Hecho cuando»)**. Se ejecutan en orden, una a la vez: código, comprobación de «Hecho cuando», `node --check app.js` + `node --test` (29/29 como puerta) y marca de la tarea. La T8 se añadió con el cambio de RF-3 aprobado el 2026-10-05 (figura del tarjetero).

- [x] **T1. Estructura HTML del rediseño.** RF-1, RF-2, RF-3, RF-6
  - Hecho cuando: `<header>` es hermano anterior del `.contenedor`; dentro hay un `.tarjetero` con `aria-live="polite"` que contiene la tarjeta 🔥 **sin** `.racha__datos` y tres `.tarjeta.dato` con los textos literales de hoy (ids `rachaNumero`, `mejorRacha`, `minutosSemana`, `diasMes` intactos); las tres secciones viven dentro de `.rejilla`; y el `ul#listaSesiones` va seguido del botón `#botonMasSesiones` (`hidden`, `aria-expanded="false"`, texto «Cargar más sesiones»). La página abre con `file://` sin errores en consola.

- [x] **T2. CSS: cabecera-barra, contenedor a todo el ancho, tarjetero y rejilla.** RF-1, RF-2, RF-3
  - Hecho cuando: la cabecera ocupa todo el ancho con filete inferior (mismo margen lateral que el contenido); `.contenedor` ya no tiene `max-width: 640px`; a ≥1024 px el tarjetero muestra las 4 tarjetas en fila con el número 🔥 reescalado para la tarjeta estrecha y `.rejilla` reparte mapa · alta · sesiones en `minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr)`; por debajo, apiladas en ese orden; `margin-bottom` de `.tarjeta` anulado dentro de `.tarjetero` y `.rejilla`; sin scroll horizontal a 375 px.

- [x] **T3. CSS: mapa en cintas de 8 columnas.** RF-4, RNF-5
  - Hecho cuando: `.mapa__rejilla` usa `grid-template-columns: auto repeat(7, minmax(0,1fr))` con flujo por filas; existen `.mapa__esquina`, `.mapa__dia` (texto centrado, letra pequeña) y `.mapa__etiqueta` (fecha con `white-space: nowrap`); las celdas han perdido `aspect-ratio: 1` y tienen `min-height` ≥ 32 px; a 375 px caben la columna de fechas y las 7 celdas sin scroll y cada celda mide ≥ 24 px.

- [x] **T4. CSS: paleta naranja y botón de la lista.** RF-5, RF-6
  - Hecho cuando: `--mapa-nivel-1..4` valen los hexes del RF-5 en `:root` (tema claro) y en `[data-tema="oscuro"]`, y las celdas y las muestras de la leyenda siguen leyendo los mismos tokens; `.lista__mas` tiene estilo secundario (filete, sin naranja) a ancho completo, ganando al `button` global sin `!important`.

- [x] **T5. app.js: `renderHeatmap()` en filas con letras y fechas.** RF-4, CA4.1 a CA4.4
  - Hecho cuando: `node --check app.js` en verde y `node --test` → 29/29 sin tocar `logica.js` ni `tests/`; la rejilla contiene 104 elementos en orden (esquina, 7 letras «L M X J V S D», y por cada fila la fecha del lunes con `etiquetaFecha` + sus 7 celdas); letras y fechas con `aria-hidden`; cada celda conserva clase de nivel, `dataset.fecha` y `aria-label = describeCell(...)`; detalle al pasar, tocar y enfocar idéntico al de hoy (CL-8, RNF-5).

- [x] **T6. app.js: lista plegada con su botón.** RF-6, CA6.1 a CA6.5
  - Hecho cuando: `node --check app.js` y `node --test` → 29/29; con 2 sesiones o menos no se ve el botón (CL-10); con más, la lista arranca con las 2 últimas y el botón alterna texto («Cargar más sesiones» ↔ «Mostrar menos»), `aria-expanded` y vista (CA6.3); el estado se conserva al guardar, editar y borrar (CA6.4); con 3 sesiones pasa CL-11 y al borrar una visible sube la siguiente (CL-12); recargar vuelve a empezar con 2 (CA6.2).

- [x] **T7. Verificación DevTools y cierre de la spec.** CF-3 a CF-7, CL-1 a CL-13
  - Hecho cuando: checklist en verde en `file://` — 1200 px (cabecera, tarjetero en fila, 3 columnas), 900 px (apilado), 375 px sin scroll; ambos temas con celdas = leyenda y ratios de CA5.2 medidos con el script de Temp en una llamada aparte del cambio de tema; CA6.x y CL-1…CL-13; recorrido de teclado con foco visible y `aria-expanded`; consola vacía; sesiones y tema persisten tras recargar; lint (`markdownlint` con MD013 y MD036) exit 0 en spec, plan y tasks; `MEMORY.md` actualizado y informe de cierre entregado al usuario.

- [x] **T8. Figura del tarjetero en las tres tarjetas de dato (cambio RF-3).** RF-3, CA3.1, CA3.2
  - Hecho cuando: cada `.tarjeta.dato` muestra `.dato__cifra` (emoji grande + cifra grande, emoji con `aria-hidden`) sobre `.dato__texto` pequeño debajo con los textos «Mejor racha», «Esta semana» y «Días este mes» (sin dos puntos); «Días este mes» lleva 📅; «min» va en `.dato__unidad` al 50 % de la cifra; la cifra de dato mide 30–40 px y **siempre menos** que la 🔥 (≥44 px ≥600); ids `mejorRacha|minutosSemana|diasMes` intactos y `app.js` sin tocar; `node --check` + `node --test` 29/29; en DevTools: cifras actualizan sin recargar (CA3.2), 375 px sin scroll incluso con 3 dígitos en «min», ambos temas y consola vacía.
