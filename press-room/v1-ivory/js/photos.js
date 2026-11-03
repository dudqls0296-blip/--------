/* Procedural "darkroom prints" — warm monochrome stand-ins used until real photos are set in config.js */
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
  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function rad(c, x, y, r0, r1, stops) {
    var g = c.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function crowd(c, w, h, R, base, dark, hands) {
    c.fillStyle = dark;
    for (var x = -10; x < w + 20; x += 11 + R() * 14) {
      var hr = 8 + R() * 6, y = base + R() * 18;
      c.beginPath(); c.arc(x, y, hr, 0, 6.28); c.fill();
      c.beginPath(); c.ellipse(x, y + hr * 2.6, hr * 2.1, hr * 2, 0, 0, 6.28); c.fill();
      if (hands && R() < .22) {
        c.lineWidth = 5; c.strokeStyle = dark; c.lineCap = "round";
        c.beginPath(); c.moveTo(x + hr, y + hr); c.lineTo(x + hr * 1.8 + R() * 8, y - 30 - R() * 30); c.stroke();
      }
    }
    c.fillRect(0, base + 40, w, h);
  }

  var scenes = {
    festival: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#0c0c0c"], [.6, "#262626"], [1, "#111"]]); c.fillRect(0, 0, w, h);
      for (var i = 0; i < 6; i++) {
        var x = w * (.1 + i * .16 + R() * .05);
        c.fillStyle = "rgba(255,255,255," + (.05 + R() * .07) + ")";
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 90 - R() * 80, h * .8); c.lineTo(x + 90 + R() * 80, h * .8); c.closePath(); c.fill();
      }
      c.strokeStyle = "rgba(200,200,200,.35)"; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0, h * .12); c.lineTo(w, h * .1); c.stroke();
      for (var b = 0; b < 70; b++) {
        var bx = R() * w, by = R() * h * .65, br = 3 + R() * 16;
        c.fillStyle = rad(c, bx, by, 0, br, [[0, "rgba(255,255,255," + (.35 + R() * .5) + ")"], [1, "rgba(255,255,255,0)"]]);
        c.beginPath(); c.arc(bx, by, br, 0, 6.28); c.fill();
      }
      c.fillStyle = rad(c, w * .5, h * .45, 0, w * .35, [[0, "rgba(255,255,255,.35)"], [1, "rgba(255,255,255,0)"]]); c.fillRect(0, 0, w, h);
      crowd(c, w, h, R, h * .72, "#050505", true);
    },
    sports: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#d9d9d9"], [.3, "#bdbdbd"], [.32, "#555"], [.42, "#4a4a4a"], [.43, "#8a8a8a"], [1, "#6d6d6d"]]); c.fillRect(0, 0, w, h);
      for (var r = 0; r < 5; r++) for (var x = 0; x < w; x += 6) {
        c.fillStyle = "rgba(20,20,20," + (.3 + R() * .5) + ")";
        c.beginPath(); c.arc(x + R() * 4, h * (.33 + r * .018) + R() * 3, 2 + R() * 1.4, 0, 6.28); c.fill();
      }
      c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = 2.5;
      for (var l = 0; l < 7; l++) {
        c.beginPath(); c.moveTo(-50, h * (.5 + l * .085)); c.quadraticCurveTo(w * .5, h * (.44 + l * .07), w + 50, h * (.56 + l * .1)); c.stroke();
      }
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 3;
      c.beginPath(); c.moveTo(w * .78, h * .45); c.lineTo(w * .8, h); c.stroke();
      for (var p = 0; p < 3; p++) {
        var px = w * (.3 + p * .17 + R() * .04), py = h * (.64 + p * .06), s = 1.1 + p * .2;
        for (var gh = 3; gh >= 0; gh--) {
          c.save(); c.filter = "blur(" + (2 + gh * 1.5) + "px)"; c.globalAlpha = gh ? .18 : .95;
          c.translate(-gh * 16 * s, 0);
          c.fillStyle = "#141414"; c.strokeStyle = "#141414"; c.lineCap = "round";
          c.beginPath(); c.ellipse(px + 4 * s, py - 64 * s, 8 * s, 9 * s, 0, 0, 6.28); c.fill();
          c.beginPath(); c.moveTo(px - 8 * s, py - 52 * s); c.quadraticCurveTo(px + 14 * s, py - 50 * s, px + 10 * s, py - 20 * s); c.lineTo(px - 6 * s, py - 18 * s); c.closePath(); c.fill();
          c.lineWidth = 9 * s;
          c.beginPath(); c.moveTo(px + 2 * s, py - 20 * s); c.quadraticCurveTo(px + 20 * s, py - 10 * s, px + 24 * s, py + 6 * s); c.stroke();
          c.beginPath(); c.moveTo(px, py - 20 * s); c.quadraticCurveTo(px - 18 * s, py - 6 * s, px - 26 * s, py - 12 * s); c.stroke();
          c.lineWidth = 6 * s;
          c.beginPath(); c.moveTo(px + 6 * s, py - 46 * s); c.lineTo(px + 22 * s, py - 30 * s); c.moveTo(px - 2 * s, py - 46 * s); c.lineTo(px - 18 * s, py - 36 * s); c.stroke();
          c.restore();
        }
      }
    },
    campus: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#e6e6e6"], [.55, "#bcbcbc"], [1, "#7a7a7a"]]); c.fillRect(0, 0, w, h);
      var bx = w * .14, bw = w * .72, by = h * .22, bh = h * .5;
      c.fillStyle = "#8c8c8c"; c.fillRect(bx, by, bw, bh);
      c.fillStyle = "#6e6e6e"; c.fillRect(bx - 8, by - 10, bw + 16, 12);
      for (var y = by + 14; y < by + bh - 16; y += 26) for (var x = bx + 12; x < bx + bw - 20; x += 24) {
        c.fillStyle = R() < .25 ? "#d8d8d8" : "#3a3a3a"; c.fillRect(x, y, 14, 16);
      }
      c.fillStyle = "#2d2d2d"; c.fillRect(bx + bw * .45, by + bh - 50, bw * .1, 50);
      for (var t = 0; t < 2; t++) {
        var tx = t ? w * .9 : w * .08;
        for (var k = 0; k < 9; k++) {
          c.fillStyle = "rgba(25,25,25," + (.7 + R() * .3) + ")";
          c.beginPath(); c.arc(tx + (R() - .5) * 90, h * (.38 + R() * .3), 28 + R() * 26, 0, 6.28); c.fill();
        }
        c.fillRect(tx - 5, h * .55, 10, h * .3);
      }
      c.fillStyle = lin(c, 0, h * .72, 0, h, [[0, "#9a9a9a"], [1, "#5e5e5e"]]); c.fillRect(0, h * .72, w, h);
      for (var pp = 0; pp < 9; pp++) {
        var ppx = w * (.2 + R() * .6), ppy = h * (.78 + R() * .14), sc = .6 + (ppy / h - .7) * 2.2;
        c.fillStyle = "#1a1a1a";
        c.beginPath(); c.arc(ppx, ppy - 30 * sc, 5 * sc, 0, 6.28); c.fill();
        c.fillRect(ppx - 5 * sc, ppy - 25 * sc, 10 * sc, 25 * sc);
      }
    },
    ceremony: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#1d1d1d"], [1, "#0b0b0b"]]); c.fillRect(0, 0, w, h);
      c.fillStyle = "#9d9d9d"; c.fillRect(w * .2, h * .12, w * .6, h * .16);
      c.fillStyle = "#2a2a2a"; for (var i = 0; i < 18; i++) c.fillRect(w * .23 + i * w * .03, h * .17, w * .018, h * .06);
      c.fillStyle = rad(c, w * .5, h * .4, 0, w * .4, [[0, "rgba(255,255,255,.45)"], [1, "rgba(255,255,255,0)"]]); c.fillRect(0, 0, w, h);
      c.fillStyle = "#3b3b3b"; c.fillRect(0, h * .52, w, h * .06);
      c.fillStyle = "#cfcfcf"; c.fillRect(w * .47, h * .36, w * .06, h * .16);
      c.fillStyle = "#101010"; c.beginPath(); c.arc(w * .5, h * .3, 9, 0, 6.28); c.fill(); c.fillRect(w * .485, h * .32, w * .03, h * .06);
      for (var row = 0; row < 4; row++) {
        for (var x = 6 + row * 7; x < w; x += 22 + row * 4) {
          var r = 8 + row * 3, y = h * (.66 + row * .1);
          c.fillStyle = "rgba(5,5,5," + (.75 + row * .06) + ")";
          c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fill();
          c.beginPath(); c.ellipse(x, y + r * 2.3, r * 1.8, r * 1.6, 0, 0, 6.28); c.fill();
        }
      }
    },
    lanterns: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#0a0a0a"], [1, "#1f1f1f"]]); c.fillRect(0, 0, w, h);
      for (var s = 0; s < 4; s++) {
        var y0 = h * (.12 + s * .14), sag = 40 + R() * 40;
        c.strokeStyle = "rgba(160,160,160,.35)"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-20, y0); c.quadraticCurveTo(w / 2, y0 + sag * 2, w + 20, y0); c.stroke();
        for (var t = 0; t <= 1; t += .045) {
          var x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * (w / 2) + t * t * (w + 20);
          var y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0;
          var r = 10 + R() * 8;
          c.fillStyle = rad(c, x, y + 6, 0, r, [[0, "rgba(255,255,255,.95)"], [.3, "rgba(255,255,255,.5)"], [1, "rgba(255,255,255,0)"]]);
          c.beginPath(); c.arc(x, y + 6, r, 0, 6.28); c.fill();
        }
      }
      c.fillStyle = "#3a3a3a"; c.fillRect(w * .05, h * .62, w * .25, h * .3); c.fillRect(w * .68, h * .6, w * .3, h * .32);
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(w * .07, h * .66, w * .21, h * .08); c.fillRect(w * .7, h * .64, w * .26, h * .08);
      crowd(c, w, h, R, h * .8, "#060606", false);
    },
    graduation: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, 0, h, [[0, "#f0f0f0"], [.7, "#bdbdbd"], [1, "#8c8c8c"]]); c.fillRect(0, 0, w, h);
      for (var k = 0; k < 14; k++) {
        var x = R() * w, y = h * (.05 + R() * .5), s = 12 + R() * 16, a = R() * 3;
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = "#151515"; c.beginPath(); c.moveTo(-s, 0); c.lineTo(0, -s * .5); c.lineTo(s, 0); c.lineTo(0, s * .5); c.closePath(); c.fill();
        c.strokeStyle = "#151515"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * .4, s * .9); c.stroke();
        c.restore();
      }
      crowd(c, w, h, R, h * .74, "#121212", true);
    },
    desk: function (c, w, h, R) {
      c.fillStyle = lin(c, 0, 0, w, h, [[0, "#5a5a5a"], [1, "#2c2c2c"]]); c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 1;
      for (var g = 0; g < h; g += 5) { c.beginPath(); c.moveTo(0, g + R() * 2); c.lineTo(w, g + R() * 3); c.stroke(); }
      var papers = [[.18, .22, .34, .5, -.12], [.42, .16, .3, .46, .08], [.3, .5, .36, .4, -.04]];
      papers.forEach(function (p) {
        c.save(); c.translate(w * p[0] + w * p[2] / 2, h * p[1] + h * p[3] / 2); c.rotate(p[4]);
        c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 18; c.shadowOffsetY = 6;
        c.fillStyle = "#e9e9e9"; c.fillRect(-w * p[2] / 2, -h * p[3] / 2, w * p[2], h * p[3]);
        c.shadowColor = "transparent";
        c.fillStyle = "#7a7a7a";
        for (var ln = 0; ln < 9; ln++) c.fillRect(-w * p[2] / 2 + 14, -h * p[3] / 2 + 18 + ln * 11, w * p[2] * (ln ? .7 + R() * .2 : .5), ln ? 3 : 7);
        c.restore();
      });
      c.fillStyle = "#121212"; c.fillRect(w * .7, h * .55, w * .22, h * .22);
      c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(w * .78, h * .66, h * .1, 0, 6.28); c.fill();
      c.fillStyle = rad(c, w * .77, h * .64, 0, h * .07, [[0, "#9a9a9a"], [1, "#0a0a0a"]]); c.beginPath(); c.arc(w * .78, h * .66, h * .07, 0, 6.28); c.fill();
      c.strokeStyle = "#0b0b0b"; c.lineWidth = 9; c.lineCap = "round";
      c.beginPath(); c.moveTo(w * .1, h * .85); c.lineTo(w * .32, h * .74); c.stroke();
      c.fillStyle = rad(c, w * .4, h * .2, 0, w * .6, [[0, "rgba(255,255,255,.25)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, 0, w, h);
    }
  };

  function finish(c, w, h, R) {
    var img = c.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var l = .3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2];
      l = (l - 128) * 1.08 + 128 + (R() - .5) * 30;
      d[i] = Math.max(0, Math.min(255, l * 1.04 + 10));
      d[i + 1] = Math.max(0, Math.min(255, l * .97 + 4));
      d[i + 2] = Math.max(0, Math.min(255, l * .86 - 4));
    }
    c.putImageData(img, 0, 0);
    c.fillStyle = rad(c, w / 2, h / 2, Math.min(w, h) * .35, Math.max(w, h) * .75, [[0, "rgba(0,0,0,0)"], [1, "rgba(20,12,4,.55)"]]);
    c.fillRect(0, 0, w, h);
  }

  var cache = {};
  function render(kind, seed, w, h) {
    w = w || 720; h = h || 480;
    var key = kind + ":" + seed + ":" + w + "x" + h;
    if (cache[key]) return cache[key];
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    var c = cv.getContext("2d"), R = rng(seed || 1);
    (scenes[kind] || scenes.campus)(c, w, h, R);
    finish(c, w, h, R);
    return (cache[key] = cv.toDataURL("image/jpeg", .84));
  }
  return { render: render };
})();
