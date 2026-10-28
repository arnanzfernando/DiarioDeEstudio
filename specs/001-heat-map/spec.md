# Spec 001 — Mapa de calor de las últimas 12 semanas

> Estado: **aprobada el 2026-10-03**; **modificada el 2026-10-05** por la spec 003 —4 resoluciones sustituidas, ver «Dudas y decisiones»— (4 dudas al aprobar; revisión QA el mismo día: 5 decisiones + correcciones; corrección del RNF-4 al redactar el plan; todo recogido en «Dudas y decisiones»). Solo el QUÉ y el POR QUÉ: el cómo (y los nombres de cosas) va en el plan.

## Contexto y objetivo

Hoy el Diario muestra la racha actual, la mejor racha, los minutos de la semana, los días del mes y la lista de sesiones, pero no se ve el **patrón temporal**: no se distingue de un vistazo si las últimas semanas han sido constantes o si hay huecos. El mapa de calor (tipo GitHub) muestra las últimas 12 semanas día a día, en cuatro tramos de intensidad fijos: cuanto más minutos se estudió cada día, más intensa es su celda, sin subir del tramo más alto.

Objetivo: que el estudiante reconozca su historial reciente de un vistazo y se motive viendo los días "encendidos", y que el mapa **nunca estorbe** al resto del Diario si los datos fallan.

Decisiones ya tomadas (5 preguntas respondidas): 12 semanas de lunes a domingo; escala fija de 4 niveles + vacío; mismas reglas de datos que el resto de la app, con la única diferencia explicada en CL-13; leyenda + detalle al pasar, tocar o enfocar; gama de color neutra (la llama naranja sigue siendo el único color de la página).

## Usuarios

- **Estudiante** (principal): usa el Diario a diario, casi siempre en el móvil; quiere motivación y ver sus huecos.
- **Persona que mantiene el proyecto** (quien empieza a programar): debe poder leer esta spec y entender su implementación sin conocimientos añadidos.
- **Usuario de tecnologías de apoyo**: navega con lector de pantalla o teclado; necesita llegar al mismo dato que quienes lo ven.

## Historias de usuario

- **HU-1**: Como estudiante, quiero ver mis últimas 12 semanas de un vistazo, para reconocer mis semanas constantes y mis huecos sin leer cifras.
- **HU-2**: Como estudiante, quiero que los días con más minutos se vean más intensos (hasta el tramo más alto), para identificar mis mejores días al instante.
- **HU-3**: Como estudiante, quiero consultar los minutos exactos de un día al pasar el ratón, tocar la celda o enfocarla con el teclado, para no tener que buscarlo en la lista.
- **HU-4**: Como persona que usa un lector de pantalla, quiero que cada día del mapa indique su fecha y sus minutos, para acceder al mismo dato que las demás personas.

## Requisitos funcionales

**RF-1 — Rejilla de 12 semanas.** El mapa es una rejilla siempre completa de 12 semanas × 7 días: cada columna es una semana (la última, la semana en curso) y cada fila un día, de lunes a domingo, igual que el resto de estadísticas del Diario.

- CA1.1 (ubicuo): El mapa deberá mostrar siempre 12 columnas y 7 filas (84 celdas), aunque el usuario tenga menos historial.
- CA1.2 (WHEN): Cuando se muestre el mapa, la última columna será la semana que contiene a hoy, en fecha local del usuario (Constitución, principio 5).
- CA1.3 (IF): Si un día de la rejilla es posterior a hoy, se mostrará como celda vacía.

**RF-2 — Cada celda es un día.** Si el día tiene al menos una sesión válida, la celda refleja sus minutos totales; si no, queda vacía.

- CA2.1 (WHEN): Cuando un día tenga una o varias sesiones válidas, la celda deberá reflejar la **suma** de sus minutos.
- CA2.2 (IF): Si el día no tiene sesiones, si ninguna es válida (fecha o minutos no válidos) o si la fecha es futura, la celda quedará vacía.

**RF-3 — Escala fija de intensidad.** Cuatro niveles más la celda vacía, con umbrales fijos en minutos:

| Minutos totales del día | Nivel |
|-------------------------|-------|
| sin sesiones válidas    | vacío |
| 1 – 30                  | 1     |
| 31 – 60                 | 2     |
| 61 – 120                | 3     |
| más de 120              | 4     |

- CA3.1 (IF): Si los minutos totales son 30, el nivel será 1; si son 31, será 2.
- CA3.2 (IF): Si los minutos totales son 60, el nivel será 2; si son 61, será 3.
- CA3.3 (IF): Si los minutos totales son 120, el nivel será 3; si son 121, será 4.
- CA3.4 (ubicuo): Los umbrales no dependerán del historial del usuario ni cambiarán con el tiempo.
- CA3.5 (ubicuo): Los umbrales se aplican con desigualdades (≤ 30 → nivel 1, ≤ 60 → 2, ≤ 120 → 3, por encima → 4, siempre con total > 0), de modo que un total no entero cae siempre en algún nivel (p. ej. 0,5 → 1 y 30,5 → 2).

**RF-4 — Leyenda.** El mapa incluye una leyenda en español, ordenada de menos a más intensidad, con los cinco estados: «Sin sesiones», «1–30 min», «31–60 min», «61–120 min», «Más de 120 min». Las celdas vacías —pasadas sin sesiones o futuras— comparten el estado «Sin sesiones»; la distinción entre ellas solo se informa a las tecnologías de apoyo (RNF-5).

- CA4.1 (WHILE): Mientras el mapa sea visible, la leyenda deberá identificar cada nivel con su rango en minutos.
- CA4.2 (ubicuo): La leyenda deberá usar exactamente los mismos colores que las celdas; la muestra de «Sin sesiones» tendrá el aspecto de una celda vacía (el fondo de la tarjeta).

**RF-5 — Detalle al pasar, tocar o enfocar.** Sobre una celda con datos se muestra su fecha en el mismo formato legible que la lista de sesiones («Hoy», «Ayer», «3 oct 2026») y sus minutos totales con la unidad «min» (p. ej. «Hoy · 45 min»). Se muestra al pasar el ratón por encima, al enfocarla con el teclado o al tocarla en pantalla; desaparece al retirar el ratón, al desenfocar o al tocar fuera.

- CA5.1 (WHEN): Cuando el puntero pase sobre una celda con datos, la celda reciba el foco o se toque en pantalla, deberá mostrarse «fecha · minutos».
- CA5.2 (WHEN): Cuando el puntero abandone la celda, se desenfoque o se toque fuera de ella, el detalle desaparecerá.
- CA5.3 (IF): Si la celda está vacía, no se mostrará detalle alguno.

**RF-6 — Actualización sin recargar.** Una sesión nueva se ve en el mapa inmediatamente, en la misma página.

- CA6.1 (WHEN): Cuando el usuario guarde una sesión, el mapa deberá reflejarla sin recargar la página.
- CA6.2 (WHEN): Si la sesión guardada cambia el nivel de su día (p. ej. de 20 a 45 min), la celda deberá pasar al nivel correspondiente.
- CA6.3 (IF): Si la sesión guardada queda fuera de la ventana de 12 semanas, es futura o no es válida, el mapa no varía (la página sigue sin recargar).

**RF-7 — Ubicación en la página.** El mapa vive en su propia sección, titulada «Mapa de calor», situada entre la tarjeta de racha y el formulario: se lee como resumen (arriba), no como registro de entrada.

- CA7.1 (ubicuo): El mapa deberá estar visible en la página principal, sin navegación adicional.

## Requisitos no funcionales

- **RNF-1**: No introduce librerías, frameworks ni pasos de build; funciona abriendo la página con doble clic (Constitución, principio 1).
- **RNF-2**: El mapa solo **lee** las sesiones: nunca las escribe, borra ni modifica, y no exige ningún cambio en su formato (Constitución, principio 5).
- **RNF-3**: Los niveles se calculan a partir de las sesiones guardadas en cada mostrado de la página; no se guarda ningún valor derivado (mismo criterio que la mejor racha). La lógica del mapa (ventana de 12 semanas, suma diaria, niveles y exclusiones) es una función pura, sin DOM ni localStorage, que recibe «hoy» como parámetro (Constitución, principio 3).
- **RNF-4**: En tema claro y en tema oscuro los 4 niveles son distinguibles: cada celda pasa 3:1 contra el fondo de la tarjeta (las vacías cumplen mediante su filete) y dos niveles adyacentes al menos 1,5:1 entre sí; los textos (detalle, leyenda) pasan 4,5:1. La gama es neutra, sin colores saturados (la llama naranja sigue siendo el único color de la página).
- **RNF-5**: Cada celda deberá informar de su fecha y de sus minutos totales a las tecnologías de apoyo: el detalle visual del RF-5 no será la única vía de obtenerlos. Las celdas sin datos informan de su fecha y su estado: «fecha · sin sesiones» (pasadas) o «fecha · día futuro» (futuras), con la misma fecha legible que el detalle.
- **RNF-6**: En pantallas de 375 px el mapa se verá bien y sin desplazamiento horizontal.
- **RNF-7**: Todos los textos visibles (título, leyenda, detalle) irán en español (Constitución, principio 6).
- **RNF-8**: Recalcular las 84 celdas al pintar o al guardar una sesión no debe apreciarse como retardo.

## Casos límite

- **CL-1**: Cero sesiones → 84 celdas vacías con la leyenda visible; el resto de la página intacta.
- **CL-2**: Fronteras exactas: 30/31 → nivel 1/2; 60/61 → 2/3; 120/121 → 3/4.
- **CL-3**: Varias sesiones el mismo día (20 + 40) → 60 min → nivel 2 (la suma manda, no la mayor).
- **CL-4**: Un día con una sesión válida y otra inválida → solo suma la válida.
- **CL-5**: Sesión con fecha futura → celda vacía; nunca discrepancia con las tarjetas.
- **CL-6**: Fecha con formato inválido o inexistente («2026-02-30») → ignorada sin romper el mapa.
- **CL-7**: Minutos no numéricos o ≤ 0 → esa sesión no suma (se interpretan como en el resto de la app: un «45» escrito como texto sí cuenta, igual que en los minutos de la semana). Si es la única del día → celda vacía (ver CL-13).
- **CL-8**: Datos guardados ilegibles o con elementos corruptos (JSON roto, array con `null`, números sueltos…) → mapa vacío, sin mensajes de error, resto de la app funcionando.
- **CL-9**: Sesiones anteriores a la semana de la primera columna (las 12 columnas son: semana en curso + 11 anteriores) → no aparecen; la ventana es de tamaño fijo, no de rango fijo.
- **CL-10**: Al pasar un lunes, la ventana se recoloca sola al pintar: cada sesión queda en su columna correcta. El mapa se pinta al cargar y al guardar; si la página está abierta al cruzar la medianoche, se actualizará en el siguiente pintado.
- **CL-11**: Día con una suma muy grande (p. ej. 500 min) → nivel 4, sin errores.
- **CL-12**: Días futuros de la semana en curso → celdas vacías, nunca coloreadas.
- **CL-13**: Día con solo sesiones de minutos inválidos (p. ej. 0) → celda vacía en el mapa, aunque las tarjetas «Días este mes» y racha sí cuenten ese día: ellas cuentan por existir sesión, el mapa pinta por minutos válidos. Es intencionado, no una discrepancia.

## Fuera de alcance (v1)

- Seleccionar o actuar sobre celdas, filtrar la lista desde el mapa, exportar o compartir (el toque solo muestra el detalle, RF-5).
- Etiquetas de mes bajo las columnas, etiquetas de día en las filas (lunes…domingo) y marcador especial para hoy (ver Dudas y decisiones).
- Más de 12 semanas, año completo, desplazamiento horizontal o rango configurable.
- Comparativas con periodos anteriores, objetivos, predicciones o notificaciones.
- Crear, editar o borrar sesiones desde el mapa.
- Cualquier almacenamiento nuevo o preferencia persistida del mapa.
- Sincronización con otras pestañas o cambios hechos fuera de esta página: el mapa se actualiza en el siguiente pintado (cargar o guardar).

## Criterios de finalización

- **CF-1**: Todas las dudas abiertas respondidas y la spec aprobada antes de escribir código (Constitución, principio 2).
- **CF-2**: Los RF-1 a RF-7 verificados con sus criterios de aceptación, incluidas las fronteras 30/31, 60/61 y 120/121 y la suma por día.
- **CF-3**: La lógica del mapa (ventana de 12 semanas, suma diaria, niveles, exclusiones) con pruebas automatizadas en verde, sin instalar dependencias (Constitución, principio 4).
- **CF-4**: Los casos límite CL-1 a CL-13 comprobados en la página abierta con doble clic, en ambos temas (CL-10 se verifica con las pruebas de CF-3, porque depende del calendario).
- **CF-5**: Contraste verificado en tema claro y oscuro y pantalla de 375 px sin desplazamiento horizontal.
- **CF-6**: Sin dependencias nuevas: la página sigue abriéndose con doble clic.
- **CF-7**: Todos los textos visibles en español y `MEMORY.md` actualizado al terminar la tarea.

## Dudas y decisiones

Ninguna abierta: todas respondidas el 2026-10-03 (4 al aprobar + 5 en la revisión QA del mismo día; una de las originales cambió) y el 2026-10-05 con las 4 modificaciones de la spec 003 recogidas al final de esta sección.

- **RF-7 (ubicación y título)**: aprobada tal cual — sección «Mapa de calor» entre la tarjeta de racha y el formulario.
- **Celda de hoy**: no se marca en v1.
- **Etiquetas de mes**: no en v1.
- **Detalle con teclado** *(cambiado en la revisión QA)*: al enfocar una celda con Tabulador se muestra el mismo detalle que al pasar el ratón (RF-5); además cada celda informa de su fecha y minutos o su estado (RNF-5). Antes se había resuelto «sin detalle visible al enfocar».
- **Día con solo sesiones de minutos inválidos**: el mapa queda vacío (CA2.2); la diferencia con «Días este mes» y la racha queda explicada y asumida en CL-13.
- **Gesto táctil**: toque (tap) — muestra el detalle y un toque fuera lo oculta (RF-5). Antes HU-3 y CA5.1 no coincidían.
- **Contraste de las celdas** *(corregido el 2026-10-03 al redactar el plan)*: **3:1 celda-fondo y 1,5:1 entre niveles adyacentes** en ambos temas, 4,5:1 solo con texto (RNF-4). El 3:1 entre adyacentes era imposible con 4 niveles (comprobado con la fórmula WCAG), y las vacías cumplen el 3:1 por su filete. La regla de `MEMORY.md` queda matizada: «4,5:1 con texto, 3:1 en bordes y celdas, 1,5:1 entre adyacentes».
- **Texto de las celdas vacías para tecnologías de apoyo**: «fecha · sin sesiones» (pasadas) y «fecha · día futuro» (futuras), en RNF-5.
- **Modificaciones de la spec 003 (2026-10-05)** — constancia de la fase «Cambio» de la skill sdd; 4 resoluciones de esta spec quedan sustituidas:
- **RF-1 (orientación)**: la rejilla pasa de 12 columnas (semanas) × 7 filas (días) a 12 filas × 7 columnas con cabecera de días; CA1.1 y CA1.2 se leen en vertical (la última fila es la semana en curso).
- **RF-7 (ubicación)**: el mapa deja de estar «entre la tarjeta de racha y el formulario» y pasa a la columna izquierda del reparto a todo el ancho; su título «Mapa de calor» no cambia.
- **RNF-4 (gama)**: la cláusula «la gama es neutra, sin colores saturados» queda sustituida por la escala naranja de la spec 003; los umbrales de contraste (3:1 contra la tarjeta, 1,5:1 entre adyacentes y 4,5:1 con texto) se mantienen.
- **Fuera de alcance (etiquetas)**: las etiquetas de día pasan a la cabecera de las columnas y se añaden las fechas de semana a la izquierda (RF-4 de la spec 003); «marcador especial para hoy» y «etiquetas de mes» siguen fuera.
