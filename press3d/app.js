/* =====================================================================
   인덕대학교 총학생회 언론부 — 연말 잡지 3D 프레젠테이션
   한 책상 위에서 이어지는 6개의 장면
   Three.js r168 + GSAP 3.12 · zero-build (CDN ES modules)
   3D 모델/텍스처: Poly Haven (CC0)
   ===================================================================== */
// index.html을 더블클릭(file://)해도 실행되도록 일반 스크립트 + 동적 import 로 작성
(async () => {
const CDN = "https://cdn.jsdelivr.net/npm/three@0.168.0/";
const [THREE, { GLTFLoader }, { RGBELoader }, { CSS3DRenderer, CSS3DObject }, { EffectComposer }, { RenderPass }, { BokehPass }, { OutputPass }] = await Promise.all([
  import(CDN + "+esm"),
  import(CDN + "examples/jsm/loaders/GLTFLoader.js/+esm"),
  import(CDN + "examples/jsm/loaders/RGBELoader.js/+esm"),
  import(CDN + "examples/jsm/renderers/CSS3DRenderer.js/+esm"),
  import(CDN + "examples/jsm/postprocessing/EffectComposer.js/+esm"),
  import(CDN + "examples/jsm/postprocessing/RenderPass.js/+esm"),
  import(CDN + "examples/jsm/postprocessing/BokehPass.js/+esm"),
  import(CDN + "examples/jsm/postprocessing/OutputPass.js/+esm")
]);

const gsap = window.gsap;
const CFG = Object.assign({ year: "2026" }, window.PRESS_CONFIG || {});
const A = (p) => (window.ASSET_MAP && window.ASSET_MAP[p]) || p;   // 경로 교체 훅
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- 장면 목록 ---------- */
const PAGES = [
  { no: "01", title: "한 해를 기록하다" },
  { no: "02", title: "학교의 시간을 기록하는 사람들" },
  { no: "03", title: "한 권의 잡지가 완성되기까지" },
  { no: "04", title: "한 권에 담길 우리의 순간들" },
  { no: "05", title: "보이지 않는 곳에서도" },
  { no: "06", title: "기록은 계속됩니다" }
];

/* ---------- 교체 가능한 자료 (실제 사진이 생기면 경로만 바꾸면 됩니다) ---------- */
const ASSETS = {
  models: {
    camera: "press3d/models/pr3d-camera.glb",
    spectacles: "press3d/models/pr3d-spectacles.glb",
    binder: "press3d/models/pr3d-binder.glb",
    stationery: "press3d/models/pr3d-stationery.glb",
    lamp: "press3d/models/pr3d-oil-lamp.glb",
    books: "press3d/models/pr3d-books.glb"
  },
  wood: { map: "press3d/textures/pr3d-wood-diff.jpg", normal: "press3d/textures/pr3d-wood-nor.jpg", rough: "press3d/textures/pr3d-wood-rough.jpg" },
  hdr: "press3d/textures/pr3d-room.hdr",
  prints: ["images/pr-shoot-1.jpg", "images/pr-concert.jpg", "images/pr-graduation.jpg", "images/pr-track.jpg", "images/pr-stage-lights.jpg", "images/pr-prints-basket.jpg"],
  // 잡지 지면에 들어갈 사진 (현재는 예시 이미지)
  magazine: {
    cover: "images/pr-stage-lights.jpg",
    sections: ["images/pr-track.jpg", "images/pr-graduation.jpg", "images/pr-shoot-1.jpg", "images/pr-concert.jpg", "images/pr-prints-basket.jpg"]
  },
  // PAGE 05 실제 작업 사진 자리 (현재는 예시 이미지)
  work: ["images/pr-shoot-1.jpg", "images/pr-shoot-2.jpg", "images/pr-prints-cards.jpg"]
};
const SECTIONS = ["대학 축제와 체육대회", "학과별 주요 행사", "총학생회 활동 및 주요 소식", "학생들의 대학생활 이야기", "한 해를 마무리하는 기록"];

document.querySelectorAll("[data-cfg]").forEach((el) => { const v = CFG[el.dataset.cfg]; if (v) el.textContent = v; });

/* =====================================================================
   1. 렌더러 · 씬 · 카메라
   ===================================================================== */
const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const css = new CSS3DRenderer({ element: document.getElementById("css3d") });
css.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#120D09");
scene.fog = new THREE.Fog("#120D09", 1.4, 3.6);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.05, 10);   // 깊이 정밀도 확보 (얇은 종이 겹침 깜빡임 방지)
const rig = { pos: V(0.42, 1.5, 1.7), look: V(0.05, 0.02, -0.2) };
const lookNow = rig.look.clone();
camera.position.copy(rig.pos);
const focusPt = V(0, 0, 0);           // 피사계 심도 초점
const keyAim = V(0.02, 0, -0.02);     // 키라이트가 비추는 곳
const KEY_OFF = V(-0.85, 1.55, 0.75);

// 후처리 버퍼에도 MSAA(4x)를 걸어 가는 선·글자 가장자리의 지글거림을 없앤다
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio(), { samples: 4, type: THREE.HalfFloatType }));
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 0.85, aperture: 0.0018, maxblur: 0.006 });
composer.addPass(bokeh);
composer.addPass(new OutputPass());

/* =====================================================================
   2. 조명
   ===================================================================== */
const key = new THREE.SpotLight("#FFE3BD", 0, 6, 0.55, 0.85, 1.6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.00012;
key.shadow.normalBias = 0.015;
key.shadow.radius = 4;
key.shadow.camera.near = 0.4; key.shadow.camera.far = 4;
scene.add(key, key.target);
const fill = new THREE.HemisphereLight("#FFE9CC", "#2A1A10", 0);
scene.add(fill);
const lampLight = new THREE.PointLight("#FFB466", 0, 2.2, 1.8);
scene.add(lampLight);
const rim = new THREE.DirectionalLight("#9DB3D6", 0);
rim.position.set(1.2, 0.9, -1.4);
scene.add(rim);
const light = { key: 0, fill: 0, lamp: 0, env: 0, rim: 0, angle: 0.55 };

/* =====================================================================
   3. 공용 재질 · 텍스처
   ===================================================================== */
const manager = new THREE.LoadingManager();
const ldbar = document.getElementById("ldbar");
manager.onProgress = (_u, done, total) => { ldbar.style.width = Math.round((done / total) * 100) + "%"; };
const texLoader = new THREE.TextureLoader(manager);
const gltfLoader = new GLTFLoader(manager);
const MAXANI = renderer.capabilities.getMaxAnisotropy();
/* ---- 더블클릭(file://) 실행용 내장 자료: press3d/offline-assets.js ---- */
const OFF = window.PRESS_OFFLINE || null;
const offBuf = {};
function offBytes(p) {
  if (!OFF || !OFF[p]) return null;
  if (!offBuf[p]) { const b = atob(OFF[p]); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); offBuf[p] = u; }
  return offBuf[p];
}
const canDrawImages = location.protocol !== "file:" || !!OFF;
function loadTex(p, cb) {
  const bytes = offBytes(p);
  if (!bytes) return texLoader.load(A(p), cb, undefined, () => {});
  createImageBitmap(new Blob([bytes]), { imageOrientation: "flipY" }).then((bm) => { const t = new THREE.Texture(bm); t.flipY = false; t.needsUpdate = true; cb(t); }).catch(() => {});
}

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI;
  t.repaint = () => { draw(c.getContext("2d"), w, h); t.needsUpdate = true; };
  t.repaint();
  return t;
}
const repaintList = [];
function liveTex(w, h, draw) { const t = canvasTex(w, h, draw); repaintList.push(t); return t; }   // 폰트·사진 로드 후 다시 그림
let repaintTimer = 0;
function scheduleRepaint() { clearTimeout(repaintTimer); repaintTimer = setTimeout(() => repaintList.forEach((t) => t.repaint()), 250); }
function rand(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

const imgCache = {};
function img(src) {
  if (!canDrawImages) return null;
  if (!imgCache[src] && offBytes(src)) {
    imgCache[src] = { complete: false };
    createImageBitmap(new Blob([offBytes(src)])).then((bm) => { imgCache[src] = bm; bm.complete = true; bm.naturalWidth = bm.width; bm.naturalHeight = bm.height; scheduleRepaint(); }).catch(() => {});
  }
  if (!imgCache[src]) {
    const im = new Image(); im.decoding = "async";
    im.onload = scheduleRepaint;
    im.src = A(src); imgCache[src] = im;
  }
  const im = imgCache[src];
  return im.complete && im.naturalWidth ? im : null;
}

const paperCache = {};
function drawPaper(ctx, w, h, seed, tone = "#EFE6D2") {   // 종이 섬유 바탕은 한 번만 계산해 재사용
  const key = `${w}x${h}:${seed}:${tone}`;
  if (!paperCache[key]) { const c = document.createElement("canvas"); c.width = w; c.height = h; paintPaper(c.getContext("2d"), w, h, seed, tone); paperCache[key] = c; }
  ctx.drawImage(paperCache[key], 0, 0);
}
function paintPaper(ctx, w, h, seed, tone) {
  ctx.fillStyle = tone; ctx.fillRect(0, 0, w, h);
  const r = rand(seed), im = ctx.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(im, 0, 0);
  ctx.globalAlpha = 0.045; ctx.strokeStyle = "#6b5236"; ctx.lineWidth = 1;
  for (let i = 0; i < 380; i++) { const x = r() * w, y = r() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 26, y + (r() - 0.5) * 8); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,86,40,.16)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function drawPhoto(ctx, src, x, y, w, h, seed = 1) {
  const im = src && img(src);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (im) {
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight), iw = im.naturalWidth * s, ih = im.naturalHeight * s;
    ctx.filter = "sepia(.22) contrast(1.04) saturate(.9)";
    ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
    ctx.filter = "none";
  } else {
    const g = ctx.createRadialGradient(x + w * (0.3 + (seed % 3) * 0.2), y + h * 0.4, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.8);
    g.addColorStop(0, "#c9b79a"); g.addColorStop(0.5, "#5a4a3a"); g.addColorStop(1, "#16110c");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}
function greek(ctx, x, y, w, lines, lh = 22, seed = 3, color = "rgba(40,30,22,.32)") {
  const r = rand(seed); ctx.fillStyle = color;
  for (let i = 0; i < lines; i++) {
    const last = i === lines - 1, len = last ? w * (0.3 + r() * 0.4) : w * (0.86 + r() * 0.14);
    ctx.fillRect(x, y + i * lh, len, lh * 0.36);
  }
}
const SERIF = '"Noto Serif KR", serif', MONO = '"IBM Plex Mono", monospace', PEN = '"Nanum Pen Script", cursive';
function wrapText(ctx, text, maxW) {   // 어절(띄어쓰기) 단위 줄바꿈
  const out = []; let line = "";
  for (const word of text.split(" ")) {
    const t = line ? line + " " + word : word;
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
  }
  if (line) out.push(line); return out;
}

/* =====================================================================
   4. 책상 · 소품 (절차적)
   ===================================================================== */
const deskMat = new THREE.MeshStandardMaterial({ color: "#8a6a52", roughness: 0.55, metalness: 0 });
{
  const set = (t, srgb) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.6); t.anisotropy = MAXANI; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  loadTex(ASSETS.wood.map, (t) => { deskMat.map = set(t, true); deskMat.color.set("#ffffff"); deskMat.needsUpdate = true; });
  loadTex(ASSETS.wood.normal, (t) => { deskMat.normalMap = set(t); deskMat.normalScale.set(0.6, 0.6); deskMat.needsUpdate = true; });
  loadTex(ASSETS.wood.rough, (t) => { deskMat.roughnessMap = set(t); deskMat.roughness = 0.9; deskMat.needsUpdate = true; });
}
const desk = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.05, 1.5), deskMat);
desk.position.set(0.17, -0.025, -0.15);
desk.receiveShadow = true;
scene.add(desk);

const paperTex = (seed, tone) => canvasTex(1024, 1024, (ctx, w, h) => drawPaper(ctx, w, h, seed, tone));
const flatPlane = (w, h, segX = 1) => new THREE.PlaneGeometry(w, h, segX, 1).rotateX(-Math.PI / 2);

/* ---- PAGE 01 · 3단으로 접힌 표지 원고 ---- */
const SHEET_W = 0.42, SHEET_H = 0.297, PANEL = SHEET_W / 3;
const SHEET_HOME = { p: V(-0.02, 0.0016, 0.0), ry: -0.05 }, SHEET_AWAY = { p: V(-0.62, 0.0016, 0.3), ry: 0.42 };
const sheet = new THREE.Group();
sheet.position.copy(SHEET_HOME.p); sheet.rotation.y = SHEET_HOME.ry;
scene.add(sheet);
const sheetMat = new THREE.MeshStandardMaterial({ map: paperTex(11, "#F1E8D5"), roughness: 0.93, side: THREE.DoubleSide });
const panel = () => { const m = new THREE.Mesh(flatPlane(PANEL + 0.002, SHEET_H, 12), sheetMat); m.castShadow = m.receiveShadow = true; return m; };
sheet.add(panel());
const hingeR = new THREE.Group(); hingeR.position.x = PANEL / 2; sheet.add(hingeR);
const hingeL = new THREE.Group(); hingeL.position.x = -PANEL / 2; sheet.add(hingeL);
{ const r = panel(); r.position.set(PANEL / 2, 0.0004, 0); hingeR.add(r); const l = panel(); l.position.set(-PANEL / 2, 0.0008, 0); hingeL.add(l); }
const fold = { r: 0, l: 0 };

const coverEl = document.getElementById("tpl-cover").content.firstElementChild.cloneNode(true);
const coverObj = new CSS3DObject(coverEl);
coverObj.scale.setScalar(SHEET_W / 840);
coverObj.rotation.x = -Math.PI / 2;
coverObj.position.y = 0.0022;
sheet.add(coverObj);
coverEl.style.opacity = "0";

/* ---- 원고지 (400자, 20×20) ---- */
const MS = { w: 1024, h: 1448, mx: 70, my: 110, cols: 20, rows: 20 };
MS.cw = (MS.w - MS.mx * 2) / MS.cols; MS.pitch = (MS.h - MS.my * 2) / MS.rows;
function drawManuscript(ctx, w, h, seed) {
  drawPaper(ctx, w, h, seed, "#EEE4CE");
  ctx.strokeStyle = "rgba(122,36,40,.55)"; ctx.lineWidth = 2.2;
  ctx.strokeRect(MS.mx - 12, MS.my - 12, w - MS.mx * 2 + 24, h - MS.my * 2 + 24);
  ctx.lineWidth = 1.3;
  for (let r = 0; r < MS.rows; r++) {
    const y = MS.my + r * MS.pitch + (MS.pitch - MS.cw);
    for (let c = 0; c < MS.cols; c++) ctx.strokeRect(MS.mx + c * MS.cw, y, MS.cw, MS.cw);
  }
  ctx.fillStyle = "rgba(122,36,40,.7)"; ctx.font = `500 22px ${MONO}`; ctx.fillText("20 × 20", w - MS.mx - 92, h - 52);
}
const msTex = canvasTex(MS.w, MS.h, (ctx, w, h) => drawManuscript(ctx, w, h, 23));
const msMat = new THREE.MeshStandardMaterial({ map: msTex, roughness: 0.95, side: THREE.DoubleSide });
const ms1 = new THREE.Mesh(flatPlane(0.21, 0.297), msMat); ms1.position.set(0.17, 0.0007, -0.12); ms1.rotation.y = 0.32; ms1.receiveShadow = true; scene.add(ms1);
const ms2 = ms1.clone(); ms2.position.set(0.2, 0.0003, -0.135); ms2.rotation.y = 0.2; scene.add(ms2);

/* ---- 인화 사진 ---- */
const allPrints = [];
function makePrint(src, seed, w = 0.15, h = 0.1, polaroid = false) {
  const g = new THREE.Group();
  const bw = polaroid ? w + 0.012 : w + 0.012, bh = polaroid ? h + 0.034 : h + 0.012;
  const border = new THREE.Mesh(flatPlane(bw, bh), new THREE.MeshStandardMaterial({ color: "#EFE8DA", roughness: 0.55 }));
  border.castShadow = border.receiveShadow = true;
  const tex = canvasTex(900, Math.round(900 * h / w), (ctx, cw, ch) => drawPhoto(ctx, src, 0, 0, cw, ch, seed));
  repaintList.push(tex);
  const photo = new THREE.Mesh(flatPlane(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32 }));
  photo.position.set(0, 0.0003, polaroid ? -0.009 : 0); photo.receiveShadow = true;
  g.add(border, photo);
  allPrints.push(g);
  return g;
}
function setHome(o, x, y, z, ry) { o.userData.home = { p: V(x, y, z), ry }; o.position.set(x, y, z); o.rotation.y = ry; return o; }

// PAGE 01 책상 왼쪽의 사진
[[-0.33, -0.02, 0.38, 0], [-0.27, 0.085, -0.22, 1], [-0.36, 0.135, 0.12, 2], [0.36, -0.235, -0.5, 3]].forEach(([x, z, ry, i], k) => {
  scene.add(setHome(makePrint(ASSETS.prints[i], i), x, 0.0006 + k * 0.0005, z, ry));
});

/* ---- PAGE 02 · 하나씩 떨어지는 인화 사진 + 펼쳐지는 원고지 ---- */
const ZB = V(-0.82, 0, -0.02);
const prints2 = [[-1.02, 0.09, 0.22, 4], [-0.98, -0.18, -0.18, 2], [-0.69, -0.21, 0.3, 0], [-0.68, 0.17, -0.12, 5], [-1.1, -0.03, -0.4, 1]]
  .map(([x, z, ry, i], k) => { const p = makePrint(ASSETS.prints[i], 10 + k); setHome(p, x, 0.0012 + k * 0.0005, z, ry); scene.add(p); return p; });
const msB = new THREE.Group(); msB.position.set(-0.83, 0.002, 0.0); msB.rotation.y = 0.1; scene.add(msB);
const halfTex = (top) => { const t = msTex.clone(); t.repeat.set(1, 0.5); t.offset.set(0, top ? 0.5 : 0); t.needsUpdate = true; return t; };
const msBBottom = new THREE.Mesh(flatPlane(0.21, 0.1485), new THREE.MeshStandardMaterial({ map: halfTex(false), roughness: 0.95, side: THREE.DoubleSide }));
msBBottom.position.z = 0.1485 / 2; msBBottom.castShadow = msBBottom.receiveShadow = true; msB.add(msBBottom);
const msBHinge = new THREE.Group(); msB.add(msBHinge);
const msBTop = new THREE.Mesh(flatPlane(0.21, 0.1485), new THREE.MeshStandardMaterial({ map: halfTex(true), roughness: 0.95, side: THREE.DoubleSide }));
msBTop.position.set(0, 0.0004, -0.1485 / 2); msBTop.castShadow = msBTop.receiveShadow = true; msBHinge.add(msBTop);
const foldB = { t: 1 };

/* ---- PAGE 03 · STEP 1 자료 수집 (카메라 곁의 사진과 필름) ---- */
const prints3 = [[0.5, 0.2, -0.35, 1], [0.56, -0.02, 0.25, 3], [0.62, 0.17, 0.05, 2]]
  .map(([x, z, ry, i], k) => { const p = makePrint(ASSETS.prints[i], 20 + k, 0.12, 0.08); setHome(p, x, 0.0012 + k * 0.0005, z, ry); scene.add(p); return p; });
function filmTexture() {
  return canvasTex(2048, 256, (ctx, w, h) => {
    ctx.fillStyle = "#1a120b"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e0b37a";
    for (let x = 12; x < w; x += 32) { ctx.fillRect(x, 14, 16, 22); ctx.fillRect(x, h - 36, 16, 22); }
    for (let f = 0; f < 6; f++) {
      const x = 40 + f * 334;
      drawPhoto(ctx, ASSETS.prints[f % ASSETS.prints.length], x, 54, 300, h - 108, f);
      ctx.fillStyle = "rgba(160,96,40,.35)"; ctx.fillRect(x, 54, 300, h - 108);     // 네거티브 앰버 톤
    }
    ctx.fillStyle = "rgba(224,179,122,.85)"; ctx.font = `500 16px ${MONO}`;
    for (let f = 0; f < 6; f++) ctx.fillText(`PRESS 400  ${f + 12}A`, 50 + f * 334, h - 6);
  });
}
const filmTex = filmTexture(); repaintList.push(filmTex);
const filmGeo = new THREE.PlaneGeometry(0.42, 0.035, 80, 1);
{ const p = filmGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.max(0, x - 0.12) ** 2 * 1.4); } filmGeo.rotateX(-Math.PI / 2); filmGeo.translate(0.21, 0, 0); filmGeo.computeVertexNormals(); }
const film = new THREE.Mesh(filmGeo, new THREE.MeshPhysicalMaterial({ map: filmTex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide }));
film.position.set(0.38, 0.0025, 0.27); film.rotation.y = 0.16; film.castShadow = true;
scene.add(film);
const filmRoll = { t: 1 };

/* ---- PAGE 03 · STEP 2 원고 작성 (원고지 위 손글씨, 실제 HTML 텍스트) ---- */
const msW = new THREE.Mesh(flatPlane(0.21, 0.297), new THREE.MeshStandardMaterial({ map: canvasTex(MS.w, MS.h, (c, w, h) => drawManuscript(c, w, h, 31)), roughness: 0.95, side: THREE.DoubleSide }));
msW.position.set(0.68, 0.0012, -0.14); msW.rotation.y = 0.1; msW.receiveShadow = msW.castShadow = true;
scene.add(msW);
const WRITE = [[0, 1, "행사 기록과 학생들의 이야기,"], [1, 0, "주요 활동 내용을 정리하고"], [2, 0, "잡지 원고를 작성합니다."]];
const msEl = document.createElement("div"); msEl.className = "ms-type";
const chars = [];
WRITE.forEach(([row, col0, text]) => {
  [...text].forEach((ch, i) => {
    const c = col0 + i, s = document.createElement("span");
    s.className = "ch"; s.textContent = ch === " " ? "" : ch;
    s.style.left = MS.mx + c * MS.cw + "px"; s.style.top = MS.my + row * MS.pitch + (MS.pitch - MS.cw) + "px";
    s.style.width = s.style.height = MS.cw + "px";
    msEl.appendChild(s);
    chars.push({ el: s, row, col: c, blank: ch === " " });
  });
});
const msObj = new CSS3DObject(msEl);
msObj.scale.setScalar(0.21 / MS.w); msObj.rotation.x = -Math.PI / 2; msObj.position.y = 0.0006;
msW.add(msObj);
const writing = { n: 0, shown: -1 };
const cellLocal = (k) => { const c = chars[Math.min(chars.length - 1, Math.max(0, k))]; return V((MS.mx + (c.col + 0.5) * MS.cw) / MS.w * 0.21 - 0.105, 0.002, (MS.my + c.row * MS.pitch + MS.pitch - MS.cw / 2) / MS.h * 0.297 - 0.1485); };

/* ---- 잡지 지면 디자인 (캔버스: 사진 영역 + 실제 폰트로 조판한 제목) ---- */
const PW = 1024, PH = 1448;
function pageCover(ctx, w, h) {
  drawPaper(ctx, w, h, 41, "#F2EADA");
  ctx.fillStyle = "#16110C"; ctx.font = `500 22px ${MONO}`;
  ctx.fillText(`${CFG.year} 연말호`, 70, 92); ctx.textAlign = "right"; ctx.fillText("VOL.01", w - 70, 92); ctx.textAlign = "left";
  ctx.fillRect(70, 112, w - 140, 3);
  ctx.font = `900 300px ${SERIF}`; ctx.fillText("기록", 58, 420);
  ctx.font = `500 40px ${SERIF}`; ctx.fillText("우리가 함께한 순간들", 74, 498);
  drawPhoto(ctx, ASSETS.magazine.cover, 70, 560, w - 140, 640, 2);
  ctx.fillStyle = "#6E2230"; ctx.fillRect(70, 1250, 90, 4);
  ctx.fillStyle = "#16110C"; ctx.font = `700 36px ${SERIF}`; ctx.fillText("인덕대학교 총학생회 언론부", 70, 1316);
  ctx.font = `400 20px ${MONO}`; ctx.fillStyle = "#5B4632"; ctx.fillText("예시 이미지", w - 200, 1236);
}
function pageContents(ctx, w, h) {
  drawPaper(ctx, w, h, 43, "#F1E9D8");
  ctx.fillStyle = "#16110C"; ctx.font = `900 96px ${SERIF}`; ctx.fillText("목차", 80, 230);
  ctx.fillStyle = "#6E2230"; ctx.fillRect(84, 270, 80, 4);
  SECTIONS.forEach((t, i) => {
    const y = 420 + i * 170;
    ctx.fillStyle = "#8A6A34"; ctx.font = `italic 400 64px ${SERIF}`; ctx.fillText(`0${i + 1}`, 80, y);
    ctx.fillStyle = "#16110C"; ctx.font = `700 40px ${SERIF}`; ctx.fillText(t, 210, y - 8);
    ctx.fillStyle = "rgba(40,30,22,.35)"; ctx.fillRect(210, y + 26, w - 300, 1.5);
    ctx.font = `500 22px ${MONO}`; ctx.textAlign = "right"; ctx.fillStyle = "#5B4632"; ctx.fillText(String(6 + i * 14).padStart(3, "0"), w - 80, y - 8); ctx.textAlign = "left";
  });
  greek(ctx, 80, 1300, w - 160, 3, 26, 44);
}
function pageSection(i) {
  return (ctx, w, h) => {
    drawPaper(ctx, w, h, 50 + i, "#F2EADA");
    ctx.fillStyle = "#8A6A34"; ctx.font = `italic 400 210px ${SERIF}`; ctx.fillText(`0${i + 1}`, 64, 250);
    ctx.fillStyle = "#16110C"; ctx.font = `900 76px ${SERIF}`;
    wrapText(ctx, SECTIONS[i], w - 150).forEach((l, k) => ctx.fillText(l, 70, 370 + k * 92));
    drawPhoto(ctx, ASSETS.magazine.sections[i], 70, 560, w - 140, 560, i);
    ctx.fillStyle = "rgba(243,237,224,.9)"; ctx.font = `400 20px ${MONO}`; ctx.fillText("예시 이미지", 90, 1100);
    greek(ctx, 70, 1170, w - 140, 6, 30, 60 + i);
    ctx.fillStyle = "#5B4632"; ctx.font = `500 22px ${MONO}`; ctx.fillText(String(6 + i * 14).padStart(3, "0"), 70, h - 60);
  };
}
function pageArticle(i) {
  return (ctx, w, h) => {
    drawPaper(ctx, w, h, 70 + i, "#F1E9D8");
    ctx.fillStyle = "#5B4632"; ctx.font = `500 22px ${MONO}`; ctx.fillText(`0${i + 1} · ${SECTIONS[i]}`, 70, 96);
    ctx.fillRect(70, 116, w - 140, 1.5);
    ctx.fillStyle = "#6E2230"; ctx.font = `900 140px ${SERIF}`; ctx.fillText("“", 70, 300);
    ctx.fillStyle = "rgba(40,30,22,.55)"; greek(ctx, 170, 210, w - 260, 3, 46, 80 + i, "rgba(40,30,22,.55)");
    const colW = (w - 180) / 2;
    greek(ctx, 70, 420, colW, 24, 30, 90 + i);
    drawPhoto(ctx, ASSETS.magazine.sections[(i + 2) % 5], 110 + colW, 420, colW, 380, i + 3);
    greek(ctx, 110 + colW, 840, colW, 12, 30, 100 + i);
    ctx.fillStyle = "#5B4632"; ctx.font = `500 22px ${MONO}`; ctx.textAlign = "right"; ctx.fillText(String(5 + i * 14).padStart(3, "0"), w - 70, h - 60); ctx.textAlign = "left";
  };
}
function pageBack(ctx, w, h) {
  ctx.fillStyle = "#5C1C27"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(0,0,0,.18)"; for (let i = 0; i < 4000; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  ctx.fillStyle = "#C9A25E"; ctx.font = `700 34px ${SERIF}`; ctx.textAlign = "center"; ctx.fillText("인덕대학교 총학생회 언론부", w / 2, h - 170);
  ctx.font = `500 20px ${MONO}`; ctx.fillText(`${CFG.year} · VOL.01`, w / 2, h - 120); ctx.textAlign = "left";
}
const pageTex = (draw) => liveTex(PW, PH, draw);
const sectionTex = SECTIONS.map((_, i) => pageTex(pageSection(i)));

/* ---- PAGE 03 · STEP 3 펼쳐지는 지면 시안 ---- */
const MAG = V(1.14, 0, 0.02);           // 잡지가 놓이는 자리 (책등 위치)
const SRC = V(1.34, 0, 0.27);           // 시안 묶음이 처음 놓인 자리
const FAN = [[0.92, -0.17, 0.08], [1.14, -0.19, -0.03], [1.36, -0.16, -0.1], [1.02, 0.13, -0.06], [1.25, 0.14, 0.05]];
const layouts = sectionTex.map((t, i) => {
  const m = new THREE.Mesh(flatPlane(0.21, 0.297), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide }));
  m.castShadow = m.receiveShadow = true; scene.add(m); return m;
});
const layoutState = (m, i, mode) => {   // mode: src | fan | bind
  if (mode === "fan") return { p: V(FAN[i][0], 0.0016 + i * 0.0004, FAN[i][1]), ry: FAN[i][2] };
  if (mode === "bind") return { p: V(MAG.x + 0.105, 0.0016 + i * 0.0006, MAG.z), ry: 0 };
  return { p: V(SRC.x, 0.0016 + i * 0.0006, SRC.z), ry: 0.32 + i * 0.02 };
};

/* ---- PAGE 04 · 실제로 넘어가는 3D 잡지 ---- */
const LW = 0.21, LH = 0.297, NLEAF = 6, SEG = 28;
const book = new THREE.Group(); book.position.copy(MAG); scene.add(book);
const leafDraw = [
  [pageCover, pageContents],
  [pageSection(0), pageArticle(0)],
  [pageSection(1), pageArticle(1)],
  [pageSection(2), pageArticle(2)],
  [pageSection(3), pageArticle(3)],
  [pageSection(4), pageBack]
];
const leaves = leafDraw.map(([fd, bd], i) => {
  const geo = new THREE.PlaneGeometry(LW, LH, SEG, 1); geo.rotateX(-Math.PI / 2); geo.translate(LW / 2, 0, 0);
  const ft = i === 0 ? pageTex(fd) : sectionTex[i - 1];
  const bt = pageTex(bd); bt.wrapS = THREE.RepeatWrapping; bt.repeat.x = -1; bt.offset.x = 1;
  const front = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: ft, roughness: i === 0 ? 0.45 : 0.85, side: THREE.FrontSide }));
  const back = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.85, side: THREE.BackSide }));
  front.castShadow = back.castShadow = true; front.receiveShadow = back.receiveShadow = true;
  front.userData.leaf = back.userData.leaf = i;
  book.add(front, back);
  return { geo, t: 0, last: -1, dir: 1, front, back };
});
const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(LW, 0.004, LH), new THREE.MeshStandardMaterial({ color: "#E9E0CD", roughness: 0.9 }));
pageBlock.position.set(LW / 2, -0.0021, 0); pageBlock.castShadow = pageBlock.receiveShadow = true; book.add(pageBlock);
const spread = { k: 0 };
function updateLeaf(L, i) {
  if (L.t === L.last) return;
  L.dir = L.t >= L.last ? 1 : -1; L.last = L.t;
  const th = L.t * Math.PI, curl = Math.sin(th) * 0.9 * L.dir;
  const yR = (NLEAF - i) * 0.0009, yL = (i + 1) * 0.0009, y0 = yR + (yL - yR) * L.t;
  const xs = [0], ys = [0], ds = LW / SEG;
  for (let j = 1; j <= SEG; j++) { const ph = th - curl * ((j - 0.5) / SEG); xs[j] = xs[j - 1] + Math.cos(ph) * ds; ys[j] = ys[j - 1] + Math.sin(ph) * ds; }
  const p = L.geo.attributes.position;
  for (let v = 0; v < p.count; v++) { const j = v % (SEG + 1); p.setX(v, xs[j]); p.setY(v, ys[j] + y0); }
  p.needsUpdate = true; L.geo.computeVertexNormals(); L.geo.computeBoundingSphere();
}
function flipTo(k, dur = 1.1, tl = null, at = 0) {
  k = Math.max(0, Math.min(NLEAF - 1, k));
  const tw = [];
  leaves.forEach((L, i) => {
    const target = i < k ? 1 : 0;
    if (L.t !== target) tw.push([L, target, i]);
  });
  tw.sort((a, b) => (k > spread.k ? a[2] - b[2] : b[2] - a[2]));
  tw.forEach(([L, target], n) => {
    const v = gsap.to(L, { t: target, duration: dur, ease: "power2.inOut", delay: n * 0.16 });
    if (tl) tl.add(v, at + n * 0.16);
  });
  spread.k = k;
  updateCopyList();
}

/* ---- PAGE 05 · 작업 사진 자리 (폴라로이드) ---- */
const polaroids = [[-0.06, 0.29, 0.16], [0.13, 0.31, -0.1], [0.6, 0.3, 0.22]]
  .map(([x, z, ry], k) => { const p = makePrint(ASSETS.work[k], 30 + k, 0.085, 0.085, true); setHome(p, x, 0.0026 + k * 0.0004, z, ry); scene.add(p); return p; });

/* 정리된 사진 더미 (PAGE 06) */
allPrints.forEach((p, i) => {
  const left = i % 2 === 0, n = Math.floor(i / 2);
  p.userData.tidy = { p: V(left ? -0.5 : 0.52, 0.002 + n * 0.0007, left ? -0.12 : 0.16), ry: (left ? 0.12 : -0.18) + ((i * 37) % 7 - 3) * 0.012 };
});

/* =====================================================================
   5. 실사 3D 모델 (GLB)
   ===================================================================== */
const models = {};
let offPending = 0;
function offDone() { if (OFF && --offPending <= 0) setTimeout(start, 250); }
function prepare(root) {
  root.traverse((o) => { if (!o.isMesh) return; o.castShadow = o.receiveShadow = true; if (o.material && o.material.map) o.material.map.anisotropy = 8; });
  return root;
}
function place(name, fn) {
  const done = (g) => { const r = prepare(g.scene); models[name] = r; fn(r); if (!r.parent) scene.add(r); offDone(); };
  const fail = () => { console.warn("model missing:", name); offDone(); };
  const bytes = offBytes(ASSETS.models[name]);
  if (bytes) { offPending++; gltfLoader.parse(bytes.buffer.slice(0), "", done, fail); }
  else gltfLoader.load(A(ASSETS.models[name]), done, undefined, fail);
}
place("camera", (r) => { r.position.set(0.335, 0, 0.06); r.rotation.y = -0.72; });
place("spectacles", (r) => { r.position.set(-0.235, 0, 0.215); r.rotation.y = 0.55; });
place("binder", (r) => { r.traverse((o) => { if (o.isMesh && o.name === "binder_notebook") o.visible = false; }); r.position.set(-0.27, 0, -0.33); r.rotation.y = 0.3; });
const pen = { holder: null, len: 0.14, TIP: -1 };
place("stationery", (r) => {
  let mesh = null;
  r.traverse((o) => { if (o.isMesh) { if (o.name === "stationery_supplies_pen_fancy") mesh = o; else o.visible = false; } });
  if (!mesh) return;
  const box = new THREE.Box3().setFromObject(mesh), c = box.getCenter(V(0, 0, 0)), sz = box.getSize(V(0, 0, 0));
  r.position.set(-c.x, -c.y, -c.z);
  pen.len = Math.max(sz.x, sz.z); pen.axisZ = sz.z > sz.x; pen.radius = sz.y / 2;
  const holder = new THREE.Group(); holder.rotation.order = "YXZ";
  const axis = new THREE.Group(); if (pen.axisZ) axis.rotation.y = Math.PI / 2;   // 펜 길이 방향을 로컬 X축으로 통일
  axis.add(r); holder.add(axis); scene.add(holder);
  pen.holder = holder;
});
place("lamp", (r) => {
  r.scale.setScalar(0.62); r.position.set(-0.47, 0, -0.5);
  r.traverse((o) => {
    if (!o.isMesh) return;
    if (/flame/.test(o.material.name)) { o.material.emissive = new THREE.Color("#FFB25A"); o.material.emissiveIntensity = 0; o.castShadow = false; models.flame = o.material; }
    if (/glass/.test(o.material.name)) { o.material.transparent = true; o.material.opacity = 0.35; o.material.roughness = 0.05; o.castShadow = false; }
  });
  lampLight.position.set(-0.47, 0.29, -0.5);
});
place("books", (r) => { r.position.set(0.12, 0, -0.62); r.rotation.y = -0.06; });
const onHdr = (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr; scene.environmentIntensity = 0; scene.environmentRotation = new THREE.Euler(0, 1.2, 0);
};
if (offBytes(ASSETS.hdr)) {
  try {
    const d = new RGBELoader().parse(offBytes(ASSETS.hdr).buffer.slice(0));
    const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
    t.colorSpace = THREE.LinearSRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = true; t.needsUpdate = true;
    onHdr(t);
  } catch (e) { console.warn("hdr", e); }
} else new RGBELoader(manager).load(A(ASSETS.hdr), onHdr, undefined, () => {});

/* ---- 만년필 포즈: 쉬는 자리 ↔ 원고지 위에서 쓰는 자세 ---- */
const PEN_REST1 = { p: V(0.235, 0, 0.13), yaw: 0.55, tilt: 0 };
const PEN_REST2 = { p: V(0.71, 0.0012, -0.03), yaw: 1.0, tilt: 0 };
const penCtl = { phase: 0 };          // 0 = 쉬는 자리1, 1 = 쓰는 중, 2 = 쉬는 자리2
const _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, "YXZ"), _v = V(0, 0, 0), _w = V(0, 0, 0);
function penRestPose(rest) { return { p: V(rest.p.x, (pen.radius || 0.005) + rest.p.y, rest.p.z), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rest.yaw, rest.tilt, "YXZ")) }; }
function penWritePose(cell) {
  const tip = msW.localToWorld(cellLocal(cell).clone());
  const yaw = pen.TIP < 0 ? -0.62 : Math.PI - 0.62, tilt = -pen.TIP * 0.62;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, tilt, "YXZ"));
  const off = V(pen.TIP * pen.len / 2, 0, 0).applyQuaternion(q);
  return { p: tip.sub(off), q };
}
function updatePen(t) {
  if (!pen.holder) return;
  msW.updateMatrixWorld();
  const ph = penCtl.phase; let a, b, u;
  if (ph <= 1) { a = penRestPose(PEN_REST1); b = penWritePose(0); u = ph; }
  else { a = penWritePose(chars.length - 1); b = penRestPose(PEN_REST2); u = ph - 1; }
  if (Math.abs(ph - 1) < 1e-4) {
    const n = writing.n, w = penWritePose(Math.floor(n));
    pen.holder.position.copy(w.p); pen.holder.position.y += Math.abs(Math.sin(n * Math.PI)) * 0.004;
    pen.holder.quaternion.copy(w.q);
    return;
  }
  const s = u * u * (3 - 2 * u);
  pen.holder.position.lerpVectors(a.p, b.p, s); pen.holder.position.y += Math.sin(s * Math.PI) * 0.05;
  pen.holder.quaternion.slerpQuaternions(a.q, b.q, s);
}

/* =====================================================================
   6. 장면 연출 공용 도구
   ===================================================================== */
const SHOT = {
  p1: { pos: V(0.03, 0.565, 0.44), look: V(0.02, 0, -0.01), focus: V(0, 0, 0), aim: V(0.02, 0, -0.02) },
  p2: { pos: V(-0.6, 0.6, 0.56), look: V(-0.64, 0, -0.04), focus: V(-0.84, 0, -0.02), aim: V(-0.84, 0, -0.02) },
  p3: [
    { pos: V(0.27, 0.5, 0.62), look: V(0.24, 0, 0.1), focus: V(0.42, 0, 0.1), aim: V(0.45, 0, 0.1) },
    { pos: V(0.585, 0.27, 0.0), look: V(0.6, 0, -0.245), focus: V(0.64, 0, -0.25), aim: V(0.66, 0, -0.18) },
    { pos: V(1.04, 0.74, 0.52), look: V(1.0, 0, -0.03), focus: V(1.14, 0, -0.02), aim: V(1.14, 0, -0.02) },
    { pos: V(1.13, 0.5, 0.45), look: V(1.1, 0, 0.03), focus: V(1.24, 0, 0.02), aim: V(1.24, 0, 0.02) }
  ],
  p4: { pos: V(1.09, 0.66, 0.5), look: V(0.99, 0, -0.01), focus: V(1.14, 0, 0.02), aim: V(1.14, 0, 0.02) },
  p5a: { pos: V(1.26, 0.66, 0.8), look: V(0.92, 0, -0.04), focus: V(0.85, 0, 0), aim: V(0.85, 0, 0) },
  p5b: { pos: V(-0.78, 0.66, 0.78), look: V(-0.52, 0, -0.04), focus: V(-0.6, 0, 0), aim: V(-0.6, 0, 0) },
  p6: { pos: V(-0.1, 0.5, 0.47), look: V(-0.16, 0, 0.03), focus: V(0, 0, 0.02), aim: V(0, 0, 0.02) }
};
let tl = null;
function camTo(t, shot, dur = 2.8, at = 0, lift = 0.16, ease = "power3.inOut") {
  const p0 = rig.pos.clone(), l0 = rig.look.clone(), f0 = focusPt.clone(), a0 = keyAim.clone();
  const c = p0.clone().lerp(shot.pos, 0.5); c.y += lift;
  const o = { u: 0 };
  t.to(o, {
    u: 1, duration: reduce ? Math.min(dur, 0.8) : dur, ease,
    onUpdate() {
      const u = o.u, iu = 1 - u;
      rig.pos.set(iu * iu * p0.x + 2 * iu * u * c.x + u * u * shot.pos.x, iu * iu * p0.y + 2 * iu * u * c.y + u * u * shot.pos.y, iu * iu * p0.z + 2 * iu * u * c.z + u * u * shot.pos.z);
      rig.look.lerpVectors(l0, shot.look, u);
      focusPt.lerpVectors(f0, shot.focus, u);
      keyAim.lerpVectors(a0, shot.aim, u);
    }
  }, at);
}
function setShot(shot) { rig.pos.copy(shot.pos); rig.look.copy(shot.look); focusPt.copy(shot.focus); keyAim.copy(shot.aim); }
function dropIn(t, obj, at, dur = 1.0) {
  const h = obj.userData.home;
  obj.visible = false;
  t.set(obj, { visible: true }, at)
   .fromTo(obj.position, { x: h.p.x + 0.04, y: h.p.y + 0.26, z: h.p.z - 0.06 }, { x: h.p.x, y: h.p.y, z: h.p.z, duration: dur, ease: "power2.in" }, at)
    .fromTo(obj.rotation, { x: -0.5, y: h.ry + 0.8, z: 0.3 }, { x: 0, y: h.ry, z: 0, duration: dur, ease: "power2.out" }, at)
    .to(obj.position, { y: h.p.y + 0.004, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.out" }, at + dur);
}
function placeAt(obj, st, visible = true) { obj.position.copy(st.p); obj.rotation.set(0, st.ry, 0); obj.visible = visible; }

/* ---- 장면별 본문 (HTML) ---- */
const copyEl = document.getElementById("copy"), scrimEl = document.getElementById("scrim");
const STEPS = [
  ["자료 수집", "한 해 동안 진행된 학교 행사와 학생들의 활동 사진, 관련 자료를 수집합니다."],
  ["글과 이야기 정리", "행사 기록과 학생들의 이야기, 주요 활동 내용을 정리하고 잡지 원고를 작성합니다."],
  ["편집 및 디자인", "사진과 글을 조합하고 페이지별 레이아웃을 구성해 잡지 디자인을 완성합니다."],
  ["최종 제작", "전체 원고와 디자인을 검토하고 최종 인쇄 및 발행을 준비합니다."]
];
const TASKS = ["행사 사진 선별", "원고 작성", "사진과 글 편집", "페이지 디자인", "시안 검토", "최종 결과물 제작"];
const COPY = {
  1: { side: "right", html: `<div class="kick rv">PAGE 02 · 언론부 소개</div>
      <h2 class="rv">학교의 시간을<br>기록하는 사람들</h2>
      <p class="rv">언론부는 인덕대학교 총학생회 소속 부서로, 한 해 동안 학교에서 일어난 다양한 행사와 학생들의 이야기를 수집하고 기록합니다.</p>
      <p class="rv">사진과 글을 통해 지나간 순간들을 보존하고, 연말에는 그 기록들을 모아 한 권의 잡지로 제작합니다.</p>` },
  2: { side: "left", html: `<div class="kick rv">PAGE 03 · 제작 과정</div>
      <h2 class="rv">한 권의 잡지가<br>완성되기까지</h2>
      <ol class="rv" data-list>${STEPS.map(([t, d], i) => `<li><b>STEP 0${i + 1}</b><span>${t}</span><em>${d}</em></li>`).join("")}</ol>` },
  3: { side: "left", html: `<div class="kick rv">PAGE 04 · 잡지 미리보기</div>
      <h2 class="rv">한 권에 담길<br>우리의 순간들</h2>
      <ol class="rv" data-list>${SECTIONS.map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join("")}</ol>
      <div class="hint rv">잡지를 클릭하거나 → 키로 페이지를 넘길 수 있습니다</div>
      <div class="note rv">※ 지면의 사진은 예시 이미지이며, 실제 행사 사진과 완성된 디자인으로 교체됩니다.</div>` },
  4: { side: "left", html: `<div class="kick rv">PAGE 05 · 제작 현장</div>
      <h2 class="rv">보이지 않는 곳에서도<br>기록은 만들어집니다</h2>
      <ol class="rv" data-list>${TASKS.map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join("")}</ol>
      <div class="note rv">※ 책상 앞쪽의 사진 자리는 실제 작업 사진으로 교체됩니다. (현재 예시 이미지)</div>` },
  5: { side: "left", cls: "end", html: `<div class="end-lines">
        <p class="rv">지나간 순간은 추억이 되고,<br>우리가 남긴 기록은 또 하나의 이야기가 됩니다.</p>
        <p class="rv">인덕대학교 총학생회 언론부는<br>앞으로도 학교의 다양한 순간을 기록하고 전달하겠습니다.</p></div>
      <div class="name rv" data-name><i></i><strong>인덕대학교 총학생회 언론부</strong><small>${CFG.year} · 한 권의 기록</small></div>` }
};
let copyTimer = 0;
function setCopy(pageIdx) {
  clearTimeout(copyTimer);
  copyEl.classList.remove("in");
  const c = COPY[pageIdx];
  scrimEl.className = "scrim" + (c ? " " + (c.side === "center" ? "center" : c.side) : "");
  copyTimer = setTimeout(() => {
    copyEl.className = "copy" + (c ? " " + c.side + (c.cls ? " " + c.cls : "") : "");
    copyEl.innerHTML = c ? c.html : "";
    copyEl.querySelectorAll(".rv").forEach((el, i) => { el.style.transitionDelay = (0.12 + i * 0.12) + "s"; });
    if (pageIdx === 5) { const n = copyEl.querySelector("[data-name]"); if (n) n.style.transitionDelay = "3.6s"; }
    updateCopyList();
    requestAnimationFrame(() => requestAnimationFrame(() => copyEl.classList.add("in")));
  }, 380);
}
function updateCopyList() {
  const ol = copyEl.querySelector("[data-list]"); if (!ol) return;
  const items = [...ol.children];
  let on = -1;
  if (page === 2) on = step;
  else if (page === 3) on = Math.max(0, spread.k - 1);
  else if (page === 4) on = taskOn;
  items.forEach((li, i) => li.classList.toggle("on", page === 4 ? i <= on : i === on));
}

/* =====================================================================
   7. 상태 스냅 (장면 건너뛰기·되돌아가기)
   ===================================================================== */
let page = 0, step = 0, taskOn = -1;
function snapTo(i, s = 0) {
  gsap.killTweensOf([fold, foldB, filmRoll, writing, penCtl, light, ...leaves]);
  allPrints.forEach((p) => { gsap.killTweensOf(p.position); gsap.killTweensOf(p.rotation); });
  layouts.forEach((m) => { gsap.killTweensOf(m.position); gsap.killTweensOf(m.rotation); });
  gsap.killTweensOf(sheet.position); gsap.killTweensOf(sheet.rotation); gsap.killTweensOf(book.position); gsap.killTweensOf(book.rotation);

  // PAGE 01 표지
  const away = i >= 5;
  placeAt(sheet, away ? SHEET_AWAY : SHEET_HOME);
  fold.r = fold.l = 1;
  coverEl.style.opacity = away ? "0" : "1";
  const sp = coverEl.querySelectorAll("h1 span"); gsap.set(sp, { clipPath: "inset(0 0% 0 0)" });
  gsap.set(coverEl.querySelector(".rule"), { width: 120 }); gsap.set(coverEl.querySelectorAll(".sub,.foot"), { opacity: 1, y: 0 });
  // PAGE 02
  prints2.forEach((p) => placeAt(p, p.userData.home, i >= 1));
  foldB.t = i >= 1 ? 0 : 1; msB.visible = i >= 1;
  // PAGE 03
  const p3 = (k) => i > 2 || (i === 2 && s >= k);
  prints3.forEach((p) => placeAt(p, p.userData.home, p3(0)));
  filmRoll.t = p3(0) ? 1 : 0; film.visible = p3(0);
  msW.visible = i >= 2;
  writing.n = p3(1) ? chars.length : 0;
  penCtl.phase = p3(1) ? 2 : 0;
  layouts.forEach((m, k) => {
    const mode = i === 2 && s === 2 ? "fan" : "src";
    placeAt(m, layoutState(m, k, mode), i === 2 && s <= 2);
  });
  // 잡지
  book.visible = p3(3);
  const center = i >= 5;
  book.position.set(center ? -LW / 2 : MAG.x, 0, center ? 0.02 : MAG.z); book.rotation.set(0, 0, 0);
  const k = i === 3 ? Math.max(1, spread.k) : i === 4 ? 1 : 0;
  leaves.forEach((L, n) => { L.t = n < k ? 1 : 0; }); spread.k = k;
  // PAGE 05
  polaroids.forEach((p) => placeAt(p, p.userData.home, i >= 4));
  // PAGE 06 정리
  if (i >= 5) allPrints.forEach((p) => { if (p.visible || i >= 5) placeAt(p, p.userData.tidy, true); });
  else allPrints.filter((p) => !prints2.includes(p) && !prints3.includes(p) && !polaroids.includes(p)).forEach((p) => placeAt(p, p.userData.home, true));
  Object.assign(light, i >= 5 ? { key: 1.25, fill: 0.45, lamp: 0.55, env: 0.5, rim: 0.5, angle: 0.3 } : { key: 1, fill: 1, lamp: 1, env: 1, rim: 1, angle: 0.55 });
}

/* =====================================================================
   8. 장면 진입 연출
   ===================================================================== */
const D = reduce ? 0.3 : 1;
function enter(i, s, forward) {
  if (tl) tl.kill();
  tl = gsap.timeline();
  const prevPage = page;
  page = i; step = s; renderHud();
  document.getElementById("hudTop").classList.add("on"); document.getElementById("hudBottom").classList.add("on");
  if (prevPage !== i || i === 0) setCopy(i);
  else updateCopyList();

  if (!forward) {                                 // 되돌아가거나 건너뛸 때: 상태를 맞추고 카메라만 이동
    snapTo(i, s);
    if (i === 3) flipTo(1, 0.01);
    const shot = i === 0 ? SHOT.p1 : i === 1 ? SHOT.p2 : i === 2 ? SHOT.p3[s] : i === 3 ? SHOT.p4 : i === 4 ? SHOT.p5b : SHOT.p6;
    camTo(tl, shot, 2.2, 0, 0.12);
    if (i === 4) { taskOn = TASKS.length - 1; updateCopyList(); }
    coverVisible(i);
    return;
  }
  ({ 0: enterP1, 1: enterP2, 2: enterP3, 3: enterP4, 4: enterP5, 5: enterP6 })[i](s);
  coverVisible(i);
}
// 표지 지면의 HTML 글자는 1·5장에서만 보이게 (다른 장면에서 본문과 겹치지 않도록)
function coverVisible(i) { if (i !== 0) coverEl.style.opacity = i === 4 ? "1" : "0"; }

/* PAGE 01 — 인트로 */
const SHEET_END = SHOT.p1;
function playIntro(replay) {
  const h1 = coverEl.querySelectorAll("h1 span"), rule = coverEl.querySelector(".rule"), sub = coverEl.querySelector(".sub"), foot = coverEl.querySelector(".foot");
  gsap.set(h1, { clipPath: "inset(0 100% 0 0)" }); gsap.set(rule, { width: 0 }); gsap.set([sub, foot], { opacity: 0, y: 8 });
  coverEl.style.opacity = "0";
  fold.r = fold.l = 0;
  if (!replay) {
    rig.pos.set(0.42, 1.5, 1.7); rig.look.set(0.05, 0.02, -0.2); lookNow.copy(rig.look);
    Object.assign(light, { key: 0, fill: 0, lamp: 0, env: 0, rim: 0, angle: 0.55 });
    tl.to(light, { lamp: 1, duration: 1.4 * D, ease: "steps(6)" }, 0.2)
      .to(light, { env: 1, fill: 1, rim: 1, duration: 2.6 * D, ease: "power1.inOut" }, 0.6)
      .to(light, { key: 1, duration: 2.2 * D, ease: "power2.out" }, 1.1);
    camTo(tl, SHEET_END, 5.4, 0.3, 0.05);
  } else camTo(tl, SHEET_END, 2.4, 0, 0.12);
  const T = replay ? 0.4 : 3.6 * D;
  tl.to(fold, { r: 1, duration: 1.15 * D, ease: "power3.inOut" }, T)
    .to(fold, { l: 1, duration: 1.15 * D, ease: "power3.inOut" }, T + 0.6 * D)
    .add(() => { coverEl.style.opacity = "1"; }, T + 1.4 * D)
    .to(h1[0], { clipPath: "inset(0 0% 0 0)", duration: 1.15 * D, ease: "power2.inOut" }, T + 1.5 * D)
    .to(h1[1], { clipPath: "inset(0 0% 0 0)", duration: 1.15 * D, ease: "power2.inOut" }, T + 2.15 * D)
    .to(rule, { width: 120, duration: 0.8 * D, ease: "power3.out" }, T + 2.95 * D)
    .to(sub, { opacity: 1, y: 0, duration: 1 * D, ease: "power2.out" }, T + 3.1 * D)
    .to(foot, { opacity: 1, y: 0, duration: 1 * D, ease: "power2.out" }, T + 3.4 * D)
    .add(() => { document.getElementById("hudTop").classList.add("on"); document.getElementById("hudBottom").classList.add("on"); }, replay ? 0 : 6.2 * D);
}
function enterP1() { snapTo(0); playIntro(introDone); introDone = true; }
let introDone = false;

/* PAGE 02 — 사진 인화물이 하나씩, 원고지가 펼쳐진다 */
function enterP2() {
  snapTo(0);
  camTo(tl, SHOT.p2, 3.2 * D, 0, 0.22);
  msB.visible = true; foldB.t = 1;
  prints2.forEach((p, k) => { p.visible = false; dropIn(tl, p, (1.6 + k * 0.42) * D, 0.95 * D); });
  tl.to(foldB, { t: 0, duration: 1.3 * D, ease: "power3.inOut" }, 3.0 * D);
}

/* PAGE 03 — 4단계 */
function enterP3(s) {
  if (s === 0) {
    snapTo(1);
    camTo(tl, SHOT.p3[0], 3.4 * D, 0, 0.2);
    prints3.forEach((p, k) => { p.visible = false; dropIn(tl, p, (1.9 + k * 0.38) * D, 0.9 * D); });
    film.visible = true; filmRoll.t = 0;
    tl.to(filmRoll, { t: 1, duration: 1.6 * D, ease: "power3.out" }, 2.4 * D);
    layouts.forEach((m, k) => placeAt(m, layoutState(m, k, "src")));
  } else if (s === 1) {
    snapTo(2, 0);
    camTo(tl, SHOT.p3[1], 2.4 * D, 0, 0.08);
    writing.n = 0; penCtl.phase = 0;
    tl.to(penCtl, { phase: 1, duration: 1.3 * D, ease: "none" }, 0.9 * D)
      .to(writing, { n: chars.length - 0.001, duration: 5.2 * D, ease: "none" }, 2.2 * D)
      .to(penCtl, { phase: 2, duration: 1.2 * D, ease: "none" }, 7.6 * D);
  } else if (s === 2) {
    snapTo(2, 1);
    camTo(tl, SHOT.p3[2], 2.6 * D, 0, 0.18);
    layouts.forEach((m, k) => {
      const a = layoutState(m, k, "src"), b = layoutState(m, k, "fan"), at = (1.2 + k * 0.32) * D;
      placeAt(m, a);
      tl.to(m.position, { x: b.p.x, z: b.p.z, duration: 1.3 * D, ease: "power3.inOut" }, at)
        .to(m.position, { y: b.p.y + 0.07, duration: 0.65 * D, ease: "sine.out", yoyo: true, repeat: 1 }, at)
        .to(m.rotation, { y: b.ry, x: 0, duration: 1.3 * D, ease: "power3.inOut" }, at)
        .fromTo(m.rotation, { z: 0 }, { z: (k % 2 ? 1 : -1) * 0.35, duration: 0.65 * D, yoyo: true, repeat: 1, ease: "sine.inOut" }, at);
    });
  } else {
    snapTo(2, 2);
    camTo(tl, SHOT.p3[3], 2.4 * D, 0, 0.1);
    book.visible = false; leaves.forEach((L) => { L.t = 0; }); spread.k = 0;
    layouts.forEach((m, k) => {
      const b = layoutState(m, k, "bind"), at = (0.6 + k * 0.22) * D;
      tl.to(m.position, { x: b.p.x, z: b.p.z, duration: 1.1 * D, ease: "power3.inOut" }, at)
        .to(m.position, { y: b.p.y + 0.05, duration: 0.55 * D, ease: "sine.out", yoyo: true, repeat: 1 }, at)
        .to(m.rotation, { y: 0, duration: 1.1 * D, ease: "power3.inOut" }, at);
    });
    // 묶이는 순간: 종이 더미가 한 권의 잡지로
    tl.add(() => { layouts.forEach((m) => { m.visible = false; }); book.visible = true; book.position.set(MAG.x, 0.03, MAG.z); }, 2.75 * D)
      .to(book.position, { y: 0, duration: 0.5 * D, ease: "bounce.out" }, 2.75 * D)
      .to(light, { key: 1.5, duration: 0.15, yoyo: true, repeat: 1 }, 2.75 * D);
  }
}

/* PAGE 04 — 잡지를 중심으로 천천히 회전, 클릭으로 페이지 넘김 */
function enterP4() {
  snapTo(2, 3);
  const r = 0.62, o = { a: -1.25 }, l0 = rig.look.clone(), p0 = rig.pos.clone(), f0 = focusPt.clone();
  const cx = MAG.x + LW / 2, cz = MAG.z;
  tl.to(o, {
    a: 0, duration: 5.2 * D, ease: "power2.inOut",
    onUpdate() {
      const u = 1 - Math.abs(o.a) / 1.25, orbit = V(cx + Math.sin(o.a) * r, 0.42 + (1 - u) * 0.1, cz + Math.cos(o.a) * r);
      const w = Math.min(1, u * 1.6);
      rig.pos.lerpVectors(p0, orbit, w).lerp(SHOT.p4.pos, u * u);
      rig.look.lerpVectors(l0, V(cx, 0, cz), w).lerp(SHOT.p4.look, u * u);
      focusPt.lerpVectors(f0, V(cx, 0, cz), w); keyAim.copy(focusPt);
    }
  }, 0);
  tl.add(() => flipTo(1, 1.3 * D), 4.6 * D);
}

/* PAGE 05 — 작업 공간을 따라 천천히 이동 */
function enterP5() {
  snapTo(3);
  flipTo(1, 0.01);
  taskOn = -1;
  camTo(tl, SHOT.p5a, 2.6 * D, 0, 0.22);
  polaroids.forEach((p, k) => { p.visible = false; dropIn(tl, p, (1.0 + k * 0.35) * D, 0.9 * D); });
  camTo(tl, SHOT.p5b, 14 * D, 2.6 * D, 0.04, "sine.inOut");
  TASKS.forEach((_, k) => tl.add(() => { taskOn = k; updateCopyList(); }, (2.8 + k * 2.1) * D));
}

/* PAGE 06 — 잡지가 닫히고, 조명이 잡지에 모인다 */
function enterP6() {
  snapTo(4);
  taskOn = TASKS.length - 1;
  camTo(tl, SHOT.p6, 4.2 * D, 0.2, 0.28);
  tl.add(() => flipTo(0, 1.1 * D), 0.2);
  tl.to(sheet.position, { x: SHEET_AWAY.p.x, z: SHEET_AWAY.p.z, duration: 1.6 * D, ease: "power3.inOut" }, 0.3)
    .to(sheet.rotation, { y: SHEET_AWAY.ry, duration: 1.6 * D, ease: "power3.inOut" }, 0.3)
    .add(() => { coverEl.style.opacity = "0"; }, 0.3)
    .to(book.position, { x: -LW / 2, z: 0.02, duration: 2.2 * D, ease: "power3.inOut" }, 1.4 * D)
    .to(book.position, { y: 0.06, duration: 1.1 * D, ease: "sine.out", yoyo: true, repeat: 1 }, 1.4 * D);
  allPrints.forEach((p, k) => {
    if (!p.visible) return;
    const t = p.userData.tidy, at = (0.8 + k * 0.09) * D;
    tl.to(p.position, { x: t.p.x, y: t.p.y, z: t.p.z, duration: 1.5 * D, ease: "power3.inOut" }, at)
      .to(p.rotation, { y: t.ry, duration: 1.5 * D, ease: "power3.inOut" }, at);
  });
  tl.to(light, { fill: 0.45, env: 0.5, lamp: 0.55, rim: 0.5, key: 1.25, angle: 0.3, duration: 3 * D, ease: "power2.inOut" }, 2.4 * D);
}

/* =====================================================================
   9. HUD · 발표 컨트롤
   ===================================================================== */
const segs = document.getElementById("segs");
PAGES.forEach((p, i) => {
  const b = document.createElement("button"); b.className = "seg"; b.innerHTML = `${p.no}<span>${p.title}</span>`;
  b.addEventListener("click", (e) => { e.stopPropagation(); jump(i); }); segs.appendChild(b);
});
const toastEl = document.getElementById("toast");
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove("show"), 2200); }
function renderHud() {
  [...segs.children].forEach((s, i) => s.classList.toggle("on", i <= page));
  document.getElementById("chNo").textContent = `PAGE ${PAGES[page].no} / 06` + (page === 2 ? ` · STEP 0${step + 1}` : "");
  document.getElementById("chTitle").textContent = PAGES[page].title;
  document.getElementById("prev").disabled = page === 0 && step === 0;
  document.getElementById("next").disabled = page === 5;
}
function next() {
  if (!started) return;
  if (page === 2 && step < 3) return enter(2, step + 1, true);
  if (page === 3 && spread.k < NLEAF - 1) return flipTo(spread.k + 1);
  if (page < 5) return enter(page + 1, 0, true);
}
function prev() {
  if (!started) return;
  if (page === 3 && spread.k > 1) return flipTo(spread.k - 1);
  if (page === 2 && step > 0) return enter(2, step - 1, false);
  if (page > 0) return enter(page - 1, page - 1 === 2 ? 3 : 0, false);
}
function jump(i) { if (!started || i === page) return; if (i === page + 1) enter(i, 0, true); else enter(i, 0, false); }
document.getElementById("next").addEventListener("click", (e) => { e.stopPropagation(); next(); });
document.getElementById("prev").addEventListener("click", (e) => { e.stopPropagation(); prev(); });
addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (["ArrowRight", "PageDown", " ", "Enter", "ArrowDown"].includes(e.key)) { e.preventDefault(); if (!e.repeat) next(); }
  else if (["ArrowLeft", "PageUp", "ArrowUp", "Backspace"].includes(e.key)) { e.preventDefault(); if (!e.repeat) prev(); }
  else if (/^[1-6]$/.test(e.key)) { const i = +e.key - 1; if (i === 0 && page === 0) { tl && tl.kill(); tl = gsap.timeline(); playIntro(true); } else jump(i); }
  else if (e.key === "f" || e.key === "F") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}); }
  else if (e.key === "Home") jump(0);
  else if (e.key === "End") jump(5);
});
// 화면 클릭: 잡지 장면에서는 페이지 넘김, 그 외에는 다음 장면
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  if (page === 3) {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(leaves.flatMap((L) => [L.front, L.back]), false)[0];
    if (hit) { const lx = book.worldToLocal(hit.point.clone()).x; return lx < 0 ? (spread.k > 1 ? flipTo(spread.k - 1) : null) : (spread.k < NLEAF - 1 ? flipTo(spread.k + 1) : next()); }
  }
  next();
});
let touchX = 0;
addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 60) (dx < 0 ? next : prev)(); }, { passive: true });
renderHud();

/* =====================================================================
   10. 루프
   ===================================================================== */
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener("pointermove", (e) => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; });
const clock = new THREE.Clock();
const tmp = V(0, 0, 0);
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const flick = 0.98 + Math.sin(t * 1.7) * 0.012 + Math.sin(t * 2.9 + 1.2) * 0.008;   // 아주 느리고 약한 불꽃 흔들림
  lampLight.intensity = light.lamp * 0.9 * flick;
  if (models.flame) models.flame.emissiveIntensity = light.lamp * 5 * flick;
  key.intensity = light.key * 9; key.angle = light.angle;
  key.target.position.copy(keyAim); key.position.copy(keyAim).add(KEY_OFF);
  fill.intensity = light.fill * 0.22;
  rim.intensity = light.rim * 0.6;
  scene.environmentIntensity = light.env * 0.42;

  // 접힌 종이
  hingeR.rotation.z = Math.PI * 0.985 * (1 - fold.r);
  hingeL.rotation.z = -Math.PI * 0.97 * (1 - fold.l);
  hingeR.position.y = Math.sin(fold.r * Math.PI) * 0.006;
  hingeL.position.y = 0.0012 * (1 - fold.l) + Math.sin(fold.l * Math.PI) * 0.006;
  msBHinge.rotation.x = Math.PI * 0.985 * foldB.t;
  msBHinge.position.y = Math.sin(foldB.t * Math.PI) * 0.004 + 0.0004;
  film.scale.x = Math.max(0.001, filmRoll.t);
  // 손글씨
  const n = Math.ceil(writing.n);
  if (n !== writing.shown) { chars.forEach((c, k) => c.el.classList.toggle("on", k < n)); writing.shown = n; }
  updatePen(t);
  msObj.visible = msW.visible;
  // 잡지
  leaves.forEach(updateLeaf);

  // 카메라
  pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 2.5);
  pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 2.5);
  if (Math.abs(pointer.x - pointer.sx) < 1e-4) pointer.sx = pointer.x;
  if (Math.abs(pointer.y - pointer.sy) < 1e-4) pointer.sy = pointer.y;
  tmp.copy(rig.pos);
  tmp.x += pointer.sx * 0.02;
  tmp.y += -pointer.sy * 0.012;
  // 목표에 거의 닿으면 딱 멈춰서, 정지 화면에서 글자·선이 미세하게 떨리지 않게 한다
  if (camera.position.distanceToSquared(tmp) < 1e-10) camera.position.copy(tmp); else camera.position.lerp(tmp, 1 - Math.pow(0.0006, dt));
  if (lookNow.distanceToSquared(rig.look) < 1e-10) lookNow.copy(rig.look); else lookNow.lerp(rig.look, 1 - Math.pow(0.0006, dt));
  camera.lookAt(lookNow);
  bokeh.uniforms.focus.value = camera.position.distanceTo(focusPt);

  composer.render(dt);
  css.render(scene, camera);
  requestAnimationFrame(frame);
}
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  camera.aspect = a;
  camera.fov = a < 1.2 ? 32 + (1.2 - a) * 30 : 32;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h); composer.setSize(w, h); css.setSize(w, h);
}
addEventListener("resize", resize); resize();

/* =====================================================================
   11. 시작
   ===================================================================== */
// 첫 화면 전에 다른 장면 소품은 숨겨 둔다
snapTo(0);
let started = false;
function start() {
  if (started) return; started = true;
  const ld = document.getElementById("loader");
  ld.style.opacity = "0"; setTimeout(() => ld.remove(), 1300);
  tl = gsap.timeline(); playIntro(false); introDone = true;
}
manager.onLoad = () => setTimeout(start, 250);
manager.onError = () => {};
setTimeout(start, 12000);
if (document.fonts) Promise.all(["900 80px 'Noto Serif KR'", "700 40px 'Noto Serif KR'", "500 20px 'IBM Plex Mono'", "italic 400 80px 'Noto Serif KR'", "40px 'Nanum Pen Script'"].map((f) => document.fonts.load(f))).then(scheduleRepaint).catch(() => {});
window.__press = { page: () => page, enter, snapTo, flipTo, pen, rig, light, leaves, spread };
frame();
})().catch((e) => {
  console.error(e);
  const t = document.getElementById("ldtxt");
  if (t) t.textContent = "3D를 불러오지 못했습니다 — 인터넷 연결을 확인해 주세요";
});
