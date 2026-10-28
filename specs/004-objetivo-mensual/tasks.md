# Tasks 004 — Objetivo mensual de estudio y felicitación

> Estado: **aprobadas el 2026-10-05; 8/8 tareas completadas el 2026-10-05.**

- [x] **T1. Funciones puras del objetivo en `logica.js` con sus tests.** RF-1, RF-2, RF-4, RF-5
  - Hecho cuando: `tests/objetivo.test.js` (fichero nuevo, patrón CommonJS de los otros dos) empieza **en rojo** con los 19 `test()` del plan — `minutesInMonth` (7), `crossesGoal` (4), `activeGoalForMonth` (4) y `validateGoal` (4, mensajes en español)— y acaba **en verde** tras implementar las cuatro funciones en `logica.js` y añadirlas al bloque de exports; los 29 tests anteriores siguen verdes y `node --check` no falla.

- [x] **T2. HTML: sección de objetivo, quinta tarjeta y modal.** RF-1, RF-3, RF-5, RF-6
  - Hecho cuando: `index.html` contiene la sección `#seccionObjetivo` (form con `#objetivoMinutos`, `#objetivoMesTexto`, `#avisoObjetivo` `role="alert"`), la tarjeta `#tarjetaObjetivo` con su `.dato__cifra` 🎯 + `#metaMinutos` + `.dato__texto` «Objetivo» + botón `#botonCambiarObjetivo`, y el modal `#felicitacion` con `role="dialog"`, `aria-modal`, `aria-labelledby/describido` y botón `#botonCerrarFelicitacion`; los tres con `hidden` inicial; todo el texto en español; **sin tocar aún** el id `minutosSemana` ni el resto del marcado (el renombre va en T4 para no romper `app.js` entre tareas).

- [x] **T3. CSS: banda, tarjeta con «Cambiar» y modal de llama.** RNF-4
  - Hecho cuando: `.objetivo` es una banda de papel con filete (sin sombra), alineada con las tarjetas, con el input al mismo tamaño que los de «Nueva sesión» y el botón con el estilo principal; `.objetivo__cambiar` es secundario (filete, ancho completo, pisa al `button` global sin `!important`, patrón `.lista__mas`); `.felicitacion` es un overlay `position: fixed` y `.felicitacion__caja` lleva fondo `--fuego` con texto marfil en ambos temas; forzando `hidden` fuera en DevTools: todo se ve bien a 1200 y 375 px (sin scroll horizontal) y la consola sigue vacía.

- [x] **T4. `app.js`: carga de la meta, `pintar()` con sección/tarjeta y renombre de la tarjeta de minutos.** RF-1, RF-2, RF-4
  - Hecho cuando: existen `CLAVE_OBJETIVO = "diario-estudio-objetivo"` con lectura en try/catch, refs a los ids nuevos y el estado `editandoObjetivo` (único escritor de la visibilidad de la sección); `pintar()` muestra/oculta `#seccionObjetivo` (visible si no hay meta del mes o se está editando) y `#tarjetaObjetivo` (visible solo con meta, cifra = meta, `#objetivoMesTexto` = mes en español de `hoy`); el id pasa a `minutosMes` con etiqueta «Este mes» y valor `minutesInMonth(...)`; `minutosDeLaSemana()` y su comentario desaparecen; tras recargar la meta sigue; `node --check` + 48/48 tests + consola vacía.

- [x] **T5. `app.js`: guardar la meta y editarla desde «Cambiar».** RF-1
  - Hecho cuando: enviar el form de objetivo con un valor válido (entero ≥ 1) guarda `{ mes, minutos }` en su clave, cierra la sección y actualiza la tarjeta 🎯; con 0, −5, 1.5 o letras aparece el aviso `role="alert"` en español y **no** se guarda nada; «Cambiar» reabre la sección precargada con la meta actual y el foco en el input, y al guardar el cambio la tarjeta refleja el nuevo valor y la sección se oculta; la meta persiste tras recargar.

- [x] **T6. `app.js`: cruce de la meta y ventana de felicitación.** RF-5, RF-6
  - Hecho cuando: en **alta y en edición** se captura `minutesInMonth` antes del cambio y, tras `pintar()`, `crossesGoal(antes, después, meta)` abre el modal con «Has estudiado N minutos en octubre. ¡Sigue así!» (con el mes real en curso); con 999/1000 y meta 1000 sale al guardar el minuto exacto; guardar de nuevo estando ya superada no la repite; si se borra y se vuelve a cruzar, repite; **recargar con la meta superada no la muestra**; el foco cae en «¡Gracias!», Esc y el botón cierran devolviendo el foco; consola vacía.

- [x] **T7. `AGENTS.md`: los casos de minutos de la semana pasan a ser de mes.** RNF-5
  - Hecho cuando: el bullet de «Verificación» dice «Casos de minutos del mes» y lista los equivalentes mensuales (las del mes pasado no cuentan —aunque sea del año anterior—, las de este mes sí, una futura de este mes no suma, minutos inválidos no suman y un mismo día suma todo) y no queda ninguna regla viva que exija la tarjeta semanal; nada más del fichero cambia.

- [x] **T8. Verificación DevTools, lint y cierre.** CA-1 a CA-5, RNF-1 a RNF-5
  - Hecho cuando: checklist en verde en `file://` — ciclo completo (sin meta → banda visible y sin tarjeta 🎯 → fijar 1000 → banda oculta y tarjeta 🎯 → editar a 1500 → cruce al llegar a 1500 → modal → cerrar → persistencia tras recargar), sin meta (clave borrada) otra vez en su estado inicial, ambos temas a 1200 y 375 px, teclado (foco y Esc en el modal), `aria-live` del tarjetero anunciando la tarjeta nueva sin romper nada, sesiones intactas, consola vacía, `node --check` + `node --test` verdes, `markdownlint` 0 en spec/plan/tasks, `MEMORY.md` actualizado, navegador devuelto al estado inicial (sin clave de sesiones ni de objetivo, tema «oscuro») e informe de cierre.
