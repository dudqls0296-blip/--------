(function () {
  "use strict";
  var C = window.DECK_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      var u = 'url("' + src.replace(/"/g, '\\"') + '")';
      el.style.setProperty("--img", u);
      if (!el.classList.contains("bg")) el.style.backgroundImage = u;
      el.classList.add("has-img");
    };
    img.src = src;
  });
  if (IM.magazinePhoto) {
    var mp = $("#magphoto");
    mp.onload = function () { mp.hidden = false; $("#mock").hidden = true; };
    mp.src = IM.magazinePhoto;
  }

  /* ---------- newspaper collage ---------- */
  var MAST = ["The Induk Gazette", "Campus Herald", "The Daily Record", "Student Chronicle", "Press Times"];
  var COND = ["축제의 밤", "총학생회 소식", "SPECIAL EDITION", "CAMPUS LIFE", "연말호 발간"];
  var HEADS = ["축제의 밤, 캠퍼스를 밝히다", "총학생회 언론부 연말호 발간", "새내기 배움터 현장 스케치", "학우들의 한 해를 담다",
    "체육대회, 함성으로 가득한 하루", "도서관 앞 가을 풍경", "총학생회 사업 결산", "졸업을 앞둔 학우들의 이야기"];
  var TXT = "언론부는 학교에서 일어나는 다양한 행사와 활동, 그리고 학우들의 이야기를 기록하고 정리합니다. 흩어지는 순간을 모아 하나의 이야기로 만들고, 그 기록을 학우들과 공유합니다. 한 해 동안 진행된 학교 주요 행사와 다양한 활동, 캠퍼스의 풍경을 수집하고 편집하여 인덕대학교의 한 해를 하나의 잡지로 완성합니다. ";
  function fillNews(el) {
    var R = rng(+el.getAttribute("data-seed") || 1);
    var wrap = document.createElement("div");
    wrap.className = "np";
    var html = "", spans = [3, 2, 1, 2, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 2, 1, 2];
    for (var i = 0; i < spans.length; i++) {
      var sp = spans[i], k = R();
      html += '<div class="np-art" style="grid-column:span ' + sp + '">';
      if (k < .3 && sp > 1) html += '<p class="np-mast" style="font-size:' + (2.2 + R() * 1.6 * sp).toFixed(2) + 'cqw">' + MAST[Math.floor(R() * MAST.length)] + "</p>";
      else if (k < .5) html += '<p class="np-mast cond" style="font-size:' + (1.6 + R() * 1.4 * sp).toFixed(2) + 'cqw">' + COND[Math.floor(R() * COND.length)] + "</p>";
      else html += '<p class="np-head">' + HEADS[Math.floor(R() * HEADS.length)] + "</p>";
      if (R() < .3) html += '<div class="np-photo"></div>';
      var n = 1 + Math.floor(R() * 3), t = "";
      for (var j = 0; j < n; j++) t += TXT;
      html += '<p class="np-txt">' + t + "</p></div>";
    }
    wrap.innerHTML = html;
    el.appendChild(wrap);
  }
  $$(".newsprint").forEach(fillNews);

  /* ---------- torn edges (clip-path) ---------- */
  $$("[data-torn]").forEach(function (el, idx) {
    var R = rng(41 + idx * 13), amp = +el.getAttribute("data-amp") || 3;
    function edge(y0, dir) {
      var arr = [], x = -1;
      while (x <= 101) {
        var big = R() < .05 ? amp * (0.4 + R() * .8) : 0;      // occasional deep rip
        arr.push([x, y0 + dir * (R() * amp * .55 + big)]);
        x += .25 + R() * 1.1;
      }
      return arr;
    }
    var top = edge(0, 1), bot = edge(100, -1).reverse();
    var poly = top.concat(bot);
    el.style.clipPath = "polygon(" + poly.map(function (p) {
      return p[0].toFixed(2) + "% " + Math.max(0, Math.min(100, p[1])).toFixed(2) + "%";
    }).join(",") + ")";
  });

  /* ---------- film scratches & dust ---------- */
  var sc = $("#scratches"), sx = sc.getContext("2d"), SW = 0, SH = 0;
  function sizeSc() {
    var r = sc.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    SW = r.width; SH = r.height;
    sc.width = Math.round(SW * dpr); sc.height = Math.round(SH * dpr);
    sx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  var lastS = 0;
  function drawScratches(t) {
    if (t - lastS > 90) {
      lastS = t;
      sx.clearRect(0, 0, SW, SH);
      var n = Math.random() < .55 ? 1 + Math.floor(Math.random() * 2) : 0;
      for (var i = 0; i < n; i++) {
        var x = Math.random() * SW, len = SH * (.3 + Math.random() * .7), y = Math.random() * (SH - len);
        sx.strokeStyle = "rgba(237,232,222," + (.08 + Math.random() * .22) + ")";
        sx.lineWidth = .6 + Math.random() * .8;
        sx.beginPath(); sx.moveTo(x, y);
        sx.quadraticCurveTo(x + (Math.random() - .5) * 14, y + len / 2, x + (Math.random() - .5) * 10, y + len);
        sx.stroke();
      }
      var d = 6 + Math.floor(Math.random() * 14);
      for (var k = 0; k < d; k++) {
        var dark = Math.random() < .5;
        sx.fillStyle = dark ? "rgba(0,0,0," + (.3 + Math.random() * .5) + ")" : "rgba(237,232,222," + (.15 + Math.random() * .4) + ")";
        var rx = Math.random() * SW, ry = Math.random() * SH, rr = .5 + Math.random() * 1.8;
        sx.beginPath(); sx.ellipse(rx, ry, rr, rr * (.4 + Math.random()), Math.random() * 3, 0, 6.28); sx.fill();
      }
      if (Math.random() < .08) { // hair
        sx.strokeStyle = "rgba(0,0,0,.35)"; sx.lineWidth = .8;
        var hx = Math.random() * SW, hy = Math.random() * SH;
        sx.beginPath(); sx.moveTo(hx, hy);
        sx.bezierCurveTo(hx + 20, hy - 15, hx + 30, hy + 20, hx + 50, hy + 4); sx.stroke();
      }
    }
    if (!reduce) requestAnimationFrame(drawScratches);
  }
  var stage = $("#stage");
  if ("ResizeObserver" in window) new ResizeObserver(sizeSc).observe(stage); else window.addEventListener("resize", sizeSc);
  sizeSc();
  if (!reduce) requestAnimationFrame(drawScratches);

  /* ---------- deck ---------- */
  var slides = $$(".slide"), N = slides.length;
  var idx = -1, step = 0, started = false;
  var curEl = $("#cur"), totEl = $("#tot"), bar = $("#bar"), chap = $("#chapter"), flash = $("#flash");
  var prevBtn = $("#prev"), nextBtn = $("#next");
  totEl.textContent = pad(N);
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function stepsOf(i) { return +slides[i].getAttribute("data-steps") || 1; }
  function cut() {
    if (reduce) return;
    flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go");
  }
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
    if (i !== idx) { slides[i].classList.remove("active"); void slides[i].offsetWidth; cut(); }
    idx = i; step = s || 0;
    render();
  }
  function next() {
    if (!started) return finishLoader();
    if (step < stepsOf(idx) - 1) { step++; cut(); render(); }
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

  var tx = 0, ty = 0, tt = 0;
  stage.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now();
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Date.now() - tt < 800 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
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

  /* ---------- opening year card ---------- */
  var startAt = 0, hm = /^#s(\d)$/.exec(location.hash);
  if (hm) startAt = Math.min(N - 1, Math.max(0, +hm[1] - 1));
  var loader = $("#loader"), ldbar = $("#ldbar"), ldpct = $("#ldpct");
  var DUR = reduce ? 0 : 2000, t0 = performance.now(), raf;
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
    if (p < 1) raf = requestAnimationFrame(tick); else setTimeout(finishLoader, 350);
  }
  raf = requestAnimationFrame(tick);
  loader.addEventListener("click", finishLoader);
})();
