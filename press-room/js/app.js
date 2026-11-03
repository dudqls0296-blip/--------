(function () {
  "use strict";
  var C = window.PRESS_CONFIG || {}, G = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = $("#stage"), deck = $("#deck");
  function u(v) { return v * stage.clientWidth / 100; }   // cqw → px
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- content ---------- */
  $$("[data-cfg]").forEach(function (el) { var v = C[el.getAttribute("data-cfg")]; if (v) el.textContent = v; });
  var WORK = (C.work || []).slice(0, 4), ARCH = C.archive || [];
  function setPhoto(el, it) {
    if (!it) return;
    el.style.backgroundImage = 'url("' + window.PressPhotos.render(it.kind || "campus", it.seed || 1) + '")';
    if (it.src) { var im = new Image(); im.onload = function () { el.style.backgroundImage = 'url("' + it.src.replace(/"/g, '\\"') + '")'; }; im.src = it.src; }
  }
  function pick(ref) { var p = ref.split(":"); return (p[0] === "work" ? WORK : ARCH)[+p[1]]; }

  var tilesBox = $("#tiles"), tiles = [];
  WORK.forEach(function (it, i) {
    var f = document.createElement("figure");
    f.className = "tile"; f.setAttribute("data-cursor", "view");
    f.innerHTML = '<div class="tile__img"></div><figcaption><b>' + esc(it.title || "") + '</b><span class="mono">No. 0' + (i + 1) + "</span></figcaption>";
    setPhoto(f.firstChild, it);
    f.addEventListener("click", function () { openLB(WORK, i, f); });
    tilesBox.appendChild(f); tiles.push(f);
  });
  var filmTrack = $("#filmTrack");
  for (var rep = 0; rep < 2; rep++) ARCH.forEach(function (it, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "frame"; b.setAttribute("data-cursor", "view");
    b.setAttribute("aria-label", (it.caption || "사진") + " 크게 보기"); if (rep) b.tabIndex = -1;
    b.innerHTML = "<span></span><i>" + (i + 1) + "A ▸</i>";
    setPhoto(b.firstChild, it);
    b.addEventListener("click", function () { openLB(ARCH, i, b); });
    filmTrack.appendChild(b);
  });
  var irisG = $("#irisBlades"), blades = [];
  for (var k = 0; k < 6; k++) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("transform", "rotate(" + k * 60 + ")");
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", -170); r.setAttribute("y", 140); r.setAttribute("width", 340); r.setAttribute("height", 220);
    g.appendChild(r); irisG.appendChild(g); blades.push(r);
  }
  // global overlays that cover the outgoing page during transitions
  deck.appendChild($(".unfold")); deck.appendChild($("#iris"));

  /* ---------- text splitting ---------- */
  function splitChars(el) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            for (var i = 0; i < word.length; i++) {
              var m = document.createElement("span"); m.className = "chm";
              var c = document.createElement("span"); c.className = "chi"; c.textContent = word[i];
              m.appendChild(c); w.appendChild(m); out.push(c);
            }
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(el);
    el._chars = out;
    return out;
  }
  $$("[data-split],[data-split-f]").forEach(splitChars);
  $$(".tl").forEach(function (p) {
    var t = p.textContent; p.textContent = "";
    for (var i = 0; i < t.length; i++) { var s = document.createElement("span"); s.className = "c"; s.textContent = t[i]; p.appendChild(s); }
  });

  /* ---------- HUD ---------- */
  var pages = $$(".page"), N = pages.length, idx = -1, step = 0, cur = null, busy = false;
  var roll = $("#roll"), segsBox = $("#segs"), segs = [], chap = $("#chapter");
  pages.forEach(function (pg, i) {
    var bb = document.createElement("b"); bb.textContent = "0" + (i + 1); roll.appendChild(bb);
    var s = document.createElement("button"); s.type = "button"; s.className = "seg";
    s.innerHTML = '<span class="mono">0' + (i + 1) + " " + pg.getAttribute("data-title") + "</span><i></i>";
    s.addEventListener("click", function () { go(i); });
    segsBox.appendChild(s); segs.push(s);
  });
  var prevBtn = $("#prev"), nextBtn = $("#next");
  function stepsOf(i) { return +pages[i].getAttribute("data-steps") || 1; }
  function setChapter(t) {
    if (!G || chap.textContent === t) { chap.textContent = t; return; }
    G.timeline().to(chap, { yPercent: -110, duration: .35, ease: "power2.in" }).add(function () { chap.textContent = t; })
      .fromTo(chap, { yPercent: 110 }, { yPercent: 0, duration: .6, ease: "expo.out" });
  }
  function hud() {
    segs.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
    if (G) G.to(roll, { yPercent: -100 / N * idx, duration: 1, ease: "expo.inOut" });
    setChapter(pages[idx].getAttribute("data-chapter"));
    prevBtn.disabled = idx === 0 && step === 0;
    nextBtn.disabled = idx === N - 1 && step === stepsOf(idx) - 1;
    try { history.replaceState(null, "", "#p" + (idx + 1)); } catch (e) {}
  }
  function tickHud() {
    if (idx < 0) return;
    var p = (step + (cur ? cur.progress() : 1)) / stepsOf(idx);
    segs.forEach(function (s, i) { s.style.setProperty("--p", i < idx ? 1 : i === idx ? p : 0); });
  }

  /* ---------- effects ---------- */
  function flash(a) { return G.timeline().set("#flash", { opacity: 0 }).to("#flash", { opacity: a || 1, duration: .05, ease: "none" }).to("#flash", { opacity: 0, duration: 1, ease: "power2.out" }); }
  function chars(el, at, tl, extra) {
    tl.fromTo(el._chars, { yPercent: 118, rotation: 7 }, Object.assign({ yPercent: 0, rotation: 0, duration: 1.5, ease: "expo.out", stagger: .028 }, extra || {}), at);
  }
  function rise(list, at, tl, st) {
    tl.fromTo(list, { opacity: 0, y: u(1.4) }, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: st || .08 }, at);
  }
  function drawLines(svg, at, tl) {
    tl.fromTo($$(".ln:not(.ln--tick):not(.ln--dash)", svg), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", stagger: .14 }, at)
      .fromTo($$(".ln--tick,.ln--dash", svg), { opacity: 0 }, { opacity: 1, duration: 1.2 }, at + 1.2);
  }
  function writeOn(svg, dur) {
    var text = $(".wtext", svg), rect = $(".wm", svg), pen = $(".wpen", svg), bb;
    try { bb = text.getBBox(); } catch (e) { bb = { x: 100, y: 50, width: 800, height: 130 }; }
    if (bb.width > 900) { text.style.fontSize = (parseFloat(getComputedStyle(text).fontSize) * 900 / bb.width).toFixed(1) + "px"; try { bb = text.getBBox(); } catch (e) {} }
    var x0 = bb.x - 20, W = bb.width + 50, o = { p: 0 };
    rect.setAttribute("x", x0); rect.setAttribute("width", 0);
    function upd() {
      var p = o.p, x = x0 + W * p, y = bb.y + bb.height * (.6 + .15 * Math.sin(p * 44) + .05 * Math.sin(p * 11));
      rect.setAttribute("width", W * p + 30);
      pen.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
    }
    upd();
    return G.timeline().to(pen, { opacity: 1, duration: .3 }).to(o, { p: 1, duration: dur, ease: "power1.inOut", onUpdate: upd }, "<")
      .to(pen, { opacity: 0, x: "+=0", duration: .5 }, "-=.1");
  }

  /* ---------- page entrances ---------- */
  /* hero: dust in the lamp light */
  var dustCv = $("#dust"), dctx = dustCv.getContext("2d"), motes = [], DW = 0, DH = 0, dustOn = 0;
  function sizeDust() {
    var r = stage.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    DW = r.width; DH = r.height; dustCv.width = DW * d; dustCv.height = DH * d; dctx.setTransform(d, 0, 0, d, 0, 0);
    motes = [];
    for (var i = 0; i < 70; i++) motes.push({ x: DW * (.06 + Math.random() * .52), y: DH * (.08 + Math.random() * .6), r: .4 + Math.random() * 1.6, vx: (Math.random() - .5) * .08, vy: -.02 - Math.random() * .08, a: .15 + Math.random() * .55, p: Math.random() * 6.28, z: Math.random() });
  }
  function drawDust(t) {
    dctx.clearRect(0, 0, DW, DH);
    if (dustOn > 0 && idx === 0) for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (!reduce) { m.x += m.vx + Math.sin(t * .0003 + m.p) * .06; m.y += m.vy; if (m.y < DH * .04) m.y = DH * .68; }
      var cx = DW * .33, cy = DH * .24, fall = Math.max(0, 1 - Math.hypot((m.x - cx) / (DW * .3), (m.y - cy) / (DH * .55)));
      var a = m.a * fall * dustOn * (.6 + .4 * Math.sin(t * .002 + m.p));
      if (a <= .01) continue;
      dctx.fillStyle = "rgba(255,226,180," + a.toFixed(3) + ")";
      dctx.beginPath(); dctx.arc(m.x, m.y, m.r * (.6 + m.z), 0, 6.283); dctx.fill();
    }
  }
  sizeDust();
  if ("ResizeObserver" in window) new ResizeObserver(sizeDust).observe(stage);

  function inkWrite(rect, dur) {
    var txt = rect.closest("svg").querySelectorAll("text")[["inkM1", "inkM2", "inkM3"].indexOf(rect.parentNode.id)], bb;
    try { bb = txt.getBBox(); } catch (e) { bb = { x: 0, width: 600 }; }
    rect.setAttribute("x", bb.x - 10);
    return G.fromTo(rect, { attr: { width: 0 } }, { attr: { width: bb.width + 40 }, duration: dur, ease: "power1.inOut" });
  }

  var ENTER = [
    function () {
      var pg = pages[0], tl = G.timeline(), photo = $("#heroPhoto"), cam = $("#heroCam"), dustState = { v: 0 };
      G.set(photo, { filter: "brightness(0) sepia(.18) saturate(1.05) contrast(1.06)", scale: 1.07 });
      G.set("#heroLight", { opacity: 0 });
      G.set(cam, { opacity: 0, filter: "brightness(3.2) contrast(.6)" });
      G.set(".glint", { opacity: 0, scale: .4 });
      G.set($$("[data-sh]", pg), { opacity: 0 });
      G.set($$(".ink .im"), { attr: { width: 0 } });
      G.set("#introHint", { opacity: 0 });
      // the lamp flickers on
      tl.to(photo, { filter: "brightness(.35) sepia(.18) saturate(1.05) contrast(1.06)", duration: .08, ease: "none" }, .3)
        .to(photo, { filter: "brightness(.06) sepia(.18) saturate(1.05) contrast(1.06)", duration: .1, ease: "none" })
        .to(photo, { filter: "brightness(.7) sepia(.18) saturate(1.05) contrast(1.06)", duration: .1, ease: "none" }, "+=.12")
        .to(photo, { filter: "brightness(1) sepia(.18) saturate(1.05) contrast(1.06)", duration: 1.6, ease: "power2.out" })
        .to(photo, { scale: 1, duration: 9, ease: "power2.out" }, .3)
        .to("#heroLight", { opacity: 1, duration: 2 }, .9)
        .to(dustState, { v: 1, duration: 2, onUpdate: function () { dustOn = dustState.v; } }, 1);
      // ink writing, line by line
      var rs = $$(".ink .im");
      tl.add(inkWrite(rs[0], .9), 1.6).add(inkWrite(rs[1], 1.25), "+=.25").add(inkWrite(rs[2], 1.1), "+=.25");
      // shutter flash → camera develops out of the light
      tl.add(flash(.75), "+=.35")
        .to(cam, { opacity: 1, duration: .15 }, "<")
        .to(cam, { filter: "brightness(1) contrast(1)", duration: 2.2, ease: "power2.out" }, "<")
        .to(".glint--1", { opacity: .9, scale: 1, duration: .5, ease: "power2.out" }, "<.15")
        .to(".glint--1", { opacity: .35, duration: 1.4 }, ">")
        .to(".glint--2", { opacity: .8, scale: 1, duration: .6, ease: "power2.out" }, "<-.9")
        .to(".glint--2", { opacity: .3, duration: 1.6 }, ">");
      var tt = tl.duration() - 3.2;
      tl.to($(".lk-pre"), { opacity: 1, duration: 1.2 }, tt);
      chars($(".lk-title"), tt + .15, tl, { stagger: .12, duration: 1.8 });
      tl.fromTo($(".lk-rule"), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, tt + .6);
      rise([$(".lk-sub"), $(".lk-by")], tt + .8, tl, .15);
      tl.to("#introHint", { opacity: 1, duration: 1 }, tt + 1.8);
      return tl;
    },
    function () {
      var pg = pages[1], tl = G.timeline();
      chars($(".hero-t", pg), .1, tl);
      rise($$("[data-r]", pg), .45, tl, .09);
      tl.fromTo($$(".pillars li", pg), { "--s": 0 }, { "--s": 1, duration: 1.6, ease: "expo.inOut", stagger: .12 }, .6)
        .fromTo($(".bignum", pg), { opacity: 0, xPercent: 8 }, { opacity: 1, xPercent: 0, duration: 2.4, ease: "expo.out" }, 0);
      return tl;
    },
    function () {
      var pg = pages[2], tl = G.timeline();
      chars($(".hero-t", pg), .1, tl);
      rise($$("[data-r]", pg), .35, tl, .07);
      tl.fromTo(tiles, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", stagger: .12 }, .15)
        .fromTo(tiles.map(function (t) { return t.firstChild; }), { scale: 1.4 }, { scale: 1, duration: 2.2, ease: "expo.out", stagger: .12 }, .4);
      return tl;
    },
    function () {
      var pg = pages[3], tl = G.timeline();
      chars($(".hero-t", pg), .1, tl);
      rise($$(".p4__head [data-r]", pg), .35, tl);
      tl.fromTo("#film", { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, .2);
      rise($$(".index [data-r]", pg), .8, tl, .1);
      return tl;
    },
    function () {
      var pg = pages[4], tl = G.timeline();
      G.set("#fin", { autoAlpha: 0 });
      G.set($$("[data-sh]", pg), { opacity: 0 });
      G.set($$(".tl .c", pg), { opacity: 0 });
      G.set("#endSeal", { opacity: 0, scale: 1.8, rotation: -40 });
      G.set("#endSheet", { opacity: 0, y: u(4), rotation: 1.5, scale: .94, rotationX: 0 });
      G.set("#endPaper", { clipPath: "inset(0% 0% 0% 0%)" });
      G.set("#endFlap", { opacity: 0, rotationX: 0, transformOrigin: "50% 0%" });
      G.set($("#writeEnd .wm"), { attr: { width: 0 } });
      G.set("#endHint", { opacity: 0 });
      tl.fromTo($(".light", pg), { opacity: .4 }, { opacity: 1, duration: 1.6 }, 0)
        .to("#endSheet", { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 1.5, ease: "expo.out" }, .1);
      rise($$("[data-sh]", pg), .6, tl);
      tl.add(writeOn($("#writeEnd"), 2.4), .9);
      var t0 = 3.5;
      $$(".tl", pg).forEach(function (ln) { var cs = $$(".c", ln); tl.to(cs, { opacity: 1, duration: .01, stagger: .03, ease: "none" }, t0); t0 += cs.length * .03 + .2; });
      tl.to("#endSeal", { opacity: 1, scale: 1, rotation: -10, duration: .45, ease: "back.out(2.2)" }, t0)
        .to("#endHint", { opacity: 1, duration: 1 }, t0 + .6);
      return tl;
    }
  ];
  function foldOut() {
    var pg = pages[4], tl = G.timeline();
    tl.to("#endHint", { opacity: 0, duration: .3 })
      .set("#endFlap", { opacity: 1, rotationX: 0 })
      .to("#endPaper", { clipPath: "inset(0% 0% 50% 0%)", duration: .5, ease: "power1.in" }, .15)
      .to("#endFlap", { rotationX: 180, duration: 1.1, ease: "power3.inOut" }, .15)
      .to("#endSheet", { scale: .62, rotation: -5, duration: 1, ease: "power2.inOut" }, 1)
      .to($(".light", pg), { opacity: 0, duration: 1.6, ease: "power2.inOut" }, 1)
      .to("#endSheet", { y: u(40), rotation: -16, scale: .3, opacity: 0, duration: 1.1, ease: "power3.in" }, 1.7)
      .set("#fin", { autoAlpha: 1 }, 2.5);
    rise($$("#fin [data-f]", pg), 2.6, tl, .15);
    chars($(".fin__t", pg), 2.7, tl, { stagger: .05, duration: 1.8 });
    tl.fromTo(".fin__rule", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "expo.inOut" }, 3);
    return tl;
  }

  /* ---------- transitions ---------- */
  function swapTo(i) {
    pages.forEach(function (p, j) { G.set(p, { autoAlpha: j === i ? 1 : 0 }); });
    idx = i; step = 0; hud();
  }
  function transition(i, back) {
    var tl = G.timeline(), ov;
    if (!back && i === 1) {           // paper folds over, then unfolds open
      var t = $(".uf--t"), b = $(".uf--b");
      tl.set(".unfold", { visibility: "visible" })
        .fromTo(t, { rotationX: 92 }, { rotationX: 0, duration: .75, ease: "power3.in" })
        .fromTo(b, { rotationX: -92 }, { rotationX: 0, duration: .75, ease: "power3.in" }, "<")
        .add(function () { swapTo(i); })
        .to(t, { rotationX: -94, duration: 1.25, ease: "expo.inOut" }, "+=.12")
        .to(b, { rotationX: 94, duration: 1.25, ease: "expo.inOut" }, "<")
        .set(".unfold", { visibility: "hidden" });
      ov = 1.1;
    } else if (!back && i === 2) {    // camera shutter
      tl.set("#iris", { visibility: "visible" }).set("#irisBlades", { rotation: 0, svgOrigin: "0 0" })
        .fromTo(blades, { attr: { y: 140 } }, { attr: { y: -1 }, duration: .5, ease: "power3.in" })
        .to("#irisBlades", { rotation: 30, duration: .5, ease: "power3.in" }, "<")
        .add(function () { swapTo(i); })
        .add(flash(.85), "+=.05")
        .to(blades, { attr: { y: 140 }, duration: .9, ease: "expo.out" }, "<.05")
        .to("#irisBlades", { rotation: 60, duration: .9, ease: "expo.out" }, "<")
        .set("#iris", { visibility: "hidden" });
      ov = .75;
    } else {                          // curtain wipe (gold edge, then ink)
      var dir = back ? -1 : 1, w1 = $("#wipe i:first-child"), w2 = $("#wipe i:last-child");
      tl.set("#wipe", { visibility: "visible" })
        .fromTo(w1, { yPercent: 100 * dir }, { yPercent: 0, duration: .7, ease: "expo.inOut" })
        .fromTo(w2, { yPercent: 100 * dir }, { yPercent: 0, duration: .7, ease: "expo.inOut" }, .08)
        .add(function () { swapTo(i); })
        .to(w2, { yPercent: -100 * dir, duration: .9, ease: "expo.inOut" }, "+=.05")
        .to(w1, { yPercent: -100 * dir, duration: .9, ease: "expo.inOut" }, "<.06")
        .set("#wipe", { visibility: "hidden" });
      ov = .95;
    }
    tl.add(ENTER[i](), ov);
    return tl;
  }
  function show(i, back) {
    if (i < 0 || i >= N || i === idx) return;
    if (cur) cur.progress(1);
    cur = idx < 0 ? (swapTo(i), ENTER[i]()) : transition(i, back);
    if (reduce) cur.progress(1);
  }
  function go(i) { show(i, i < idx); }
  function next() {
    if (lbOpen) return;
    if (cur && cur.progress() < .97) { cur.progress(1); return; }
    if (idx === N - 1 && step === 0) { step = 1; cur = foldOut(); if (reduce) cur.progress(1); hud(); return; }
    show(idx + 1);
  }
  function prev() {
    if (lbOpen) return;
    if (idx === N - 1 && step === 1) { step = 0; cur = ENTER[N - 1](); cur.progress(1); hud(); return; }
    show(idx - 1, true);
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
    else if (k === "Home") { e.preventDefault(); go(0); }
    else if (k === "End") { e.preventDefault(); go(N - 1); }
    else if (k === "f" || k === "F") toggleFs();
  });
  var sx = 0, sy = 0, st = 0;
  stage.addEventListener("touchstart", function (e) { var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 800 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (lbOpen) stepLB(dx < 0 ? 1 : -1); else if (dx < 0) next(); else prev(); }
  }, { passive: true });
  function toggleFs() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) { var p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
  }
  $("#fsbtn").addEventListener("click", toggleFs);
  if (!document.documentElement.requestFullscreen) $("#fsbtn").hidden = true;

  /* ---------- lightbox ---------- */
  var lb = $("#lb"), lbImg = $("#lbImg"), lbFig = $("#lbFig"), lbOpen = false, lbList = ARCH, lbIdx = 0, loop = null;
  function fillLB() {
    var it = lbList[lbIdx]; setPhoto(lbImg, it);
    $("#lbCap").textContent = it.caption || it.title || "";
    $("#lbNo").textContent = "No. " + ("0" + (lbIdx + 1)).slice(-2) + " — " + ("0" + lbList.length).slice(-2);
  }
  function openLB(list, i, from) {
    lbList = list; lbIdx = i; fillLB(); lb.hidden = false; lbOpen = true;
    if (loop) loop.pause();
    if (G && !reduce) {
      var a = from.getBoundingClientRect(), b = lbImg.getBoundingClientRect();
      G.fromTo("#lbBg", { opacity: 0 }, { opacity: 1, duration: .6 });
      G.fromTo(lbImg, { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scaleX: a.width / b.width, scaleY: a.height / b.height },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1, ease: "expo.inOut" });
      G.fromTo([".lb__fig figcaption", ".lb__btn", ".lb__close"], { opacity: 0 }, { opacity: 1, duration: .6, delay: .7 });
    }
  }
  function closeLB() {
    if (!lbOpen) return; lbOpen = false;
    var done = function () { lb.hidden = true; G && G.set(lbFig, { opacity: 1 }); if (loop) loop.resume(); };
    if (G && !reduce) G.timeline({ onComplete: done }).to(lbFig, { opacity: 0, y: u(1), duration: .4, ease: "power2.in" }).to("#lbBg", { opacity: 0, duration: .4 }, "<.1").set(lbFig, { y: 0 });
    else done();
  }
  function stepLB(d) {
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    if (G && !reduce) G.timeline().to(lbImg, { clipPath: d > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)", duration: .45, ease: "power3.in" })
      .add(fillLB).fromTo(lbImg, { clipPath: d > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .7, ease: "expo.out" });
    else fillLB();
  }
  $("#lbClose").addEventListener("click", closeLB); $("#lbBg").addEventListener("click", closeLB);
  $("#lbPrev").addEventListener("click", function () { stepLB(-1); }); $("#lbNext").addEventListener("click", function () { stepLB(1); });

  /* ---------- static fallback ---------- */
  function startIndex() { var m = /^#p(\d)$/.exec(location.hash); return m ? Math.min(N - 1, Math.max(0, +m[1] - 1)) : 0; }
  if (!G) {
    document.documentElement.classList.add("no-gsap");
    $$(".wm").forEach(function (r) { r.setAttribute("width", 1000); });
    var set = function (i) { if (i < 0 || i >= N) return; pages.forEach(function (p, j) { p.classList.toggle("on", j === i); }); idx = i; hud(); segs.forEach(function (s, j) { s.style.setProperty("--p", j <= i ? 1 : 0); }); };
    prevBtn.onclick = function () { set(idx - 1); }; nextBtn.onclick = function () { set(idx + 1); };
    next = function () { set(idx + 1); }; prev = function () { set(idx - 1); }; go = set;
    set(startIndex());
    return;
  }

  /* ---------- cursor, magnetic buttons, parallax, hover thumbnail ---------- */
  var curEl = $("#cur"), curLbl = $("#curLbl");
  var cx = G.quickTo(curEl, "x", { duration: .35, ease: "power3" }), cy = G.quickTo(curEl, "y", { duration: .35, ease: "power3" });
  var movers = $$("[data-depth]").map(function (el) { return { d: +el.getAttribute("data-depth"), x: G.quickTo(el, "x", { duration: 1.2, ease: "power3" }), y: G.quickTo(el, "y", { duration: 1.2, ease: "power3" }) }; });
  var thumb = $("#thumb"), tx = G.quickTo(thumb, "x", { duration: .6, ease: "power3" }), ty = G.quickTo(thumb, "y", { duration: .6, ease: "power3" });
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    G.set(curEl, { opacity: 1 }); cx(x); cy(y);
    var t = e.target.closest ? e.target.closest("[data-cursor],button,.seg,.index li") : null;
    curEl.classList.toggle("is-view", !!(t && t.getAttribute("data-cursor") === "view"));
    curEl.classList.toggle("is-hover", !!t && !(t.getAttribute("data-cursor") === "view"));
    curLbl.textContent = "View";
    if (!reduce) { var nx = x / r.width * 2 - 1, ny = y / r.height * 2 - 1; movers.forEach(function (m) { m.x(nx * m.d); m.y(ny * m.d * .6); }); }
    tx(x + u(1.5)); ty(y - u(10));
    if (idx === 0 && !reduce) G.to("#heroLight", { "--lx": (x / r.width * 100 * .25 + 25) + "cqw", "--ly": (y / r.height * 100 * .2 + 14) + "%", duration: 1.6, ease: "power3", overwrite: "auto" });
  });
  stage.addEventListener("pointerleave", function () { G.to(curEl, { opacity: 0, duration: .3 }); });
  $$("[data-mag]").forEach(function (b) {
    var bx = G.quickTo(b, "x", { duration: .6, ease: "elastic.out(1,.4)" }), by = G.quickTo(b, "y", { duration: .6, ease: "elastic.out(1,.4)" });
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * .35); by((e.clientY - r.top - r.height / 2) * .35); });
    b.addEventListener("pointerleave", function () { bx(0); by(0); });
  });
  $$(".index li").forEach(function (li) {
    li.addEventListener("pointerenter", function () { setPhoto(thumb.firstChild, pick(li.getAttribute("data-thumb"))); G.to(thumb, { opacity: 1, scale: 1, rotation: -3, duration: .6, ease: "expo.out" }); });
    li.addEventListener("pointerleave", function () { G.to(thumb, { opacity: 0, scale: .85, rotation: 0, duration: .4 }); });
  });
  G.set(thumb, { scale: .85 });

  /* film loop */
  if (!reduce) loop = G.to(filmTrack, { xPercent: -50, duration: 90, ease: "none", repeat: -1 });
  $("#film").addEventListener("pointerenter", function () { if (loop) G.to(loop, { timeScale: .15, duration: .8 }); });
  $("#film").addEventListener("pointerleave", function () { if (loop) G.to(loop, { timeScale: 1, duration: 1 }); });

  /* ---------- preloader → intro ---------- */
  G.ticker.add(tickHud);
  G.ticker.add(function () { drawDust(performance.now()); });
  function boot() {
    var si = startIndex(), o = { v: 0 };
    var tl = G.timeline();
    tl.fromTo(".ld__mark em", { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: "expo.out" }, 0)
      .fromTo(".ld__t", { opacity: 0 }, { opacity: 1, duration: 1 }, .2)
      .to(o, { v: 100, duration: reduce ? 0 : 2.4, ease: "power2.inOut", onUpdate: function () { $("#ldn").textContent = ("00" + Math.round(o.v)).slice(-3); } }, .2)
      .to("#ldbar", { scaleX: 1, duration: reduce ? 0 : 2.4, ease: "power2.inOut" }, .2)
      .to(".ld__mark em", { yPercent: -110, duration: .9, ease: "expo.in" }, "+=.15")
      .to("#loader", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "expo.inOut" }, "-=.35")
      .add(function () { show(si); }, "-=.9")
      .set("#loader", { display: "none" });
    $("#loader").addEventListener("click", function () { tl.progress(1); });
    var skip = function (e) { if (tl.progress() < 1) { tl.progress(1); e.stopImmediatePropagation(); e.preventDefault(); } };
    document.addEventListener("keydown", skip, true);
  }
  var booted = false;
  function once() { if (!booted) { booted = true; boot(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(once);
  setTimeout(once, 2500);
})();
