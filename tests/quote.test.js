import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuote } from "../src/quote.js";

test("families see a larger reference capacity, never a cheaper large system", () => {
  const small = calculateQuote({ people: 2 }),
    medium = calculateQuote({ people: 4 }),
    large = calculateQuote({ people: 8 });
  assert.ok(
    small.capacity < medium.capacity && medium.capacity < large.capacity,
  );
  assert.ok(small.low < medium.low && medium.low < large.low);
});
test("unknown pressure and out-of-area addresses need review, not a misleading price", () => {
  for (const options of [
    { water: "desconocido" },
    { zone: "otra" },
    { water: "invalid" },
    { zone: "invalid" },
  ]) {
    const q = calculateQuote(options);
    assert.equal(q.needsReview, true);
    assert.equal(q.range, "Requiere valoración");
    assert.ok(q.notes.length);
  }
});
test("pressurized supply selects a compatible reference and explicit warning", () => {
  const q = calculateQuote({ water: "presion", home: "Departamento" });
  assert.match(q.model, /Presión/);
  assert.ok(q.low > calculateQuote().low);
  assert.equal(q.notes.length, 2);
});
test("invalid occupancy remains within supported range", () => {
  assert.equal(calculateQuote({ people: -20 }).people, 1);
  assert.equal(calculateQuote({ people: 100 }).people, 8);
  assert.equal(calculateQuote({ people: "invalid" }).people, 4);
});
