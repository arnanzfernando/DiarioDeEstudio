# Spec 002 — Editar y borrar sesiones guardadas

> Estado: **aprobada el 2026-10-03** (entrevista del mismo día:3 preguntas; aprobada sin cambios). Solo el QUÉ y el POR QUÉ: el cómo va en el plan.

## Contexto y objetivo

Hoy el Diario solo acepta crear sesiones: la lista de sesiones es de solo lectura. Si registro mal —minutos de más, el día equivocado, un tema que no toca— la sesión queda para siempre y contamina la racha, la mejor racha, los minutos de la semana, los días del mes y el mapa de calor. Objetivo: poder corregir y eliminar registros con la misma sencillez que crearlos, sin salir de la página, sin instalar nada y sin tocar el formato de los datos.

## Usuarios

El estudiante que usa el Diario, dueño de los datos que se guardan en su navegador.

## Historias de usuario

- HU-1. Como estudiante, quiero editar una sesión ya guardada para corregir un error de registro.
- HU-2. Como estudiante, quiero borrar una sesión que no corresponde, con confirmación, para que mis estadísticas digan la verdad.

## Requisitos funcionales

**RF-1 — Editar una sesión.** CUANDO el usuario pida editar una sesión desde la lista, EL SISTEMA le mostrará la sesión con sus tres campos (fecha, tema y minutos) y, al confirmar, guardará los nuevos valores con las mismas validaciones que la creación.

- CA1.1 (WHEN): cuando la edición sea válida, la sesión se actualiza conservando su `creadaEn` y la lista muestra los valores nuevos.
- CA1.2 (IF): si los valores no son válidos, no se guarda nada, la sesión queda como estaba y se muestra un aviso en español.
- CA1.3 (WHEN): cuando cambie la fecha, la sesión aparece en su nuevo día de la lista y desaparece del anterior si este queda vacío.

**RF-2 — Borrar una sesión.** CUANDO el usuario pida borrar una sesión desde la lista, EL SISTEMA pedirá confirmación explícita antes de eliminarla.

- CA2.1 (WHEN): cuando el usuario confirme, la sesión desaparece de la lista y de localStorage.
- CA2.2 (IF): si el usuario cancela, no cambia nada.

**RF-3 — Recálculo sin recargar.** MIENTRAS la página esté abierta, EL SISTEMA recalculará tras cada edición o borrado las tarjetas (racha actual, mejor racha, minutos de la semana y días del mes) y el mapa de calor, sin recargar la página y a partir de lo que queda guardado.

- CA3.1 (WHEN): si el cambio altera el nivel del día en el mapa (p. ej. de 20 a 45 min), la celda pasa al nivel correspondiente en el momento.
- CA3.2 (IF): si la fecha resultante es futura o queda fuera de la ventana de 12 semanas del mapa, la lista la sigue mostrando en su día pero las tarjetas no la cuentan (si es futura) y el mapa no la pinta.

**RF-4 — Los datos no cambian de forma.** EL SISTEMA mantendrá el formato de las sesiones `{ fecha, tema, minutos, creadaEn }`: editar solo cambia valores y borrar solo quita elementos; las demás sesiones guardadas quedan intactas.

## Requisitos no funcionales

- **RNF-1**: Sin dependencias ni build; la página sigue abriéndose con doble clic (Constitución, principio 1).
- **RNF-2**: La validación de la edición y el cálculo de «qué queda» se separan del DOM en funciones puras, con «hoy» como parámetro donde aplique (Constitución, principio 3).
- **RNF-3**: Todos los textos nuevos (acciones, formulario de edición, aviso de confirmación) en español, utilizables con teclado y lector de pantalla, y con aspecto correcto a 375 px (Constitución, principio 6).
- **RNF-4**: Operar con datos ilegibles en localStorage (JSON roto, elementos corruptos) no rompe la edición ni el borrado ni el resto de la app; sigue existiendo la saneación actual al leer (Constitución, principio 5).

## Casos límite

- **CL-1**: Borrar la única sesión de un día → el día desaparece de la lista, las tarjetas y el mapa lo olvidan (la racha se recalcula).
- **CL-2**: Varias sesiones en el mismo día → editar o borrar una recalcula la suma del día en el mapa sin tocar a las demás.
- **CL-3**: Editar la fecha de una sesión a un futuro → las tarjetas no la cuentan (lo futuro no suma) y el mapa deja esa celda vacía.
- **CL-4**: Edición inválida (minutos 0 o no numéricos, fecha con formato incorrecto) → se rechaza entera: ni la sesión original se modifica ni se crea otra.
- **CL-5**: Cancelar la confirmación de borrado → no cambia nada, ni la lista ni localStorage.
- **CL-6**: En localStorage hay elementos corruptos (null, números sueltos) → editar y borrar operan sobre las sesiones válidas, sin romper nada y sin perderlas al guardar.
- **CL-7**: Borrar todas las sesiones → la página vuelve al estado inicial: lista vacía, tarjetas a 0 y mapa de 84 celdas vacías.
- **CL-8**: Editar sin cambiar la fecha → la sesión conserva su posición dentro del día (`creadaEn` intacto); al cambiar de día, pasa a ordenarse en su nuevo día.

## Fuera de alcance (v1)

- Editar o borrar desde las celdas del mapa: la spec 001 lo dejó fuera de alcance y el mapa sigue siendo de solo lectura.
- Borrado en lote, selección de varias sesiones o «vaciar diario» de un golpe.
- Deshacer tras borrar o papelera de reciclaje: la protección es la confirmación previa.
- Exportar, importar o sincronizar sesiones.
- Cambiar la forma de los datos guardados.

## Criterios de finalización

- **CF-1**: Esta spec aprobada antes de escribir código (Constitución, principio 2).
- **CF-2**: RF-1 a RF-4 verificados con sus criterios de aceptación.
- **CF-3**: La lógica de validación y recálculo con pruebas automatizadas en verde con `node --test`, sin instalar dependencias (Constitución, principio 4).
- **CF-4**: Los casos límite CL-1 a CL-8 comprobados en la página abierta con doble clic, en ambos temas y a 375 px.
- **CF-5**: Formato de datos sin cambios y compatibilidad hacia atrás: tras editar, borrar y recargar, todo sigue funcionando y localStorage solo contiene las claves conocidas (Constitución, principio 5).
- **CF-6**: Todos los textos visibles en español y `MEMORY.md` actualizado al terminar.

## Dudas abiertas

Ninguna: las3 preguntas de la entrevista quedaron respondidas el 2026-10-03 (qué campos se editan, desde dónde se edita y borra, y confirmación previa al borrar).
