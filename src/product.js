import gsap from "gsap";
import { THREE, getHeater, makeRenderer, addLighting } from "./three-shared.js";

let spin = 0,
  pitch = 0.19;

export async function initProduct() {
  const canvas = document.querySelector("#product-canvas");
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
  // Pointer surface follows the rendered product even between the static chapters.
  const hitArea = document.createElement("div");
  hitArea.className = "product-hit-area";
  hitArea.setAttribute("aria-hidden", "true");
  document.body.append(hitArea);
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
    active = true;
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
    Object.assign(hitArea.style, {
      left: `${cx - width * 0.44}px`,
      top: `${cy - height * 0.43}px`,
      width: `${width * 0.88}px`,
      height: `${height * 0.86}px`,
    });
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
    heater.rotation.set(pitch, lastAngle, -0.018);
    renderer.render(scene, camera);
    if (Math.abs(lastAngle - angle) > 0.001) requestDraw();
  }
  function requestDraw() {
    if (!raf) raf = requestAnimationFrame(render);
  }
  let drag;
  [...anchors, hitArea].forEach((anchor) => {
    anchor.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !active) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        touch: event.pointerType === "touch",
      };
      anchor.setPointerCapture(event.pointerId);
      anchor.classList.add("is-dragging");
    });
    anchor.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      spin += (event.clientX - drag.x) * 0.009;
      if (!drag.touch)
        pitch = Math.max(
          -0.35,
          Math.min(0.65, pitch + (event.clientY - drag.y) * 0.005),
        );
      drag.x = event.clientX;
      drag.y = event.clientY;
      requestDraw();
    });
    const release = () => {
      drag = null;
      anchor.classList.remove("is-dragging");
    };
    anchor.addEventListener("pointerup", release);
    anchor.addEventListener("pointercancel", release);
    anchor.addEventListener("lostpointercapture", release);
    anchor.addEventListener("keydown", (event) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
          event.key,
        )
      )
        return;
      event.preventDefault();
      if (event.key === "Home") {
        spin = 0;
        pitch = 0.19;
      }
      if (event.key === "ArrowLeft") spin -= 0.22;
      if (event.key === "ArrowRight") spin += 0.22;
      if (event.key === "ArrowUp") pitch = Math.max(-0.35, pitch - 0.1);
      if (event.key === "ArrowDown") pitch = Math.min(0.65, pitch + 0.1);
      requestDraw();
    });
  });
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestDraw();
  });
  new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      hitArea.hidden = !active;
      if (active) requestDraw();
    },
    { rootMargin: "100px" },
  ).observe(story);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    active = false;
    document.querySelector(".model-fallback").hidden = false;
    hitArea.hidden = true;
    anchors.forEach((anchor) => {
      anchor.setAttribute("aria-disabled", "true");
      anchor.tabIndex = -1;
    });
  });
  canvas.addEventListener("webglcontextrestored", () => {
    active = true;
    document.querySelector(".model-fallback").hidden = true;
    hitArea.hidden = false;
    anchors.forEach((anchor) => {
      anchor.removeAttribute("aria-disabled");
      anchor.tabIndex = 0;
    });
    requestDraw();
  });
  resize();
  if (!reduce.matches) gsap.from(canvas, { opacity: 0, duration: 0.8 });
  return { renderer, requestDraw };
}
