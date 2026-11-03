# 한 권의 기록 — 인덕대학교 총학생회 언론부 3D 프레젠테이션

연말 잡지 제작을 주제로 한 3D 인터랙티브 발표 사이트입니다. (Three.js + GSAP, 별도 설치·빌드 없음)

## 실행
- GitHub Pages 또는 로컬 웹서버에서 `index.html`을 엽니다. (인터넷 연결 필요: CDN 라이브러리·폰트)
- 조작: → / Space / PageDown 다음, ← / PageUp 이전, 1~6 장면 이동, F 전체 화면, 화면 클릭 = 다음
- PAGE 04 잡지는 클릭(오른쪽/왼쪽 페이지) 또는 → / ← 키로 페이지를 넘깁니다.

## 구성
- `index.html` — 화면 구성, HTML 텍스트, 스타일
- `press3d/app.js` — 3D 장면과 6개 장면 연출
- `press3d/models/` — 3D 모델 (Poly Haven, CC0)
- `press3d/textures/` — 책상 나무 텍스처·실내 조명 HDRI (Poly Haven, CC0)
- `images/` — 사진 (Unsplash 무료 예시 이미지)

## 사진 교체
`press3d/app.js` 위쪽 `ASSETS`에서 경로만 바꾸면 됩니다.
- `prints` — 책상 위 인화 사진
- `magazine` — 잡지 표지·지면 사진
- `work` — PAGE 05 작업 사진 자리
