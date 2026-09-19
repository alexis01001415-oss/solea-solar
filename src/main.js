import "./styles.css";
import "./refinements.css";
import gsap from "gsap";
import {
  initScrollExperience,
  connectScrollTour,
} from "./scroll-experience.js";
import { calculateQuote } from "./quote.js";
import { sources } from "./config.js";

const $ = (s) => document.querySelector(s);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = $(".menu-toggle");
const menu = $("#mobile-menu");
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  menuButton.firstElementChild.textContent = "menu";
}
menuButton.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  menuButton.firstElementChild.textContent = open ? "close" : "menu";
});
menu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const restore = menu.contains(document.activeElement);
    closeMenu();
    if (restore) menuButton.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".site-header")) closeMenu();
});
matchMedia("(min-width:701px)").addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});
$("#year").textContent = new Date().getFullYear();
const exploreToggle = $("#explore-toggle");
const exploreMenu = $("#explore-menu");
function closeExplore(restoreFocus = false) {
  exploreMenu.hidden = true;
  exploreToggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) exploreToggle.focus();
}
exploreToggle.addEventListener("click", () => {
  exploreMenu.hidden = !exploreMenu.hidden;
  exploreToggle.setAttribute("aria-expanded", String(!exploreMenu.hidden));
});
exploreMenu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => closeExplore()));
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-explore")) closeExplore();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    closeExplore(exploreMenu.contains(document.activeElement));
});
document.addEventListener("focusin", (e) => {
  if (!e.target.closest(".nav-explore")) closeExplore();
});
initScrollExperience();

if (!reducedMotion.matches) {
  gsap.from(".hero-copy > *", {
    y: 22,
    stagger: 0.1,
    duration: 0.8,
    ease: "power2.out",
    delay: 0.1,
    clearProps: "all",
  });
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.from(entry.target, {
            opacity: 0,
            y: 28,
            duration: 0.85,
            ease: "power2.out",
            clearProps: "all",
          });
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
}

const quoteForm = $("#quote-form");
function currentQuote() {
  return calculateQuote(Object.fromEntries(new FormData(quoteForm)));
}
function updateQuote() {
  const q = currentQuote();
  $("#people-value").textContent = q.people;
  $("#people").setAttribute(
    "aria-valuetext",
    `${q.people} ${q.people === 1 ? "persona" : "personas"}`,
  );
  $("#quote-model").textContent = q.model;
  $("#quote-type").textContent =
    `${q.type} · ${q.people} ${q.people === 1 ? "persona" : "personas"}`;
  $("#quote-price").textContent = q.range;
  $(".quote-price > span").hidden = q.needsReview;
  $("#quote-includes").textContent = q.needsReview
    ? "Definimos la solución después de revisar tu hogar"
    : "Equipo + instalación básica de referencia";
  $("#quote-special").textContent = q.notes.join(" ");
  $("#quote-special").hidden = q.notes.length === 0;
}
quoteForm.addEventListener("input", updateQuote);
updateQuote();
let pdfModule;
const getPdf = () => (pdfModule ??= import("./pdf.js"));
quoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#download-quote"),
    status = $("#quote-status");
  btn.disabled = true;
  status.textContent = "Preparando tu plan…";
  try {
    const { downloadPlan } = await getPdf();
    await downloadPlan(currentQuote());
    status.textContent =
      "Tu plan está listo. Revisa las descargas de tu navegador.";
  } catch (error) {
    console.error(error);
    status.textContent = "No pudimos generar el PDF. Inténtalo de nuevo.";
    pdfModule = undefined;
  } finally {
    btn.disabled = false;
  }
});
$("#contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget,
    btn = form.querySelector("button[type=submit]"),
    status = $("#contact-status");
  btn.disabled = true;
  status.textContent = "Preparando tu solicitud…";
  const data = Object.fromEntries(new FormData(form));
  try {
    const { downloadPlan } = await getPdf();
    await downloadPlan(currentQuote(), data);
    status.textContent =
      "Solicitud descargada. No se ha enviado ningún mensaje ni se han guardado tus datos.";
  } catch (error) {
    console.error(error);
    status.textContent =
      "No pudimos preparar tu solicitud. Inténtalo de nuevo.";
    pdfModule = undefined;
  } finally {
    btn.disabled = false;
  }
});

const dialog = $("#info-dialog");
function openInfo(title, content) {
  $("#dialog-title").textContent = title;
  $("#dialog-content").replaceChildren(content);
  dialog.showModal();
}
function paragraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}
$("#privacy-open").addEventListener("click", () => {
  const content = document.createElement("div");
  content.append(
    paragraph(
      "Solea es una marca ficticia y esta web es un prototipo público. El cotizador y el formulario funcionan en tu navegador. Los datos que escribes solo se usan para generar el PDF que descargas; no se envían a un vendedor, no se guardan en una base de datos y no se incorporan a la dirección web.",
    ),
    paragraph(
      "No usamos cookies, analítica ni rastreadores publicitarios. Las tipografías, los iconos y el modelo 3D se sirven con la página. GitHub Pages, como proveedor de alojamiento, puede procesar registros técnicos de las visitas conforme a su política de privacidad.",
    ),
    paragraph(
      "Tu PDF puede contener los datos que hayas escrito. Decide con quién lo compartes. Recargar o cerrar esta página descarta la solicitud del prototipo.",
    ),
  );
  const a = document.createElement("a");
  a.href =
    "https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement";
  a.textContent = "Política de privacidad de GitHub";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  content.append(a);
  openInfo("Tu privacidad, con claridad.", content);
});
$("#credits-open").addEventListener("click", () => {
  const content = document.createElement("div");
  content.append(
    paragraph(
      "Modelo 3D: “Solar Water Heater- Anil”, de aniljaco. Bajo licencia Creative Commons Attribution 4.0. Adaptación: reducción de geometría de tornillos, normalización de escala e iluminación de la escena. La vivienda y el recorrido se construyeron proceduralmente para este prototipo.",
    ),
  );
  const links = [
    { title: "Modelo original en Sketchfab", url: "https://skfb.ly/onWWG" },
    {
      title: "Licencia CC BY 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/",
    },
    ...sources,
  ];
  const list = document.createElement("ul");
  for (const item of links) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.url;
    a.textContent = item.title;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    li.append(a);
    list.append(li);
  }
  content.append(
    list,
    paragraph(
      "Iconos: Google Material Symbols / Material Icons (Apache 2.0). Tipografías: Lora y Raleway (SIL Open Font License). Los importes, nombres de equipos y capacidades del cotizador son ejemplos ficticios. Las fuentes explican criterios generales; cada instalación se rige por el equipo seleccionado y su manual.",
    ),
  );
  openInfo("El sol también se comparte.", content);
});
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});

// Product code is separate from the initial document; the house is loaded near its section.
let productModule;
async function bootProduct() {
  try {
    productModule = await import("./product.js");
    await productModule.initProduct();
    $(".model-loading").hidden = true;
  } catch (error) {
    console.error("Product view:", error);
    $(".model-loading").hidden = true;
    $(".model-fallback").hidden = false;
    document.querySelectorAll(".model-slot").forEach((anchor) => {
      anchor.tabIndex = -1;
      anchor.setAttribute("aria-disabled", "true");
    });
  }
}
if ("requestIdleCallback" in window)
  requestIdleCallback(bootProduct, { timeout: 600 });
else setTimeout(bootProduct, 80);

let tourPromise;
async function loadTour() {
  if (tourPromise) return tourPromise;
  tourPromise = import("./tour.js")
    .then(async (module) => {
      const api = await module.initTour();
      $(".tour-loading").hidden = true;
      return api;
    })
    .catch((error) => {
      console.error("Tour view:", error);
      $(".tour-loading").textContent =
        "Vista 3D no disponible. Sigue la historia al deslizar.";
      return null;
    });
  return tourPromise;
}
connectScrollTour(loadTour);

const savingsRange = $("#savings-budget");
const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
function updateSavings() {
  const budget = Number(savingsRange.value);
  $("#savings-monthly").textContent = money.format(budget);
  $("#savings-annual").textContent = money.format(budget * 0.6 * 12);
  $("#savings-remaining").textContent = money.format(budget * 0.4);
  savingsRange.setAttribute(
    "aria-valuetext",
    money.format(budget) + " mensuales sólo para calentar agua",
  );
}
savingsRange.addEventListener("input", updateSavings);
updateSavings();

// Build-time JSON-LD is used for search engines (see scripts/seo.mjs).
if (import.meta.env.DEV && new URLSearchParams(location.search).has("audit")) {
  setTimeout(() => import("./dev-audit.js").then((m) => m.auditPage()), 1800);
}
