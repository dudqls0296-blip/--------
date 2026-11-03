---
name: press-3d-webgl
description: >-
  Use this skill when building, upgrading, or modifying the 3D Press Department
  (언론부) presentation website using Three.js, WebGL, CSS3D, or GSAP camera
  choreography. Provides ready-to-use 3D Press Room scene architecture, camera
  rig waypoints, 3D magazine/film-strip builders, and CORS-safe texture loaders.
---

# 3D Press Room WebGL & Camera Choreography Skill (`press-3d-webgl`)

언론부 3D 소개 발표 홈페이지를 제작하거나 개선할 때 이 스킬의 절차와 아키텍처를 따르세요.

## 1. 하이브리드 3D 레이어 아키텍처 (WebGL + Crispy HUD)

빔프로젝터 및 고해상도 모니터에서 **3D 공간감**과 **한글 타이포그래피 가독성**을 동시에 확보하기 위해 반드시 3중 레이어 구조를 사용합니다:

1. **Layer 0 — WebGL Canvas (`#webgl-stage`)**:
   - `position: fixed; inset: 0; z-index: 0; pointer-events: none;` (인터랙티브 오브젝트 피킹 시에만 Raycaster 사용)
   - 암실(Darkroom) 공간 조명, 부유하는 먼지 입자(Dust Particles), 챕터별 핵심 3D 오브젝트 렌더링
2. **Layer 1 — Editorial Slide Overlay (`.stage > .deck > .page`)**:
   - 16:9 기준 컨테이너(`100cqw`) 또는 뷰포트 그리드 위에 배치된 한글/영문 타이포그래피와 인터랙티브 카드
   - 챕터 전환 시 WebGL 카메라 트래블링과 동기화되어 등장/퇴장
3. **Layer 2 — Global Transitions & HUD (`.hud`, `#iris`, `#flash`, `.grain`)**:
   - 상/하단 챕터 인디케이터, 페이지 번호 롤러(`01 / 05`), 조리개(Iris) 및 카메라 플래시 오버레이

---

## 2. 5-Chapter 3D 카메라 워킹 & 오브젝트 설계

각 챕터(`idx: 0 ~ 4`)는 고유한 3D 카메라 좌표(`camPos`), 응시점(`lookAt`), 조명 색상, 중심 3D 아티팩트를 가집니다.

| 챕터 | 3D 중심 오브젝트 (Hero Artifact) | 카메라 무브먼트 (Camera Rig) | 조명 & 분위기 |
| :--- | :--- | :--- | :--- |
| **01 Prologue** | 빈티지 트윈렌즈 카메라(Rollei 모티프) & 렌즈 경통 | 렌즈 정면 클로즈업에서 서서히 풀샷으로 줌아웃(`z: 4.2 → 6.5`) | 텅스텐 스팟라이트(`#F3DFAE`) + 금빛 먼지 입자 |
| **02 About** | 편집실 데스크(The Desk) — 원고지, 만년필, 프레스 배지 | 데스크 상단 사선 부감 뷰(`x: -2.8, y: 2.2, z: 4.8`) | 따뜻한 앰버 데스크 램프(`#D48C46`) |
| **03 Our Work** | 4개의 3D 인화 사진 프레임(PHOTO/VIDEO/CONTENT/COMM) | 아치형 갤러리 레일을 따라 패닝(`x: 0, y: 0.4, z: 5.5`) | 카메라 셔터 플래시 + 콘트라스트 키라이트 |
| **04 Archive & Magazine** | 나선형 35mm 필름 스트립 & **3D 오픈 연말 매거진** | 필름 스트립을 통과해 중앙의 3D 연말 잡지 표지/펼침면으로 돌진 | 영사기 백라이트 + 아카이브 핀스팟 |
| **05 Epilogue** | 편지 봉투 & 3D 붉은 왁스 실링(Wax Seal `P` 각인) | 편지 위에서 수직 하강하며 실링이 찍히는 모션(`y: 3.5 → 1.8`) | 로우키 비네팅 + 골드/크림슨 림라이트 |

---

## 3. CORS-Safe 텍스처 로딩 (필수 규칙)

사용자가 `index.html`을 더블클릭(`file://`)으로 열더라도 검은 화면이나 WebGL 보안 에러가 나지 않아야 합니다:
1. **Canvas 절차적 텍스처 우선 생성**:
   - `window.PressPhotos` 또는 2D Canvas로 고품질 에디토리얼 플레이스홀더(필름 프레임, 그레인, 스펙 텍스트 포함)를 즉시 생성해 `new THREE.CanvasTexture(canvas)`로 먼저 바인딩합니다.
2. **비동기 실사 이미지 업그레이드**:
   - `img.crossOrigin = "anonymous"` 설정 후 `images/pr-*.jpg` 로드를 시도하고, `onload` 성공 시에만 텍스처를 교체합니다 (`onerror` 시 Canvas 폴백 유지).

구체적인 Three.js 코드 템플릿과 셰이더/카메라 리그 구현은 [threejs-patterns.md](./references/threejs-patterns.md)를 읽고 적용하세요.
