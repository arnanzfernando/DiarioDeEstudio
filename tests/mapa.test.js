// Heat map logic tests. Run from the project root with: node --test
const test = require("node:test");
const assert = require("node:assert");

const {
  etiquetaFecha,
  lunesDeLaSemana,
  addDays,
  levelFromMinutes,
  sanitizeSessions,
  buildHeatmap,
  describeCell,
} = require("../logica.js");

// Fixed "today" for every test: 2026-10-03 is a Saturday.
// The logic always receives "today" as a parameter (Constitution, principle 3).
const HOY = "2026-10-03";

function cellAt(cells, date) {
  const cell = cells.find((c) => c.date === date);
  assert.ok(cell, "the grid must contain " + date);
  return cell;
}

test("levelFromMinutes keeps the exact boundaries (CL-2)", () => {
  assert.strictEqual(levelFromMinutes(0), 0);
  assert.strictEqual(levelFromMinutes(1), 1);
  assert.strictEqual(levelFromMinutes(30), 1);
  assert.strictEqual(levelFromMinutes(31), 2);
  assert.strictEqual(levelFromMinutes(60), 2);
  assert.strictEqual(levelFromMinutes(61), 3);
  assert.strictEqual(levelFromMinutes(120), 3);
  assert.strictEqual(levelFromMinutes(121), 4);
  assert.strictEqual(levelFromMinutes(500), 4); // CL-11: a huge sum stays at 4
});

test("levelFromMinutes accepts decimals and rejects junk (CA3.5)", () => {
  assert.strictEqual(levelFromMinutes(0.5), 1);
  assert.strictEqual(levelFromMinutes(30.5), 2);
  assert.strictEqual(levelFromMinutes(120.5), 4);
  assert.strictEqual(levelFromMinutes(-5), 0);
  assert.strictEqual(levelFromMinutes(NaN), 0);
});

test("addDays and lunesDeLaSemana work with local calendar days", () => {
  assert.strictEqual(addDays("2026-09-28", -77), "2026-07-13");
  assert.strictEqual(addDays("2026-10-03", 1), "2026-10-04");
  assert.strictEqual(lunesDeLaSemana("2026-10-03"), "2026-09-28");
});

test("the grid always has 84 cells, Monday to Sunday (RF-1, CA1.1, CL-1)", () => {
  const cells = buildHeatmap([], HOY);
  assert.strictEqual(cells.length, 84);
  assert.strictEqual(cells[0].date, "2026-07-13"); // 11 weeks back (CL-9)
  assert.strictEqual(cells[6].date, "2026-07-19"); // first column ends on Sunday
  assert.strictEqual(cells[83].date, "2026-10-04"); // last cell = Sunday of this week
  for (let week = 0; week < 12; week++) {
    const monday = cells[week * 7].date;
    assert.strictEqual(lunesDeLaSemana(monday), monday, "every column starts on a Monday");
  }
  assert.ok(
    cells.every((cell) => cell.level === 0 && cell.minutes === 0),
    "no sessions = 84 empty cells (CL-1)"
  );
});

test("future cells are flagged and stay empty (CA1.3, CA2.2, CL-12)", () => {
  const cells = buildHeatmap([{ fecha: "2026-10-04", minutos: 50 }], HOY);
  const future = cells.filter((cell) => cell.future);
  assert.deepStrictEqual(
    future.map((cell) => cell.date),
    ["2026-10-04"],
    "only Sunday 4 is after the fixed today"
  );
  assert.strictEqual(future[0].minutes, 0);
  assert.strictEqual(future[0].level, 0, "a future session never paints (CL-5)");
});

test("a Monday 'today' moves the whole window (CL-10)", () => {
  const cells = buildHeatmap([], "2026-10-05");
  assert.strictEqual(cells[0].date, "2026-07-20");
  assert.strictEqual(cells[83].date, "2026-10-11");
});

test("sessions out of the window never appear (CL-9)", () => {
  const cells = buildHeatmap([{ fecha: "2026-07-06", minutos: 30 }], HOY);
  assert.ok(cells.every((cell) => cell.date !== "2026-07-06"));
  assert.ok(cells.every((cell) => cell.level === 0));
});

test("minutes of the same day are added, not compared (CL-3)", () => {
  const cells = buildHeatmap(
    [
      { fecha: "2026-10-01", minutos: 20 },
      { fecha: "2026-10-01", minutos: 40 },
    ],
    HOY
  );
  const cell = cellAt(cells, "2026-10-01");
  assert.strictEqual(cell.minutes, 60);
  assert.strictEqual(cell.level, 2);
});

test("only valid minutes count (CL-4, CL-7)", () => {
  const cells = buildHeatmap(
    [
      { fecha: "2026-10-01", minutos: 20 },
      { fecha: "2026-10-01", minutos: "abc" },
      { fecha: "2026-10-01", minutos: 0 },
      { fecha: "2026-10-01", minutos: -10 },
    ],
    HOY
  );
  const cell = cellAt(cells, "2026-10-01");
  assert.strictEqual(cell.minutes, 20, "CL-4: only the valid session adds up");
  assert.strictEqual(cell.level, 1);

  const textMinutes = cellAt(
    buildHeatmap([{ fecha: "2026-10-01", minutos: "45" }], HOY),
    "2026-10-01"
  );
  assert.strictEqual(textMinutes.minutes, 45, "CL-7: a text '45' counts, like the week card");
  assert.strictEqual(textMinutes.level, 2);
});

test("a day with only invalid minutes stays empty (CL-13)", () => {
  const cells = buildHeatmap(
    [
      { fecha: "2026-10-01", minutos: 0 },
      { fecha: "2026-10-01", minutos: "abc" },
    ],
    HOY
  );
  const cell = cellAt(cells, "2026-10-01");
  assert.strictEqual(cell.minutes, 0);
  assert.strictEqual(cell.level, 0);
});

test("nonexistent dates are ignored without throwing (CL-6)", () => {
  const cells = buildHeatmap([{ fecha: "2026-02-30", minutos: 50 }], HOY);
  assert.strictEqual(cells.length, 84);
  assert.ok(cells.every((cell) => cell.level === 0));
});

test("corrupt entries do not break the map (CL-8)", () => {
  const cells = buildHeatmap([null, 42, "x", { fecha: "2026-10-01", minutos: 10 }], HOY);
  assert.strictEqual(cells.length, 84);
  assert.strictEqual(cellAt(cells, "2026-10-01").minutes, 10);
  assert.strictEqual(buildHeatmap(null, HOY).length, 84, "even a broken list returns 84 cells");
});

test("sanitizeSessions drops non-objects only (CL-8, principle 5)", () => {
  assert.deepStrictEqual(sanitizeSessions([null, 42, "x", { fecha: "2026-10-01" }]), [
    { fecha: "2026-10-01" },
  ]);
  assert.deepStrictEqual(sanitizeSessions("nope"), []);
  assert.deepStrictEqual(sanitizeSessions(undefined), []);
  assert.deepStrictEqual(sanitizeSessions([]), []);
});

test("describeCell follows RF-5 and RNF-5", () => {
  assert.strictEqual(
    describeCell({ date: "2026-10-03", minutes: 45, level: 2, future: false }, HOY),
    "Hoy · 45 min"
  );
  assert.strictEqual(
    describeCell({ date: "2026-10-02", minutes: 45, level: 2, future: false }, HOY),
    "Ayer · 45 min"
  );
  assert.match(
    describeCell({ date: "2026-10-01", minutes: 0, level: 0, future: false }, HOY),
    /^1 oct\.? 2026 · sin sesiones$/,
    "past empty cell (RNF-5)"
  );
  assert.match(
    describeCell({ date: "2026-10-04", minutes: 0, level: 0, future: true }, HOY),
    /^4 oct\.? 2026 · día futuro$/,
    "future empty cell (CL-12, RNF-5)"
  );
});

test("etiquetaFecha receives 'today' instead of reading the clock", () => {
  assert.strictEqual(etiquetaFecha("2026-10-03", HOY), "Hoy");
  assert.strictEqual(etiquetaFecha("2026-10-02", HOY), "Ayer");
  assert.notStrictEqual(etiquetaFecha("2026-10-05", HOY), "Hoy");
});

test("the calculation is pure: same input, same output (principle 3)", () => {
  const sessions = [{ fecha: "2026-10-01", minutos: 30 }];
  assert.deepStrictEqual(buildHeatmap(sessions, HOY), buildHeatmap(sessions, HOY));
});
