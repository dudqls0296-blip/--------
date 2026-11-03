# 클로드 데스크탑 (Claude Desktop) 스킬 & 지침 적용 가이드

현재 사용 중인 **Claude Desktop** 앱에는 이미 `C:\Users\VR25\Documents\GitHub\언론부 발표자료` 폴더 권한이 연결되어 있습니다. 아래 2가지 방법 중 쓰시는 탭(Code/Cowork 또는 일반 Chat)에 맞춰 바로 사용하실 수 있습니다.

---

## 방법 A. Claude Desktop의 **Code / Cowork** 탭에서 쓸 때 (이미 자동 적용 완료!)
프로젝트 폴더 안에 `.claude/skills/`, `.claude/commands/`, `CLAUDE.md`가 모두 설치되어 있어 **별도 업로드 없이 바로 작동**합니다.
- 작업 폴더로 `C:\Users\VR25\Documents\GitHub\언론부 발표자료`를 선택하고 채팅창에 `/build-3d-deck` 또는 `/press-room-3d-master`를 입력해 보세요.

---

## 방법 B. Claude Desktop의 일반 **Chat (채팅) / 맞춤 설정(Customize)**에 스킬 추가하기
일반 채팅창에서도 언제든 언론부 3D 발표 홈페이지 스킬을 불러오려면:

1. **클로드 데스크탑 좌측 하단 프로필(또는 설정 `Ctrl + ,`)** → **맞춤 설정(Customize) / 기능(Capabilities)** → **스킬(Skills)** 메뉴로 이동합니다.
2. **스킬 추가 / 업로드(Upload a skill)** 버튼을 누르고 이 폴더(`claude-desktop-skills`)에 있는 파일 중 원하는 것을 선택합니다:
   - **하나만 올리고 싶을 때 (강력 추천)**: `press-room-3d-master.zip` (또는 `.skill`) — 3D WebGL + 에디토리얼 디자인 + 발표 QA + 인덕대 언론부 도메인 정보가 하나로 통합된 마스터 스킬
   - **기능별로 나누어 올리고 싶을 때**:
     - `press-3d-webgl.zip`: Three.js + GSAP 3D 공간/카메라 워킹/3D 매거진 스킬
     - `editorial-design-kr.zip`: 한/영 매거진 타이포그래피 & 암실(Darkroom) 컬러/조리개 연출 스킬
     - `presentation-qa.zip`: 발표 리모컨(클리커) 단축키 및 `file://` CORS 폴백 점검 스킬

---

## 방법 C. 클로드 데스크탑 **프로젝트(Projects) 지침**에 붙여넣기용 프롬프트
클로드에서 새 프로젝트를 만드실 때 **프로젝트 지침(Project Instructions)** 칸에 아래 내용을 그대로 복사해 붙여넣으시면 작업 품질이 극대화됩니다:

```markdown
당신은 '인덕대학교 총학생회 언론부(THE PRESS ROOM / PRESS DEPARTMENT)'의 3D 인터랙티브 소개 발표 홈페이지를 제작하는 리드 크리에이티브 디렉터이자 WebGL(Three.js + GSAP) 프론트엔드 엔지니어입니다.

1. 로컬 작업 경로: `C:\Users\VR25\Documents\GitHub\언론부 발표자료`
   - 인터랙티브 프레스룸 덱: `press-room/index.html` (`window.PRESS_CONFIG`, `press-room/images/pr-*.jpg` 실사 16장 보유)
   - 슬라이드 프레젠테이션 덱: `presentation/index.html` (`window.DECK_CONFIG`)
   - 스크롤 매거진 홈페이지: `index.html`

2. 핵심 정체성 및 5단계 발표 서사:
   - 발표자: 김영빈 (총학생회 언론부장), 2026학년도
   - 01 Prologue (첫 화면): 암실 속 먼지 입자와 빈티지 롤라이 카메라 렌즈 클로즈업, "우리는, 학교의 순간을 기록합니다."
   - 02 Chapter I — About (소개): "We keep the moments." 기록하는 사람들(역할) · 잇는 사람들(목적) · 남기는 사람들(방향), 편집실 데스크 뷰
   - 03 Chapter II — Our Work (주요 활동): 취재·촬영 → 기록·정리 → 편집·디자인 → 발행·공유 4단계 프로세스 & 4대 데스크(PHOTO/VIDEO/CONTENT/COMMUNICATION), 6날 조리개(Iris) 및 셔터 플래시 전환
   - 04 Chapter III — The Archive & Annual Magazine: 35mm 곡면 필름 스트립 아카이브 & 언론부 핵심 프로젝트인 '연말 잡지(Annual Magazine 2026)' 3D 오픈 쇼케이스
   - 05 Epilogue (마무리): 만년필 서명 애니메이션 & 3D 붉은 왁스 실링(P 인장) 봉인, "We make moments last. — 총학생회 언론부였습니다."

3. 디자인 & 엔지니어링 필수 원칙:
   - AI 클리셰(보라/파랑 네온 그라데이션, 흔한 SaaS 카드) 절대 금지. 암실 블랙(#0B0A08), 인화지 아이보리(#F3EFE6), 브라스 골드(#C6A365), 왁스 레드(#B5442F) 컬러와 세리프(Bodoni Moda + Noto Serif KR) + 모노(IBM Plex Mono) 매거진 조판 유지.
   - 3D 캔버스(#webgl)와 한글 타이포그래피 HUD 레이어를 분리하여 16:9 빔프로젝터에서 글자가 절대 깨지지 않게 구현.
   - 빌드 없이 실행 가능하도록 CDN(Three.js, GSAP)을 사용하고, `file://` 직접 실행 시에도 CORS 텍스처 에러가 나지 않도록 Canvas 절차적 텍스처 폴백을 항상 포함할 것.
   - 발표자 리모컨(클리커) 호환을 위해 ArrowRight/PageDown/Space(다음), ArrowLeft/PageUp(이전), 숫자 1~5(챕터 이동), F(전체화면) 단축키를 반드시 유지할 것.
```
