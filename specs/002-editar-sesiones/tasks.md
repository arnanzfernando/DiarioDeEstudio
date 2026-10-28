# Tareas — Spec 002: Editar y borrar sesiones

> Generado el 2026-10-03 desde `spec.md` y `plan.md` aprobados. Tareas de 20-30 minutos como máximo, en orden de dependencia (misma columna vertebral que la sección 9 del plan). La línea «Hecho cuando:» es la prueba que cierra la tarea.

## Fase 0 — Compromiso

- [x] **T1. Aprobar spec y plan** — CF-1
  Hecho cuando: las cabeceras de `spec.md` y `plan.md` llevan fecha de aprobación y no existe ningún cambio de código anterior a esa fecha.

## Fase A — Lógica y tests (`logica.js`)

- [x] **T2. Tests rojos de las3 funciones nuevas** — RF-1, RF-2, RF-4, CF-3
  Hecho cuando: `tests/sesiones.test.js` existe con ~12 pruebas y `node --test` las lista y **falla** (las funciones aún no existen).
- [x] **T3. `validateSession`, `replaceSession` y `removeSessionAt` en `logica.js`** — RF-1, RF-2, RF-4, RNF-2
  Hecho cuando: `node --test` pasa todo (~28 pruebas, exit 0), `node --check logica.js` da exit 0 y ninguna función muta la lista de entrada.

## Fase B — Estructura y estilos (sin lógica: la página no cambia)

- [x] **T4. `index.html`: ids, aviso y botón Cancelar** — RF-1, CA1.2, RNF-3
  Hecho cuando: el formulario tiene `tituloFormulario`, `botonGuardar`, `avisoEdicion` (`role="alert"`, oculto) y `botonCancelar` (oculto), y la página abierta con doble clic se ve idéntica a antes.
- [x] **T5. `styles.css`: acciones de fila, botón fantasma y aviso** — RNF-3, CF-4
  Hecho cuando: `.sesion` admite `flex-wrap`, `.sesion__acciones` ocupa su propia línea alineada a la derecha, `.sesion__accion` usa `--texto`/`--borde-fuerte` y el aviso el par fuego; a375 px la lista no se desborda.

## Fase C — Integración (`app.js`)

- [x] **T6. Pintado de los botones y listener delegado en la lista** — RF-1, RF-2, RNF-3
  Hecho cuando: cada fila muestra «Editar» y «Borrar» con `data-i`, `data-accion` y `aria-label` en español (fecha y tema), hay un único listener en `listaSesiones` y `node --check app.js` da exit 0.
- [x] **T7. Modo edición: entrar, guardar y cancelar** — RF-1, CA1.1, CA1.2, CA1.3, CL-4, CL-5
  Hecho cuando: «Editar» rellena el formulario y cambia título/botón/foco; guardar válido actualiza la sesión **conservando `creadaEn`** y sale del modo; lo inválido muestra el aviso en español sin guardar; «Cancelar» restaura sin tocar datos.
- [x] **T8. Borrado con confirmación** — RF-2, CA2.1, CA2.2, CL-1, CL-5, CL-7
  Hecho cuando: confirmar quita la sesión de la lista y de localStorage; cancelar no cambia nada; borrar la única deja el array vacío y la página en su estado inicial.

## Fase D — Verificación y cierre

- [x] **T9. Puerta de integración: recálculo sin recargar** — RF-3, CA3.1, CA3.2, CL-2, CL-3, CL-6, CF-3
  Hecho cuando: `node --check` (ambos ficheros) + `node --test` en verde y en DevTools editar/borrar actualizan tarjetas y mapa sin recargar: la celda cambia de nivel, lo editado a futuro no cuenta y los datos corruptos no rompen nada.
- [x] **T10. Verificación final CF-4/CF-5 y cierre** — CL-1 a CL-8, CF-4, CF-5, CF-6
  Hecho cuando: los8 casos límite constan en DevTools en ambos temas y a375 px, tras recargar todo sigue funcionando con solo las claves conocidas en localStorage, el checklist `local-dates` está limpio y `MEMORY.md` refleja la spec implementada.
