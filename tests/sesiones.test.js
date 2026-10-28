// Edit and delete session tests (Spec 002). Run from the project root with: node --test
const test = require("node:test");
const assert = require("node:assert");

const { validateSession, replaceSession, removeSessionAt } = require("../logica.js");

// --- validateSession (RF-1, CL-4, CA1.2) ---

test("validateSession accepts the values the creation form accepts (RF-1)", () => {
  assert.strictEqual(validateSession("2026-10-01", "Álgebra", 45), null);
  assert.strictEqual(
    validateSession("2026-10-01", "Repaso de historia", "45"),
    null,
    "a text '45' counts, like everywhere else in the app"
  );
});

test("validateSession rejects broken dates with a Spanish message (CL-4)", () => {
  for (const fecha of ["2026-02-30", "", "hola", undefined]) {
    const error = validateSession(fecha, "Tema", 45);
    assert.strictEqual(typeof error, "string", "must return a message, never throw");
    assert.match(error, /fecha/i);
  }
});

test("validateSession rejects empty or blank topics (CL-4)", () => {
  for (const tema of ["", "   "]) {
    const error = validateSession("2026-10-01", tema, 45);
    assert.strictEqual(typeof error, "string");
    assert.match(error, /tema/i);
  }
});

test("validateSession rejects invalid minutes (CL-4)", () => {
  for (const minutos of [0, -5, "", "abc", NaN]) {
    const error = validateSession("2026-10-01", "Tema", minutos);
    assert.strictEqual(typeof error, "string");
    assert.match(error, /minutos/i);
  }
});

// --- replaceSession (RF-1, CA1.1, CL-6, CL-8) ---

test("replaceSession updates the three fields and trims the topic (RF-1)", () => {
  const lista = [
    { fecha: "2026-10-01", tema: "Álgebra", minutos: 45, creadaEn: 1000 },
    { fecha: "2026-10-02", tema: "Historia", minutos: 30, creadaEn: 2000 },
  ];
  const resultado = replaceSession(lista, 0, {
    fecha: "2026-10-03",
    tema: "  Física  ",
    minutos: "60",
  });
  assert.strictEqual(resultado.length, 2);
  assert.deepStrictEqual(resultado[0], {
    fecha: "2026-10-03",
    tema: "Física",
    minutos: 60, // Number(...): the stored format keeps a number
    creadaEn: 1000,
  });
  assert.deepStrictEqual(resultado[1], lista[1], "the other session stays exactly the same (CL-6)");
});

test("replaceSession keeps the original creadaEn (CA1.1, CL-8)", () => {
  const original = { fecha: "2026-10-01", tema: "Tema", minutos: 45, creadaEn: 1791000000000 };
  const resultado = replaceSession([original], 0, {
    fecha: "2026-10-05",
    tema: "Nuevo tema",
    minutos: 10,
  });
  assert.strictEqual(resultado[0].creadaEn, 1791000000000, "editing never reorders the day");
  assert.strictEqual(resultado[0].fecha, "2026-10-05");
});

test("replaceSession with an out-of-range index returns the list unchanged", () => {
  const lista = [{ fecha: "2026-10-01", tema: "T", minutos: 45, creadaEn: 1 }];
  const campos = { fecha: "2026-10-02", tema: "X", minutos: 10 };
  assert.deepStrictEqual(replaceSession(lista, -1, campos), lista);
  assert.deepStrictEqual(replaceSession(lista, 99, campos), lista);
});

test("replaceSession never mutates the input list (principle 3)", () => {
  const lista = [{ fecha: "2026-10-01", tema: "T", minutos: 45, creadaEn: 1 }];
  const antes = JSON.parse(JSON.stringify(lista));
  replaceSession(lista, 0, { fecha: "2026-10-02", tema: "X", minutos: 10 });
  assert.deepStrictEqual(lista, antes, "the original array must be exactly as before");
});

// --- removeSessionAt (RF-2, CL-1, CL-6, CL-7) ---

test("removeSessionAt removes only the chosen session (RF-2)", () => {
  const lista = [
    { fecha: "2026-10-01", tema: "A", minutos: 10, creadaEn: 1 },
    { fecha: "2026-10-01", tema: "B", minutos: 20, creadaEn: 2 },
    { fecha: "2026-10-02", tema: "C", minutos: 30, creadaEn: 3 },
  ];
  const resultado = removeSessionAt(lista, 1);
  assert.deepStrictEqual(
    resultado.map((s) => s.tema),
    ["A", "C"]
  );
  assert.strictEqual(lista.length, 3, "the input list is untouched (principle 3)");
});

test("removeSessionAt on the only session leaves an empty list (CL-7, CL-1)", () => {
  const unica = [{ fecha: "2026-10-01", tema: "Única", minutos: 45, creadaEn: 1 }];
  assert.deepStrictEqual(removeSessionAt(unica, 0), []);
  assert.strictEqual(unica.length, 1, "and the input survives too");
});

test("removeSessionAt with an out-of-range index returns the list unchanged", () => {
  const lista = [{ fecha: "2026-10-01", tema: "T", minutos: 45, creadaEn: 1 }];
  assert.deepStrictEqual(removeSessionAt(lista, -1), lista);
  assert.deepStrictEqual(removeSessionAt(lista, 99), lista);
});

test("removeSessionAt keeps corrupt leftovers exactly as they are (CL-6)", () => {
  const corrupta = { fecha: "no-es-fecha", minutos: "abc" };
  const lista = [corrupta, { fecha: "2026-10-01", tema: "OK", minutos: 45, creadaEn: 1 }];
  const resultado = removeSessionAt(lista, 1);
  assert.strictEqual(resultado.length, 1);
  assert.strictEqual(resultado[0], corrupta, "the weird entry keeps its own identity");
});

// --- Purity of the three helpers (principle 3) ---

test("the three helpers are pure: same input, same output (principle 3)", () => {
  const lista = [{ fecha: "2026-10-01", tema: "T", minutos: 45, creadaEn: 7 }];
  const campos = { fecha: "2026-10-02", tema: "X", minutos: 10 };
  assert.deepStrictEqual(replaceSession(lista, 0, campos), replaceSession(lista, 0, campos));
  assert.deepStrictEqual(removeSessionAt(lista, 0), removeSessionAt(lista, 0));
  assert.deepStrictEqual(lista, [{ fecha: "2026-10-01", tema: "T", minutos: 45, creadaEn: 7 }]);
});
