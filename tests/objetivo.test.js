const test = require("node:test");
const assert = require("node:assert");

const {
  minutesInMonth,
  crossesGoal,
  activeGoalForMonth,
  validateGoal,
} = require("../logica.js");

// Spec 004 — monthly goal helpers. "today" is always injected (RNF-1) and
// every test fixes its own date so nothing depends on the clock.

function session(fecha, minutos) {
  return { fecha: fecha, tema: "Prueba", minutos: minutos, creadaEn: 0 };
}

test("minutesInMonth sums the sessions of the current month", () => {
  const sessions = [session("2026-10-01", 45), session("2026-10-05", 30)];
  assert.strictEqual(minutesInMonth(sessions, "2026-10-05"), 75);
});

test("minutesInMonth ignores sessions of other months", () => {
  assert.strictEqual(minutesInMonth([session("2026-09-30", 100)], "2026-10-05"), 0);
});

test("minutesInMonth ignores future sessions", () => {
  assert.strictEqual(minutesInMonth([session("2026-10-31", 50)], "2026-10-05"), 0);
});

test("minutesInMonth ignores invalid minutes", () => {
  const sessions = [
    session("2026-10-05", 0),
    session("2026-10-05", -20),
    session("2026-10-04", "abc"),
    session("2026-10-04", null),
  ];
  assert.strictEqual(minutesInMonth(sessions, "2026-10-05"), 0);
});

test("minutesInMonth ignores corrupt dates but keeps the valid ones", () => {
  const sessions = [
    session("2026-02-30", 60),
    session(null, 10),
    session("no-fecha", 10),
    session("2026-10-05", 5),
  ];
  assert.strictEqual(minutesInMonth(sessions, "2026-10-05"), 5);
});

test("minutesInMonth adds every session of the same day", () => {
  const sessions = [session("2026-10-05", 45), session("2026-10-05", 15)];
  assert.strictEqual(minutesInMonth(sessions, "2026-10-05"), 60);
});

test("minutesInMonth returns 0 for non-array input", () => {
  assert.strictEqual(minutesInMonth(null, "2026-10-05"), 0);
  assert.strictEqual(minutesInMonth("junk", "2026-10-05"), 0);
});

test("crossesGoal is true when the save reaches the goal", () => {
  assert.strictEqual(crossesGoal(999, 1000, 1000), true);
});

test("crossesGoal is false when the goal was already reached", () => {
  assert.strictEqual(crossesGoal(1000, 1050, 1000), false);
  assert.strictEqual(crossesGoal(1500, 1400, 1000), false);
});

test("crossesGoal is false while still below the goal", () => {
  assert.strictEqual(crossesGoal(0, 999, 1000), false);
});

test("crossesGoal is false when the save does not reach the goal", () => {
  assert.strictEqual(crossesGoal(999, 999, 1000), false);
  assert.strictEqual(crossesGoal(999, 500, 1000), false);
});

test("activeGoalForMonth returns the goal of the current month", () => {
  assert.strictEqual(
    activeGoalForMonth({ mes: "2026-10", minutos: 1000 }, "2026-10-05"),
    1000
  );
});

test("activeGoalForMonth returns null for another month", () => {
  assert.strictEqual(
    activeGoalForMonth({ mes: "2026-09", minutos: 1000 }, "2026-10-05"),
    null
  );
  assert.strictEqual(
    activeGoalForMonth({ mes: "2026-11", minutos: 1000 }, "2026-10-05"),
    null
  );
});

test("activeGoalForMonth returns null for invalid minute values", () => {
  const today = "2026-10-05";
  assert.strictEqual(activeGoalForMonth({ mes: "2026-10", minutos: 0 }, today), null);
  assert.strictEqual(activeGoalForMonth({ mes: "2026-10", minutos: -5 }, today), null);
  assert.strictEqual(activeGoalForMonth({ mes: "2026-10", minutos: 1.5 }, today), null);
  assert.strictEqual(activeGoalForMonth({ mes: "2026-10", minutos: "1000" }, today), null);
  assert.strictEqual(activeGoalForMonth({ mes: "2026-10" }, today), null);
});

test("activeGoalForMonth returns null for weird shapes", () => {
  const today = "2026-10-05";
  assert.strictEqual(activeGoalForMonth(null, today), null);
  assert.strictEqual(activeGoalForMonth("1000", today), null);
  assert.strictEqual(activeGoalForMonth({}, today), null);
  assert.strictEqual(activeGoalForMonth(1000, today), null);
});

test("validateGoal accepts positive integers", () => {
  assert.strictEqual(validateGoal(1000), null);
  assert.strictEqual(validateGoal(1), null);
  assert.strictEqual(validateGoal(99999), null);
});

test("validateGoal rejects zero and negatives with a Spanish message", () => {
  const error = validateGoal(0);
  assert.match(error, /número entero/);
  assert.strictEqual(typeof validateGoal(-5), "string");
});

test("validateGoal rejects non-integer values", () => {
  for (const value of [1.5, NaN, Infinity]) {
    assert.strictEqual(typeof validateGoal(value), "string");
  }
});

test("validateGoal rejects non-numeric values", () => {
  for (const value of ["1000", "", null, undefined]) {
    assert.strictEqual(typeof validateGoal(value), "string");
  }
});
