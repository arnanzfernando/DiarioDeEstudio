# Plan de implementación — Spec 002: Editar y borrar sesiones

> Estado: **aprobado e implementado el 2026-10-03** por el usuario. Este documento decide el CÓMO —archivos, nombres, algoritmo, estilos y pruebas—; el QUÉ y el POR QUÉ siguen siendo de la spec (`spec.md`). Las6 fases de la sección 9 quedaron en verde: `node --check` ×2, `node --test` (29/29,13 nuevas) y verificación en DevTools (`file://`, los8 CL, ambos temas,375 px y escritorio, consola vacía).

## 1. Cómo cumple la constitución

- **Principio 1 — Simplicidad**: confirmación nativa del navegador, cero dependencias, `index.html` con doble clic. — *RNF-1, CF-5*.
- **Principio 2 — La spec manda**: solo RF-1 a RF-4; el mapa sigue intacto, sin borrado en lote ni deshacer (fuera de alcance). — *CF-1*.
- **Principio 3 — Lógica separada**: `validateSession`, `replaceSession` y `removeSessionAt` viven en `logica.js`, sin DOM ni localStorage. — *RNF-2, CF-3*.
- **Principio 4 — Tests como puerta**: `tests/sesiones.test.js` en rojo primero y en verde antes de tocar la interfaz. — *CF-3*.
- **Principio 5 — Datos sagrados**: confirmación previa al borrar; `creadaEn` nunca se pierde; el saneado de `leerSesiones` se queda como está; fechas como texto `AAAA-MM-DD` en hora local. — *RF-4, RNF-4, CL-6, CL-8*.
- **Principio 6 — Idioma**: identificadores y comentarios nuevos en inglés; textos de interfaz (botones, avisos, confirmación) en español. — *RNF-3, CF-6*.

## 2. Qué se crea y qué se modifica

- **`logica.js` (modifica)** — se añaden las3 funciones puras de la sección 3, antes de la guardia de export existente (que no se toca). — *Cubre: RF-1 (validación), RF-2/RF-4 en su parte lógica, RNF-2, CL-4, CL-6, CL-7, CL-8*.
- **`tests/sesiones.test.js` (nuevo)** — pruebas de `node --test` sobre esas3 funciones. — *Cubre: CF-3 y la parte lógica de CF-2 y CF-4*.
- **`index.html` (modifica)** — en el formulario: `id="tituloFormulario"` al `<h2>`, `id="botonGuardar"` al submit, botón «Cancelar» (`type="button"`, oculto por defecto) y un párrafo de aviso con `role="alert"` (oculto). La lista no cambia en HTML: las acciones las pinta JS. — *Cubre: RF-1 (estructura del modo edición), CA1.2, RNF-3*.
- **`styles.css` (modifica)** — acciones de cada fila en su propia línea, botón fantasma para «Editar»/«Borrar», aviso en español y modo edición visible. — *Cubre: RNF-3 (móvil a375 px), CF-4*.
- **`app.js` (modifica)** — estado de edición (`editandoIndice`), pintado de los botones en cada fila, un listener delegado en la lista y los tres flujos (editar, borrar con `confirm`, guardar en modo edición), todos cerrando con `guardarSesiones()` + `pintar()`. — *Cubre: RF-1, RF-2, RF-3/CA3.1-CA3.2, CA1.1, CA1.3, CA2.1, CA2.2*.
- **No se toca**: clave ni formato de localStorage (*RF-4, CF-5*), `renderHeatmap` ni nada del mapa (*fuera de alcance*), cálculos de racha/minutos/días (se recalculan solos desde `pintar()`), el tema, ni la saneación actual (*CL-6*).

## 3. Funciones puras necesarias (`logica.js`)

Nuevas, en inglés (principio 6), sin mutar la entrada:

- `validateSession(fecha, tema, minutos)` → `null` si es válida, o el **mensaje de error en español** (la interfaz muestra textos en español): fecha con `esFechaValida`, tema sin quedarse vacío tras `trim()`, minutos `Number(...)` finito y > 0 («45» de texto vale, igual que en el resto de la app). — *RF-1/CA1.2, CL-4*.
- `replaceSession(sessions, index, fields)` → **copia** de la lista con ese elemento sustituido por `{ fecha, tema.trim(), minutos: Number(...), creadaEn: original.creadaEn }`; índice fuera de rango → devuelve la lista tal cual. — *CA1.1, CL-8, principio 5*.
- `removeSessionAt(sessions, index)` → **copia** sin ese elemento (índice fuera de rango → sin cambios). — *RF-2, CL-1, CL-7*.

Se quedan en `app.js` (leen el DOM o el reloj): `empezarEdicion`, `salirDeModoEdicion`, el manejo de `confirm`, el submit con su bifurcación y `pintar()`.

## 4. Algoritmo en pseudocódigo

```text
VALIDAR SESION (fecha, tema, minutos)               -> null | mensaje
  si no esFechaValida(fecha)   -> "La fecha no es válida."        (CL-4)
  si tema.trim() = ""          -> "El tema no puede estar vacío."  (CL-4)
  m <- Numero(minutos)
  si no es finito o m <= 0     -> "Los minutos deben ser un número mayor que 0."
  en otro caso                 -> null

REEMPLAZAR SESION (lista, indice, campos)           -> lista nueva
  si indice fuera de rango ------------------------> devolver lista sin cambios
  original <- lista[indice]
  reemplazar lista[indice] por { fecha, tema: tema.trim(),
        minutos: Numero(minutos), creadaEn: original.creadaEn }
                              -> CA1.1 y CL-8 (creadaEn intacto)
  devolver copia                (la original no se toca, principio 3)

BORRAR SESION EN (lista, indice)                    -> lista nueva
  si indice fuera de rango ------------------------> devolver lista sin cambios
  devolver lista sin el elemento indice             -> CL-1; [] en CL-7

PULSAR EDITAR (indice)                              (app.js, delegado en la lista)
  editandoIndice <- indice
  rellenar fecha/tema/minutos con sesiones[indice]
  titulo <- "Editar sesión",  botonGuardar <- "Guardar cambios"
  botonCancelar visible; aviso oculto; campoFecha.focus()

PULSAR BORRAR (indice)                              (app.js)
  si confirm("¿Borrar esta sesión?")  -> CL-5 si cancela (nada)
      sesiones <- removeSessionAt(sesiones, indice)
      guardarSesiones(); pintar()        -> RF-3, sin recargar

SUBMIT DEL FORMULARIO
  si editandoIndice = null   -> camino actual de crear (sin cambios)
  sino:
      error <- validateSession(...)          -> CL-4
      si error: aviso.textContent <- error y visible; NO se guarda
      sino:     sesiones <- replaceSession(sesiones, editandoIndice, campos)
                salirDeModoEdicion()         -> vuelve a "Nueva sesión"
      guardarSesiones(); pintar()            -> CA1.1, CA1.3, RF-3 (CA3.1, CA3.2)
```

Notas: la edición es de **texto a texto** (el input `type=date` ya entrega `AAAA-MM-DD`): ni `toISOString()` ni `new Date("AAAA-MM-DD")` ni 86400000 ms (skill `local-dates`). Las tarjetas y el mapa se recalculan dentro de `pintar()`, que ya existe: RF-3 sale sin esfuerzo nuevo.

## 5. Cómo se pinta en la interfaz

**Formulario** (esquema, no código final — se añaden ids, el aviso y el cancelar; los3 campos no cambian):

```html
<section class="tarjeta">
  <h2 id="tituloFormulario">Nueva sesión</h2>
  <form id="formularioSesion">
    <!-- fecha, tema y minutos: idénticos a hoy -->
    <p class="formulario__aviso" id="avisoEdicion" role="alert" hidden></p>
    <button type="submit" id="botonGuardar">Guardar sesión</button>
    <button type="button" id="botonCancelar" hidden>Cancelar</button>
  </form>
</section>
```

**Cada fila de la lista** (pintada por `pintar()`, que ya rehace la lista entera en cada llamada):

```html
<li class="sesion">
  <div> <!-- tema + fecha como hoy --> </div>
  <span class="sesion__minutos">45 min</span>
  <div class="sesion__acciones">
    <button type="button" class="sesion__accion" data-i="3" data-accion="editar"
            aria-label="Editar la sesión Álgebra, 1 oct 2026">Editar</button>
    <button type="button" class="sesion__accion" data-i="3" data-accion="borrar"
            aria-label="Borrar la sesión Álgebra, 1 oct 2026">Borrar</button>
  </div>
</li>
```

- **Identificador**: `data-i` es el índice en el array `sesiones`, obtenido con `sesiones.indexOf(sesion)` (referencia al objeto: correcto aunque haya dos sesiones idénticas). Tras cada mutación se repinta entero, así que los índices siempre están frescos. — *CA1.1*.
- **Un solo listener delegado** en `listaSesiones` (igual que en el mapa): la lista se reconstruye en cada pintado, los botones de antes no sobrevivirían.
- **Modo edición visible**: el `<h2>` pasa a «Editar sesión», el submit a «Guardar cambios» y aparece «Cancelar»; al entrar, foco en el campo de fecha; al salir (guardar o cancelar), todo vuelve al estado inicial y el foco queda en el botón de guardar. — *RNF-3 (teclado)*.
- **Estilos** (tokens existentes): `.sesion` gana `flex-wrap: wrap` y `.sesion__acciones` ocupa `flex-basis: 100%` alineado a la derecha → las acciones nunca aprietan tema/minutos (*375 px*). Botón fantasma: fondo transparente (la tarjeta), `color: var(--texto)` (≥4,5:1 ya usado), filete `1px var(--borde-fuerte)` (≥3:1), radio `var(--radio-suave)`, hover `var(--borde)`; el `:focus-visible` global sigue mandando. Aviso: fondo `var(--fuego-suave)` con texto `var(--fuego-hondo)` — el mismo par que la píldora de minutos, ya contrastado en ambos temas.

## 6. Decisiones técnicas (y su alternativa descartada)

1. **Reutilizar el formulario superior con «modo edición»** (un estado + cambio de textos). — *Descartado*: edición en línea dentro de la fila (duplica inputs y validaciones y la lista se rehace en cada pintado); un `<dialog>` aparte (más estructura, estilos y gestión de foco para lo que son3 campos).
2. **Identificar la sesión por índice de array + referencia de objeto**, sin añadir campos. — *Descartado*: crear un `id` por sesión (RF-4 prohíbe cambiar la forma de los datos); buscar por `fecha`+`creadaEn` (más código para lo mismo).
3. **`window.confirm("¿Borrar esta sesión?")` nativo**. — *Descartado*: diálogo propio (más código; el nativo ya es accesible y su texto lo ponemos nosotros en español). El aviso de cancelación es simplemente no pasar nada (*CA2.2, CL-5*).
4. **Las3 operaciones como funciones puras en `logica.js`**. — *Descartado*: lógica dentro de los listeners (CF-3 exigiría tests de DOM que `node --test` no puede hacer).
5. **Delegación de clics en la lista** (`data-accion` + `data-i`). — *Descartado*: `addEventListener` por fila (se pierden en cada `pintar()`; dos maneras de gestionar eventos en la misma página).
6. **`replaceSession` conserva el `creadaEn` original**. — *Descartado*: `Date.now()` nuevo (reordenaría la sesión dentro del día y rompería CA1.1 y CL-8).
7. **Aviso propio con `role="alert"` además de la validación nativa**. — *Descartado*: solo la nativa (su idioma depende del navegador —CA1.2 pide español—, y un tema de solo espacios la supera).
8. **Acciones en su propia línea dentro de la fila**. — *Descartado*: a la derecha de los minutos (a375 px quedan2 botones y la píldora peleando por el sitio); iconos sin texto (peor para lectores de pantalla; aquí «Editar»/«Borrar» es clarísimo).
9. **Cerrar cada operación con `guardarSesiones()` + `pintar()`**, el mismo ciclo que ya usa «Guardar sesión». — *Descartado*: recalcular tarjetas y mapa a mano (duplica lógica existente y es fácil olvidar algo: RF-3 lo cubre `pintar()` entero).
10. **El mapa no se toca**. — *Descartado*: acciones sobre las celdas (fuera de alcance de la spec y entrería en conflicto con la spec 001: allí el clic muestra detalle).

## 7. Estrategia de tests con `node --test`

- **Fichero**: `tests/sesiones.test.js`; `require("../logica.js")` — la guardia de export ya existe de la spec 001.
- **Primer paso al implementar**: escribir los tests y verlos **fallar** (las funciones aún no existen), después el código hasta que pasen (*principio 4*).
- **Casos** (≈12 pruebas; junto a las16 actuales, ~28 en total):
  - `validateSession`: válida → `null` (con minutos numérico y «45» de texto); fecha «2026-02-30» o vacía → mensaje; tema «» y «   » → mensaje; minutos `0`, `-5`, `""`, `"abc"` → mensaje — *CA1.2, CL-4*.
  - `replaceSession`: cambia los tres campos; conserva `creadaEn` (*CA1.1, CL-8*); índice `-1`/`99` → lista igual; la lista de entrada queda intacta (pureza).
  - `removeSessionAt`: quita la sesión correcta dejando las demás (*CL-6*: la suciedad que quede no se toca); con la única → `[]` (*CL-7*); índice inválido → sin cambios.
  - Pureza general: mismas entradas, mismas salidas (*principio 3*).
- **Qué no cubre** (a mano en DevTools): el formulario, `confirm`, estilos, foco y el recálculo de tarjetas/mapa.

**Verificación al implementar**:

1. `node --check logica.js` y `node --check app.js` → exit 0.
2. `node --test` → todos en verde (nada avanza con rojos).
3. Chrome DevTools en `file://`: editar sesión completa (CA1.1-CA1.3), edición inválida con aviso en español (CL-4), cancelar y confirmar borrado (CL-5), borrar única del día y ver racha/tarjetas/mapa reaccionar sin recargar (CL-1, RF-3), varias en un mismo día (CL-2), edición a fecha futura (CL-3), borrar todo → estado inicial (CL-7), corruptos en localStorage sin romper nada (CL-6), ambos temas y375 px (CF-4), consola limpia.
4. **Checklist `local-dates`**: fechas solo como texto (`fechaATexto`/`textoAFecha`), sin `toISOString()` ni `new Date("AAAA-MM-DD")`, sin 86400000 ms; lo futuro sigue sin sumar en tarjetas ni mapa tras editar.

## 8. Qué RF cubre cada parte

- **RF-1 (editar desde la lista)** → `logica.js: validateSession` + `app.js: empezarEdicion`/submit en modo edición + `index.html` (aviso, cancelar) — tests de validación y DevTools del flujo completo.
- **RF-2 (borrar con confirmación)** → `app.js: confirm` + `logica.js: removeSessionAt` — tests de `removeSessionAt` + DevTools (confirmar y cancelar).
- **RF-3 (recálculo sin recargar)** → `app.js`: ambas operaciones cierran con `guardarSesiones()` + `pintar()` — DevTools: celda cambia de nivel (CA3.1) y futuras/fuera de ventana no cuentan (CA3.2).
- **RF-4 (formato intacto)** → `logica.js: replaceSession` conserva `creadaEn`; nadie añade campos — tests + recarga tras editar/borrar (CF-5).
- **RNF-1** → sin dependencias ni build — doble clic.
- **RNF-2** →3 funciones puras sin DOM ni localStorage — tests.
- **RNF-3** → textos en español (HTML, mensajes, `confirm`), foco al editar, botones fantasma con filete ≥3:1 — DevTools con teclado y a375 px.
- **RNF-4** → saneación intacta + confirmación previa (principio 5) — CL-6 con datos corruptos.
- **CL-1 a CL-8** → su función lógica en los tests + su pasada manual en DevTools (sección 7).
- **CF-1** → plan aprobado antes de código. **CF-2** → tests + DevTools por CA. **CF-3** → `tests/sesiones.test.js` en verde. **CF-4** → CL-1…CL-8 en la página, ambos temas,375 px. **CF-5** → recarga y claves conocidas. **CF-6** → textos en español y `MEMORY.md`.

## 9. Orden de trabajo (una fase en verde antes de pasar a la siguiente)

1. **Aprobar este plan**.
2. **Generar `tasks.md`** (estándar nuevo: ≤10 tareas con RF y «Hecho cuando:»).
3. **Lógica**:3 funciones en `logica.js` + `tests/sesiones.test.js` → rojo primero, `node --test` en verde. `app.js` no se toca: la página sigue igual.
4. **Interfaz**: `index.html` (ids, aviso, cancelar) y `styles.css` (acciones, fantasma, aviso) — todo oculto o inerte sin `app.js`, así que la página no cambia aún; revisión visual.
5. **Integración**: `app.js` — estado de edición, pintado de acciones, delegados y flujos → `node --check`, `node --test` y DevTools completo (sección 7).
6. **Cierre**: verificación final, `tasks.md` al día y `MEMORY.md` actualizado.
