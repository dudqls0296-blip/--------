---
description: 발표 전 3D 홈페이지의 설정, 이미지 경로, 리모컨 키 바인딩, WebGL 폴백 상태를 점검합니다.
---

`presentation-qa` 스킬을 사용하여 현재 언론부 발표 홈페이지의 발표 준비 상태를 점검하세요:

1. `.agents/skills/presentation-qa/scripts/serve-and-check.ps1 -CheckOnly`를 실행하여 엔트리 파일, `PRESS_CONFIG`, 이미지 에셋을 확인합니다.
2. 키보드 및 발표자 클리커(`PageDown`, `PageUp`, `ArrowRight`, `ArrowLeft`, `Space`, `1~5`, `F`, `Escape`) 바인딩 누락 여부를 점검합니다.
3. 로컬 `file://` 직접 실행 시 WebGL 텍스처 CORS 오류가 발생하지 않도록 Canvas 폴백이 정상 작동하는지 확인하고 결과를 요약합니다.
