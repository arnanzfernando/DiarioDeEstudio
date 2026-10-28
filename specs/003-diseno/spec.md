# Spec 003 — Rediseño visual: cabecera, todo el ancho, mapa en cintas y lista plegada

> Estado: **aprobada el 2026-10-05**, con cambio de RF-3 aprobado e implementado el mismo día —T8 cerrada— (cifras grandes en las tres tarjetas de dato + 📅; constancia en «Dudas y decisiones»). Solo el QUÉ y el POR QUÉ: el cómo (y los nombres de cosas) va en el plan.

## Contexto y objetivo

El Diario funciona completo: la spec 001 (mapa de calor) y la spec 002 (editar y borrar sesiones) están cerradas y verificadas. El 2026-10-05 el usuario pide un rediseño de presentación:

1. El mapa de calor no le gusta ni el formato ni los colores.
2. El título y el botón de cambio de tema claro/oscuro quiere verlos en una cabecera.
3. La web debe aprovechar todo el ancho de pantalla: arriba el tarjetero y, debajo, de izquierda a derecha: mapa de calor, nueva sesión y sesiones.
4. En la tarjeta «Sesiones» quiere ver solo las dos últimas sesiones y, abajo, un botón desplegable «Cargar más sesiones».

Decisiones de la entrevista (2026-10-05, cuatro preguntas): el mapa pasa a **cintas semanales** y el tarjetero pasa a **cuatro tarjetas**; el botón de la lista **despliega todas las sesiones y permite volver a plegar** («Mostrar menos»), y tras guardar, editar o borrar la lista **mantiene lo que se veía**.

Objetivo: cambiar únicamente cómo se ve, se dispone y se despliega la página. La lógica, los datos guardados, los 29 tests y los flujos de alta, edición y borrado quedan intactos.

## Definiciones

- **Cinta semanal**: una fila del mapa, dedicada a una semana (lunes a domingo).
- **Tarjetero**: la fila de tarjetas de resumen que encabeza el contenido.
- **Lista plegada**: la tarjeta «Sesiones» mostrando solo las dos últimas sesiones con su botón de desplegar; **desplegada** muestra todas.

## Usuarios

- **Estudiante** (principal): usa el Diario a diario, en el móvil y en el ordenador; quiere verlo todo de un vistazo.
- **Persona que mantiene el proyecto** (quien empieza a programar): debe poder leer esta spec y entender qué cambia y qué no.
- **Usuario de tecnologías de apoyo**: navega con lector de pantalla o teclado; necesita seguir llegando a cada dato.

## Historias de usuario

- **HU-1**: Como estudiante en el ordenador, quiero ver mapa, alta y sesiones a la vez, para no desplazarme de arriba abajo.
- **HU-2**: Como estudiante, quiero que el mapa se coloque con la gama de la llama, para que el historial encaje con el resto del Diario.
- **HU-3**: Como estudiante, quiero leer el mapa semana a semana con la fecha de cada semana y las iniciales de los días, para localizar cada fila sin memorizar el orden.
- **HU-4**: Como usuario de tecnologías de apoyo, quiero que el título y el botón de tema estén siempre en la cabecera y las cifras repartidas en el tarjetero, para encontrarlos en el mismo sitio y seguir recibiéndolos al actualizarse.
- **HU-5**: Como estudiante, quiero ver primero solo mis dos últimas sesiones y desplegar el resto cuando lo necesite, para que la lista no ocupe toda la pantalla.

## Cambios sobre la spec 001

Al aprobar esta spec, la spec 001 se reestampa y en su «Dudas y decisiones» queda constancia de que estas resoluciones suyas quedan sustituidas:

- **RF-1**: la orientación de la rejilla pasa de «12 columnas (semanas) × 7 filas (días)» a «12 filas (semanas) × 7 columnas (días)»; CA1.1 y CA1.2 se leen ahora en vertical (la última fila es la semana en curso).
- **RF-7**: el mapa deja de estar «entre la tarjeta de racha y el formulario» para ocupar la columna izquierda del reparto a todo el ancho. Su título «Mapa de calor» no cambia.
- **RNF-4**: la cláusula «la gama es neutra, sin colores saturados» queda sustituida por la escala naranja del RF-5 de esta spec. Los umbrales de contraste (3:1 contra la tarjeta, 1,5:1 entre adyacentes y 4,5:1 con texto) se mantienen tal cual.
- **Fuera de alcance**: «etiquetas de día» pasa a estar permitido en su nueva posición (cabecera sobre las columnas) y se añaden las fechas de semana a la izquierda. «Marcador especial para hoy» y «etiquetas de mes» siguen fuera.

Lo que no cambia de la spec 001: ventana de 12 semanas, suma diaria, umbrales de los 4 niveles, leyenda, detalle al pasar/tocar/enfocar, información a tecnologías de apoyo, mapa de solo lectura y todos sus casos límite.

## Requisitos funcionales

**RF-1 — Cabecera.** La página abre con una cabecera que ocupa todo el ancho de la ventana: a la izquierda el título «Diario de Estudio» con su subtítulo «Registra tus sesiones y mantén la racha viva», a la derecha el botón de tema (🌙/☀️).

- CA1.1 (ubicuo): la cabecera estará por encima de todo el contenido, en los dos temas, con los textos de hoy.
- CA1.2 (WHEN): cuando se pulse el botón de tema, el tema cambiará sin recargar la página (igual que hoy).

**RF-2 — Disposición a todo el ancho.** Con 1024 px o más, el contenido ocupa el ancho de la ventana con un margen cómodo, sin la columna central de 640 px de hoy: arriba el tarjetero y, debajo, de izquierda a derecha «Mapa de calor», «Nueva sesión» y «Sesiones».

- CA2.1 (WHEN): con 1024 px o más, las tres secciones se mostrarán en tres columnas en ese orden exacto (mapa a la izquierda), con el tarjetero en fila por encima de ellas.
- CA2.2 (IF): por debajo de 1024 px, las mismas secciones se mostrarán apiladas en una sola columna y en ese mismo orden (tarjetero, mapa, nueva sesión, sesiones), sin desplazamiento horizontal.

**RF-3 — Tarjetero de cuatro tarjetas.** El tarjetero son cuatro tarjetas con la misma figura: emoji grande + cifra grande y, debajo, la etiqueta pequeña. (1) la racha actual, superficie de llama: «🔥 3» más «días seguidos estudiando»; (2) «🏆 3» más «Mejor racha»; (3) «⏱️ 135 min» más «Esta semana»; (4) «📅 3» más «Días este mes» (los números son de ejemplo).

- CA3.1 (ubicuo): las cuatro tarjetas muestran emoji y cifra en tamaño grande con su etiqueta pequeña debajo, en ese orden y con los textos de hoy. La tarjeta de la racha conserva su superficie de llama (la única de la fila con fondo de color) y su cifra es la mayor de las cuatro; las otras tres van en papel de tarjeta.
- CA3.2 (WHEN): cuando una sesión nueva cambie cualquiera de las cuatro cifras, las tarjetas se actualizarán sin recargar la página y seguirán anunciándose a las tecnologías de apoyo, como hoy.

**RF-4 — Mapa en cintas semanales.** El mapa se pinta como 12 filas × 7 columnas: cada fila es una semana (la más antigua arriba y la semana en curso abajo) y cada columna un día de lunes a domingo. Sobre las columnas hay una cabecera con las iniciales «L M X J V S D»; a la izquierda de cada fila, la fecha de su lunes en el mismo formato legible que el detalle (p. ej. «28 sep 2026»).

- CA4.1 (ubicuo): siempre 12 filas × 7 columnas = 84 celdas, aunque el usuario tenga menos historial.
- CA4.2 (WHEN): la última fila será la semana que contiene a hoy, en fecha local del usuario; los días posteriores a hoy se mostrarán como celda vacía.
- CA4.3 (ubicuo): cada celda seguirá siendo un botón, con el mismo detalle al pasar, tocar o enfocar y la misma información para las tecnologías de apoyo que en la spec 001 (RF-5 y RNF-5).
- CA4.4 (WHEN): cuando se pinte la página (carga o guardado), cada fecha de fila corresponderá al lunes de esa misma fila; si la ventana se recoloca (nuevo lunes), las 12 fechas se recolocan con sus celdas.

**RF-5 — Escala de color de la llama.** Los cuatro niveles del mapa usarán esta escala (los umbrales en minutos son los de la spec 001):

| Nivel | Minutos        | Tema claro | Tema oscuro |
|-------|----------------|------------|-------------|
| 1     | 1 – 30         | `#ea580c`  | `#c2410c`   |
| 2     | 31 – 60        | `#b4400d`  | `#f97316`   |
| 3     | 61 – 120       | `#7c2d12`  | `#fdba74`   |
| 4     | más de 120     | `#4a190b`  | `#fff7ed`   |

- CA5.1 (ubicuo): la leyenda usará exactamente estos mismos colores (RF-4 de la spec 001) y las celdas vacías mantendrán el fondo de la tarjeta con su filete.
- CA5.2 (ubicuo): en cada tema, cada nivel pasará 3:1 contra el fondo de la tarjeta y cada par de adyacentes 1,5:1. Medido el 2026-10-05 con la fórmula WCAG: tema claro 3,56 · 5,71 · 9,37 · 14,63 y adyacentes 1,60 · 1,64 · 1,56; tema oscuro 3,22 · 5,95 · 9,89 · 15,71 y adyacentes 1,85 · 1,66 · 1,59.
- CA5.3 (WHEN): al cambiar de tema, celdas y leyenda cambiarán de escala juntos, sin recargar la página.
- CA5.4 (IF): si el nivel de un día cambia al guardar una sesión, su celda pasará al color de su nuevo nivel, sin tocar a las demás.

**RF-6 — Lista de sesiones plegada.** La tarjeta «Sesiones» muestra las dos sesiones más recientes (la lista conserva su orden actual, de más reciente a más antigua) y, debajo del listado, un botón «Cargar más sesiones» que la despliega; mientras esté desplegada, el botón pasa a «Mostrar menos».

- CA6.1 (IF): con 2 sesiones o menos —incluida la lista vacía— el botón no se mostrará.
- CA6.2 (WHEN): al cargar la página, la lista empezará plegada con las dos últimas; el estado desplegado no se conservará al recargar.
- CA6.3 (WHEN): al pulsar «Cargar más sesiones» se mostrarán todas las sesiones y el botón dirá «Mostrar menos»; al pulsarlo de nuevo, la lista volverá a las dos últimas y el botón volverá a decir «Cargar más sesiones».
- CA6.4 (WHEN): cuando se guarde, edite o borre una sesión, la lista se repintará sin recargar y manteniendo lo que se veía: si estaba desplegada seguirá desplegada y si estaba plegada seguirá con las dos últimas.
- CA6.5 (IF): si al editar cambia la fecha de una sesión para que deje de estar entre las dos últimas estando la lista plegada, tras guardar la lista seguirá plegada con las dos más recientes; la sesión editada se verá al desplegar (y si la lista está desplegada, se ve siempre, en su nueva posición).

## Requisitos no funcionales

- **RNF-1**: Sin librerías, frameworks ni pasos de build; la página sigue abriéndose con doble clic (Constitución, principio 1).
- **RNF-2**: La lógica no cambia: `logica.js` (ventana, sumas, niveles, rachas, sesiones) queda intacto y `node --test` sigue dando 29/29 sin modificar ni añadir pruebas (Constitución, principio 4).
- **RNF-3**: Los datos no cambian: misma clave de localStorage, mismo formato y misma compatibilidad con lo ya guardado; el mapa sigue solo leyendo (Constitución, principio 5; RNF-2 de la spec 001).
- **RNF-4**: Contraste: los textos pasan 4,5:1 y los filetes 3:1 como hoy; los niveles cumplen CA5.2 en los dos temas.
- **RNF-5**: En 375 px, la página entera (cabecera, tarjetero, las 8 columnas del mapa: fecha de semana + 7 días, y el botón de la lista) cabe sin desplazamiento horizontal, con celdas cómodas al tacto.
- **RNF-6**: Accesibilidad sin pérdidas: navegación con teclado y foco visible; el detalle al enfocar, los `aria-label` de las celdas y la leyenda de la spec 001 siguen; las cifras del tarjetero se siguen anunciando (CA3.2); el botón de tema conserva su etiqueta; el botón de la lista informará de si está desplegado.
- **RNF-7**: Todos los textos visibles en español (Constitución, principio 6).
- **RNF-8**: Pintar 84 celdas, 12 fechas de fila, la cabecera de días y las 4 tarjetas no debe apreciarse como retardo.

## Casos límite

- **CL-1**: Cero sesiones → 84 celdas vacías, leyenda visible, cabecera de días y las 12 fechas de fila presentes; el resto de la página intacta.
- **CL-2**: Semana en curso con días futuros → sus celdas vacías con la fecha de su lunes igual que las demás filas.
- **CL-3**: Cambio de tema con el mapa pintado → todas las celdas y la leyenda cambian de escala juntos; ninguna se queda con el color del otro tema.
- **CL-4**: Al cruzar un lunes o la medianoche → en el siguiente pintado la ventana y las 12 fechas de fila se recolocan solas (misma regla que la CL-10 de la spec 001).
- **CL-5**: Pantallas entre 768 y 1023 px → secciones apiladas sin columnas partidas ni celdas aplastadas.
- **CL-6**: 375 px → sin desplazamiento horizontal; la fecha de la semana no tapa las celdas de su fila.
- **CL-7**: Sesión guardada que cambia el nivel de su día → su celda cambia de color sin recargar, con el resto del mapa idéntico.
- **CL-8**: Detalle al pasar, tocar o enfocar en el formato nuevo → mismo texto (p. ej. «Hoy · 45 min») y misma ocultación que hoy.
- **CL-9**: Los casos de datos de las specs 001 y 002 (fronteras de nivel, fechas inválidas o futuras, minutos inválidos, datos corruptos, editar y borrar) siguen resueltos → los cubren los 29 tests.
- **CL-10**: Cero o una sesiones —o haberlas borrado todas— → sin botón «Cargar más sesiones»; la lista vacía conserva su mensaje actual (compatible con la CL-7 de la spec 002).
- **CL-11**: Exactamente 3 sesiones → plegada muestra 2; «Cargar más sesiones» despliega la 3ª y «Mostrar menos» vuelve a 2.
- **CL-12**: Borrar una de las dos visibles con la lista plegada → la siguiente sesión sube sola a la vista y la lista sigue plegada.
- **CL-13**: Editar una sesión cambiándole la fecha de forma que salga de las dos últimas con la lista plegada → tras guardar sigue plegada con las dos más recientes; al desplegar aparece la sesión editada en su nueva posición.

## Fuera de alcance

- La lógica, los umbrales de nivel, la ventana de 12 semanas, la leyenda, el detalle, los `aria` y los textos de sesión: sin cambios (specs 001 y 002 mandan).
- Marca especial para hoy, etiquetas de mes, más de 12 semanas y seleccionar o actuar sobre celdas (siguen fuera, spec 001).
- Nuevas tipografías o fuentes web: se mantiene la tipografía del sistema.
- Animaciones nuevas, cabecera fija, degradados o sombras.
- Cambiar cualquier texto de la interfaz que no sea añadir las etiquetas nuevas del RF-4, los dos textos del RF-6 y reordenar las etiquetas del RF-3 (cambio del 2026-10-05).
- Mostrar un número de sesiones plegadas distinto de dos, paginación por páginas, contador de sesiones totales o conservar el estado desplegado entre recargas.

## Criterios de finalización

- **CF-1**: La spec aprobada antes de escribir código (Constitución, principio 2); al aprobar, constancia en la spec 001 («Cambios sobre la spec 001») con su fecha reestampada.
- **CF-2**: `node --check app.js` en verde y `node --test` → 29/29 sin tocar `logica.js` ni `tests/`.
- **CF-3**: Los ratios de CA5.2 verificados con la fórmula WCAG en ambos temas.
- **CF-4**: DevTools con la página abierta con doble clic: ≥ 1024 px con cabecera, tarjetero y tres columnas; < 1024 px apilado; 375 px sin desplazamiento horizontal; ambos temas; el botón de la lista despliega, pliega y conserva su estado al guardar o borrar; consola vacía; sesiones y tema persisten tras recargar.
- **CF-5**: Los casos límite CL-1 a CL-13 comprobados en la página.
- **CF-6**: Recorrido con teclado y con lector de pantalla sin pérdidas respecto a la spec 001 (RNF-6).
- **CF-7**: Todos los textos visibles en español, la spec con lint en verde (`markdownlint` con MD013 y MD036 desactivados) y `MEMORY.md` actualizado al terminar.

## Dudas y decisiones

Ninguna abierta: las cuatro preguntas de la entrevista las respondió el usuario el 2026-10-05 (formato del mapa: cintas semanales; tarjetero: cuatro tarjetas; botón de la lista: desplegar y poder volver a plegar; tras guardar, editar o borrar: mantener lo que se veía).

- **Lista plegada** (decisiones de redacción el 2026-10-05): dos es un número fijo; con menos de 3 sesiones no se muestra el botón; el estado desplegado no se conserva al recargar; textos «Cargar más sesiones» (mayúscula inicial, igual que el resto de botones de la interfaz) y «Mostrar menos». El requisito se añadió a esta spec en vez de crear una spec 004 porque es presentación.

- **Paleta** (decisión al redactar, con las medidas puestas en la mesa): escala naranja de la llama; la alternativa ámbar se probó con la fórmula WCAG y no alcanza 3:1 + 1,5:1 en tema claro (0 combinaciones válidas), por lo que se descartó. Si el usuario prefiere otro tono, se cambia aquí antes del código.
- **Constancia del cambio**: al aprobar, la spec 001 se reestampa con los cuatro puntos de «Cambios sobre la spec 001» y la fecha de aprobación de hoy.

- **Cambio de RF-3 (aprobado el 2026-10-05 con diff)**: las tres tarjetas de dato pasan a la figura de la racha —emoji grande + cifra grande + etiqueta pequeña debajo— y «Días este mes» gana 📅; los dos puntos de las etiquetas desaparecen al mudarse debajo de la cifra. «Como la tarjeta de la racha» se interpretó como la **figura**, no el fondo: solo 🔥 conserva la superficie de llama (el usuario aprobó el diff con esa lectura; si quiere las cuatro con fondo de llama, se cambia aquí).
