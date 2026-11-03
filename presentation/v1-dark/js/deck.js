(function () {
  "use strict";
  var C = window.DECK_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- config ---------- */
  $$("[data-cfg]").forEach(function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });
  var IM = C.images || {};
  function loadInto(el, src, cb) {
    if (!src) return;
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + src.replace(/"/g, '\\"') + '")';
      el.classList.add("has-img");
      if (cb) cb();
    };
    img.src = src;
  }
  $$("[data-img]").forEach(function (el) { loadInto(el, IM[el.getAttribute("data-img")]); });
  if (IM.magazinePhoto) {
    var mp = $("#magphoto");
    mp.onload = function () { mp.hidden = false; $("#mock").hidden = true; };
    mp.src = IM.magazinePhoto;
  }

  /* ---------- procedural campus skyline ---------- */
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function drawSkyline(cv) {
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = r.width, H = r.height, R = rng(+cv.getAttribute("data-seed") || 7);
    c.clearRect(0, 0, W, H);
    var layers = [
      { col: "#1D2421", hMin: .30, hMax: .80, lit: .06, alpha: .75 },
      { col: "#131816", hMin: .18, hMax: .62, lit: .14, alpha: 1 }
    ];
    var unit = Math.max(4, W / 260);
    layers.forEach(function (L, li) {
      var x = -unit * 2;
      c.globalAlpha = L.alpha;
      while (x < W) {
        var w = W * (.035 + R() * .085);
        var bias = .45 + .75 * Math.min(1, Math.max(0, x / W));
        var h = H * (L.hMin + R() * (L.hMax - L.hMin)) * bias;
        var top = H - h;
        c.fillStyle = L.col;
        c.fillRect(x, top, w, h);
        if (R() < .22) { // tower / roof detail
          var tw = w * (.18 + R() * .2), th = h * (.12 + R() * .25), tx = x + w * (.2 + R() * .5);
          c.fillRect(tx, top - th, tw, th);
          if (R() < .5) c.fillRect(tx + tw / 2 - .6, top - th - unit * 3, 1.2, unit * 3);
        }
        // windows
        var gx = unit * 1.7, gy = unit * 2.2;
        for (var wx = x + gx * .6; wx < x + w - gx * .6; wx += gx) {
          for (var wy = top + gy; wy < H - gy; wy += gy) {
            if (R() < L.lit * (li ? 1 : .6)) {
              c.fillStyle = "rgba(255," + (190 + Math.round(R() * 30)) + ",130," + (.18 + R() * .5) + ")";
              c.fillRect(wx, wy, unit * .55, unit * .8);
            }
          }
        }
        x += w + (R() < .3 ? W * R() * .012 : 0);
      }
    });
    c.globalAlpha = 1;
    var fog = c.createLinearGradient(0, H, 0, H * .35);
    fog.addColorStop(0, "rgba(9,11,11,.95)");
    fog.addColorStop(.45, "rgba(9,11,11,.35)");
    fog.addColorStop(1, "rgba(9,11,11,0)");
    c.fillStyle = fog; c.fillRect(0, 0, W, H);
  }
  function drawAllSkylines() { $$("canvas.skyline").forEach(drawSkyline); }

  /* ---------- floating dust ---------- */
  var dust = $("#dust"), dc = dust.getContext("2d"), parts = [], DW = 0, DH = 0;
  function sizeDust() {
    var r = dust.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    DW = r.width; DH = r.height;
    dust.width = Math.round(DW * dpr); dust.height = Math.round(DH * dpr);
    dc.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(90, Math.round(DW * DH / 16000));
    parts = [];
    for (var i = 0; i < n; i++) parts.push(newPart(true));
  }
  function newPart(anywhere) {
    return {
      x: Math.random() * DW, y: anywhere ? Math.random() * DH : DH + 6,
      r: .4 + Math.random() * 1.5, vy: .06 + Math.random() * .28,
      a: .12 + Math.random() * .5, ph: Math.random() * 6.28,
      ember: Math.random() < .12
    };
  }
  function drawDust(t) {
    dc.clearRect(0, 0, DW, DH);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!reduce) {
        p.y -= p.vy; p.x += Math.sin(t * .0004 + p.ph) * .15;
        if (p.y < -6) parts[i] = p = newPart(false);
      }
      var a = p.a * (.55 + .45 * Math.sin(t * .0018 + p.ph));
      dc.fillStyle = p.ember ? "rgba(214,110,80," + a + ")" : "rgba(222,200,160," + a + ")";
      dc.beginPath(); dc.arc(p.x, p.y, p.r, 0, 6.2832); dc.fill();
    }
  }
  function loop(t) {
    if (!document.hidden) drawDust(t || 0);
    if (!reduce) requestAnimationFrame(loop);
  }

  var stage = $("#stage");
  function onResize() { sizeDust(); drawAllSkylines(); if (reduce) drawDust(0); }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(stage);
  else window.addEventListener("resize", onResize);
  onResize();
  requestAnimationFrame(loop);

  /* ---------- deck ---------- */
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
    if (i !== idx) {
      // replay entrance motion when re-entering a slide
      slides[i].classList.remove("active");
      void slides[i].offsetWidth;
    }
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

  // swipe
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

  // fullscreen
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
    if (m && started) { var i = +m[1] - 1; if (i !== idx) go(i, 0); }
  });

  /* ---------- opening ---------- */
  var startAt = 0;
  var hm = /^#s(\d)$/.exec(location.hash);
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
    var p = DUR ? Math.min(1, (now - t0) / DUR) : 1;
    var e = 1 - Math.pow(1 - p, 3);
    ldbar.style.width = (e * 100) + "%";
    ldpct.textContent = Math.round(e * 100) + "%";
    if (p < 1) raf = requestAnimationFrame(tick);
    else setTimeout(finishLoader, 350);
  }
  raf = requestAnimationFrame(tick);
  loader.addEventListener("click", finishLoader);
})();
