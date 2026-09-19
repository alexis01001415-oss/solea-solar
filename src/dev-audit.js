import axe from "axe-core";

// Development only. Vite removes this module and its import from production.
export async function auditPage() {
  await document.fonts.ready;
  const report = document.createElement("output");
  report.id = "accessibility-report";
  report.hidden = true;
  document.body.append(report);
  try {
    const results = await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
      },
    });
    report.textContent = JSON.stringify({
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.map((x) => x.id),
    });
  } catch (e) {
    report.textContent = JSON.stringify({ error: e.message });
  }
}
