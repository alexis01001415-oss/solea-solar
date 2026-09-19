import fs from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld } from "@gltf-transform/functions";

await fs.mkdir("public/models", { recursive: true });
await fs.mkdir("public/fonts", { recursive: true });
const io = new NodeIO();
const inputPath = process.argv[2];
if (!inputPath)
  throw new Error(
    "Usage: node scripts/prepare-assets.mjs <path-to-original.glb>",
  );
const document = await io.read(inputPath);
let removed = 0;
for (const node of [...document.getRoot().listNodes()]) {
  if (/^Bolt/.test(node.getName())) {
    node.dispose();
    removed++;
  }
}
await document.transform(prune(), dedup(), weld());
await io.write("public/models/solar-heater.glb", document);
const icons = [
  "add",
  "add_circle",
  "apartment",
  "check",
  "close",
  "construction",
  "description",
  "download",
  "east",
  "eco",
  "energy_savings_leaf",
  "handyman",
  "home",
  "info",
  "location_on",
  "menu",
  "north",
  "pause_circle",
  "play_circle",
  "rotate_left",
  "rotate_right",
  "savings",
  "south",
  "sunny",
  "task_alt",
  "thermostat",
  "tune",
  "view_in_ar",
  "water_drop",
  "wb_twilight",
  "west",
]
  .sort()
  .join(",");
const fontCss = await fetch(
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@100..700&icon_names=${icons}&display=block`,
  { headers: { "User-Agent": "Mozilla/5.0" } },
).then((r) => r.text());
const match = fontCss.match(/src:\s*url\(([^)]+)\)/);
if (!match) throw new Error("Material Symbols font URL missing");
const font = await fetch(match[1]).then((r) => r.arrayBuffer());
await fs.writeFile("public/fonts/material-symbols.woff2", Buffer.from(font));
// Official Google Material Design sunny icon; geometry is unmodified.
const sunnyUrl =
  "https://raw.githubusercontent.com/google/material-design-icons/master/src/image/wb_sunny/materialicons/24px.svg";
let sunny = await fetch(sunnyUrl).then((r) => {
  if (!r.ok) throw new Error("Favicon download failed");
  return r.text();
});
sunny = sunny.replace(
  "<svg ",
  '<svg fill="#9b4f20" style="background:#fefae0;border-radius:6px" ',
);
await fs.writeFile("public/favicon.svg", sunny);
await fs.writeFile(
  "public/robots.txt",
  "User-agent: *\nAllow: /\nSitemap: https://alexis01001415-oss.github.io/solea-solar/sitemap.xml\n",
);
await fs.writeFile(
  "public/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://alexis01001415-oss.github.io/solea-solar/</loc></url></urlset>\n',
);
await fs.writeFile("public/.nojekyll", "");
console.log({
  removedBoltNodes: removed,
  modelBytes: (await fs.stat("public/models/solar-heater.glb")).size,
  iconFontBytes: font.byteLength,
});
