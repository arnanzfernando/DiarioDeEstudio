// =========================================================
// Diario de Estudio
// Guarda las sesiones en localStorage y calcula la racha.
// =========================================================

// Clave donde guardamos los datos en el navegador.
const CLAVE = "diario-estudio-sesiones";

// Goal storage, kept apart from the sessions: the sessions' key and shape
// never change (RF-2). It sits with CLAVE because readGoal() runs at load,
// before section 1 is reached.
const CLAVE_OBJETIVO = "diario-estudio-objetivo";

// Elementos de la página.
const formulario = document.getElementById("formularioSesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const rachaNumero = document.getElementById("rachaNumero");
const mejorRachaNumero = document.getElementById("mejorRacha");
const minutosMesNumero = document.getElementById("minutosMes");
const diasMesNumero = document.getElementById("diasMes");
const seccionObjetivo = document.getElementById("seccionObjetivo");
const objetivoMesTexto = document.getElementById("objetivoMesTexto");
const tarjetaObjetivo = document.getElementById("tarjetaObjetivo");
const metaMinutos = document.getElementById("metaMinutos");
const listaSesiones = document.getElementById("listaSesiones");
const listaVacia = document.getElementById("listaVacia");
const botonMasSesiones = document.getElementById("botonMasSesiones");
const botonTema = document.getElementById("botonTema");
const heatmapGrid = document.getElementById("mapaRejilla");
const heatmapDetail = document.getElementById("mapaDetalle");
const tituloFormulario = document.getElementById("tituloFormulario");
const botonGuardar = document.getElementById("botonGuardar");
const botonCancelar = document.getElementById("botonCancelar");
const avisoEdicion = document.getElementById("avisoEdicion");
const formularioObjetivo = document.getElementById("formularioObjetivo");
const campoObjetivo = document.getElementById("objetivoMinutos");
const avisoObjetivo = document.getElementById("avisoObjetivo");
const botonCambiarObjetivo = document.getElementById("botonCambiarObjetivo");
const felicitacion = document.getElementById("felicitacion");
const felicitacionTexto = document.getElementById("felicitacionTexto");
const botonCerrarFelicitacion = document.getElementById("botonCerrarFelicitacion");

// Empezamos con las sesiones guardadas (o una lista vacía).
let sesiones = leerSesiones();

// Raw stored goal ({ mes, minutos } or null), read once at load (RF-2). Its
// validity for the current month is checked on every use, so a goal from
// another month simply reads as "no goal" and the band asks again.
let objetivoGuardado = readGoal();

// Position of the session being edited in `sesiones`, or null when the form
// would create a new one. Memory only: the stored format never changes and
// sessions have no id (RF-4, principle 5).
let editandoIndice = null;

// Whether the list shows every session or only the last two. Only the
// toggle button changes it, so saving, editing or deleting keeps the
// current view (CA6.4). Memory only: it resets on reload (CA6.2, RF-6).
let listaDesplegada = false;

// Whether the goal band is open in edit mode (RF-1). Memory only: together
// with pintar() it is the single writer of the band's visibility, so saving,
// editing sessions or pressing "Cambiar" never fight over it (same pattern
// as listaDesplegada).
let editandoObjetivo = false;

// =========================================================
// 1. Leer y guardar en localStorage
// =========================================================

function leerSesiones() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return [];
    const datos = JSON.parse(texto);
    // sanitizeSessions (logica.js) drops entries that are not objects so the
    // rest of the app keeps working (CL-8); no real session is ever lost.
    return Array.isArray(datos) ? sanitizeSessions(datos) : [];
  } catch (error) {
    // Si hay algún problema con los datos, empezamos de cero.
    return [];
  }
}

function guardarSesiones() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesiones));
  } catch (error) {
    // Si el navegador no permite localStorage, la página sigue funcionando.
  }
}

// Reads the stored goal in one piece. Anything missing or unparseable simply
// means "no goal" (same defence as leerSesiones).
function readGoal() {
  try {
    const texto = localStorage.getItem(CLAVE_OBJETIVO);
    if (!texto) return null;
    return JSON.parse(texto);
  } catch (error) {
    return null;
  }
}

// =========================================================
// 2. Fechas en formato local (nunca UTC)
// =========================================================
// The pure date helpers (fechaATexto, textoAFecha, diasAntes, esFechaValida,
// etiquetaFecha) moved to logica.js: they are shared with the heat map, so
// the list and the map can never show different dates. hoy() and ayer()
// read the clock, so they stay here (Constitution, principle 3).

function hoy() {
  return fechaATexto(new Date());
}

function ayer() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 1);
  return fechaATexto(fecha);
}

// =========================================================
// 3. Racha
// =========================================================

// La racha son días consecutivos con sesión que terminan hoy.
// Si hoy todavía no hay sesión pero sí la de ayer, sigue viva.
function calcularRacha() {
  const dias = new Set(sesiones.map((sesion) => sesion.fecha));

  let diaActual = hoy();
  if (!dias.has(diaActual)) {
    diaActual = ayer();
    if (!dias.has(diaActual)) return 0;
  }

  let racha = 0;
  while (dias.has(diaActual)) {
    racha += 1;
    diaActual = diasAntes(diaActual, 1);
  }
  return racha;
}

// La mejor racha es el tramo más largo de días seguidos de todo el historial.
// Se calcula de las sesiones guardadas: nunca guardamos este valor.
function calcularMejorRacha() {
  // Días únicos, válidos y no futuros (las fechas futuras no suman).
  const dias = new Set();
  sesiones.forEach(function (sesion) {
    if (!esFechaValida(sesion.fecha)) return;
    if (sesion.fecha > hoy()) return;
    dias.add(sesion.fecha);
  });

  // De la más antigua a la más reciente. Con "aaaa-mm-dd" basta comparar el texto.
  const ordenados = Array.from(dias).sort();

  let actual = 0;
  let mejor = 0;
  let anterior = "";

  ordenados.forEach(function (fecha) {
    // Si es el día siguiente al anterior, la racha sigue; si no, empieza otra.
    if (anterior !== "" && diasAntes(fecha, 1) === anterior) {
      actual += 1;
    } else {
      actual = 1;
    }
    anterior = fecha;
    if (actual > mejor) mejor = actual;
  });

  return mejor;
}

// --- Monthly goal (Spec 004) ---

// The goal of the current month, or null when the month has none (RF-2).
function currentGoal() {
  return activeGoalForMonth(objetivoGuardado, hoy());
}

// Month name in Spanish for the goal band ("octubre"): interface text.
function monthName() {
  return new Intl.DateTimeFormat("es-ES", { month: "long" })
    .format(textoAFecha(hoy()));
}

// --- Días del mes ---

// Días distintos con al menos una sesión en el mes en curso.
// Comparamos solo el texto: "2026-10-17".slice(0, 7) es "2026-10".
function diasEstudiadosEsteMes() {
  const mesActual = hoy().slice(0, 7); // "2026-10"

  const dias = new Set();
  sesiones.forEach(function (sesion) {
    if (!esFechaValida(sesion.fecha)) return; // Datos corruptos: los ignoramos.
    if (sesion.fecha.slice(0, 7) !== mesActual) return; // Otro mes.
    if (sesion.fecha > hoy()) return; // Fecha futura: todavía no se ha estudiado.

    dias.add(sesion.fecha); // Un mismo día cuenta una sola vez.
  });
  return dias.size;
}

// =========================================================
// 4. Pintar la página
// =========================================================

// Sesiones de la más reciente a la más antigua.
function sesionesOrdenadas() {
  return sesiones.slice().sort(function (a, b) {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return (b.creadaEn || 0) - (a.creadaEn || 0);
  });
}

// One "Editar" or "Borrar" button for a session row. The label repeats the
// session (topic and date): a bare "Editar" means nothing out of context in
// a screen reader (RF-1, RF-2, RNF-3).
function crearBotonSesion(accion, texto, indice, sesion, fechaTexto) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "sesion__accion";
  boton.dataset.accion = accion;
  boton.dataset.i = indice;
  boton.textContent = texto;
  boton.setAttribute("aria-label", texto + " la sesión " + sesion.tema + ", " + fechaTexto);
  return boton;
}

function pintar() {
  rachaNumero.textContent = calcularRacha();
  mejorRachaNumero.textContent = calcularMejorRacha();
  minutosMesNumero.textContent = minutesInMonth(sesiones, hoy()).toLocaleString("es-ES");
  diasMesNumero.textContent = diasEstudiadosEsteMes();

  // Goal of the month (RF-1…RF-3): the fifth card only with a goal, the top
  // band only without one (or while editing it). The card lives inside the
  // tarjetero's single aria-live region.
  const meta = currentGoal();
  tarjetaObjetivo.hidden = meta === null;
  if (meta !== null) {
    metaMinutos.textContent = meta.toLocaleString("es-ES");
  }
  objetivoMesTexto.textContent = monthName();
  seccionObjetivo.hidden = meta !== null && !editandoObjetivo;

  listaSesiones.innerHTML = "";
  const ordenadas = sesionesOrdenadas();
  listaVacia.hidden = ordenadas.length > 0;

  // Folded by default: only the last two rows until the user unfolds
  // (RF-6, CA6.2).
  const visibles = listaDesplegada ? ordenadas : ordenadas.slice(0, 2);
  visibles.forEach(function (sesion) {
    const li = document.createElement("li");
    li.className = "sesion";

    const info = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "sesion__tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("p");
    fecha.className = "sesion__fecha";
    const fechaTexto = etiquetaFecha(sesion.fecha, hoy());
    fecha.textContent = fechaTexto;

    info.appendChild(tema);
    info.appendChild(fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion__minutos";
    minutos.textContent = sesion.minutos + " min";

    // data-i is the position in `sesiones`, found by object reference, so two
    // sessions with identical values still get their own buttons (CA1.1).
    const indice = sesiones.indexOf(sesion);
    const acciones = document.createElement("div");
    acciones.className = "sesion__acciones";
    acciones.appendChild(crearBotonSesion("editar", "Editar", indice, sesion, fechaTexto));
    acciones.appendChild(crearBotonSesion("borrar", "Borrar", indice, sesion, fechaTexto));

    li.appendChild(info);
    li.appendChild(minutos);
    li.appendChild(acciones);
    listaSesiones.appendChild(li);
  });

  // With two sessions or fewer there is nothing to unfold (CL-10).
  botonMasSesiones.hidden = ordenadas.length <= 2;
  botonMasSesiones.textContent = listaDesplegada ? "Mostrar menos" : "Cargar más sesiones";
  botonMasSesiones.setAttribute("aria-expanded", String(listaDesplegada));

  renderHeatmap();
}

// =========================================================
// 5. Guardar, editar y borrar sesiones
// =========================================================

// The list is rebuilt on every paint, so one delegated listener takes care
// of the "Editar" and "Borrar" buttons of every row (plan, decision 5).
listaSesiones.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const indice = Number(boton.dataset.i);
  if (boton.dataset.accion === "editar") {
    empezarEdicion(indice);
  } else {
    borrarSesion(indice);
  }
});

// The only writer of `listaDesplegada` (CA6.2, CA6.4): one toggle and a
// repaint. The button itself is hidden with two sessions or fewer (CL-10).
botonMasSesiones.addEventListener("click", function () {
  listaDesplegada = !listaDesplegada;
  pintar();
});

// Fills the form with the chosen session and switches it to edit mode (RF-1).
function empezarEdicion(indice) {
  const sesion = sesiones[indice];
  if (!sesion) return;
  editandoIndice = indice;
  campoFecha.value = sesion.fecha;
  campoTema.value = sesion.tema;
  campoMinutos.value = sesion.minutos;
  tituloFormulario.textContent = "Editar sesión";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  ocultarAviso();
  // Keyboard users land on the first field of the change (RNF-3).
  campoFecha.focus();
}

// Back to "Nueva sesión" without touching any data (CL-5).
function salirDeModoEdicion() {
  editandoIndice = null;
  formulario.reset();
  campoFecha.value = hoy();
  tituloFormulario.textContent = "Nueva sesión";
  botonGuardar.textContent = "Guardar sesión";
  botonCancelar.hidden = true;
  ocultarAviso();
}

function ocultarAviso() {
  avisoEdicion.textContent = "";
  avisoEdicion.hidden = true;
}

// Asks first, then removes the session from the list (RF-2, CA2.1, CL-5).
function borrarSesion(indice) {
  if (!sesiones[indice]) return;
  if (!window.confirm("¿Borrar esta sesión?")) return;
  if (editandoIndice === indice) {
    salirDeModoEdicion(); // We were editing the session we just deleted.
  } else if (indice < editandoIndice) {
    editandoIndice -= 1; // The list shifted: keep pointing at the same session.
  }
  sesiones = removeSessionAt(sesiones, indice);
  guardarSesiones();
  pintar();
}

// "Cancelar" only leaves the edit mode: no data is modified (CA2.2, CL-5).
botonCancelar.addEventListener("click", function () {
  // Move the focus first, so it does not fall to the body when we hide it.
  botonGuardar.focus();
  salirDeModoEdicion();
});

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Goal crossing (RF-5): the month total before this save, so both
  // branches below can tell a first crossing from a save made while the
  // goal was already reached (that one never celebrates).
  const minutosAntes = minutesInMonth(sesiones, hoy());

  // Edit mode: validate, replace and leave the mode (RF-1, CA1.1-CA1.3).
  if (editandoIndice !== null) {
    const error = validateSession(fecha, tema, minutos);
    if (error) {
      // Nothing is saved and the session stays exactly as it was (CL-4).
      avisoEdicion.textContent = error;
      avisoEdicion.hidden = false;
      return;
    }
    sesiones = replaceSession(sesiones, editandoIndice, {
      fecha: fecha,
      tema: tema,
      minutos: minutos,
    });
    salirDeModoEdicion();
    guardarSesiones();
    // Cards, statistics and map all repaint without reloading (RF-3).
    pintar();
    checkCrossing(minutosAntes);
    return;
  }

  // Comprobación extra, por si el navegador no valida el formulario.
  if (!fecha || tema === "" || !(minutos > 0)) return;

  sesiones.push({
    fecha: fecha,
    tema: tema,
    minutos: minutos,
    creadaEn: Date.now(),
  });

  guardarSesiones();

  // Limpiamos el formulario para la próxima sesión.
  formulario.reset();
  campoFecha.value = hoy();

  pintar();
  checkCrossing(minutosAntes);
});

// =========================================================
// 6. Guardar y editar la meta (Spec 004)
// =========================================================

// Persists the goal for its month and refreshes everything (RF-1, RF-2).
// The form carries novalidate: validateGoal() is the single validator, so
// every invalid value (0, negatives, decimals, letters) shows the same
// Spanish message instead of the browser's own bubble.
function saveGoal(minutos) {
  const meta = { mes: hoy().slice(0, 7), minutos: minutos };
  objetivoGuardado = meta;
  editandoObjetivo = false;
  try {
    localStorage.setItem(CLAVE_OBJETIVO, JSON.stringify(meta));
  } catch (error) {
    // Without localStorage the page still works: the goal would live
    // only for this session (same defence as guardarSesiones).
  }
  pintar();
}

formularioObjetivo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const valor = Number(campoObjetivo.value);
  const error = validateGoal(valor);
  if (error !== null) {
    avisoObjetivo.textContent = error;
    avisoObjetivo.hidden = false;
    return;
  }
  avisoObjetivo.textContent = "";
  avisoObjetivo.hidden = true;
  saveGoal(valor);
  // Clear the field so the next month does not open prefilled with a
  // goal that is no longer valid (RF-2: every month asks again).
  campoObjetivo.value = "";
});

botonCambiarObjetivo.addEventListener("click", function () {
  editandoObjetivo = true;
  const meta = currentGoal();
  campoObjetivo.value = meta === null ? "" : String(meta);
  avisoObjetivo.textContent = "";
  avisoObjetivo.hidden = true;
  pintar();
  campoObjetivo.focus();
});

// --- Celebration (Spec 004, RF-5, RF-6) ---

// Where focus was before the dialog opened, so closing it can give it back.
let previousFocus = null;

function openCelebration(minutosTotales) {
  felicitacionTexto.textContent =
    `Has estudiado ${minutosTotales.toLocaleString("es-ES")} minutos en ${monthName()}. ¡Sigue así!`;
  previousFocus = document.activeElement;
  felicitacion.hidden = false;
  botonCerrarFelicitacion.focus();
}

function closeCelebration() {
  felicitacion.hidden = true;
  if (previousFocus !== null && document.contains(previousFocus)) {
    previousFocus.focus();
  }
  previousFocus = null;
}

botonCerrarFelicitacion.addEventListener("click", closeCelebration);

felicitacion.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") {
    closeCelebration();
  }
});

// Opens the celebration only when THIS save moves the month total from
// below the goal to at or above it (RF-5). Loading the page with an
// already beaten goal never celebrates, because nothing here runs on load.
function checkCrossing(minutosAntes) {
  const meta = currentGoal();
  if (meta === null) return;
  const minutosDespues = minutesInMonth(sesiones, hoy());
  if (crossesGoal(minutosAntes, minutosDespues, meta)) {
    openCelebration(minutosDespues);
  }
}

// =========================================================
// 7. Tema claro u oscuro
// =========================================================

// Clave aparte para la elección de tema: no se mezcla con las sesiones.
const CLAVE_TEMA = "diario-estudio-tema";

// Aplica el tema en la página y deja en el botón qué hará al pulsarlo.
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  botonTema.setAttribute(
    "aria-label",
    tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
  );
}

// Si ya se eligió tema, vale el suyo; si no, seguimos el del sistema.
let temaInicial = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "oscuro"
  : "claro";
const temaGuardado = localStorage.getItem(CLAVE_TEMA);
if (temaGuardado === "claro" || temaGuardado === "oscuro") {
  temaInicial = temaGuardado;
}
aplicarTema(temaInicial);

// Al pulsar cambiamos al otro tema y lo guardamos para la próxima visita.
botonTema.addEventListener("click", function () {
  const actual = document.documentElement.getAttribute("data-tema");
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, nuevo);
  aplicarTema(nuevo);
});

// =========================================================
// 8. Heat map (last 12 weeks)
// =========================================================

// The cells from the last paint, indexed by date. In memory only:
// localStorage must never store derived data (RNF-3).
let cellsByDate = {};

// Paints the grid: a decorative header (corner + weekday letters) and one
// row per week — its Monday date, then its 7 cells (RF-4, CA4.1, CA4.4).
// Letters and dates are aria-hidden: only the cells carry labels (CA4.1).
// Called from pintar(), which already runs on load and after every saved
// session (RF-6, CL-10).
function renderHeatmap() {
  const todayText = hoy();
  const cells = buildHeatmap(sesiones, todayText);

  cellsByDate = {};
  cells.forEach(function (cell) {
    cellsByDate[cell.date] = cell;
  });

  heatmapGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  const corner = document.createElement("span");
  corner.className = "mapa__esquina";
  corner.setAttribute("aria-hidden", "true");
  fragment.appendChild(corner);

  ["L", "M", "X", "J", "V", "S", "D"].forEach(function (letter) {
    const day = document.createElement("span");
    day.className = "mapa__dia";
    day.setAttribute("aria-hidden", "true");
    day.textContent = letter;
    fragment.appendChild(day);
  });

  for (let row = 0; row < cells.length / 7; row++) {
    const firstOfRow = cells[row * 7];
    const label = document.createElement("span");
    label.className = "mapa__etiqueta";
    label.setAttribute("aria-hidden", "true");
    label.textContent = etiquetaFecha(firstOfRow.date, todayText);
    fragment.appendChild(label);

    for (let column = 0; column < 7; column++) {
      const cell = cells[row * 7 + column];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mapa__celda mapa__celda--nivel-" + cell.level;
      button.dataset.fecha = cell.date;
      button.setAttribute("aria-label", describeCell(cell, todayText));
      fragment.appendChild(button);
    }
  }
  heatmapGrid.appendChild(fragment);
}

// The detail reads cellsByDate; empty cells never show a detail (CA5.3).
function showHeatmapDetail(target) {
  const cell = target instanceof Element ? cellsByDate[target.dataset.fecha] : null;
  if (!cell || cell.level === 0) {
    hideHeatmapDetail();
    return;
  }
  heatmapDetail.textContent = describeCell(cell, hoy());
}

function hideHeatmapDetail() {
  heatmapDetail.textContent = "";
}

// One listener per event, delegated on the grid: the cells are recreated
// on every paint, so per-cell listeners would not survive (plan, decision 5).
// mouseover and not mouseenter: only the first one bubbles.
heatmapGrid.addEventListener("mouseover", function (evento) {
  showHeatmapDetail(evento.target);
});

heatmapGrid.addEventListener("focusin", function (evento) {
  showHeatmapDetail(evento.target);
});

// A click is also the mobile tap: no touch events needed (CA5.1, CA5.2).
heatmapGrid.addEventListener("click", function (evento) {
  showHeatmapDetail(evento.target);
});

heatmapGrid.addEventListener("focusout", hideHeatmapDetail);
heatmapGrid.addEventListener("mouseleave", hideHeatmapDetail);

// Tapping or clicking outside any cell closes the detail (CA5.2).
document.addEventListener("click", function (evento) {
  if (!(evento.target instanceof Element) || !evento.target.closest(".mapa__celda")) {
    hideHeatmapDetail();
  }
});

// =========================================================
// 9. Arranque
// =========================================================

campoFecha.value = hoy();
pintar();
