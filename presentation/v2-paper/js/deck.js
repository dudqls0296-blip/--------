(function () {
  "use strict";
  var C = window.DECK_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- config ---------- */
  $$("[data-cfg]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });
  var IM = C.images || {};
  $$("[data-img]").forEach(function (el) {
    var src = IM[el.getAttribute("data-img")];
    if (!src) return;
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src.replace(/"/g, '\\"') + '")';
      el.classList.add("has-img");
    };
    img.src = src;
  });
  if (IM.magazinePhoto) {
    var mp = $("#magphoto");
    mp.onload = function () { mp.hidden = false; $("#mock").hidden = true; };
    mp.src = IM.magazinePhoto;
  }

  /* ---------- laurel wreath ---------- */
  (function buildLaurel() {
    var g = document.getElementById("laurelLeaves");
    if (!g) return;
    var cx = 100, cy = 98, R = 74, html = "", N = 9;
    [-1, 1].forEach(function (side) {
      var d = "";
      for (var i = 0; i <= 24; i++) {
        var th = (18 + 140 * i / 24) * Math.PI / 180;
        d += (i ? "L" : "M") + (cx + side * R * Math.sin(th)).toFixed(1) + " " + (cy + R * Math.cos(th)).toFixed(1);
      }
      html += '<path d="' + d + '" fill="none" stroke="#9A7638" stroke-width="2"/>';
      for (var j = 0; j < N; j++) {
        var th = (24 + 128 * j / (N - 1)) * Math.PI / 180;
        var px = cx + side * R * Math.sin(th), py = cy + R * Math.cos(th);
        // tangent pointing up along the branch
        var tx = side * R * Math.cos(th), ty = -R * Math.sin(th);
        var ang = Math.atan2(ty, tx) * 180 / Math.PI;
        var s = 1.05 - j * 0.04;
        [[-34, 1], [34, .85]].forEach(function (o) {
          var a = ang + o[0] * side;
          var rad = a * Math.PI / 180, L = 11 * s;
          var ex = px + Math.cos(rad) * L, ey = py + Math.sin(rad) * L;
          html += '<ellipse cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" rx="' + L.toFixed(1) + '" ry="' + (4.3 * s).toFixed(1) +
            '" transform="rotate(' + a.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ')" fill="url(#gLeaf)" opacity="' + o[1] + '"/>';
        });
      }
    });
    html += '<path d="M100 178l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="url(#gLeaf)"/>';
    g.innerHTML = html;
  })();

  /* ---------- newsprint ---------- */
  var MAST = ["PRESS", "<i>News</i>", "ARCHIVE", "Campus", "<i>Daily</i>", "RECORD"];
  var HEADS = ["축제의 밤, 캠퍼스를 밝히다", "총학생회 언론부 연말호 발간", "새내기 배움터 현장 스케치", "학우들의 한 해를 담다",
    "체육대회, 함성으로 가득한 하루", "도서관 앞 가을 풍경", "총학생회 사업 결산", "졸업을 앞둔 학우들의 이야기"];
  var TXT = "언론부는 학교에서 일어나는 다양한 행사와 활동, 그리고 학우들의 이야기를 기록하고 정리합니다. 흩어지는 순간을 모아 하나의 이야기로 만들고, 그 기록을 학우들과 공유합니다. 한 해 동안 진행된 학교 주요 행사와 다양한 활동, 캠퍼스의 풍경을 수집하고 편집하여 인덕대학교의 한 해를 하나의 잡지로 완성합니다. ";
  function fillNews(el) {
    var R = rng(+el.getAttribute("data-seed") || 1);
    var wrap = document.createElement("div");
    wrap.className = "np";
    var html = "", spans = [2, 1, 2, 1, 3, 1, 2, 2, 1, 2, 1, 3, 2, 1, 1, 2, 2, 1];
    for (var i = 0; i < spans.length; i++) {
      var sp = spans[i], kind = R();
      html += '<div class="np-art" style="grid-column:span ' + sp + '">';
      if (kind < .28) {
        html += '<p class="np-mast" style="font-size:' + (2.6 + R() * 3.2 * sp / 2).toFixed(2) + 'cqw">' + MAST[Math.floor(R() * MAST.length)] + "</p>";
      } else {
        html += '<p class="np-head">' + HEADS[Math.floor(R() * HEADS.length)] + "</p>";
      }
      if (R() < .35) html += '<div class="np-photo"></div>';
      var n = 1 + Math.floor(R() * 3);
      var t = ""; for (var k = 0; k < n; k++) t += TXT;
      html += '<p class="np-txt">' + t + "</p></div>";
    }
    wrap.innerHTML = html;
    el.appendChild(wrap);
  }
  $$(".newsprint").forEach(fillNews);

  /* ---------- torn edges ---------- */
  function tornPoints(R, n, amp) {
    var pts = [], x = 0, base = 0;
    var ph = R() * 6.28, ph2 = R() * 6.28;
    while (x <= 1000) {
      var low = Math.sin(x / 1000 * 6.28 * 1.3 + ph) * amp * .55 + Math.sin(x / 1000 * 6.28 * 3.7 + ph2) * amp * .25;
      var jag = (R() - .5) * amp * .55;
      pts.push([x, low + jag]);
      x += 4 + R() * 12;
    }
    pts.push([1000, pts[pts.length - 1][1]]);
    return pts;
  }
  $$("svg.tear").forEach(function (svg) {
    var R = rng(+svg.getAttribute("data-seed") || 2);
    var H = 100, mid = 55;
    svg.setAttribute("viewBox", "0 0 1000 " + H);
    var pts = tornPoints(R, 0, 40);
    var top = "M0 -400 H1000 V" + (mid + pts[pts.length - 1][1]).toFixed(1);
    var fiber = top;
    for (var i = pts.length - 1; i >= 0; i--) {
      top += " L" + pts[i][0].toFixed(1) + " " + (mid + pts[i][1]).toFixed(1);
      fiber += " L" + pts[i][0].toFixed(1) + " " + (mid + pts[i][1] + 3 + R() * 5).toFixed(1);
    }
    top += " Z"; fiber += " Z";
    svg.innerHTML = '<path class="t-fiber" d="' + fiber + '"/><path class="t-paper" d="' + top + '"/>';
  });
  // clip-path tear for cards and scraps
  $$("[data-torn]").forEach(function (el, idx) {
    var R = rng(31 + idx * 7), mode = el.getAttribute("data-torn");
    var poly = [];
    function edge(y0, rev, amp) {
      var arr = [], x = 0;
      while (x <= 100) { arr.push([x, y0 + (R() - .5) * amp + Math.sin(x / 9 + R()) * amp * .3]); x += 1.2 + R() * 2.6; }
      arr.push([100, y0]);
      return rev ? arr.reverse() : arr;
    }
    if (mode === "top") {
      poly = edge(4, false, 5).concat([[100, 100], [0, 100]]);
    } else {
      poly = edge(2.5, false, 3.6).concat(edge(97.5, true, 3.6));
    }
    el.style.clipPath = "polygon(" + poly.map(function (p) {
      return Math.max(0, Math.min(100, p[0])).toFixed(2) + "% " + Math.max(0, Math.min(100, p[1])).toFixed(2) + "%";
    }).join(",") + ")";
  });

  /* ---------- deck ---------- */
  var stage = $("#stage");
  var slides = $$(".slide"), N = slides.length;
  var idx = -1, step = 0, started = false;
  var curEl = $("#cur"), totEl = $("#tot"), bar = $("#bar"), chap = $("#chapter");
  var prevBtn = $("#prev"), nextBtn = $("#next");
  totEl.textContent = pad(N);
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function stepsOf(i) { return +slides[i].getAttribute("data-steps") || 1; }
  function setChapter(text) {
    if (chap.textContent === text) return;
    chap.classList.add("swap");
    setTimeout(function () { chap.textContent = text; chap.classList.remove("swap"); }, 250);
  }
  function render() {
    var s = slides[idx];
    slides.forEach(function (el, i) { el.classList.toggle("active", i === idx); });
    for (var k = 1; k < 4; k++) s.classList.toggle("step-" + k, step >= k);
    curEl.textContent = pad(idx + 1);
    var total = stepsOf(idx);
    bar.style.width = ((idx + (step + 1) / total) / N * 100) + "%";
    setChapter(step > 0 && s.getAttribute("data-chapter2") ? s.getAttribute("data-chapter2") : s.getAttribute("data-chapter"));
    prevBtn.disabled = idx === 0 && step === 0;
    nextBtn.disabled = idx === N - 1 && step === total - 1;
    try { history.replaceState(null, "", "#s" + (idx + 1)); } catch (e) {}
  }
  function go(i, s) {
    if (i < 0 || i >= N) return;
    if (i !== idx) { slides[i].classList.remove("active"); void slides[i].offsetWidth; }
    idx = i; step = s || 0;
    render();
  }
  function next() {
    if (!started) return finishLoader();
    if (step < stepsOf(idx) - 1) { step++; render(); }
    else if (idx < N - 1) go(idx + 1, 0);
  }
  function prev() {
    if (!started) return finishLoader();
    if (step > 0) { step--; render(); }
    else if (idx > 0) go(idx - 1, stepsOf(idx - 1) - 1);
  }
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === "ArrowDown" || (k === " " && !e.shiftKey) || k === "Enter") {
      e.preventDefault(); if (!e.repeat) next();
    } else if (k === "ArrowLeft" || k === "PageUp" || k === "ArrowUp" || (k === " " && e.shiftKey) || k === "Backspace") {
      e.preventDefault(); if (!e.repeat) prev();
    } else if (k === "Home") { e.preventDefault(); if (started) go(0, 0); }
    else if (k === "End") { e.preventDefault(); if (started) go(N - 1, stepsOf(N - 1) - 1); }
    else if (k === "f" || k === "F") { toggleFs(); }
  });

  var sx = 0, sy = 0, st = 0;
  stage.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 800 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  function toggleFs() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) {
        var p = document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(function () {});
      }
    } catch (e) {}
  }
  $("#fsbtn").addEventListener("click", toggleFs);
  if (!document.documentElement.requestFullscreen) $("#fsbtn").hidden = true;

  window.addEventListener("hashchange", function () {
    var m = /^#s(\d)$/.exec(location.hash);
    if (m && started) { var i = +m[1] - 1; if (i !== idx && i < N) go(i, 0); }
  });

  /* ---------- opening ---------- */
  var startAt = 0, hm = /^#s(\d)$/.exec(location.hash);
  if (hm) startAt = Math.min(N - 1, Math.max(0, +hm[1] - 1));
  var loader = $("#loader"), ldbar = $("#ldbar"), ldpct = $("#ldpct");
  var DUR = reduce ? 0 : 1800, t0 = performance.now(), raf;
  function finishLoader() {
    if (started) return;
    started = true;
    cancelAnimationFrame(raf);
    ldbar.style.width = "100%"; ldpct.textContent = "100%";
    loader.classList.add("done");
    go(startAt, 0);
  }
  function tick(now) {
    var p = DUR ? Math.min(1, (now - t0) / DUR) : 1, e = 1 - Math.pow(1 - p, 3);
    ldbar.style.width = (e * 100) + "%";
    ldpct.textContent = Math.round(e * 100) + "%";
    if (p < 1) raf = requestAnimationFrame(tick); else setTimeout(finishLoader, 300);
  }
  raf = requestAnimationFrame(tick);
  loader.addEventListener("click", finishLoader);
})();
