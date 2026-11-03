---
name: presentation-qa
description: >-
  Use this skill to verify, test, and launch the Press Department (언론부) 3D
  presentation website before a live presentation. Checks config bindings,
  image paths, keyboard/clicker controls, 60fps WebGL performance, and starts a
  local preview server.
---

# Live Presentation QA & Verification Skill (`presentation-qa`)

3D 언론부 발표 홈페이지 제작 후 또는 실제 발표 리허설 전에 아래 검증 절차를 수행하세요.

## 1. 자동 진단 및 로컬 서버 실행 스크립트

PowerShell에서 아래 스크립트를 실행하면 `config.js` 설정, 이미지 파일 존재 여부, 필수 키보드 이벤트 바인딩을 점검하고 선택 시 로컬 HTTP 서버를 띄웁니다:

- 검증만 실행:
  `powershell -ExecutionPolicy Bypass -File ".agents/skills/presentation-qa/scripts/serve-and-check.ps1" -CheckOnly`
- 검증 후 로컬 서버(`http://localhost:8080`) 실행:
  `powershell -ExecutionPolicy Bypass -File ".agents/skills/presentation-qa/scripts/serve-and-check.ps1"`

## 2. 발표 현장 필수 점검 체크리스트 (5대 항목)

1. **`window.PRESS_CONFIG` 바인딩 확인**:
   - `[data-cfg="presenter"]`, `[data-cfg="presenterRole"]`, `[data-cfg="year"]`가 누락 없이 렌더링되는지 확인합니다.
2. **발표용 리모컨(클리커) & 키보드 매핑**:
   - 로지텍 Spotlight / 일반 파워포인트 클리커는 `PageDown`(다음)과 `PageUp`(이전) 키 코드를 전송합니다.
   - 반드시 `ArrowRight`, `PageDown`, `Space`가 **다음 스텝/챕터**로, `ArrowLeft`, `PageUp`이 **이전 스텝/챕터**로 작동하는지 확인하세요.
   - 숫자키 `1`~`5`(질의응답 시 특정 슬라이드로 즉시 점프)와 `F`(전체화면 토글)가 동작해야 합니다.
3. **빔프로젝터 명암비 (Projector Safe Contrast)**:
   - 발표장 프로젝터는 암부(`#0B0A08` ~ `#1A1815`)가 하나로 뭉개져 보일 수 있습니다.
   - 중요한 카드 테두리는 최소 `rgba(198, 163, 101, 0.28)` 이상, 본문 텍스트는 `#EBE5D8` 이상의 밝기를 확보하세요.
4. **오프라인 / `file://` 폴백 안전성**:
   - 발표장 와이파이가 끊기거나 `index.html`을 직접 열었을 때도 폰트/이미지가 깨져 빈 박스로 남지 않고 Canvas 폴백 그래픽이 표시되는지 확인하세요.
5. **60FPS 프레임 방어**:
   - WebGL `devicePixelRatio`가 `2` 이하로 제한되어 있는지, 라이트박스 열림 중 불필요한 무거운 3D 연산이 감속되는지 확인하세요.
