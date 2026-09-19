import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const lenis = new Lenis({
  autoRaf: false,
  anchors: true,
  lerp: 0.095,
  smoothWheel: true,
  syncTouch: false,
  respectReducedMotion: true,
  prevent: (node) => node.id === "info-dialog" || node.id === "mobile-menu",
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

export function initScrollExperience() {
  const header = document.querySelector(".site-header");
  const updateHeader = () =>
    header.classList.toggle("is-scrolled", scrollY > 32);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const portal = document.querySelector(".tour-portal");
    if (portal) {
      const surface = portal.querySelector(".portal-surface");
      const caption = portal.querySelector(".portal-caption");
      gsap.fromTo(
        surface,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(72% at 50% 50%)",
          ease: "none",
          scrollTrigger: {
            trigger: portal,
            start: "top 78%",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      gsap.fromTo(
        caption,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: portal,
            start: "top 32%",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    }
    document.querySelectorAll(".word-motion").forEach((word) => {
      gsap.from(word, {
        yPercent: 115,
        rotate: 3,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: word.closest("h1,h2"),
          start: "top 90%",
          once: true,
        },
      });
    });
    if (document.querySelector(".impact-story")) {
      gsap.to(".life-section > *", {
        y: -40,
        opacity: 0.22,
        ease: "none",
        scrollTrigger: {
          trigger: "#impacto",
          start: "top 85%",
          end: "top 20%",
          scrub: true,
        },
      });
    }
  });
  document.querySelectorAll(".button, .text-button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches || event.pointerType === "touch") return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--light-x", `${event.clientX - rect.left}px`);
      button.style.setProperty("--light-y", `${event.clientY - rect.top}px`);
    });
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  const flow = document.querySelector(".solar-flow");
  if (flow) {
    let visible = false;
    const updateFlow = () =>
      flow.classList.toggle(
        "is-playing",
        visible && !document.hidden && !reducedMotion.matches,
      );
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        updateFlow();
      },
      { threshold: 0.15 },
    ).observe(flow);
    document.addEventListener("visibilitychange", updateFlow);
    reducedMotion.addEventListener("change", updateFlow);
  }
}

export function connectScrollTour(loadTour) {
  const chapters = [...document.querySelectorAll(".tour-chapter")];
  const grid = document.querySelector(".tour-scroll-grid");
  const track = document.querySelector(".tour-track span");
  let api,
    frame,
    active = false,
    previousStep = -1,
    progress = 0;
  document.documentElement.classList.add("scroll-tour");
  function update() {
    frame = null;
    if (!active) return;
    const probe = innerHeight * (innerWidth <= 700 ? 0.77 : 0.54);
    const centers = chapters.map((chapter) => {
      const rect = chapter.firstElementChild.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    let index = 0;
    while (index < centers.length - 2 && probe > centers[index + 1]) index++;
    const fraction = Math.max(
      0,
      Math.min(
        1,
        (probe - centers[index]) / (centers[index + 1] - centers[index]),
      ),
    );
    progress = index + fraction;
    const step = Math.round(progress);
    api?.setProgress(reducedMotion.matches ? step : progress);
    track.style.transform = `scaleX(${(progress + 1) / chapters.length})`;
    if (step !== previousStep) {
      previousStep = step;
      document.querySelector("#tour-counter").textContent = String(
        step + 1,
      ).padStart(2, "0");
      chapters.forEach((chapter, i) =>
        chapter.classList.toggle("is-current", i === step),
      );
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active) {
        loadTour().then((result) => {
          api = result;
          schedule();
        });
        schedule();
      }
    },
    { rootMargin: "700px" },
  ).observe(grid);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener("change", schedule);
  new ResizeObserver(schedule).observe(grid);
}
