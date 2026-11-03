/* =========================================================
   THE PRESS ROOM — 설정 파일
   ---------------------------------------------------------
   실제 사진은 images 폴더에 넣고 src 에 경로를 적어 주세요.
   예) src: "images/festival.jpg"
   src 를 비워 두면 흑백 인화 사진 느낌의 이미지가 자동으로 그려집니다.
   (kind: festival · sports · campus · ceremony · lanterns · graduation · desk)
   ========================================================= */
window.PRESS_CONFIG = {
  year: "2026",
  presenter: "김영빈",
  presenterRole: "총학생회 언론부장",

  /* PAGE 03 OUR WORK 에 쓰이는 대표 사진 4장 */
  work: [
    { src: "", kind: "festival", seed: 3,  title: "축제",        caption: "대동제 — 무대 위의 밤" },
    { src: "", kind: "sports",   seed: 5,  title: "체육대회",    caption: "체육대회 — 결승선 앞에서" },
    { src: "", kind: "campus",   seed: 7,  title: "교내 행사",   caption: "교내 행사 — 캠퍼스의 오후" },
    { src: "", kind: "ceremony", seed: 11, title: "총학생회 사업", caption: "총학생회 사업 — 현장 기록" }
  ],

  /* PAGE 04 ARCHIVE 필름 스트립 사진 (클릭하면 크게 보기) */
  archive: [
    { src: "", kind: "festival",   seed: 21, caption: "대동제 — 마지막 앵콜" },
    { src: "", kind: "campus",     seed: 4,  caption: "새내기 배움터 — 첫 만남" },
    { src: "", kind: "sports",     seed: 12, caption: "체육대회 — 이어달리기" },
    { src: "", kind: "lanterns",   seed: 8,  caption: "축제의 밤 — 불빛 아래" },
    { src: "", kind: "ceremony",   seed: 15, caption: "총학생회 — 출범식" },
    { src: "", kind: "desk",       seed: 2,  caption: "편집실 — 마감 전날" },
    { src: "", kind: "graduation", seed: 9,  caption: "졸업 — 던져 올린 학사모" },
    { src: "", kind: "festival",   seed: 33, caption: "공연 — 객석의 함성" },
    { src: "", kind: "campus",     seed: 18, caption: "가을 — 도서관 앞" },
    { src: "", kind: "lanterns",   seed: 27, caption: "야간 부스 — 늦은 저녁" }
  ]
};
