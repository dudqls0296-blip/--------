/* Abstract "light studies" — photographic placeholders (bokeh, haze, beams, depth of field)
   used until real photos are set in config.js. No drawn figures. */
window.PressPhotos = (function () {
  "use strict";
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var PAL = {
    amber: { bg: ["#140b05", "#2b170a"], light: [255, 186, 110], soft: [255, 214, 160] },
    gold: { bg: ["#120d07", "#2a2012"], light: [240, 200, 130], soft: [255, 232, 190] },
    rose: { bg: ["#130a08", "#2a1210"], light: [236, 150, 120], soft: [255, 205, 180] },
    smoke: { bg: ["#0e0d0c", "#252220"], light: [220, 210, 195], soft: [245, 238, 225] },
    dusk: { bg: ["#0d0a10", "#2a1c22"], light: [250, 170, 120], soft: [255, 220, 190] }
  };
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function bokeh(c, w, h, R, P, n, rMin, rMax, yMin, yMax, blur) {
    c.save(); c.globalCompositeOperation = "screen"; c.filter = "blur(" + blur + "px)";
    for (var i = 0; i < n; i++) {
      var x = R() * w, y = h * (yMin + R() * (yMax - yMin)), r = rMin + R() * (rMax - rMin), a = .15 + R() * .55;
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(R() < .5 ? P.light : P.soft, a)); g.addColorStop(.75, rgba(P.light, a * .7)); g.addColorStop(1, rgba(P.light, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    }
    c.restore();
  }
  function base(c, w, h, P, gx, gy) {
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    var r = c.createRadialGradient(w * gx, h * gy, 0, w * gx, h * gy, w * .8);
    r.addColorStop(0, rgba(P.light, .28)); r.addColorStop(1, rgba(P.light, 0));
    c.fillStyle = r; c.fillRect(0, 0, w, h);
  }
  var scenes = {
    festival: function (c, w, h, R) { // stage haze, beams, crowd bokeh
      var P = PAL.amber; base(c, w, h, P, .5, .2);
      c.save(); c.globalCompositeOperation = "screen"; c.filter = "blur(10px)";
      for (var i = 0; i < 5; i++) {
        var x = w * (.15 + i * .18), g = c.createLinearGradient(x, 0, x, h * .9);
        g.addColorStop(0, rgba(P.soft, .5)); g.addColorStop(1, rgba(P.light, 0));
        c.fillStyle = g; c.beginPath(); c.moveTo(x - 8, 0); c.lineTo(x + 8, 0); c.lineTo(x + 120 + R() * 80, h); c.lineTo(x - 120 - R() * 80, h); c.closePath(); c.fill();
      }
      c.restore();
      bokeh(c, w, h, R, P, 80, 6, 28, .55, 1, 2.5);
      bokeh(c, w, h, R, P, 20, 30, 70, .1, .5, 8);
    },
    sports: function (c, w, h, R) { // daylight track, motion streaks
      var P = PAL.smoke; base(c, w, h, P, .3, .1);
      c.save(); c.filter = "blur(1.5px)"; c.strokeStyle = "rgba(240,232,220,.55)";
      for (var l = 0; l < 8; l++) { c.lineWidth = 2 + l * .4; c.beginPath(); c.moveTo(-40, h * (.45 + l * .08)); c.bezierCurveTo(w * .3, h * (.4 + l * .07), w * .7, h * (.5 + l * .09), w + 40, h * (.62 + l * .11)); c.stroke(); }
      c.restore();
      c.save(); c.globalCompositeOperation = "screen"; c.filter = "blur(14px)";
      for (var s = 0; s < 6; s++) { c.fillStyle = rgba(P.soft, .22 + R() * .2); c.fillRect(R() * w * .6, h * (.35 + R() * .4), w * (.25 + R() * .3), 10 + R() * 18); }
      c.restore();
      bokeh(c, w, h, R, P, 40, 2, 8, 0, .3, 1.5);
    },
    campus: function (c, w, h, R) { // golden hour, window grid out of focus
      var P = PAL.gold; base(c, w, h, P, .75, .3);
      c.save(); c.filter = "blur(6px)";
      for (var y = h * .18; y < h * .8; y += 26) for (var x = w * .08; x < w * .7; x += 30) {
        c.fillStyle = R() < .35 ? rgba(P.soft, .5 + R() * .3) : "rgba(20,14,8,.55)"; c.fillRect(x, y, 18, 18);
      }
      c.restore();
      var g = c.createLinearGradient(w, 0, w * .4, h); g.addColorStop(0, rgba(P.soft, .5)); g.addColorStop(1, rgba(P.light, 0));
      c.save(); c.globalCompositeOperation = "screen"; c.fillStyle = g; c.fillRect(0, 0, w, h); c.restore();
      bokeh(c, w, h, R, P, 26, 10, 36, .6, 1, 6);
    },
    ceremony: function (c, w, h, R) { // single spotlight on stage, dark hall
      var P = PAL.rose; base(c, w, h, P, .5, .45);
      c.save(); c.globalCompositeOperation = "screen"; c.filter = "blur(18px)";
      var g = c.createLinearGradient(w * .5, 0, w * .5, h * .8); g.addColorStop(0, rgba(P.soft, .7)); g.addColorStop(1, rgba(P.light, .05));
      c.fillStyle = g; c.beginPath(); c.moveTo(w * .46, 0); c.lineTo(w * .54, 0); c.lineTo(w * .72, h * .85); c.lineTo(w * .28, h * .85); c.closePath(); c.fill();
      c.restore();
      c.save(); c.filter = "blur(3px)"; c.fillStyle = "rgba(10,5,4,.85)"; c.fillRect(0, h * .78, w, h); c.restore();
      bokeh(c, w, h, R, P, 50, 3, 12, .78, 1, 2);
    },
    lanterns: function (c, w, h, R) { // string lights at night
      var P = PAL.dusk; base(c, w, h, P, .5, .9);
      for (var s = 0; s < 3; s++) {
        var y0 = h * (.18 + s * .2), sag = 50 + R() * 40;
        for (var t = 0; t <= 1; t += .04) {
          var x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * (w / 2) + t * t * (w + 20), y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0;
          c.save(); c.globalCompositeOperation = "screen"; c.filter = "blur(" + (3 + s * 4) + "px)";
          var r = 10 + s * 7 + R() * 6, g = c.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, rgba(P.soft, .95)); g.addColorStop(1, rgba(P.light, 0));
          c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore();
        }
      }
    },
    graduation: function (c, w, h, R) { // bright sky, confetti
      var P = PAL.gold; base(c, w, h, P, .5, 0);
      c.save(); c.globalCompositeOperation = "screen"; var g = c.createRadialGradient(w * .5, -h * .2, 0, w * .5, -h * .2, h * 1.3);
      g.addColorStop(0, rgba(P.soft, .75)); g.addColorStop(1, rgba(P.light, 0)); c.fillStyle = g; c.fillRect(0, 0, w, h); c.restore();
      c.save(); c.filter = "blur(1px)";
      for (var k = 0; k < 120; k++) { c.fillStyle = R() < .5 ? rgba(P.soft, .8) : "rgba(30,20,10,.5)"; c.save(); c.translate(R() * w, R() * h); c.rotate(R() * 3); c.fillRect(-3, -1.5, 6 + R() * 6, 3); c.restore(); }
      c.restore();
    },
    desk: function (c, w, h, R) { // papers under a lamp, shallow depth of field
      var P = PAL.amber; base(c, w, h, P, .4, .35);
      c.save(); c.filter = "blur(5px)";
      [[.2, .25, .4, .55, -.12], [.45, .2, .36, .5, .08], [.3, .5, .42, .45, -.04]].forEach(function (p) {
        c.save(); c.translate(w * (p[0] + p[2] / 2), h * (p[1] + p[3] / 2)); c.rotate(p[4]);
        c.fillStyle = "rgba(230,214,185,.85)"; c.fillRect(-w * p[2] / 2, -h * p[3] / 2, w * p[2], h * p[3]);
        c.fillStyle = "rgba(60,44,30,.35)"; for (var i = 0; i < 9; i++) c.fillRect(-w * p[2] / 2 + 16, -h * p[3] / 2 + 20 + i * 12, w * p[2] * .7, 3);
        c.restore();
      });
      c.restore();
      var v = c.createRadialGradient(w * .4, h * .35, h * .2, w * .4, h * .35, w * .8);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,6,3,.85)"); c.fillStyle = v; c.fillRect(0, 0, w, h);
    }
  };
  function finish(c, w, h, R) {
    var img = c.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) { var n = (R() - .5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    c.putImageData(img, 0, 0);
    var v = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(8,5,3,.6)"); c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  var cache = {};
  function render(kind, seed, w, h) {
    w = w || 900; h = h || 600;
    var key = kind + seed + w + h;
    if (cache[key]) return cache[key];
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    var c = cv.getContext("2d"), R = rng(seed || 1);
    (scenes[kind] || scenes.campus)(c, w, h, R);
    finish(c, w, h, R);
    return (cache[key] = cv.toDataURL("image/jpeg", .86));
  }
  return { render: render };
})();
