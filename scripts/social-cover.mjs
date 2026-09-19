import fs from "node:fs/promises";
import sharp from "sharp";

// A code-native brand composition using the official Google Material sunny icon.
const icon = await fs.readFile("public/favicon.svg", "utf8");
const paths = [...icon.matchAll(/<path[^>]*\/>/g)].map((m) => m[0]).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg"><stop stop-color="#f8f5e9"/><stop offset="1" stop-color="#f0e5c6"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1010" cy="314" r="240" fill="#dda15e" opacity=".45"/><circle cx="1010" cy="314" r="260" fill="none" stroke="#bc6c25" opacity=".24"/><circle cx="1010" cy="314" r="295" fill="none" stroke="#bc6c25" opacity=".12"/><g transform="translate(66 49) scale(1.9)" fill="#9b4f20">${paths}</g><text x="129" y="92" font-family="Georgia,serif" font-size="58" font-weight="bold" fill="#283618" letter-spacing="-3">solea.</text><text x="70" y="201" font-family="Arial,sans-serif" font-size="15" letter-spacing="3" fill="#606c38">CALOR DE AQUÍ. PARA TU HOGAR.</text><text x="66" y="294" font-family="Georgia,serif" font-size="74" fill="#283618" letter-spacing="-3">El sol de siempre.</text><text x="66" y="377" font-family="Georgia,serif" font-size="74" fill="#283618" letter-spacing="-3">Una nueva forma</text><text x="66" y="460" font-family="Georgia,serif" font-size="74" font-style="italic" fill="#9b4f20" letter-spacing="-3">de vivir.</text><g transform="translate(864 167) scale(12)" fill="#9b4f20" opacity=".9">${paths}</g><path d="M70 526h1060" stroke="#283618" opacity=".2"/><text x="70" y="568" font-family="Arial,sans-serif" font-size="16" fill="#283618">Calentadores solares · CDMX y área metropolitana</text><text x="1130" y="568" text-anchor="end" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#606c38">EXPLORA EL PROTOTIPO</text></svg>`;
await fs.writeFile("public/social-cover.svg", svg);
await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile("public/social-cover.jpg");
console.log("Created social-cover.jpg (1200 × 630).");
