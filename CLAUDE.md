# 인덕대학교 총학생회 언론부 3D 소개 발표 홈페이지 (Project Rules)

이 저장소는 **인덕대학교 총학생회 언론부(THE PRESS ROOM)** 소개 홈페이지 및 3D 인터랙티브 발표 프레젠테이션 프로젝트입니다. 모든 작업 시 아래 도메인 컨텍스트, 디자인 시스템, 3D WebGL 엔지니어링 규칙을 준수하세요.

---

## 1. 도메인 및 발표 컨텍스트 (Core Identity)

- **소속 / 부서**: 인덕대학교 총학생회 언론부 (`THE PRESS ROOM` / `PRESS DEPARTMENT`)
- **발표자 기본값**: `김영빈` (`총학생회 언론부장`), 연도 `2026` (`window.PRESS_CONFIG`에서 동적 바인딩)
- **핵심 정체성**:
  1. **기록하는 사람들 (Role)**: 교내 행사(대동제, 체육대회, 새내기 배움터, 졸업식)와 총학생회 사업을 현장에서 사진·영상·글로 기록
  2. **잇는 사람들 (Purpose)**: 4개 데스크(`PHOTO`, `VIDEO`, `CONTENT`, `COMMUNICATION`)를 통해 학우와 학생자치기구를 연결
  3. **남기는 사람들 (Direction)**: 한 해의 모든 기록을 핵심 프로젝트인 **연말 잡지(Annual Magazine)** 한 권으로 완성 및 아카이빙
- **표준 5단계 발표 서사 (5-Chapter Narrative)**:
  - `01 Prologue (첫 화면)`: 암실/프레스룸 진입, 카메라 렌즈·만년필 모티프, 슬로건 *"우리는, 학교의 순간을 기록합니다."*
  - `02 I — About (소개)`: *"We keep the moments."* 언론부의 역할·목적·방향 3대 기둥
  - `03 II — Our Work (주요 활동)`: 취재·촬영 → 기록·정리 → 편집·디자인 → 발행·공유 4단계 프로세스 & 4대 대표 현장(축제, 체육대회, 교내 행사, 총학생회 사업)
  - `04 III — The Archive & Annual Magazine (아카이브 및 연말 잡지)`: 35mm 필름 스트립 아카이브 & 3D 연말 매거진 쇼케이스
  - `05 Epilogue (마무리)`: 만년필 서명, 왁스 실링(Wax Seal), *"We make moments last. — 총학생회 언론부였습니다."*

---

## 2. 아키텍처 및 설정 분리 원칙 (Architecture Rules)

1. **`window.PRESS_CONFIG` 분리 (`js/config.js`)**:
   - 발표자 이름, 연도, 문구, 사진 경로(`src`), 캡션은 반드시 `js/config.js`의 `window.PRESS_CONFIG`와 `[data-cfg]` 속성으로 제어할 수 있어야 합니다.
2. **Zero-Build 즉시 실행 호환성**:
   - 별도 번들러 설치 요청이 없는 한, 로컬 정적 서버 또는 `index.html` 실행만으로 바로 동작하도록 CDN(Three.js, GSAP 3.12+)을 사용하세요.
   - 로컬 `file://` 환경에서도 텍스처 CORS 오류가 발생하지 않도록 이미지 로드 실패 또는 `file://` 감지 시 **절차적 Canvas 텍스처(`PressPhotos` 스타일 흑백 인화 느낌) 또는 DOM/CSS3D 폴백**이 자동 작동해야 합니다.
3. **기존 실사 에셋 활용**:
   - `press-room/images/` 폴더 내 17종의 고해상도 실사 이미지(`pr-camera-rollei.jpg`, `pr-camera-rollei-close.jpg`, `pr-concert.jpg`, `pr-graduation.jpg`, `pr-news-stack.jpg`, `pr-news-wall.jpg`, `pr-paper.jpg`, `pr-pen-lamp.jpg`, `pr-pen-nib.jpg`, `pr-prints-basket.jpg`, `pr-prints-cards.jpg`, `pr-prints-envelope.jpg`, `pr-shoot-1.jpg`, `pr-shoot-2.jpg`, `pr-stage-lights.jpg`, `pr-track.jpg`)를 적극 활용하세요.

---

## 3. 에디토리얼 디자인 & 타이포그래피 규칙 (Design System)

- **AI 클리셰 금지**: 네온 사이버펑크, 보라/파랑 그라데이션 배경, 흔한 SaaS 카드 UI를 절대 사용하지 마세요.
- **프레스룸 & 다크룸 미학 (Darkroom & Editorial Aesthetic)**:
  - **배경/조명**: 깊은 암실 톤(`#0B0A08` ~ `#14110E`), 따뜻한 인화지 아이보리(`#F3EFE6`), 텅스텐 램프 하이라이트
  - **포인트 컬러**: 브라스 골드(`#C6A365`), 왁스 실링 레드(`#B5442F` / `#7A2418`), 필름 엣지 앰버(`#D48C46`)
  - **질감**: 은은한 필름 그레인(Film Grain), 비네팅(Vignette), 인화지 섬유 질감, 카메라 조리개(Iris)·셔터 플래시 연출
- **타이포그래피 조합**:
  - 영문 디스플레이: `Bodoni Moda`, `Instrument Serif` (이탤릭 강조 `<em>` 적극 활용)
  - 국문 본문/헤드라인: `Noto Serif KR` (조판 중심), `IBM Plex Sans KR` 또는 `Noto Sans KR` (가독성 본문)
  - 메타데이터/캡션/카메라 스펙: `IBM Plex Mono` (`f/2.8 · 1/250s · ISO 400`, `PRESS 400 · SAFETY FILM`)

---

## 4. 3D WebGL & 인터랙션 가드레일 (3D & Performance)

1. **카메라 기반 챕터 전환 (Camera Waypoints)**:
   - 3D 공간 내 각 챕터 오브젝트(빈티지 롤라이 카메라, 편집 데스크, 3D 부유 필름 스트립, 3D 오픈 매거진, 왁스 실링 편지)로 카메라 위치(`position`)와 응시점(`lookAt` target)이 GSAP 타임라인(`expo.inOut` / `power3.inOut`)으로 부드럽게 이동해야 합니다.
2. **가독성 우선 (HUD & HTML Layer 분리)**:
   - 3D 캔버스(`#webgl`)는 배경과 핵심 시각 오브젝트를 담당하고, 한글 본문·타이포그래피·네비게이션 HUD는 선명한 HTML/SVG 레이어 위에 배치하여 빔프로젝터 발표 시 글자가 깨지지 않게 하세요.
3. **발표장 하드웨어 & 리모컨 컨트롤 필수 지원**:
   - 키보드 및 발표용 클리커 완벽 대응: `ArrowRight` / `PageDown` / `Space` (다음), `ArrowLeft` / `PageUp` (이전), `1`~`5` (챕터 즉시 이동), `F` (전체화면 토글), `ESC` (라이트박스/모달 닫기).
4. **성능 최적화**:
   - `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` 고정.
   - 마우스 패럴랙스는 `gsap.quickTo` 또는 `lerp` 보간으로 부드럽게 감쇠.
   - `prefers-reduced-motion: reduce` 감지 시 급격한 카메라 회전과 플래시 효과를 완화.

---

## 5. 사용 가능한 전문 스킬 (Skills)

작업 목적에 따라 `.agents/skills/` (및 `.claude/skills/`)에 정의된 스킬을 참조하세요:
- `press-3d-webgl`: Three.js + GSAP 기반 3D 프레스룸 씬 구성, 카메라 리그, 3D 매거진/필름 오브젝트, 셰이더 및 CORS-safe 텍스처 패턴
- `editorial-design-kr`: 한/영 매거진 타이포그래피, 16:9 스테이지 스케일링, 조리개/셔터 트랜지션 가이드
- `presentation-qa`: 발표 전 빔프로젝터 가독성, 60fps 성능, 클리커 입력, 폴백 검증 및 로컬 서버 실행
