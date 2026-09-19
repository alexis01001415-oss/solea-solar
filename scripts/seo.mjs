import { createHash } from "node:crypto";
export function seoPlugin() {
  return {
    name: "solea-static-seo",
    transformIndexHtml(html) {
      const questions = [
        ...html.matchAll(
          /<details>\s*<summary>([\s\S]*?)<span[\s\S]*?<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g,
        ),
      ].map((m) => ({
        "@type": "Question",
        name: m[1].replace(/\s+/g, " ").trim(),
        acceptedAnswer: { "@type": "Answer", text: m[2].replace(/\s+/g, " ").trim() },
      }));
      const url = "https://alexis01001415-oss.github.io/solea-solar/";
      const json = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${url}#website`,
            url,
            name: "Solea Solar",
            inLanguage: "es-MX",
            description:
              "Prototipo interactivo de una marca ficticia de calentadores solares para Ciudad de México y área metropolitana.",
          },
          {
            "@type": "WebPage",
            "@id": `${url}#webpage`,
            url,
            name: "Solea · Calentadores solares en CDMX y área metropolitana",
            inLanguage: "es-MX",
            isPartOf: { "@id": `${url}#website` },
            about: { "@type": "Thing", name: "Calentamiento solar de agua" },
            description:
              "Explora el calentador 3D, conoce el proceso de instalación y descarga una estimación ilustrativa en PDF.",
          },
          {
            "@type": "FAQPage",
            "@id": `${url}#preguntas`,
            inLanguage: "es-MX",
            mainEntity: questions,
          },
        ],
      });
      const hash = createHash("sha256").update(json).digest("base64");
      return html
        .replace("script-src 'self';", `script-src 'self' 'sha256-${hash}';`)
        .replace(
          "</head>",
          `<script type="application/ld+json">${json}</script></head>`,
        );
    },
  };
}
