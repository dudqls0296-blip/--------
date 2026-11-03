---
name: press-room-3d-master
description: Build, upgrade, and polish the 3D Press Department (인덕대학교 총학생회 언론부 - THE PRESS ROOM) introduction and annual magazine presentation website. Always trigger this skill whenever the user mentions 언론부, THE PRESS ROOM, PRESS DEPARTMENT, 3D 발표 홈페이지, 연말 잡지 (Annual Magazine), 프레스룸, or asks to create/edit/upgrade their 3D interactive web presentation, Three.js/GSAP camera transitions, or editorial slide deck.
---

# THE PRESS ROOM 3D — 인덕대학교 총학생회 언론부 3D 발표 홈페이지 마스터 스킬

이 스킬은 **인덕대학교 총학생회 언론부(THE PRESS ROOM / PRESS DEPARTMENT)** 3D 소개 발표 홈페이지를 제작·업그레이드할 때 필요한 모든 도메인 지식, 에셋 경로, 에디토리얼 디자인 시스템, Three.js + GSAP 3D 카메라 워킹 아키텍처를 제공합니다.

---

## 1. 프로젝트 경로 및 핵심 도메인 정보

- **로컬 프로젝트 폴더**: `C:\Users\VR25\Documents\GitHub\언론부 발표자료`
  - `press-room/index.html`, `press-room/css/style.css`, `press-room/js/app.js`, `press-room/js/config.js`, `press-room/js/photos.js` — 인터랙티브 프레스룸 발표 덱 (`THE PRESS ROOM`)
  - `presentation/index.html` (`v1-dark` ~ `v4-amber`) — 프레젠테이션 슬라이드 덱 (`PRESS DEPARTMENT`)
  - `index.html` — 언론부 스크롤형 매거진 홈페이지
- **발표자 및 기본 설정 (`window.PRESS_CONFIG`)**:
  - 소속: 인덕대학교 총학생회 언론부 (`Induk University Student Council — The Press Room`)
  - 발표자: `김영빈` (`총학생회 언론부장`), 연도: `2026`
- **보유 실사 에셋 (`press-room/images/` 내 16종 JPG)**:
  - 카메라/데스크: `pr-camera-rollei.jpg`, `pr-camera-rollei-close.jpg`, `pr-pen-lamp.jpg`, `pr-pen-nib.jpg`, `pr-paper.jpg`
  - 취재/행사 현장: `pr-concert.jpg`, `pr-stage-lights.jpg`, `pr-track.jpg`, `pr-graduation.jpg`, `pr-shoot-1.jpg`, `pr-shoot-2.jpg`
  - 인화물/아카이브: `pr-news-stack.jpg`, `pr-news-wall.jpg`, `pr-prints-basket.jpg`, `pr-prints-cards.jpg`, `pr-prints-envelope.jpg`

---

## 2. 5단계 발표 서사 및 3D 공간 연출 (5-Chapter 3D Narrative)

각 페이지는 **WebGL 3D 공간(Three.js)**과 **선명한 에디토리얼 HTML/SVG HUD 레이어**가 결합된 하이브리드 구조로 동작합니다:

1. **01 Prologue (첫 화면 — 암실과 렌즈)**
   - **슬로건**: *"우리는, 학교의 순간을 기록합니다."* / *"학교의 오늘을 기록하고, 그 기록을 한 권의 잡지로 남깁니다."*
   - **3D 연출**: 어두운 암실(Darkroom) 속 금빛 먼지 입자(Dust Particles)와 빈티지 롤라이 트윈렌즈 카메라. 렌즈 클로즈업에서 시작해 서서히 줌아웃하며 만년필 잉크 마스크 애니메이션 재생.
2. **02 Chapter I — About (소개 — 편집실 데스크)**
   - **헤드라인**: *"We keep the moments."* — *"학교의 오늘을 모아, 내일의 기억으로 남깁니다."*
   - **3대 기둥**:
     1. `i. Role — 역할 (기록하는 사람들)`: 교내 행사와 활동, 학생자치기구 사업과 학우들의 이야기를 현장에서 기록·정리
     2. `ii. Purpose — 목적 (잇는 사람들)`: 흩어지는 순간을 하나의 이야기로 엮어 학우와 총학생회를 연결
     3. `iii. Direction — 방향 (남기는 사람들)`: 한 해의 기록을 **연말 잡지**로 완성해 다시 꺼내 볼 수 있는 학교의 아카이브 구축
   - **3D 연출**: 카메라가 편집실 데스크(원고지, 만년필, 텅스텐 램프) 상단 사선 뷰로 트래블링.
3. **03 Chapter II — Our Work (주요 활동 — 4대 프로세스 & 현장 갤러리)**
   - **헤드라인**: *"Our work."* — *"현장에서 지면까지, 사진과 글로 남깁니다."*
   - **4단계 프로세스**: `01 취재·촬영` → `02 기록·정리` → `03 편집·디자인` → `04 발행·공유`
   - **4대 데스크/현장**: 축제(대동제), 체육대회, 교내 행사, 총학생회 사업 (`PHOTO / VIDEO / CONTENT / COMMUNICATION`)
   - **3D 연출**: 3D 공간에 부유하는 4개의 인화 사진 프레임과 6날 카메라 조리개(`#iris`) 및 셔터 플래시(`#flash`) 전환.
4. **04 Chapter III — The Archive & Annual Magazine (아카이브 및 연말 잡지)**
   - **헤드라인**: *"The archive."* — *"기록은 다시 꺼내 볼 때 비로소 완성됩니다."*
   - **핵심 기록 3종**: `R.01 Annual Magazine 2026` (연말 잡지), `R.02 The Festival Issue` (축제 특집), `R.03 Council Report` (총학생회 기록)
   - **3D 연출**: 곡선으로 흐르는 **35mm 필름 스트립(`PRESS 400 · SAFETY FILM`)**과 중앙에서 입체적으로 펼쳐지는 **3D 연말 매거진(하드커버 오픈 & 페이지 플립)**. 프레임 클릭 시 라이트박스 확대.
5. **05 Epilogue (마무리 — 편지와 왁스 실링)**
   - **헤드라인**: *"We make moments last."* → *"Thank you. 총학생회 언론부였습니다."*
   - **2-Step 연출**: Step 1에서 만년필이 문장을 쓰고 편지 본문이 타이핑된 뒤, `→` 입력 시 Step 2에서 편지 봉투가 접히며 **3D 붉은 왁스 실링(`P` 인장)**이 찍히고 최종 엔딩 크레딧 등장.

---

## 3. 에디토리얼 디자인 & 타이포그래피 규칙

- **절대 금지**: 사이버펑크 네온, 보라/파랑 AI 그라데이션, 흔한 스타트업 SaaS UI.
- **컬러 시스템**:
  - 배경: 암실 블랙(`#0B0A08` ~ `#12100D`), 인화지 아이보리(`#F3EFE6`)
  - 포인트: 브라스 골드(`#C6A365` / `#F3DFAE`), 왁스 레드(`#B5442F` / `#7A2418`), 텅스텐 앰버(`#D48C46`)
- **타이포그래피**:
  - 영문 세리프: `Bodoni Moda` 또는 `Instrument Serif` (핵심 단어 `<em>` 이탤릭 강조)
  - 국문: `Noto Serif KR` (타이틀/서사), `IBM Plex Sans KR` (본문, `word-break: keep-all`)
  - 메타데이터/캡션: `IBM Plex Mono` (`f/2.8 · 1/250s · ISO 400`, `No. 01`)
- **16:9 발표 스테이지**:
  - `.stage { width: min(100vw, 177.78vh); height: min(56.25vw, 100vh); container-type: inline-size; }` 및 `cqw` 단위로 빔프로젝터 완벽 대응.

---

## 4. 3D WebGL 구현 및 발표장 안전 수칙

1. **Zero-Build & CORS-Safe 폴백**:
   - 별도 빌드 없이 `index.html` 더블클릭(`file://`)이나 정적 서버에서 즉시 실행되도록 CDN(`three.min.js` + `gsap.min.js`)을 사용합니다.
   - `file://` 환경에서 이미지 텍스처 CORS 에러가 나지 않도록 먼저 2D Canvas(`window.PressPhotos` 등)로 절차적 텍스처를 생성해 바인딩하고, 이미지 로드 성공 시에만 텍스처를 갱신합니다.
2. **발표자 클리커 & 단축키 완벽 지원**:
   - 다음: `ArrowRight`, `PageDown`, `Space`
   - 이전: `ArrowLeft`, `PageUp`
   - 챕터 점프: 숫자키 `1` ~ `5`
   - 전체화면: `F`, 모달 닫기: `Escape`
3. **성능 방어**:
   - `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` 제한
   - `cameraRig`(GSAP 챕터 이동용 Group)와 `camera`(마우스 패럴랙스 오프셋용)를 분리해 트윈 충돌 방지

구체적인 Three.js 3D 씬, 카메라 리그, 3D 매거진 및 필름 스트립 코드 템플릿은 `references/threejs-pressroom-template.md`를 참고하세요.
