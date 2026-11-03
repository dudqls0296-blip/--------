# Three.js + GSAP Patterns for THE PRESS ROOM 3D

## 1. Zero-Build CDN 로드 구성 (`index.html`)

빌드 도구 없이 브라우저에서 바로 동작하도록 Three.js와 GSAP를 함께 로드합니다:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```
*(또는 ES Module 환경에서는 `<script type="importmap">`으로 `three@0.160.0` + `three/addons/` 사용 가능. 단, `file://` 직접 실행 호환성이 필요하면 UMD `three.min.js` + `gsap.min.js` 방식을 우선 권장합니다.)*

---

## 2. CORS-Safe Texture Loader (file:// 및 로컬 서버 겸용)

```javascript
function createEditorialTexture( THREE, item, fallbackRenderFn ) {
  var canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  var ctx = canvas.getContext("2d");

  // 1. 즉시 절차적 에디토리얼 그래픽 렌더링 (폴백 보장)
  if (typeof fallbackRenderFn === "function") {
    fallbackRenderFn(ctx, canvas.width, canvas.height, item);
  } else {
    ctx.fillStyle = "#16130F";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#C6A365";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
    ctx.fillStyle = "#F3EFE6";
    ctx.font = "600 44px 'Bodoni Moda', serif";
    ctx.fillText((item && item.title) || "THE PRESS ROOM", 72, 120);
  }

  var tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;

  // 2. 실사 이미지가 있고 file:// CORS 제한에 걸리지 않으면 덮어쓰기
  if (item && item.src) {
    var img = new Image();
    if (location.protocol !== "file:") {
      img.crossOrigin = "anonymous";
    }
    img.onload = function () {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        tex.needsUpdate = true;
      } catch (e) {
        // file:// tainted canvas 예외 무시 -> 절차적 텍스처 유지
      }
    };
    img.src = item.src;
  }
  return tex;
}
```

---

## 3. 카메라 리그 & 챕터 웨이포인트 전환 (Camera Rig + Mouse Parallax)

카메라 자체를 직접 마우스로 흔들면 GSAP 트윈과 충돌하므로, **`cameraRig` (Group) → `camera`** 계층으로 분리합니다:

```javascript
var cameraRig = new THREE.Group();
scene.add(cameraRig);
cameraRig.add(camera);

var lookTarget = new THREE.Vector3(0, 0, 0);

var WAYPOINTS = [
  // 01 Prologue: Vintage Camera Lens
  { pos: { x: 0.0, y: 0.2, z: 5.2 }, look: { x: 0.0, y: 0.1, z: 0.0 }, fov: 42 },
  // 02 About: The Editorial Desk
  { pos: { x: -3.2, y: 1.8, z: 4.6 }, look: { x: -1.2, y: 0.0, z: -1.5 }, fov: 45 },
  // 03 Our Work: 4 Floating Press Frames
  { pos: { x: 2.8, y: 0.5, z: 5.4 }, look: { x: 0.8, y: 0.2, z: -2.0 }, fov: 48 },
  // 04 Archive & 3D Annual Magazine
  { pos: { x: 0.0, y: 0.6, z: 3.8 }, look: { x: 0.0, y: 0.0, z: -4.5 }, fov: 40 },
  // 05 Epilogue: Letter & Wax Seal
  { pos: { x: 0.0, y: 2.6, z: 3.2 }, look: { x: 0.0, y: -0.4, z: 0.0 }, fov: 38 }
];

function transitionCameraToChapter(idx, duration) {
  var wp = WAYPOINTS[idx] || WAYPOINTS[0];
  var d = duration || 1.6;
  gsap.to(cameraRig.position, {
    x: wp.pos.x, y: wp.pos.y, z: wp.pos.z,
    duration: d, ease: "expo.inOut"
  });
  gsap.to(lookTarget, {
    x: wp.look.x, y: wp.look.y, z: wp.look.z,
    duration: d, ease: "expo.inOut"
  });
  gsap.to(camera, {
    fov: wp.fov, duration: d, ease: "expo.inOut",
    onUpdate: function () { camera.updateProjectionMatrix(); }
  });
}
```

---

## 4. 3D 핵심 오브젝트 프로시저럴 빌더 (외부 .glb 없이 즉시 생성)

외부 `.glb` 파일 다운로드 실패 위험 없이 Three.js 기본 지오메트리와 PBR 재질(`MeshStandardMaterial` / `MeshPhysicalMaterial`)만으로 정교한 프레스룸 오브젝트를 조립합니다:

1. **Twin-Lens Press Camera (롤라이플렉스 스타일)**:
   - 바디: 매트 블랙 가죽 질감 `BoxGeometry` + 브라스 골드(`#C6A365`) 테두리 `EdgesGeometry`
   - 상하 트윈 렌즈: `CylinderGeometry` 다단 적층 + 내부 조리개 링(`TorusGeometry`) + 유리 알갱이(`MeshPhysicalMaterial`, `roughness: 0.08, metalness: 0.9`)
2. **35mm Curved Film Strip (아카이브 헬릭스)**:
   - 곡선 경로를 따라 배치된 `PlaneGeometry` 프레임들과 상/하단 퍼포레이션(필름 구멍) 텍스처
   - 마우스 휠 또는 드래그로 필름 스트립이 회전하며 선택된 프레임이 전면 확대
3. **3D Annual Magazine (연말 잡지 하드커버 & 페이지 플립)**:
   - 책등(Spine) 피벗 그룹(`pivotGroup.rotation.y`)을 이용한 실제 표지 열림 애니메이션
   - 표지 텍스트: `THE PRESS ROOM — ANNUAL MAGAZINE 2026`
