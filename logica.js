// =========================================================
// Diario de Estudio — logica.js
// Pure logic: date helpers and the heat map calculation.
// No DOM and no localStorage: anything that needs "today"
// receives it as a parameter (Constitution, principle 3).
// The page loads this file before app.js; the block at the
// end exports the functions only when Node runs the tests.
// =========================================================

// --- Date helpers (moved from app.js; bodies unchanged) ---

// Convierte un Date en texto "aaaa-mm-dd" usando la hora local del usuario.
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Convierte un texto "aaaa-mm-dd" en un Date de ese día (a medianoche hora local:
// solo se construye a partir del año, el mes y el día, así que no arrastra horas).
function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// Devuelve el texto de un día que está "cantidad" días antes del dado.
function diasAntes(texto, cantidad) {
  const fecha = textoAFecha(texto);
  fecha.setDate(fecha.getDate() - cantidad);
  return fechaATexto(fecha);
}

// Etiqueta legible: "Hoy", "Ayer" o "30 sept 2026".
// It receives "today" as a parameter instead of reading the clock
// (Constitution, principle 3).
function etiquetaFecha(texto, hoyTexto) {
  if (!esFechaValida(texto)) return "Fecha no válida";
  if (texto === hoyTexto) return "Hoy";
  if (texto === diasAntes(hoyTexto, 1)) return "Ayer";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(textoAFecha(texto));
}

// Comprueba que el texto sea una fecha de verdad con pinta de "aaaa-mm-dd".
// Si no lo es, la ignoramos: el formulario nunca puede crear una así.
function esFechaValida(texto) {
  if (typeof texto !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  // Si al convertirla y volver a texto no coincide, ese día no existe (2026-02-30).
  return fechaATexto(textoAFecha(texto)) === texto;
}

// Devuelve el texto del lunes de la semana en la que cae la fecha dada.
// La semana empieza el lunes y termina el domingo.
function lunesDeLaSemana(texto) {
  const fecha = textoAFecha(texto);
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado.
  const diasDesdeElLunes = (dia + 6) % 7;
  fecha.setDate(fecha.getDate() - diasDesdeElLunes);
  return fechaATexto(fecha);
}

// --- Heat map (new code) ---

// Adds days to an "aaaa-mm-dd" text with local calendar arithmetic
// (a negative amount goes back). Never milliseconds: 24h is not always
// one day across the daylight-saving-time changes.
function addDays(dateText, days) {
  const fecha = textoAFecha(dateText);
  fecha.setDate(fecha.getDate() + days);
  return fechaATexto(fecha);
}

// Fixed scale of levels (CA3.1-CA3.5): 0 = empty cell.
function levelFromMinutes(minutes) {
  if (!(minutes > 0)) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
}

// Keeps only real session objects: corrupt entries (null, numbers...)
// would crash the rest of the app (CL-8). Every object is kept,
// so no session is ever dropped (Constitution, principle 5).
function sanitizeSessions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(function (item) {
    return item !== null && typeof item === "object";
  });
}

// The heat map itself: the last 12 weeks (12 columns, Monday to Sunday),
// always 84 cells in column order. Pure function: "today" is a parameter
// and nothing is written anywhere (RNF-2, RNF-3).
function buildHeatmap(sessions, today) {
  // Pass 1: valid minutes grouped per day, one single walk (RNF-8).
  const totales = {};
  const list = Array.isArray(sessions) ? sessions : [];
  list.forEach(function (session) {
    if (session === null || typeof session !== "object") return; // CL-8
    if (!esFechaValida(session.fecha)) return; // CL-6: 2026-02-30 does not exist
    if (session.fecha > today) return; // CL-5, CA2.2: future days never paint
    const minutes = Number(session.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) return; // CL-7
    totales[session.fecha] = (totales[session.fecha] || 0) + minutes; // CL-3
  });

  // Pass 2: the 84 cells, from the oldest week to the current one.
  const monday = lunesDeLaSemana(today);
  const firstMonday = addDays(monday, -77); // 11 weeks back (CL-9)
  const cells = [];
  for (let week = 0; week <= 11; week++) {
    const weekMonday = addDays(firstMonday, 7 * week);
    for (let row = 0; row <= 6; row++) { // Monday to Sunday
      const date = addDays(weekMonday, row);
      const minutes = totales[date] || 0; // CL-1 and CL-13: no valid data = empty
      cells.push({
        date: date,
        minutes: minutes,
        level: levelFromMinutes(minutes),
        future: date > today, // CA1.3, CL-12
      });
    }
  }
  return cells; // always 84 (CA1.1)
}

// Text for one cell: the same string for the aria-label and for the
// visible detail (RF-5, RNF-5): "Hoy · 45 min", "1 oct 2026 · sin sesiones",
// "4 oct 2026 · día futuro".
function describeCell(cell, today) {
  const label = etiquetaFecha(cell.date, today);
  if (cell.future) return label + " · día futuro";
  if (cell.level === 0) return label + " · sin sesiones";
  return label + " · " + cell.minutes + " min";
}

// --- Edit and delete sessions (Spec 002) ---

// Validates the three fields the edit form changes. Returns null when they
// are fine, or a Spanish message for the interface to show (RF-1, CL-4,
// CA1.2): the messages are interface text, so they are written in Spanish.
function validateSession(fecha, tema, minutos) {
  if (!esFechaValida(fecha)) return "La fecha no es válida.";
  if (typeof tema !== "string" || tema.trim() === "") return "El tema no puede estar vacío.";
  const minutosNumero = Number(minutos);
  if (!Number.isFinite(minutosNumero) || minutosNumero <= 0) {
    return "Los minutos deben ser un número mayor que 0.";
  }
  return null;
}

// Returns a copy of the list with the session at that index replaced by the
// edited fields. The original creadaEn is kept (CA1.1): editing must never
// reorder the sessions of the same day (CL-8). Out of range: the list
// untouched, and the input list is never modified (principle 3).
function replaceSession(sessions, index, campos) {
  if (!Number.isInteger(index) || index < 0 || index >= sessions.length) return sessions;
  const copia = sessions.slice();
  copia[index] = {
    fecha: campos.fecha,
    tema: campos.tema.trim(),
    minutos: Number(campos.minutos),
    creadaEn: sessions[index].creadaEn,
  };
  return copia;
}

// Returns a copy of the list without the session at that index (RF-2).
// The other entries — including any weird leftover — keep their own identity
// (CL-6), the input list is never modified, and removing the last session
// simply leaves an empty list (CL-7).
function removeSessionAt(sessions, index) {
  if (!Number.isInteger(index) || index < 0 || index >= sessions.length) return sessions;
  return sessions.filter(function (_session, posicion) {
    return posicion !== index;
  });
}

// --- Monthly goal (Spec 004) ---

// Total minutes studied in the month of "today" (same "yyyy-mm" prefix rule
// as the days-of-the-month card): other months, future dates, corrupt dates
// and minutes that are not a positive number never count (RF-4, RNF-2).
// Every session of the same day adds up (HF/CAs of the spec).
function minutesInMonth(sessions, today) {
  const month = today.slice(0, 7);
  const list = Array.isArray(sessions) ? sessions : [];
  let total = 0;
  list.forEach(function (session) {
    if (session === null || typeof session !== "object") return;
    if (!esFechaValida(session.fecha)) return;
    if (session.fecha.slice(0, 7) !== month) return;
    if (session.fecha > today) return; // Future: not studied yet.
    const minutes = Number(session.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    total += minutes;
  });
  return total;
}

// True only when a save moves the month total from below the goal to at or
// above it (RF-5). A save made while the goal was already reached is not a
// crossing and never celebrates again.
function crossesGoal(before, after, goal) {
  return before < goal && after >= goal;
}

// The stored goal is one { mes, minutos } object and only counts for its own
// month: a new month asks again (RF-2). Anything unexpected returns null
// instead of crashing the page (defensive, like sanitizeSessions).
function activeGoalForMonth(goal, today) {
  if (goal === null || typeof goal !== "object") return null;
  if (goal.mes !== today.slice(0, 7)) return null;
  if (!Number.isInteger(goal.minutos) || goal.minutos < 1) return null;
  return goal.minutos;
}

// Validates the goal field. Returns null when it is fine, or a Spanish
// message for the interface to show (RF-1): interface text is written in
// Spanish, same contract as validateSession.
function validateGoal(value) {
  if (!Number.isInteger(value) || value < 1) {
    return "El objetivo debe ser un número entero mayor que 0.";
  }
  return null;
}

// Export for the Node tests; this block is skipped in the browser.
if (typeof module === "object" && module.exports) {
  module.exports = {
    fechaATexto,
    textoAFecha,
    diasAntes,
    etiquetaFecha,
    esFechaValida,
    lunesDeLaSemana,
    addDays,
    levelFromMinutes,
    sanitizeSessions,
    buildHeatmap,
    describeCell,
    validateSession,
    replaceSession,
    removeSessionAt,
    minutesInMonth,
    crossesGoal,
    activeGoalForMonth,
    validateGoal,
  };
}
