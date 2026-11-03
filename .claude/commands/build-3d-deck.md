---
description: 인덕대학교 총학생회 언론부 3D 소개 발표 홈페이지를 제작하거나 업그레이드합니다.
---

`CLAUDE.md` 규칙과 `press-3d-webgl`, `editorial-design-kr` 스킬을 활성화하여 3D 언론부 소개 발표 홈페이지를 구축하세요:

1. **목표 확인**: `$ARGUMENTS` 요구사항(신규 3D 페이지 제작, 기존 `press-room/` 3D WebGL 업그레이드, 3D 연말 매거진 쇼케이스 추가 등)을 분석합니다.
2. **에셋 & 설정 연동**: `js/config.js`(`window.PRESS_CONFIG`) 및 `press-room/images/pr-*.jpg` 실사 이미지(CORS 폴백 포함)를 유지·연결합니다.
3. **3D 카메라 & 씬 구현**:
   - Three.js + GSAP 기반 5개 챕터 카메라 웨이포인트(`cameraRig` + `lookTarget`)
   - 01 빈티지 카메라 렌즈 & 암실 먼지 입자 → 02 편집실 데스크 → 03 4대 취재 프레임 → 04 35mm 필름 스트립 & 3D 오픈 연말 매거진 → 05 만년필 서명 & 3D 왁스 실링
4. **발표장 컨트롤 & QA**:
   - 화살표키, `PageUp`/`PageDown`(발표 클리커), `Space`, 숫자키 `1~5`, `F`(전체화면) 지원 여부를 검증합니다.
