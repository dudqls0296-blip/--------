---
name: editorial-design-kr
description: >-
  Use this skill when styling Korean/English bilingual editorial layouts,
  magazine typography, 16:9 presentation stage scaling, or camera shutter/iris
  transitions for the Press Department (언론부) website and presentation decks.
---

# Korean/English Editorial & Magazine Design Skill (`editorial-design-kr`)

언론부 소개 홈페이지 및 발표 프레젠테이션의 시각 디자인과 모션 연출 시 적용하는 에디토리얼 디자인 가이드입니다.

## 1. 컬러 팔레트 토큰 (Darkroom & Ivory Edition)

```css
:root {
  /* Darkroom Base */
  --bg-void: #0B0A08;
  --bg-stage: #12100D;
  --bg-surface: rgba(24, 20, 16, 0.76);

  /* Paper & Ink */
  --paper-ivory: #F3EFE6;
  --paper-warm: #E6DEC8;
  --ink-dark: #181410;

  /* Editorial Accents */
  --brass-gold: #C6A365;
  --brass-light: #F3DFAE;
  --wax-red: #B5442F;
  --amber-lamp: #D48C46;

  /* Text Hierarchy */
  --text-primary: #F5F1E8;
  --text-secondary: rgba(245, 241, 232, 0.72);
  --text-muted: rgba(245, 241, 232, 0.45);
  --border-hairline: rgba(198, 163, 101, 0.22);
}
```

## 2. 한/영 하이브리드 타이포그래피 규칙

1. **영문 디스플레이 헤드라인 (`Bodoni Moda` / `Instrument Serif`)**:
   - 큰 제목은 세리프 정체와 이탤릭체(`<em>`)를 대비시켜 매거진 제호(Masthead) 느낌을 살립니다.
   - 예: `We keep the <em>moments.</em>`, `The <em>archive.</em>`
2. **국문 타이틀 & 본문 (`Noto Serif KR` + `IBM Plex Sans KR`)**:
   - 한글 제목은 `word-break: keep-all; letter-spacing: -0.02em; line-height: 1.35;`를 기본 적용해 단어 중간 줄바꿈을 방지합니다.
   - 본문 문단은 최대 너비 `42ch ~ 52ch`를 넘지 않게 제한하여 매거진 컬럼의 밀도를 유지합니다.
3. **모노스페이스 캡션 & EXIF 메타데이터 (`IBM Plex Mono`)**:
   - 모든 사진 프레임과 섹션 인덱스에는 카메라 EXIF 또는 매거진 폴리오 표기를 함께 배치합니다.
   - 예: `FIG. 01 — 35MM · F/2.0 · 1/500S · ISO 1600`, `VOL. 2026 · INDUK UNIV. PRESS`

## 3. 16:9 발표용 스테이지 스케일링 (`cqw` 단위)

발표장 빔프로젝터(1920×1080, 16:9)와 노트북 화면 어디서든 레이아웃이 깨지지 않도록 `container-type: inline-size` 기반의 고정 비율 스테이지를 사용합니다:

```css
.stage {
  width: min(100vw, 177.78vh);
  height: min(56.25vw, 100vh);
  container-type: inline-size;
  position: relative;
  overflow: hidden;
}
```
- 폰트 크기와 여백은 `cqw` (Container Query Width) 단위를 사용하여 화면 크기에 비례해 정확히 스케일링되게 설계합니다.

## 4. 시그니처 트랜지션 모티프

- **Shutter Flash (`#flash`)**: 챕터 전환 직후 `0.05s` 화이트/앰버 플래시 후 `0.9s` 잔상 감쇠
- **Aperture Iris (`#iris`)**: 6날 카메라 조리개 블레이드가 회전하며 화면을 닫았다 여는 SVG 트랜지션
- **Character Mask Reveal (`[data-split]`)**: 글자 단위로 마스킹(`overflow: hidden`)된 상태에서 `yPercent: 118 → 0, rotation: 7 → 0` (`expo.out`)로 솟아오르는 모션
