/* =========================================================
   PRESS DEPARTMENT — 발표 설정 파일
   ---------------------------------------------------------
   사진은 presentation/images 폴더에 넣고 경로를 적어 주세요.
   예) cover: "images/cover.jpg"
   비워 두면("") 직접 그린 시네마틱 배경이 대신 나옵니다.
   ========================================================= */
window.DECK_CONFIG = {
  year: "2026",
  presenter: "김영빈",
  presenterRole: "총학생회 언론부장",

  images: {
    cover:   "",   // 01 COVER 배경 — 캠퍼스·건물 사진 (가로 16:9, 어두운 사진일수록 좋아요)
    about:   "",   // 02 ABOUT US 배경 — 캠퍼스 사진
    work:    "",   // 03 WHAT WE DO 배경 (선택)
    process: "",   // 05 OUR PROCESS 배경 (선택)
    value:   "",   // 06 OUR VALUE 배경 (선택)

    magazineCover:  "",  // 04 잡지 표지에 들어갈 사진 (세로형)
    magazineSpread: "",  // 04 잡지 내지 왼쪽 페이지 사진
    magazinePhoto:  ""   // 04 실제 제작한 잡지 사진. 넣으면 3D 목업 대신 이 사진이 나옵니다.
  }
};
