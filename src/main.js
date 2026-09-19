import "./styles.css";
import gsap from "gsap";
import { calculateQuote } from "./quote.js";
import { brand, installationSteps, sources } from "./config.js";

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

if (!reducedMotion.matches) {
  gsap.from(".hero-copy > *", {
    opacity: 0,
    y: 22,
    stagger: 0.1,
    duration: 0.8,
    ease: "power2.out",
    delay: 0.1,
    clearProps: "all",
  });
  gsap.from(".solar-disc", {
    scale: 0.87,
    opacity: 0,
    duration: 1.25,
    ease: "power2.out",
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
    document
      .querySelectorAll(".rotate-model")
      .forEach((b) => (b.disabled = true));
  }
}
document
  .querySelectorAll(".rotate-model")
  .forEach((b) =>
    b.addEventListener("click", () =>
      productModule?.rotateProduct(Number(b.dataset.direction)),
    ),
  );
if ("requestIdleCallback" in window)
  requestIdleCallback(bootProduct, { timeout: 600 });
else setTimeout(bootProduct, 80);

let tourApi,
  tourPromise,
  step = 0,
  autoplay,
  touring = false;
$("#tour-viewport").append($(".tour-loading"));
async function loadTour() {
  if (tourPromise) return tourPromise;
  tourPromise = import("./tour.js")
    .then(async (m) => {
      tourApi = await m.initTour();
      $(".tour-loading").hidden = true;
      return tourApi;
    })
    .catch((error) => {
      console.error("Tour view:", error);
      $(".tour-loading").textContent =
        "Vista 3D no disponible. Sigue los cinco pasos con los controles.";
      $(".tour-start > p").textContent = "La instalación, paso a paso.";
      return null;
    });
  return tourPromise;
}
const tourObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      loadTour();
      tourObserver.disconnect();
    }
  },
  { rootMargin: "500px" },
);
tourObserver.observe($("#recorrido"));
function stopAutoplay() {
  clearInterval(autoplay);
  autoplay = null;
  $("#tour-play").firstElementChild.textContent = "play_circle";
  $("#tour-play").lastElementChild.textContent = "Reproducir";
  $("#tour-play").setAttribute(
    "aria-label",
    "Reproducir recorrido automáticamente",
  );
}
function showStep(next, { manual = true } = {}) {
  if (manual) stopAutoplay();
  step = Math.max(0, Math.min(4, next));
  touring = true;
  $(".tour-start").hidden = true;
  const s = installationSteps[step];
  $("#step-number").textContent = String(step + 1).padStart(2, "0");
  $("#step-title").textContent = s.title;
  $("#step-description").textContent = s.text;
  $("#step-detail").textContent = s.detail;
  $(".tour-step-icon").textContent = s.icon;
  document.querySelectorAll(".step-dot").forEach((b, i) => {
    b.classList.toggle("active", i === step);
    if (i === step) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  $("#tour-prev").disabled = step === 0;
  $("#tour-next").disabled = step === 4;
  loadTour().then((api) => api?.goTo(step));
  if (!reducedMotion.matches)
    gsap.fromTo(
      "#tour-copy",
      { opacity: 0.5, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, clearProps: "all" },
    );
}
$("#start-tour").addEventListener("click", () => showStep(0));
document
  .querySelectorAll(".step-dot")
  .forEach((b) =>
    b.addEventListener("click", () => showStep(Number(b.dataset.step))),
  );
$("#tour-prev").addEventListener("click", () => showStep(step - 1));
$("#tour-next").addEventListener("click", () => showStep(step + 1));
$("#tour-play").addEventListener("click", () => {
  if (autoplay) {
    stopAutoplay();
    return;
  }
  showStep(step === 4 ? 0 : step);
  $("#tour-play").firstElementChild.textContent = "pause_circle";
  $("#tour-play").lastElementChild.textContent = "Pausar";
  $("#tour-play").setAttribute("aria-label", "Pausar el recorrido");
  autoplay = setInterval(() => {
    if (step >= 4) {
      stopAutoplay();
      return;
    }
    showStep(step + 1, { manual: false });
  }, 6500);
});
$("#tour-reset").addEventListener("click", () => {
  stopAutoplay();
  tourApi?.overview();
  $(".tour-start").hidden = false;
  touring = false;
});
new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) stopAutoplay();
  },
  { threshold: 0.1 },
).observe($("#recorrido"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoplay();
});

// Build-time JSON-LD is used for search engines (see scripts/seo.mjs).
if (import.meta.env.DEV && new URLSearchParams(location.search).has("audit")) {
  setTimeout(() => import("./dev-audit.js").then((m) => m.auditPage()), 1800);
}
