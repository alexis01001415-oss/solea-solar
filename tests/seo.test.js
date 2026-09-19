import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { seoPlugin } from "../scripts/seo.mjs";

test("published HTML includes all visible FAQ answers and an authorized JSON-LD hash", () => {
  const html = seoPlugin().transformIndexHtml(
    fs.readFileSync("index.html", "utf8"),
  );
  const json = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s,
  )?.[1];
  assert.ok(json);
  const graph = JSON.parse(json)["@graph"];
  const faq = graph.find((x) => x["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 13);
  for (const q of faq.mainEntity) {
    assert.ok(q.name.endsWith("?"));
    assert.ok(q.acceptedAnswer.text.length > 80);
  }
  assert.ok(
    html.includes(
      `'sha256-${createHash("sha256").update(json).digest("base64")}'`,
    ),
  );
  assert.ok(
    graph.every(
      (x) => !["LocalBusiness", "AggregateRating"].includes(x["@type"]),
    ),
  );
});
