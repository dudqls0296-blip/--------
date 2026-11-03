(function () {
  "use strict";
  var C = window.PRESS_CONFIG || {};
  var G = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = $("#stage"), deck = $("#deck");

  /* ---------- config text ---------- */
  $$("[data-cfg]").forEach(function (el) { var v = C[el.getAttribute("data-cfg")]; if (v) el.textContent = v; });
  $$(".stamp-year").forEach(function (el) { if (C.year) el.textContent = C.year; });

  /* ---------- photos (real image if set, darkroom print otherwise) ---------- */
  function setPhoto(el, item) {
    var fallback = window.PressPhotos ? window.PressPhotos.render(item.kind || "campus", item.seed || 1) : "";
    el.style.backgroundImage = 'url("' + fallback + '")';
    if (item.src) {
      var img = new Image();
      img.onload = function () { el.style.backgroundImage = 'url("' + item.src.replace(/"/g, '\\"') + '")'; };
      img.src = item.src;
    }
  }
  var WORK = C.work || [], ARCH = C.archive || [];
  $$("[data-photo]").forEach(function (el) {
    var p = el.getAttribute("data-photo").split(":"), list = p[0] === "work" ? WORK : ARCH, item = list[+p[1]];
    if (item) setPhoto(el, item);
  });

  // intro film curl
  var introFilm = $("#introFilm");
  ARCH.slice(0, 5).forEach(function (it) { var s = document.createElement("span"); setPhoto(s, it); introFilm.appendChild(s); });

  // work prints
  var LAYOUT = [
    { l: 0, t: 5, w: 53, r: -2.6 },
    { l: 57, t: 0, w: 40, r: 3.2 },
    { l: 52, t: 49, w: 36, r: -3.6 },
    { l: 9, t: 55, w: 37, r: 2.4 }
  ];
  var printsBox = $("#workPrints"), workPrints = [];
  WORK.slice(0, 4).forEach(function (it, i) {
    var L = LAYOUT[i], f = document.createElement("figure");
    f.className = "print";
    f.style.left = L.l + "%"; f.style.top = L.t + "%"; f.style.width = L.w + "%";
    f.dataset.r = L.r;
    f.innerHTML = '<div class="print__img"></div><figcaption><span>' + esc(it.caption || "") + "</span><span>No. 0" + (i + 1) + "</span></figcaption>";
    setPhoto(f.firstChild, it);
    f.addEventListener("click", function () { openLB(LBWORK, i, f); });
    printsBox.appendChild(f);
    workPrints.push(f);
  });
  var LBWORK = WORK.slice(0, 4);

  // film strip (two copies for an endless loop)
  var track = $("#stripTrack");
  for (var rep = 0; rep < 2; rep++) {
    ARCH.forEach(function (it, i) {
      var b = document.createElement("button");
      b.className = "frame"; b.type = "button";
      b.setAttribute("aria-label", (it.caption || "사진") + " 크게 보기");
      if (rep) b.tabIndex = -1;
      b.innerHTML = "<span></span><i>" + (i + 1) + "A ▸ PRESS 400</i>";
      setPhoto(b.firstChild, it);
      b.addEventListener("click", function () { openLB(ARCH, i, b); });
      track.appendChild(b);
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // iris blades
  var blades = $("#irisBlades"), bladeRects = [];
  for (var k = 0; k < 6; k++) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", "rotate(" + (k * 60) + ")");
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", -160); r.setAttribute("y", 140); r.setAttribute("width", 320); r.setAttribute("height", 200);
    g.appendChild(r); blades.appendChild(g); bladeRects.push(r);
  }

  // typewriter split
  $$(".typeline").forEach(function (p) {
    var t = p.textContent; p.textContent = "";
    for (var i = 0; i < t.length; i++) { var s = document.createElement("span"); s.className = "ch"; s.textContent = t[i]; p.appendChild(s); }
  });

  /* ---------- pages / HUD ---------- */
  var pages = $$(".page"), N = pages.length, idx = -1, step = 0, cur = null;
  var chipsBox = $("#chips"), chips = [];
  pages.forEach(function (pg, i) {
    var b = document.createElement("button");
    b.className = "chip"; b.type = "button";
    b.innerHTML = "<b>0" + (i + 1) + "</b>" + pg.getAttribute("data-title");
    b.addEventListener("click", function () { go(i); });
    chipsBox.appendChild(b); chips.push(b);
  });
  $("#tot").textContent = "0" + N;
  var bar = $("#bar"), curEl = $("#cur"), prevBtn = $("#prev"), nextBtn = $("#next");
  function stepsOf(i) { return +pages[i].getAttribute("data-steps") || 1; }

  function updateHud() {
    curEl.textContent = "0" + (idx + 1);
    chips.forEach(function (c, i) { c.classList.toggle("on", i === idx); });
    deck.classList.toggle("dark", idx === 0 || (idx === N - 1 && step === 1));
    prevBtn.disabled = idx === 0 && step === 0;
    nextBtn.disabled = idx === N - 1 && step === stepsOf(idx) - 1;
    try { history.replaceState(null, "", "#p" + (idx + 1)); } catch (e) {}
  }
  function tickHud() {
    if (idx < 0) return;
    var tp = cur ? cur.progress() : 1, steps = stepsOf(idx);
    var pp = (step + tp) / steps;
    bar.style.width = ((idx + pp) / N * 100) + "%";
    chips.forEach(function (c, i) { c.style.setProperty("--p", i < idx ? 1 : i === idx ? pp : 0); });
  }

  /* ---------- reusable effects ---------- */
  function flash(strength) {
    return G.timeline().set("#flash", { opacity: 0 })
      .to("#flash", { opacity: strength || 1, duration: .05, ease: "none" })
      .to("#flash", { opacity: 0, duration: .9, ease: "power2.out" });
  }
  function shutter() {
    var tl = G.timeline();
    tl.set("#iris", { visibility: "visible" })
      .set(bladeRects, { attr: { y: 140 } })
      .set("#irisBlades", { rotation: 0, svgOrigin: "0 0" })
      .to(bladeRects, { attr: { y: -1 }, duration: .38, ease: "power3.in" })
      .to("#irisBlades", { rotation: 32, duration: .38, ease: "power3.in" }, "<")
      .add(flash(.9), "+=.06")
      .to(bladeRects, { attr: { y: 140 }, duration: .75, ease: "power3.out" }, "<.05")
      .to("#irisBlades", { rotation: 64, duration: .75, ease: "power3.out" }, "<")
      .set("#iris", { visibility: "hidden" });
    return tl;
  }
  function writeOn(svg, dur) {
    var text = $(".wtext", svg), rect = $(".wm", svg), pen = $(".wpen", svg);
    var bb; try { bb = text.getBBox(); } catch (e) { bb = { x: 100, y: 60, width: 800, height: 140 }; }
    if (bb.width > 920) {               // keep the handwriting inside the sheet whatever font loads
      var fs = parseFloat(getComputedStyle(text).fontSize) || 150;
      text.style.fontSize = (fs * 920 / bb.width).toFixed(1) + "px";
      try { bb = text.getBBox(); } catch (e) {}
    }
    var x0 = bb.x - 20, W = bb.width + 60;
    var o = { p: 0 };
    G.set(rect, { attr: { x: x0, width: 0 } });
    G.set(pen, { opacity: 0, x: x0, y: bb.y + bb.height * .6 });
    function upd() {
      var p = o.p, x = x0 + W * p;
      var y = bb.y + bb.height * (.58 + .16 * Math.sin(p * 46) + .06 * Math.sin(p * 13));
      rect.setAttribute("width", W * p + 40);
      pen.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
    }
    var tl = G.timeline();
    tl.to(pen, { opacity: 1, duration: .25 })
      .to(o, { p: 1, duration: dur, ease: "power1.inOut", onUpdate: upd }, "<")
      .to(pen, { opacity: 0, duration: .5, ease: "power2.in" }, "-=.15");
    return tl;
  }
  function resetWrite(svg) {
    G.set($(".wm", svg), { attr: { width: 0 } });
    G.set($(".wpen", svg), { opacity: 0 });
  }

  /* ---------- page timelines ---------- */
  var ENTER = [
    function intro() {
      var pg = pages[0], flap = $("#introFlap"), paper = $("#introPaper"), sheet = $("#introSheet");
      resetWrite($("#writeIntro"));
      G.set($$("[data-sh]", pg), { opacity: 0 });
      G.set($$("[data-t]", pg), { opacity: 0, y: 14 });
      G.set("#introStamp", { opacity: 0, scale: 1.9, rotation: -32 });
      G.set($$("[data-obj]", pg), { opacity: 0, y: 24 });
      G.set($(".room__lamp", pg), { opacity: 0 });
      G.set(sheet, { opacity: 0, yPercent: 16, scale: .84, rotation: -3 });
      G.set(paper, { clipPath: "inset(0% 0% 50% 0%)" });
      G.set(flap, { rotationX: 180, opacity: 1, transformOrigin: "50% 0%" });
      return G.timeline()
        .to($(".room__lamp", pg), { opacity: 1, duration: 1.6, ease: "power2.out" })
        .to($$("[data-obj]", pg), { opacity: 1, y: 0, duration: 1.4, stagger: .14, ease: "power3.out" }, "-=1.2")
        .to(sheet, { opacity: 1, yPercent: 0, scale: 1, rotation: 0, duration: 1.4, ease: "power3.out" }, "-=1.3")
        .to(flap, { rotationX: 0, duration: 1.15, ease: "power2.inOut" }, "-=.25")
        .to(paper, { clipPath: "inset(0% 0% 0% 0%)", duration: .5, ease: "power1.out" }, "-=.5")
        .to(flap, { opacity: 0, duration: .25 }, "-=.1")
        .to($$("[data-sh]", pg), { opacity: 1, duration: .7, stagger: .12 })
        .add(writeOn($("#writeIntro"), 2.7), "-=.3")
        .add(flash(1), "-=.05")
        .to($$("[data-t]", pg), { opacity: 1, y: 0, duration: 1, stagger: .16, ease: "power3.out" }, "-=.55")
        .to("#introStamp", { opacity: .9, scale: 1, rotation: -14, duration: .38, ease: "back.out(2.4)" }, "-=.35");
    },
    function about() {
      var pg = pages[1];
      G.set($(".unfold", pg), { visibility: "visible" });
      G.set($(".unfold__flap--t", pg), { rotationX: 0, opacity: 1 });
      G.set($(".unfold__flap--b", pg), { rotationX: 0, opacity: 1 });
      G.set($$("[data-in]", pg), { opacity: 0, y: 26 });
      return G.timeline()
        .to($(".unfold__flap--t", pg), { rotationX: -94, duration: 1.25, ease: "power3.inOut" }, .15)
        .to($(".unfold__flap--b", pg), { rotationX: 94, duration: 1.25, ease: "power3.inOut" }, "<")
        .to($$(".unfold__flap", pg), { opacity: 0, duration: .3 }, "-=.35")
        .set($(".unfold", pg), { visibility: "hidden" })
        .to($$("[data-in]", pg), { opacity: 1, y: 0, duration: 1.1, stagger: .09, ease: "power3.out" }, "-=.75");
    },
    function work() {
      var pg = pages[2];
      G.set($$("[data-in]", pg), { opacity: 0, y: 24 });
      workPrints.forEach(function (p) {
        G.set(p, { opacity: 0, y: -40, rotation: +p.dataset.r + 9, scale: 1.08 });
        G.set(p.firstChild, { filter: "brightness(2.6) contrast(.45) sepia(.7) blur(1.5px)" });
      });
      return G.timeline()
        .add(shutter(), 0)
        .to($$("[data-in]", pg), { opacity: 1, y: 0, duration: 1, stagger: .08, ease: "power3.out" }, .7)
        .to(workPrints, { opacity: 1, y: 0, scale: 1, rotation: function (i, el) { return +el.dataset.r; }, duration: 1.1, stagger: .16, ease: "power3.out" }, .85)
        .to(workPrints.map(function (p) { return p.firstChild; }), { filter: "brightness(1) contrast(1) sepia(0) blur(0px)", duration: 2.6, stagger: .16, ease: "power2.out" }, 1.1);
    },
    function archive() {
      var pg = pages[3];
      G.set($$("[data-in]", pg), { opacity: 0, y: 26 });
      G.set("#strip", { opacity: 0, xPercent: 18 });
      return G.timeline()
        .add(flash(.55), 0)
        .to($$(".p4__head [data-in]", pg), { opacity: 1, y: 0, duration: 1, stagger: .1, ease: "power3.out" }, .15)
        .to("#strip", { opacity: 1, xPercent: 0, y: 0, duration: 1.6, ease: "power3.out" }, .3)
        .to($$(".records [data-in]", pg), { opacity: 1, y: 0, duration: 1, stagger: .12, ease: "power3.out" }, .7);
    },
    function ending() {
      var pg = pages[4], paper = $("#endPaper"), sheet = $("#endSheet");
      resetWrite($("#writeEnd"));
      G.set($$("[data-sh]", pg), { opacity: 0 });
      G.set($$(".typeline .ch", pg), { opacity: 0 });
      G.set("#endStamp", { opacity: 0, scale: 1.9, rotation: -30 });
      G.set(sheet, { opacity: 0, yPercent: 10, scale: .92, rotation: 2, rotationX: 0 });
      G.set(paper, { clipPath: "inset(0% 0% 0% 0%)" });
      G.set("#endFlap", { opacity: 0, rotationX: 0, transformOrigin: "50% 0%" });
      G.set(".p5__dark", { opacity: 0 });
      G.set("#finale", { autoAlpha: 0, y: 20 });
      G.set("#endHint", { opacity: 0 });
      var lines = $$(".typeline", pg);
      var tl = G.timeline()
        .to(sheet, { opacity: 1, yPercent: 0, scale: 1, rotation: 0, duration: 1.2, ease: "power3.out" })
        .to($$("[data-sh]", pg), { opacity: 1, duration: .6, stagger: .1 }, "-=.6")
        .add(writeOn($("#writeEnd"), 2.6), "-=.2");
      lines.forEach(function (ln, i) {
        var chs = $$(".ch", ln);
        tl.to(chs, { opacity: 1, duration: .01, stagger: .034, ease: "none" }, i ? "+=.15" : "+=.1");
      });
      tl.to("#endStamp", { opacity: .9, scale: 1, rotation: -12, duration: .38, ease: "back.out(2.4)" }, "+=.1")
        .to("#endHint", { opacity: 1, duration: .6 }, "+=.3");
      return tl;
    }
  ];
  function foldOut() {
    var paper = $("#endPaper"), sheet = $("#endSheet"), flap = $("#endFlap");
    return G.timeline()
      .to("#endHint", { opacity: 0, duration: .3 })
      .set(flap, { opacity: 1, rotationX: 0 })
      .to(paper, { clipPath: "inset(0% 0% 50% 0%)", duration: .5, ease: "power1.in" }, "<.1")
      .to(flap, { rotationX: 180, duration: 1.1, ease: "power2.inOut" }, "<")
      .to(sheet, { rotation: -6, scale: .6, duration: 1, ease: "power2.inOut" }, "-=.35")
      .to(".p5__dark", { opacity: 1, duration: 1.4, ease: "power2.inOut" }, "<")
      .to(sheet, { yPercent: 140, rotation: -18, scale: .32, opacity: 0, duration: 1.1, ease: "power3.in" }, "-=.4")
      .add(flash(.35), "-=.2")
      .to("#finale", { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" }, "-=.4");
  }

  /* ---------- navigation ---------- */
  function show(i, instant) {
    if (i < 0 || i >= N) return;
    var prevPage = pages[idx];
    if (cur) cur.kill();
    if (prevPage && i !== idx) G.to(prevPage, { autoAlpha: 0, duration: .45, ease: "power2.out", zIndex: 1 });
    idx = i; step = 0;
    G.set(pages[i], { autoAlpha: 1, zIndex: 2 });
    cur = ENTER[i]();
    if (instant || reduce) cur.progress(1);
    updateHud();
  }
  function go(i) { if (i !== idx) show(i); }
  function next() {
    if (lbOpen) return;
    if (cur && cur.progress() < .97) { cur.progress(1); return; }
    if (idx === N - 1 && step === 0) { step = 1; cur = foldOut(); if (reduce) cur.progress(1); updateHud(); return; }
    if (idx < N - 1) show(idx + 1);
  }
  function prev() {
    if (lbOpen) return;
    if (idx === N - 1 && step === 1) { show(N - 1, true); return; }
    if (idx > 0) show(idx - 1, true);
  }
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (lbOpen) {
      if (k === "Escape" || k === " ") { e.preventDefault(); closeLB(); }
      else if (k === "ArrowRight") { e.preventDefault(); stepLB(1); }
      else if (k === "ArrowLeft") { e.preventDefault(); stepLB(-1); }
      return;
    }
    if (e.repeat) return;
    if (k === "ArrowRight" || k === "PageDown" || k === "ArrowDown" || k === " " || k === "Enter") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "PageUp" || k === "ArrowUp" || k === "Backspace") { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); show(0); }
    else if (k === "End") { e.preventDefault(); show(N - 1); }
    else if (k === "f" || k === "F") toggleFs();
  });

  var sx = 0, sy = 0, st = 0;
  stage.addEventListener("touchstart", function (e) { var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 800 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (lbOpen) stepLB(dx < 0 ? 1 : -1); else if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  function toggleFs() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) { var p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
  }
  $("#fsbtn").addEventListener("click", toggleFs);
  if (!document.documentElement.requestFullscreen) $("#fsbtn").hidden = true;

  /* ---------- mouse-reactive objects ---------- */
  var movers = $$("[data-depth]").map(function (el) {
    return { el: el, d: +el.getAttribute("data-depth"), x: G ? G.quickTo(el, "x", { duration: 1, ease: "power3" }) : null, y: G ? G.quickTo(el, "y", { duration: 1, ease: "power3" }) : null, cam: $(".camera", el) };
  });
  stage.addEventListener("pointermove", function (e) {
    if (!G || reduce) return;
    var r = stage.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    movers.forEach(function (m) {
      m.x(nx * m.d); m.y(ny * m.d * .6);
      if (m.cam) G.to(m.cam, { rotationY: nx * 14, rotationX: -ny * 10, duration: 1, ease: "power3", transformPerspective: 700, overwrite: "auto" });
    });
    workPrints.forEach(function (p, i) {
      G.to(p, { x: nx * (6 + i * 4), y: ny * (4 + i * 3), duration: 1.2, ease: "power3", overwrite: false });
    });
  });

  /* ---------- film strip loop ---------- */
  var loop = null;
  function startLoop() {
    if (!G || reduce || loop) return;
    loop = G.to(track, { xPercent: -50, duration: 70, ease: "none", repeat: -1 });
  }
  $("#strip").addEventListener("pointerenter", function () { if (loop) G.to(loop, { timeScale: .12, duration: .6 }); });
  $("#strip").addEventListener("pointerleave", function () { if (loop) G.to(loop, { timeScale: 1, duration: .8 }); });

  /* ---------- lightbox ---------- */
  var lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbNo = $("#lbNo"), lbCard = $("#lbCard");
  var lbOpen = false, lbList = ARCH, lbIdx = 0;
  function fillLB() {
    var it = lbList[lbIdx];
    setPhoto(lbImg, it);
    lbCap.textContent = it.caption || "";
    lbNo.textContent = "No. " + ("0" + (lbIdx + 1)).slice(-2) + " / " + ("0" + lbList.length).slice(-2);
  }
  function openLB(list, i, fromEl) {
    lbList = list; lbIdx = i; fillLB();
    lb.hidden = false; lbOpen = true;
    if (loop) loop.pause();
    if (G && !reduce) {
      var sr = stage.getBoundingClientRect(), fr = fromEl.getBoundingClientRect();
      var cx = fr.left + fr.width / 2 - (sr.left + sr.width / 2), cy = fr.top + fr.height / 2 - (sr.top + sr.height / 2);
      G.fromTo("#lbBg", { opacity: 0 }, { opacity: 1, duration: .5 });
      G.fromTo(lbCard, { x: cx, y: cy, scale: fr.width / lbCard.offsetWidth, rotation: -4 }, { x: 0, y: 0, scale: 1, rotation: 0, duration: .75, ease: "power3.out" });
      G.fromTo(".lb__btn,.lb__close", { opacity: 0 }, { opacity: 1, duration: .5, delay: .3 });
    }
    $("#lbClose").focus();
  }
  function closeLB() {
    if (!lbOpen) return;
    lbOpen = false;
    var done = function () { lb.hidden = true; if (loop) loop.resume(); };
    if (G && !reduce) G.timeline({ onComplete: done }).to(lbCard, { scale: .9, opacity: 0, duration: .35, ease: "power2.in" }).to("#lbBg", { opacity: 0, duration: .3 }, "<").set(lbCard, { opacity: 1 });
    else done();
  }
  function stepLB(d) {
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    if (G && !reduce) G.timeline().to(lbImg, { opacity: 0, x: -d * 30, duration: .2 }).add(fillLB).fromTo(lbImg, { x: d * 30 }, { opacity: 1, x: 0, duration: .45, ease: "power3.out" });
    else fillLB();
  }
  $("#lbClose").addEventListener("click", closeLB);
  $("#lbBg").addEventListener("click", closeLB);
  $("#lbPrev").addEventListener("click", function () { stepLB(-1); });
  $("#lbNext").addEventListener("click", function () { stepLB(1); });

  /* ---------- start ---------- */
  function startAt() { var m = /^#p(\d)$/.exec(location.hash); return m ? Math.min(N - 1, Math.max(0, +m[1] - 1)) : 0; }

  if (!G) {
    // static fallback when the animation library cannot load
    document.documentElement.classList.add("no-gsap");
    $$(".wm").forEach(function (r) { r.setAttribute("width", 1000); });
    $$(".sheet__flap,.unfold,.finale,.p5__hint").forEach(function (el) { el.style.display = "none"; });
    var si = startAt();
    var setPage = function (i) { pages.forEach(function (p, j) { p.classList.toggle("on", j === i); }); idx = i; updateHud(); bar.style.width = ((i + 1) / N * 100) + "%"; };
    show = function (i) { if (i >= 0 && i < N) setPage(i); };
    next = function () { show(idx + 1); }; prev = function () { show(idx - 1); };
    prevBtn.onclick = prev; nextBtn.onclick = next;
    setPage(si);
    return;
  }

  G.ticker.add(tickHud);
  function boot() { startLoop(); show(startAt()); }
  var booted = false;
  function once() { if (!booted) { booted = true; boot(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(once);
  setTimeout(once, 2500);
})();
