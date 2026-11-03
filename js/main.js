(function () {
  "use strict";
  var C = window.PRESS_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 텍스트 설정값 반영 ---------- */
  $$("[data-cfg]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });
  if (C.logo) {
    var logo = $("#logo");
    logo.innerHTML = '<img src="' + esc(C.logo) + '" alt="' + esc((C.name || "") + " " + (C.nameKo || "")) + '">';
  }
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- 사진 넣기 (없거나 깨지면 자리 표시 유지) ---------- */
  function fillPhoto(ph, src, alt) {
    if (!src) return;
    var img = new Image();
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onload = function () { ph.classList.add("has-img"); };
    img.onerror = function () { img.remove(); };
    img.src = src;
    ph.appendChild(img);
  }
  var images = C.images || {};
  $$(".ph[data-img]").forEach(function (ph) {
    var key = ph.getAttribute("data-img");
    var label = ph.querySelector(".ph__label");
    fillPhoto(ph, images[key], label ? label.textContent.trim() : "");
  });

  /* ---------- ARCHIVE ---------- */
  var grid = $("#archiveGrid");
  var icons = { PHOTO: "i-cam", VIDEO: "i-video", INTERVIEW: "i-talk", NEWS: "i-talk" };
  if (grid && Array.isArray(C.archive)) {
    grid.innerHTML = C.archive.map(function (a, i) {
      var tag = a.url ? "a" : "div";
      var href = a.url ? ' href="' + esc(a.url) + '" target="_blank" rel="noopener"' : "";
      var icon = icons[a.category] || "i-content";
      var d = " d" + (i % 4);
      return '<' + tag + ' class="aitem reveal' + d + '"' + href + '>' +
        '<div class="ph" data-src="' + esc(a.image || "") + '"><span class="ph__crop"></span>' +
        '<span class="ph__label mono"><svg><use href="#' + icon + '"/></svg>' + esc(a.category) + '</span></div>' +
        '<div class="aitem__meta mono"><span class="kicker">' + esc(a.category) + '</span><span>' + esc(a.date) + '</span></div>' +
        '<h3><span>' + esc(a.title) + '</span></h3>' +
        '</' + tag + '>';
    }).join("");
    $$(".ph[data-src]", grid).forEach(function (ph, i) {
      fillPhoto(ph, ph.getAttribute("data-src"), C.archive[i] && C.archive[i].title);
    });
  }

  /* ---------- CONTACT ---------- */
  var ct = C.contact || {};
  var emailText = $("#emailText");
  if (ct.email && emailText) emailText.textContent = ct.email;
  var list = $("#channels");
  if (list) {
    var rows = "";
    (ct.channels || []).forEach(function (ch) {
      rows += '<li><span class="mono">' + esc(ch.label) + '</span>' +
        '<a class="chan__val" href="' + esc(ch.url) + '" target="_blank" rel="noopener">' + esc(ch.handle) + '</a>' +
        '<svg class="chan__go" aria-hidden="true"><use href="#i-ne"/></svg></li>';
    });
    if (ct.office) {
      rows += '<li><span class="mono">OFFICE</span><span class="chan__val">' + esc(ct.office) + '</span><span></span></li>';
    }
    list.insertAdjacentHTML("beforeend", rows);
  }

  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }
  var copyBtn = $("#copyEmail");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var text = emailText.textContent.trim();
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(emailText);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      toast("이메일 주소를 선택했어요. 복사해 주세요.");
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast("이메일 주소를 복사했어요."); }, fallback);
      } else fallback();
    } catch (e) { fallback(); }
  });

  /* ---------- NAV ---------- */
  var nav = $("#nav"), burger = $("#burger");
  function setOpen(open) {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  }
  burger.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 현재 보고 있는 섹션의 메뉴 표시 (주요 업무는 ABOUT에 포함)
  var map = { about: "about", work: "about", activities: "activities", archive: "archive", contact: "contact" };
  var links = {};
  $$("#menu a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  function markActive() {
    var line = window.innerHeight * 0.35, current = null;
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = map[id];
    });
    Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === current); });
  }
  window.addEventListener("scroll", markActive, { passive: true });
  markActive();

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var els = $$(".reveal");
    document.documentElement.classList.add("anim");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
    // 첫 화면에 보이는 요소는 바로 표시
    requestAnimationFrame(function () {
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      });
    });
  }
})();
