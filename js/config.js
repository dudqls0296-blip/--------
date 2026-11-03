/* =========================================================
   언론부 홈페이지 설정 파일
   ---------------------------------------------------------
   사진 · 로고 · 이메일 · SNS 주소는 이 파일만 고치면 됩니다.
   - 이미지는 images 폴더에 넣고 경로를 적어 주세요.
     예) hero: "images/hero.jpg"
   - 비워 두면("") 사진 자리 표시가 대신 나타나며,
     레이아웃은 그대로 유지됩니다.
   ========================================================= */
window.PRESS_CONFIG = {
  /* 로고 · 이름 */
  name: "PRESS",              // 네비게이션 로고 글자
  nameKo: "언론부",
  org: "학생자치기구",          // 예: "○○대학교 총학생회"
  logo: "",                   // 로고 이미지 경로 (예: "images/logo.png"), 비우면 글자 로고
  issue: "VOL. 2026",         // 표지 상단의 호수 표기

  /* 섹션별 대표 사진 */
  images: {
    hero: "",       // 메인 표지 사진 (가로형 권장)
    about: "",      // ABOUT US 옆 사진 (세로형 권장)
    festival: "",   // 축제 및 교내 행사 기록
    campaign: "",   // 학생자치기구 주요 사업 홍보
    news: "",       // 교내 소식 및 정보 전달 (세로형 권장)
    online: ""      // 다양한 온라인 콘텐츠 제작 (아주 넓은 가로형 권장)
  },

  /* 연락처 · SNS */
  contact: {
    email: "press@university.ac.kr",
    office: "학생회관 학생자치기구실",
    channels: [
      { label: "INSTAGRAM", handle: "@univ_press",     url: "https://www.instagram.com/" },
      { label: "YOUTUBE",   handle: "언론부 채널",       url: "https://www.youtube.com/" },
      { label: "KAKAO",     handle: "카카오톡 채널",     url: "https://pf.kakao.com/" }
    ]
  },

  /* ARCHIVE — 최근 기록 (예시 항목입니다. 실제 게시물로 바꿔 주세요) */
  archive: [
    { category: "PHOTO",     title: "새내기 배움터 현장 스케치",   date: "2026.03", image: "", url: "" },
    { category: "VIDEO",     title: "봄 축제 하이라이트 영상",      date: "2026.05", image: "", url: "" },
    { category: "CARD NEWS", title: "시험기간 간식 나눔 안내",      date: "2026.04", image: "", url: "" },
    { category: "PHOTO",     title: "체육대회 베스트 컷",          date: "2026.05", image: "", url: "" },
    { category: "INTERVIEW", title: "학생자치기구 사람들",          date: "2026.06", image: "", url: "" },
    { category: "NEWS",      title: "2학기 학사 일정 한눈에 보기",  date: "2026.08", image: "", url: "" }
  ]
};
