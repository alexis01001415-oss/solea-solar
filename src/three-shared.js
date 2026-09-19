import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE };
let modelPromise;
export async function getHeater(width = 3.5, floor = false) {
  modelPromise ??= new GLTFLoader().loadAsync(
    `${import.meta.env.BASE_URL}models/solar-heater.glb`,
  );
  const { scene } = await modelPromise;
  const model = scene.clone(true);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model, true);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scale = width / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  model.position.set(
    -center.x * scale,
    -(floor ? box.min.y : center.y) * scale,
    -center.z * scale,
  );
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = child.material.clone();
      child.material.envMapIntensity = 1.6;
    }
  });
  const group = new THREE.Group();
  group.add(model);
  return group;
}

export function makeRenderer(canvas, { alpha = false, shadows = true } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 1.75),
  );
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

export function addLighting(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff8dd, 0x77745b, 2.1));
  const sun = new THREE.DirectionalLight(0xffefd0, 4.2);
  sun.position.set(-4, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 0.1,
    far: 35,
  });
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe3ecff, 1.7);
  fill.position.set(4, 2, -3);
  scene.add(fill);
  return sun;
}
