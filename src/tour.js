import { THREE, getHeater, makeRenderer, addLighting } from "./three-shared.js";

export async function initTour() {
  const viewport = document.querySelector("#tour-viewport"),
    canvas = document.querySelector("#tour-canvas");
  const renderer = makeRenderer(canvas);
  renderer.setClearColor(0xd1c6a6);
  renderer.toneMappingExposure = 0.83;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd1c6a6, 26, 60);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  const sunlight = addLighting(scene, renderer);
  sunlight.position.set(-8, 14, 10);
  sunlight.intensity = 2.7;
  scene.children
    .filter((light) => light.isHemisphereLight)
    .forEach((light) => (light.intensity = 1.1));
  sunlight.shadow.mapSize.set(1536, 1536);
  sunlight.shadow.camera.far = 45;
  const materials = {
    plaster: new THREE.MeshStandardMaterial({
      color: 0xe9dfc4,
      roughness: 0.92,
    }),
    warm: new THREE.MeshStandardMaterial({ color: 0xd1aa80, roughness: 0.95 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf1e9d3, roughness: 0.85 }),
    green: new THREE.MeshStandardMaterial({ color: 0x48563b, roughness: 0.68 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2d352b, roughness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x526865,
      roughness: 0.25,
      metalness: 0.25,
    }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9c643e, roughness: 0.82 }),
    copper: new THREE.MeshStandardMaterial({
      color: 0xbb682e,
      roughness: 0.5,
      metalness: 0.35,
    }),
    cold: new THREE.MeshStandardMaterial({
      color: 0x4f8496,
      roughness: 0.45,
      metalness: 0.1,
    }),
    hot: new THREE.MeshStandardMaterial({
      color: 0xa44825,
      roughness: 0.45,
      metalness: 0.1,
    }),
    terracotta: new THREE.MeshStandardMaterial({
      color: 0xb8704c,
      roughness: 0.9,
    }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x647442, roughness: 0.9 }),
    leafLight: new THREE.MeshStandardMaterial({
      color: 0x83905e,
      roughness: 0.9,
    }),
    dirt: new THREE.MeshStandardMaterial({ color: 0x6c6243, roughness: 1 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xbab9a3, roughness: 1 }),
    roof: new THREE.MeshStandardMaterial({ color: 0xd2bba0, roughness: 1 }),
  };
  function box(w, h, d, x, y, z, mat = materials.plaster, parent = scene) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(
    rt,
    rb,
    h,
    x,
    y,
    z,
    mat = materials.dark,
    segments = 24,
    parent = scene,
  ) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, segments),
      mat,
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function pipe(points, radius, mat) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "catmullrom",
      0.03,
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, radius, 8, false),
      mat,
    );
    mesh.castShadow = true;
    scene.add(mesh);
    return curve;
  }
  function plant(x, y, z, scale = 1) {
    const group = new THREE.Group();
    scene.add(group);
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    cylinder(0.24, 0.17, 0.42, 0, 0.21, 0, materials.terracotta, 16, group);
    cylinder(0.215, 0.215, 0.035, 0, 0.42, 0, materials.dirt, 16, group);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(1, 7, 5),
        i % 2 ? materials.leaf : materials.leafLight,
      );
      leaf.scale.set(0.065, 0.44, 0.11);
      leaf.position.set(Math.sin(angle) * 0.18, 0.7, Math.cos(angle) * 0.18);
      leaf.rotation.set(Math.cos(angle) * 0.47, angle, Math.sin(angle) * -0.47);
      leaf.castShadow = true;
      group.add(leaf);
    }
    return group;
  }
  function tree(x, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    scene.add(group);
    cylinder(0.1, 0.16, 1.9, 0, 1, 0, materials.wood, 8, group);
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.65 + (i % 2) * 0.13, 1),
        i % 2 ? materials.leaf : materials.leafLight,
      );
      leaf.position.set(
        Math.sin(i * 2.3) * 0.35,
        2.05 + (i % 3) * 0.33,
        Math.cos(i * 2.3) * 0.35,
      );
      leaf.castShadow = true;
      group.add(leaf);
    }
  }
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0xc9c2a5, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.34;
  ground.receiveShadow = true;
  scene.add(ground);
  box(11, 0.32, 9, 0, -0.16, 0, materials.white);
  box(10.4, 0.035, 8.4, 0, 0.018, 0, materials.stone);
  // Mexican urban house: plaster, concrete slabs, roof parapet, porch and planting.
  box(6, 5.1, 4.5, 0, 2.6, -0.65, materials.plaster);
  box(6.24, 0.2, 4.73, 0, 2.9, -0.65, materials.white);
  box(6.26, 0.25, 4.74, 0, 5.26, -0.65, materials.white);
  box(5.9, 0.055, 4.38, 0, 5.42, -0.65, materials.roof);
  box(6.22, 0.47, 0.15, 0, 5.57, -3, materials.plaster);
  box(0.15, 0.47, 4.64, -3.05, 5.57, -0.65, materials.plaster);
  box(0.15, 0.47, 4.64, 3.05, 5.57, -0.65, materials.plaster);
  box(6.22, 0.22, 0.17, 0, 5.45, 1.66, materials.plaster);
  box(2.25, 2.5, 0.14, 0.45, 1.28, 1.63, materials.warm);
  box(1.24, 2.27, 0.1, 0.38, 1.16, 1.73, materials.dark);
  box(1.13, 2.2, 0.12, 0.38, 1.17, 1.8, materials.wood);
  for (let i = 0; i < 7; i++)
    box(0.018, 2.11, 0.025, -0.08 + i * 0.15, 1.16, 1.87, materials.warm);
  box(0.025, 0.38, 0.075, 0.76, 1.28, 1.94, materials.dark);
  box(1.55, 0.1, 0.8, 0.4, 0.08, 2.05, materials.white);
  box(1.8, 0.08, 0.45, 0.4, 0.04, 2.64, materials.white);
  // Light above entry and a simple house number made as a real 3D surface.
  box(0.32, 0.15, 0.16, 0.4, 2.59, 1.82, materials.dark);
  const lamp = new THREE.PointLight(0xffc879, 1.2, 3);
  lamp.position.set(0.4, 2.5, 1.95);
  scene.add(lamp);
  function windowFront(x, y, w = 1.4, h = 1.25) {
    box(w + 0.15, h + 0.15, 0.16, x, y, 1.66, materials.white);
    box(w, h, 0.17, x, y, 1.76, materials.dark);
    box(w - 0.13, h - 0.13, 0.025, x, y, 1.855, materials.glass);
    box(0.042, h, 0.03, x, y, 1.9, materials.white);
    box(w, 0.045, 0.03, x, y, 1.9, materials.white);
    box(w + 0.3, 0.1, 0.27, x, y - h / 2 - 0.03, 1.8, materials.white);
  }
  windowFront(-1.8, 1.65, 1.25, 1.35);
  windowFront(2.12, 1.62, 1.05, 1.35);
  windowFront(-1.72, 4.04, 1.45, 1.43);
  windowFront(0.6, 4.04, 1.7, 1.43);
  box(0.12, 1.5, 1.85, 3.08, 3.96, -0.9, materials.white);
  box(0.13, 1.33, 1.67, 3.16, 3.96, -0.9, materials.glass);
  box(0.16, 1.43, 0.055, 3.23, 3.96, -0.9, materials.dark);
  // Balcony with thin metal railings.
  box(2.25, 0.13, 0.7, 0.6, 3.25, 1.98, materials.white);
  box(2.25, 0.045, 0.04, 0.6, 4.05, 2.29, materials.dark);
  for (let i = 0; i < 13; i++)
    box(0.025, 0.8, 0.025, -0.46 + i * 0.176, 3.65, 2.29, materials.dark);
  box(0.04, 0.8, 0.68, -0.5, 3.65, 1.97, materials.dark);
  box(0.04, 0.8, 0.68, 1.7, 3.65, 1.97, materials.dark);
  plant(-0.22, 3.32, 1.99, 0.55);
  plant(1.35, 3.32, 1.99, 0.55);
  // Roof access volume with a door and chimney-like utility vent.
  box(1.35, 1.55, 1.15, 2.14, 6.18, -2.05, materials.warm);
  box(1.51, 0.14, 1.3, 2.14, 7, -2.05, materials.white);
  box(0.7, 1.31, 0.08, 2.13, 6.05, -1.44, materials.green);
  box(0.07, 0.1, 0.04, 2.34, 6.05, -1.37, materials.copper);
  // Tile seams and a small rooftop terrace.
  for (let i = 0; i < 9; i++)
    box(0.012, 0.006, 4.2, -2.75 + i * 0.68, 5.45, -0.65, materials.warm);
  for (let i = 0; i < 7; i++)
    box(5.85, 0.006, 0.012, 0, 5.45, -2.68 + i * 0.67, materials.warm);
  plant(2.5, 5.48, 0.99, 0.78);
  plant(2.52, 5.48, -0.55, 0.6);
  // Elevated water tank: water level above heater; open air vent above tank.
  const tx = -1.85,
    tz = -1.73;
  box(1.3, 0.16, 1.3, tx, 6.06, tz, materials.white);
  for (const x of [-0.47, 0.47])
    for (const z of [-0.47, 0.47])
      box(0.13, 0.66, 0.13, tx + x, 5.74, tz + z, materials.plaster);
  cylinder(0.55, 0.56, 1.03, tx, 6.65, tz, materials.dark, 32);
  cylinder(0.47, 0.55, 0.22, tx, 7.26, tz, materials.dark, 32);
  cylinder(0.18, 0.2, 0.065, tx, 7.41, tz, materials.dark, 20);
  for (const y of [6.25, 6.45, 6.66, 6.87, 7.06]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.558, 0.014, 5, 32),
      materials.dark,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(tx, y, tz);
    scene.add(ring);
  }
  const heater = await getHeater(2.18, true);
  heater.position.set(0.35, 5.5, -0.04);
  scene.add(heater);
  // Rails/feet and roof pads preserve separation from the waterproofing.
  box(0.22, 0.08, 2.08, -0.52, 5.46, -0.02, materials.white);
  box(0.22, 0.08, 2.08, 1.18, 5.46, -0.02, materials.white);
  // Illustrative LP supply and separate solar-compatible auxiliary heater.
  // Fuel goes only to the auxiliary unit; the roof's solar tank contains water.
  const gasMaterial = new THREE.MeshStandardMaterial({
    color: 0xe3c459,
    roughness: 0.65,
  });
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: 0xebece1,
    roughness: 0.48,
    metalness: 0.12,
  });
  const gasTank = cylinder(0.32, 0.32, 1.2, -2.1, 6.03, 0.35, tankMaterial, 32);
  gasTank.rotation.x = Math.PI / 2;
  for (const z of [-0.25, 0.95]) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 12),
      tankMaterial,
    );
    cap.position.set(-2.1, 6.03, z);
    cap.castShadow = true;
    scene.add(cap);
  }
  for (const z of [-0.08, 0.78]) {
    box(0.62, 0.1, 0.22, -2.1, 5.53, z, materials.white);
    box(0.4, 0.28, 0.12, -2.1, 5.68, z, materials.dark);
  }
  cylinder(0.07, 0.07, 0.13, -2.1, 6.39, 0.35, materials.copper, 12);
  cylinder(0.09, 0.09, 0.045, -2.1, 6.48, 0.35, materials.dark, 16);
  box(0.19, 0.025, 0.07, -2.1, 6.53, 0.35, materials.copper);
  // Open exterior service wall; auxiliary unit is distinct from the rooftop fuel tank.
  box(0.38, 0.98, 0.64, -3.24, 3.2, -1.87, tankMaterial);
  box(0.035, 0.7, 0.52, -3.445, 3.23, -1.87, materials.white);
  for (let i = 0; i < 5; i++)
    box(0.04, 0.025, 0.36, -3.47, 3.48 - i * 0.07, -1.87, materials.dark);
  box(0.045, 0.12, 0.24, -3.475, 2.99, -1.87, materials.dark);
  pipe(
    [
      [-3.25, 3.69, -1.87],
      [-3.48, 3.85, -1.87],
      [-3.65, 4.07, -1.87],
      [-3.65, 6.37, -1.87],
    ],
    0.095,
    materials.stone,
  );
  cylinder(0.18, 0.18, 0.045, -3.65, 6.47, -1.87, materials.stone, 20);
  cylinder(0.09, 0.09, 0.07, -3.65, 6.4, -1.87, materials.dark, 20);
  pipe(
    [
      [-2.1, 6.48, 0.35],
      [-2.66, 6.48, 0.35],
      [-3.35, 6.48, 0.35],
      [-3.4, 5.79, 0.35],
      [-3.5, 5.79, -2.12],
      [-3.5, 2.54, -2.12],
      [-3.3, 2.54, -2.12],
      [-3.3, 2.73, -2.12],
    ],
    0.032,
    gasMaterial,
  );
  // Physical labels are part of the equipment, not floating interaction controls.
  function equipmentLabel(text, w, h, x, y, z, rotation = 0) {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256;
    labelCanvas.height = 96;
    const context = labelCanvas.getContext("2d");
    context.fillStyle = "#ebece1";
    context.fillRect(0, 0, 256, 96);
    context.fillStyle = "#283618";
    context.font = '700 38px "Raleway Variable", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 49);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(labelCanvas),
      }),
    );
    label.position.set(x, y, z);
    label.rotation.y = rotation;
    scene.add(label);
  }
  equipmentLabel("GAS LP", 0.4, 0.15, -2.1, 6.04, 1.274);
  equipmentLabel("AUXILIAR", 0.43, 0.15, -3.47, 2.87, -1.87, -Math.PI / 2);
  const coldPath = pipe(
    [
      [tx + 0.45, 6.25, tz],
      [tx + 0.73, 6.25, tz],
      [tx + 0.73, 5.65, tz],
      [1.5, 5.65, tz],
      [1.5, 6.54, -0.94],
      [1.13, 6.54, -0.94],
    ],
    0.043,
    materials.cold,
  );
  const hotPath = pipe(
    [
      [-0.73, 6.63, -0.83],
      [-1.04, 6.63, -0.83],
      [-1.04, 5.7, -0.83],
      [-2.6, 5.7, -0.83],
      [-3.2, 5.7, -0.83],
      [-3.25, 2.48, -0.83],
      [-3.25, 2.48, -1.63],
      [-3.25, 2.72, -1.63],
    ],
    0.055,
    materials.hot,
  );
  pipe(
    [
      [-3.25, 2.72, -1.92],
      [-3.25, 2.36, -1.92],
      [-3.55, 2.36, -1.92],
      [-3.55, 1.38, -1.92],
      [-2.91, 1.38, -1.92],
    ],
    0.055,
    materials.hot,
  );
  pipe(
    [
      [-0.93, 6.63, -0.83],
      [-0.93, 7.75, -0.83],
      [-1.12, 7.75, -0.83],
    ],
    0.031,
    materials.copper,
  );
  // Visible valve handles. These are physical plumbing geometry, not UI icons.
  box(0.17, 0.03, 0.05, tx + 0.73, 6.13, tz, materials.copper);
  box(0.13, 0.03, 0.06, -3.55, 1.8, -1.92, materials.copper);
  // Insulation collars around hot riser and wall clips.
  for (const y of [2.8, 3.9, 5])
    box(0.16, 0.05, 0.19, -3.14, y, -0.83, materials.dark);
  // Courtyard, stepping stones and characteristic greenery.
  box(2.35, 0.08, 1.3, -3.45, 0.1, 2.15, materials.dirt);
  for (let i = 0; i < 4; i++)
    plant(-4.15 + i * 0.49, 0.14, 2.18, 0.7 + (i % 2) * 0.15);
  plant(-0.66, 0.12, 2.1, 0.85);
  plant(1.5, 0.12, 2.1, 1.15);
  for (let i = 0; i < 3; i++)
    box(1.45, 0.045, 0.46, 0.42, 0.045, 3.01 + i * 0.58, materials.white);
  box(0.2, 0.7, 5.25, 4.58, 0.39, -0.52, materials.warm);
  box(2.13, 0.7, 0.2, 3.63, 0.39, 2.08, materials.warm);
  tree(-4.6, -3.15, 1.12);
  tree(4.05, -2.64, 0.86);
  // A restrained streetscape gives scale without competing with the home.
  const neighbor = new THREE.MeshStandardMaterial({
    color: 0xbcbba3,
    roughness: 1,
  });
  box(3.3, 3.5, 3.7, -8.2, 1.42, -4.75, neighbor);
  box(3.5, 0.18, 3.9, -8.2, 3.24, -4.75, materials.stone);
  box(3.5, 4.8, 4, 7.9, 2.08, -5.8, neighbor);
  box(3.7, 0.18, 4.2, 7.9, 4.55, -5.8, materials.stone);
  box(5, 2.4, 3, -0.2, 0.91, -9.5, neighbor);
  const pathCurves = [coldPath, hotPath];
  const drops = [];
  sunlight.shadow.autoUpdate = false;
  sunlight.shadow.needsUpdate = true;
  for (let i = 0; i < 8; i++) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 6),
      new THREE.MeshBasicMaterial({ color: i < 4 ? 0xa5d7e3 : 0xffc17e }),
    );
    ball.visible = false;
    scene.add(ball);
    drops.push(ball);
  }
  let visible = true,
    raf = null,
    step = -1;
  const target = new THREE.Vector3(0, 3, 0);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const views = [
    { camera: [3.2, 2.55, 11.1], target: [0.2, 1.9, 1.4] },
    { camera: [9.5, 12.5, 11.5], target: [0, 4.9, -0.3] },
    { camera: [4.45, 8.05, 5.15], target: [0.25, 6.12, -0.35] },
    { camera: [-9.15, 8.2, 6.1], target: [-1.65, 4.92, -0.7] },
    { camera: [10.8, 8.25, 14.7], target: [0, 2.9, -0.1] },
  ];
  let currentProgress = 0;
  function requestDraw() {
    if (!raf) raf = requestAnimationFrame(render);
  }
  function render(now) {
    raf = null;
    if (!visible || document.hidden) return;
    camera.lookAt(target);
    if (step === 3 && !reduce.matches) {
      for (let i = 0; i < drops.length; i++) {
        drops[i].position.copy(
          pathCurves[i < 4 ? 0 : 1].getPointAt(
            (now * 0.00009 + (i % 4) / 4) % 1,
          ),
        );
      }
    }
    renderer.render(scene, camera);
    if (step === 3 && !reduce.matches) requestDraw();
  }
  function setProgress(value) {
    currentProgress = Math.max(0, Math.min(4, value));
    const start = Math.min(3, Math.floor(currentProgress));
    let fraction = currentProgress - start;
    fraction = fraction * fraction * (3 - 2 * fraction);
    const a = views[start],
      b = views[start + 1];
    const interpolate = (key, i) =>
      a[key][i] + (b[key][i] - a[key][i]) * fraction;
    target.set(...[0, 1, 2].map((i) => interpolate("target", i)));
    camera.position.set(...[0, 1, 2].map((i) => interpolate("camera", i)));
    if (viewport.clientWidth < 420)
      camera.position.sub(target).multiplyScalar(1.14).add(target);
    step = Math.round(currentProgress);
    drops.forEach((drop) => {
      drop.visible = step === 3 && !reduce.matches;
    });
    requestDraw();
  }
  function resize() {
    renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    setProgress(currentProgress);
  }
  new ResizeObserver(resize).observe(viewport);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) requestDraw();
    },
    { rootMargin: "100px" },
  ).observe(viewport);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestDraw();
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    visible = false;
    document.querySelector(".tour-loading").hidden = false;
    document.querySelector(".tour-loading").textContent =
      "Vista 3D interrumpida. Puedes seguir los pasos del recorrido.";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    visible = true;
    document.querySelector(".tour-loading").hidden = true;
    sunlight.shadow.needsUpdate = true;
    requestDraw();
  });
  camera.position.set(11, 10.4, 15);
  resize();
  requestDraw();
  return { setProgress };
}
