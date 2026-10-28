# Spec 004 — Objetivo mensual de estudio y felicitación

> Estado: **aprobada e implementada el 2026-10-05** —8/8 tareas cerradas, veredicto «spec cumplida» y aprobación de cierre del usuario el mismo día— (constancia y decisiones de codificación en «Dudas y decisiones»). Solo el QUÉ y el POR QUÉ: el cómo (y los nombres de cosas) va en el plan.

## Contexto y objetivo

El diario muestra la racha y los minutos, pero no hay una meta que perseguir. Este cambio añade un objetivo mensual de minutos: la persona fija cuánto quiere estudiar en el mes, ve su meta en el tarjetero y, al alcanzarla, recibe una felicitación. La tarjeta que hoy acumula los minutos de la semana pasará a acumular los del mes, porque la meta es mensual.

## Usuarios

- Estudiante que registra sesiones y quiere una meta concreta que poder celebrar.

## Historias de usuario

- HU-1. Como estudiante, quiero fijar un objetivo de minutos al mes y poder cambiarlo si me equivoco, para tener una meta concreta hacia la que tirar.
- HU-2. Como estudiante, quiero ver mi meta en el tarjetero para saber cuánto me falta para el mes.
- HU-3. Como estudiante, quiero que al alcanzar la meta me salga una felicitación para celebrar el logro.

## Definiciones

- **Objetivo mensual**: número entero de minutos (≥ 1) a alcanzar en el mes en curso. Cada mes tiene el suyo.
- **Minutos del mes**: total de minutos de las sesiones con fecha del mes en curso en fecha local (prefijo «AAAA-MM» de la fecha, el mismo criterio que «Días este mes»). Las fechas futuras, las inválidas y las de otros meses no cuentan; varias sesiones el mismo día suman todos sus minutos.
- **Meta alcanzada**: los minutos del mes son mayores o iguales que el objetivo.
- **Cruce**: el momento en que un guardado hace que los minutos del mes pasen de estar por debajo de la meta a igualarla o superarla.

## Requisitos funcionales

- RF-1: MIENTRAS el mes en curso no tenga objetivo, EL SISTEMA muestra entre la cabecera y el tarjetero una sección para fijar el objetivo de minutos del mes, indicando el mes al que corresponde; CUANDO la persona lo fija, EL SISTEMA oculta la sección. EL SISTEMA permite además cambiar la meta del mes desde la quinta tarjeta: al pedir el cambio, la sección vuelve a mostrarse con la meta actual y, al guardarla, se vuelve a ocultar.
- RF-2: EL SISTEMA conserva el objetivo del mes en curso al cerrar y volver a abrir la página (localStorage, clave nueva propuesta `diario-estudio-objetivo`), sin tocar la clave de sesiones ni su formato; CUANDO empieza un mes nuevo, EL SISTEMA vuelve a pedir el objetivo de ese mes (el del mes anterior no se reutiliza).
- RF-3: MIENTRAS haya objetivo del mes, EL SISTEMA muestra una quinta tarjeta en el tarjetero con la meta, con la misma figura que las demás tarjetas (emoji 🎯 + cifra grande + etiqueta pequeña debajo); SI el mes no tiene objetivo, ENTONCES la quinta tarjeta no aparece.
- RF-4: EL SISTEMA muestra en la tarjeta de minutos el acumulado del mes en curso con la etiqueta «Este mes»; la tarjeta ya no muestra los minutos de la semana.
- RF-5: CUANDO al guardar una sesión (alta o edición) los minutos del mes alcancen o superen el objetivo, EL SISTEMA muestra una ventana emergente (modal de la app) con una felicitación en español; SI en ese guardado el acumulado no llega a la meta, ENTONCES no se muestra nada. La ventana no aparece al cargar la página. Si más adelante se vuelve a cruzar la meta (p. ej. tras borrar sesiones), vuelve a mostrarse.
- RF-6: SI la persona cierra la ventana (botón o teclado), ENTONCES la página sigue funcionando con normalidad y el acumulado y la meta siguen visibles.

## Requisitos no funcionales

- RNF-1: El cálculo de los minutos del mes y el juicio «alcanzado o no» (incluido el cruce) viven en funciones puras con «hoy» como parámetro, probadas con `node --test`.
- RNF-2: Solo fecha local: comparación por prefijo de texto «AAAA-MM»; prohibidos `toISOString()` y `new Date("AAAA-MM-DD")`.
- RNF-3: La ventana emergente es accesible (se anuncia, se cierra con teclado) y todos los textos nuevos están en español.
- RNF-4: La quinta tarjeta y la sección nueva se ven bien a 375 px y en ambos temas; consola sin errores; el tarjetero sigue con su único `aria-live`.
- RNF-5: Sin dependencias ni build; las 29 pruebas actuales siguen en verde y las specs 001-003 no se tocan.

## Casos límite

- Objetivo 0, negativo o no numérico: no se acepta (el control pide enteros ≥ 1).
- Sesión con fecha futura de este mes: no suma al acumulado.
- Minutos inválidos en los datos guardados: se ignoran, igual que en el resto de cálculos.
- Varias sesiones el mismo día: suman todos.
- Guardar una sesión con fecha de otro mes: no altera el acumulado ni puede cruzar la meta.
- Cambio de mes: el acumulado empieza en 0 y la sección de arriba vuelve a pedir la meta del mes nuevo.
- Objetivo fijado ya igualado o superado (p. ej. 100 min con 500 ya estudiados): no hay cruce en los guardados siguientes y no se felicita; la sección se oculta y la quinta tarjeta muestra la meta. [Decisión a revisar, ver «Dudas y decisiones»]
- Cambiar la meta a un valor ya igualado o superado: no dispara la felicitación (mismo criterio que al fijarla); la quinta tarjeta muestra el nuevo valor.
- Borrar sesiones después de alcanzar la meta: la ventana ya no está abierta; si se vuelve a cruzar la meta, vuelve a salir.
- Objetivo muy grande (p. ej. 100000): la tarjeta lo muestra con separador de miles sin desbordar a 375 px.

## Fuera de alcance

- Mostrar los minutos de la semana en algún sitio (la tarjeta pasa a lo mensual).
- Objetivos por semana, por día o por tema; notas o textos motivacionales escritos por la persona.
- Historial de metas de meses anteriores o gráficos de progreso.
- Notificaciones fuera de la página.
- Cambiar las otras tarjetas (racha, mejor racha, días este mes) o el formato de las sesiones guardadas.

## Criterios de finalización

- CA-1: Sin objetivo, se ve la sección de arriba y no hay quinta tarjeta; al fijar la meta, la sección se oculta y aparece «🎯 …» en el tarjetero; tras recargar, la meta sigue y la sección no vuelve. La quinta tarjeta permite cambiar la meta: al pedirlo, la sección vuelve a mostrarse con el valor actual; al guardar el cambio, se oculta y la tarjeta refleja el nuevo valor.
- CA-2: La tarjeta de minutos muestra el acumulado del mes en curso (no el de la semana) con la etiqueta «Este mes».
- CA-3: Con meta 1000 y 999 minutos, guardar una sesión no felicita; el guardado que lleva el acumulado a 1000 o más muestra la ventana con la felicitación; al cerrarla, la página queda usable. Recargar con la meta ya superada no la muestra.
- CA-4: `node --check app.js` exit 0 y `node --test` en verde (29 actuales + las nuevas, con «hoy» inyectado para simular cambio de mes).
- CA-5: Verificación en DevTools a 1200 y 375 px, ambos temas, ventana accesible por teclado y consola vacía; `markdownlint` (MD013 y MD036 desactivados) con exit 0 en spec, plan y tasks.

## Dudas y decisiones

- **D1 — Entrada del objetivo** (respondida el 2026-10-05): sección nueva «arriba del todo, entre la cabecera y las tarjetas», no prompt ni campo del formulario de sesión.
- **D1.a — Persistencia de esa sección**: pide y se oculta; la meta vive después en la quinta tarjeta. Un mes nuevo vuelve a pedirla.
- **D2 — Alcance**: un objetivo distinto por cada mes; no se reutiliza el del mes anterior ni se guarda historial.
- **D3 — Ventana**: modal de la app con su estilo, no `alert()` nativo.
- **D4 / D4.a — Disparo**: «solo se felicita en caso de alcanzar el objetivo mensual» → en el guardado que cruza la meta (alta o edición), nunca al cargar; si se vuelve a cruzar, repite.
- **D5 — La tarjeta**: la meta va en su propia quinta tarjeta 🎯; la de minutos muestra solo el acumulado. Su etiqueta pasa de «Esta semana» a «Este mes» por veracidad (el dato ya es mensual; si prefieres otro texto, dilo).
- **Decisiones mías, para revisar**: (a) si la meta se fija —o se cambia— ya igualada o superada no hay felicitación (no hubo cruce). Cambia con una indicación.
- **Enmienda del 2026-10-05 (condición de la aprobación)**: la meta **sí se puede editar** dentro del mes (se anula la decisión (b) del borrador); la edición entra desde la quinta tarjeta —botón secundario «Cambiar» en su interior, confirmado por el usuario— y reabre la sección de arriba con el valor actual.
- **Datos**: clave nueva propuesta `diario-estudio-objetivo`; la clave de sesiones no cambia de formato.
- **Cierre y aprobación (2026-10-05)**: spec implementada (8/8 tareas), veredicto «spec cumplida» y **aprobación de cierre del usuario** el mismo día. Tres decisiones de codificación, ya probadas en DevTools: (i) el form de objetivo lleva `novalidate` para que `validateGoal` sea el único validador y el aviso `role="alert"` en español salga con 0, −5, 1.5 y letras —la validación nativa del navegador los habría bloqueado antes de llegar al manejador; el form de sesión no cambia—; (ii) en `AGENTS.md` pasaron a mensuales **los dos** bullets («Verificación» —lo pedía T7— y «Minutos de la semana» de «Fechas y racha»), para que ninguna regla viva siga exigiendo la tarjeta semanal; (iii) las cifras se pintan con `toLocaleString("es-ES")`: «1000» sin separador de millares —así lo marca la norma española para 4 cifras— y «100.000» con él.
