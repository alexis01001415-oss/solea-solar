import gsap from "gsap";
import { THREE, getHeater, makeRenderer, addLighting } from "./three-shared.js";

let spin = 0,
  draw;
export function rotateProduct(direction) {
  spin += (direction * Math.PI) / 4;
  draw?.();
}

export async function initProduct() {
  const canvas = document.querySelector("#product-canvas");
  const stage = document.querySelector("#product-stage");
  const story = document.querySelector("#solar-story");
  const anchors = [0, 1, 2].map((i) =>
    document.querySelector(`#model-anchor-${i}`),
  );
  const renderer = makeRenderer(canvas, { alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  addLighting(scene, renderer);
  const camera = new THREE.PerspectiveCamera(
    35,
    innerWidth / innerHeight,
    0.1,
    60,
  );
  camera.position.set(0, 0, 11);
  const root = new THREE.Group();
  scene.add(root);
  const heater = await getHeater(3.5);
  root.add(heater);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, "rgba(44,34,17,0.25)");
  gradient.addColorStop(1, "rgba(44,34,17,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 2.2),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.position.set(0, -1.55, -0.5);
  root.add(shadow);
  let w,
    h,
    raf,
    active = true,
    lastScroll = -1,
    lastSpin = NaN,
    settling = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let lastAngle = -0.48;
  function resize() {
    w = innerWidth;
    h = innerHeight;
    renderer.setSize(w, h, false);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    lastScroll = -1;
    requestDraw();
  }
  const ease = (t) => t * t * (3 - 2 * t);
  function render() {
    raf = null;
    if (!active || document.hidden) return;
    const rects = anchors.map((a) => a.getBoundingClientRect());
    const centers = rects.map((r) => r.top + r.height / 2);
    const targetY = h * 0.51;
    let index = centers[1] > targetY ? 0 : 1;
    let t = Math.max(
      0,
      Math.min(
        1,
        (targetY - centers[index]) / (centers[index + 1] - centers[index]),
      ),
    );
    t = ease(t);
    if (w <= 700) t = t > 0.5 ? 1 : 0;
    if (reduce.matches) t = t > 0.5 ? 1 : 0;
    const r0 = rects[index],
      r1 = rects[index + 1];
    const lerp = (a, b) => a + (b - a) * t;
    const cx = lerp(r0.left + r0.width / 2, r1.left + r1.width / 2);
    const cy = lerp(centers[index], centers[index + 1]);
    const width = lerp(r0.width, r1.width),
      height = lerp(r0.height, r1.height);
    const viewHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 11;
    const canvasTop = canvas.getBoundingClientRect().top;
    root.position.set(
      ((cx - w / 2) / h) * viewHeight,
      (-(cy - canvasTop - h / 2) / h) * viewHeight,
      0,
    );
    const scale =
      (Math.min((width * 0.91) / 4.6, (height * 0.82) / 3.6) / h) * viewHeight;
    root.scale.setScalar(scale);
    const rotations = [-0.47, 0.64, -0.2];
    const angle = lerp(rotations[index], rotations[index + 1]) + spin;
    lastAngle = reduce.matches
      ? angle
      : THREE.MathUtils.lerp(lastAngle, angle, 0.13);
    heater.rotation.set(0.19, lastAngle, -0.018);
    renderer.render(scene, camera);
    lastScroll = scrollY;
    lastSpin = spin;
    if (Math.abs(lastAngle - angle) > 0.001) requestDraw();
  }
  function requestDraw() {
    if (!raf) raf = requestAnimationFrame(render);
  }
  draw = requestDraw;
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestDraw();
  });
  new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active) requestDraw();
    },
    { rootMargin: "100px" },
  ).observe(story);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    active = false;
    document.querySelector(".model-fallback").hidden = false;
    document
      .querySelectorAll(".rotate-model")
      .forEach((b) => (b.disabled = true));
  });
  canvas.addEventListener("webglcontextrestored", () => {
    active = true;
    document.querySelector(".model-fallback").hidden = true;
    document
      .querySelectorAll(".rotate-model")
      .forEach((b) => (b.disabled = false));
    requestDraw();
  });
  resize();
  if (!reduce.matches) gsap.from(canvas, { opacity: 0, duration: 0.8 });
  return { renderer, requestDraw };
}
