# Three.js + GSAP Full 3D Press Room Architecture Template

이 문서는 `press-room-3d-master` 스킬에서 사용하는 3D WebGL 프레스룸 씬 코드 패턴입니다.

## 1. 카메라 리그 + 마우스 패럴랙스 + 5챕터 웨이포인트

```javascript
(function initPressRoom3D() {
  if (!window.THREE || !window.gsap) return;
  var THREE = window.THREE, G = window.gsap;

  var canvas = document.getElementById("webgl");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "webgl";
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
    var stage = document.getElementById("stage") || document.body;
    stage.insertBefore(canvas, stage.firstChild);
  }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0a08, 0.085);

  var camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100);
  var cameraRig = new THREE.Group();
  cameraRig.position.set(0, 0.2, 5.2);
  cameraRig.add(camera);
  scene.add(cameraRig);

  var lookTarget = new THREE.Vector3(0, 0.1, 0);

  // 조명: 텅스텐 키라이트 + 골드 림라이트 + 왁스 레드 포인트
  var ambLight = new THREE.AmbientLight(0xf3efe6, 0.35);
  scene.add(ambLight);

  var keyLight = new THREE.SpotLight(0xf3dfae, 2.2, 25, Math.PI / 4, 0.5, 1.5);
  keyLight.position.set(3.5, 5.0, 5.5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  var rimLight = new THREE.PointLight(0xb5442f, 1.1, 15);
  rimLight.position.set(-4.0, -1.5, -2.0);
  scene.add(rimLight);

  // 챕터별 카메라 웨이포인트 (01 ~ 05)
  var WAYPOINTS = [
    { pos: { x: 0.0, y: 0.15, z: 4.8 }, look: { x: 0.0, y: 0.05, z: 0.0 }, fov: 40 },
    { pos: { x: -2.6, y: 1.65, z: 4.4 }, look: { x: -1.4, y: 0.0, z: -1.2 }, fov: 44 },
    { pos: { x: 2.5, y: 0.4, z: 5.0 }, look: { x: 1.2, y: 0.1, z: -1.8 }, fov: 46 },
    { pos: { x: 0.0, y: 0.55, z: 3.6 }, look: { x: 0.0, y: 0.0, z: -4.2 }, fov: 38 },
    { pos: { x: 0.0, y: 2.4, z: 3.0 }, look: { x: 0.0, y: -0.5, z: 0.0 }, fov: 36 }
  ];

  window.Press3D = {
    goToChapter: function (idx, dur) {
      var wp = WAYPOINTS[idx] || WAYPOINTS[0];
      var d = dur != null ? dur : 1.5;
      G.to(cameraRig.position, { x: wp.pos.x, y: wp.pos.y, z: wp.pos.z, duration: d, ease: "expo.inOut" });
      G.to(lookTarget, { x: wp.look.x, y: wp.look.y, z: wp.look.z, duration: d, ease: "expo.inOut" });
      G.to(camera, {
        fov: wp.fov, duration: d, ease: "expo.inOut",
        onUpdate: function () { camera.updateProjectionMatrix(); }
      });
    }
  };
})();
```

## 2. 3D 연말 매거진 (Annual Magazine Book Group) 빌더

```javascript
function build3DMagazine(THREE, coverTex, spreadLeftTex, spreadRightTex) {
  var bookGroup = new THREE.Group();

  // 뒷표지/바닥 페이지
  var pageGeo = new THREE.BoxGeometry(1.6, 2.2, 0.04);
  var paperMat = new THREE.MeshStandardMaterial({ color: 0xf3efe6, roughness: 0.65 });
  var rightBlock = new THREE.Mesh(pageGeo, [
    paperMat, paperMat, paperMat, paperMat,
    new THREE.MeshStandardMaterial({ map: spreadRightTex, roughness: 0.5 }),
    paperMat
  ]);
  rightBlock.position.set(0.8, 0, 0);
  bookGroup.add(rightBlock);

  // 앞표지 피벗 (책등 기준 회전하여 열림)
  var coverPivot = new THREE.Group();
  coverPivot.position.set(0, 0, 0.02);
  var coverMat = new THREE.MeshStandardMaterial({ color: 0x16120e, roughness: 0.4, metalness: 0.15 });
  var coverMesh = new THREE.Mesh(pageGeo, [
    coverMat, coverMat, coverMat, coverMat,
    new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ map: spreadLeftTex, roughness: 0.5 })
  ]);
  coverMesh.position.set(0.8, 0, 0);
  coverPivot.add(coverMesh);
  bookGroup.add(coverPivot);

  bookGroup.userData.coverPivot = coverPivot;
  return bookGroup;
}
```
