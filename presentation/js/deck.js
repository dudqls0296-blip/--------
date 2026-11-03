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
    setTimeout(function () { chap.textContent = text; chap.classList.remove("swap"); }, 280);
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

  /* ---------- opening ---------- */
  var startAt = 0, hm = /^#s(\d)$/.exec(location.hash);
  if (hm) startAt = Math.min(N - 1, Math.max(0, +hm[1] - 1));
  var loader = $("#loader"), ldbar = $("#ldbar"), ldpct = $("#ldpct");
  var DUR = reduce ? 0 : 2200, t0 = performance.now(), raf;
  function finishLoader() {
    if (started) return;
    started = true;
    cancelAnimationFrame(raf);
    ldbar.style.width = "100%"; ldpct.textContent = "100";
    loader.classList.add("done");
    go(startAt, 0);
  }
  function tick(now) {
    var p = DUR ? Math.min(1, (now - t0) / DUR) : 1, e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    ldbar.style.width = (e * 100) + "%";
    ldpct.textContent = ("00" + Math.round(e * 100)).slice(-3);
    if (p < 1) raf = requestAnimationFrame(tick); else setTimeout(finishLoader, 450);
  }
  raf = requestAnimationFrame(tick);
  loader.addEventListener("click", finishLoader);
})();
