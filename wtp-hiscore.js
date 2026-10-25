/* wtp-hiscore.js: arcade-style top-10 table + 3-letter initials entry for DOM-overlay games.
   WTPHi.init({ key, seed })            seed = [[score, "ABC"], ...] (10 rows)
   WTPHi.render(el, opts)               draws the table into el ({ hl: rankToHighlight })
   WTPHi.gameOver(score, el, onDone)    if score qualifies: initials entry inside el, then save + onDone(rank)
   While entry is open it owns keyboard, d-pad and taps so a stray press cannot restart the game. */
(function () {
  "use strict";
  var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .", KEY = "wtp_hiscores", table = [], ent = null, lastHl = -1;
  function load(seed) {
    var t = null;
    try { t = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    var ok = Array.isArray(t) && t.length === 10 && t.every(function (r) { return Array.isArray(r) && typeof r[0] === "number" && typeof r[1] === "string"; });
    table = ok ? t : seed.map(function (r) { return [r[0], r[1]]; });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(table)); } catch (_) {} }
  function rankOf(s) { if (!(s > 0)) return -1; for (var i = 0; i < 10; i++) if (s > table[i][0]) return i; return -1; }
  var ORD = ["1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH", "9TH", "10TH"];
  var COL = ["#ffff00", "#ff0000", "#ffb8ff", "#00ffff", "#ffb852", "#ffff00", "#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render(el, o) {
    if (!el || !table.length) return; o = o || {}; var hl = o.hl == null ? -1 : o.hl;
    var h = '<div class="wtp-hs-head">HIGH SCORES</div><table class="wtp-hs">';
    for (var i = 0; i < 10; i++) {
      h += '<tr class="' + (i === hl ? "wtp-hs-new" : "") + '" style="color:' + COL[i] + '"><td>' + ORD[i] + '</td><td class="s">' + table[i][0] + '</td><td class="n">' + esc(table[i][1]) + "</td></tr>";
    }
    el.innerHTML = h + "</table>"; el.style.display = "";
  }
  function css() {
    if (document.getElementById("wtp-hs-css")) return;
    var st = document.createElement("style"); st.id = "wtp-hs-css";
    st.textContent =
      "#overlay.gameover:has(.wtp-ini){background:rgba(0,0,0,.94)}" +
      ".wtp-hs-head{color:#fff;font-size:14px;margin:10px 0 6px;letter-spacing:2px;text-align:center}" +
      ".wtp-hs{border-collapse:collapse;margin:0 auto;font-size:12px;line-height:1.7}" +
      ".wtp-hs td{padding:0 10px}.wtp-hs td.s{text-align:right;min-width:7em}.wtp-hs td.n{letter-spacing:4px;white-space:pre}" +
      ".wtp-hs tr.wtp-hs-new{animation:wtpblink .5s steps(1) infinite}@keyframes wtpblink{50%{opacity:.25}}" +
      ".wtp-ini{text-align:center;color:#fff;font-size:12px;line-height:1.8;pointer-events:auto}" +
      ".wtp-ini .t{color:#f00;font-size:16px;margin-bottom:6px}.wtp-ini .sc{color:#ff0;margin-bottom:8px}" +
      ".wtp-ini .row{display:flex;justify-content:center;gap:10px;margin:6px 0}" +
      ".wtp-ini .slot{display:flex;flex-direction:column;align-items:center;gap:4px}" +
      ".wtp-ini .ch{width:44px;height:44px;line-height:44px;font-size:28px;color:#ffb8ff;border-bottom:3px solid #333;cursor:pointer;white-space:pre}" +
      ".wtp-ini .slot.on .ch{color:#ff0;border-color:#ff0;animation:wtpblink .5s steps(1) infinite}" +
      ".wtp-ini button{font:inherit;font-size:14px;color:#0ff;background:#000;border:2px solid #0ff;min-width:44px;min-height:36px;cursor:pointer;touch-action:manipulation}" +
      ".wtp-ini .slot:not(.on) .ar{visibility:hidden}.wtp-ini .end{margin-top:8px;color:#ff0;border-color:#ff0;padding:0 12px}" +
      ".wtp-ini .help{color:#0ff;font-size:9px;margin-top:8px;opacity:.85}";
    document.head.appendChild(st);
  }
  function drawEntry() {
    var e = ent, h = '<div class="wtp-ini"><div class="t">YOU HAVE A HIGH SCORE!</div><div class="sc">' + e.score + '</div><div>ENTER YOUR INITIALS</div><div class="row">';
    for (var i = 0; i < 3; i++) {
      h += '<div class="slot' + (i === e.pos ? " on" : "") + '" data-i="' + i + '"><button type="button" class="ar" data-a="up" aria-label="Next letter">&#9650;</button>' +
        '<div class="ch" data-i="' + i + '">' + esc(ABC[e.c[i]]) + '</div><button type="button" class="ar" data-a="down" aria-label="Previous letter">&#9660;</button></div>';
    }
    h += '</div><button type="button" class="end" data-a="end">END</button><div class="help">UP/DOWN: LETTER &nbsp; LEFT/RIGHT: MOVE<br>SPACE/ENTER: NEXT &nbsp; OR JUST TYPE</div></div>';
    e.el.innerHTML = h; e.el.style.display = "";
  }
  function step(d) { ent.c[ent.pos] = (ent.c[ent.pos] + d + ABC.length) % ABC.length; drawEntry(); }
  function move(d) { ent.pos = Math.max(0, Math.min(2, ent.pos + d)); drawEntry(); }
  function next() { if (ent.pos < 2) { ent.pos++; drawEntry(); } else finish(); }
  function finish() {
    var e = ent, name = e.c.map(function (i) { return ABC[i]; }).join(""), r = rankOf(e.score);
    if (r < 0) r = 9;
    table.splice(r, 0, [e.score, name]); table.length = 10; save(); lastHl = r;
    window.__wtpHiSaved = { name: name, score: e.score, rank: r };
    render(e.el, { hl: r });
    setTimeout(function () { ent = null; }, 350); // swallow the confirming key/tap so it can't restart
    e.done && e.done(r);
  }
  function onKey(ev) {
    if (!ent) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    if (ev.type !== "keydown" || !ent.el.querySelector(".wtp-ini")) return;
    var k = ev.key;
    if (k === "ArrowUp" || k === "w" || k === "W") step(1);
    else if (k === "ArrowDown" || k === "s" || k === "S") step(-1);
    else if (k === "ArrowLeft" || k === "a" || k === "A" || k === "Backspace") move(-1);
    else if (k === "ArrowRight" || k === "d" || k === "D") move(1);
    else if (k === " " || k === "Enter") next();
    else if (k.length === 1 && /[a-z]/i.test(k)) { ent.c[ent.pos] = ABC.indexOf(k.toUpperCase()); if (ent.pos < 2) ent.pos++; drawEntry(); }
  }
  function onPtr(ev) {
    if (!ent) return;
    var t = ev.target, dp = t.closest && t.closest("[data-dir]");
    if (!(t.closest && t.closest(".wtp-ini")) && !dp) { ev.stopImmediatePropagation(); if (ev.cancelable) ev.preventDefault(); return; }
    ev.stopImmediatePropagation(); if (ev.cancelable) ev.preventDefault();
    if (ev.type !== "pointerdown" || !ent.el.querySelector(".wtp-ini")) return;
    if (dp) { var d = dp.getAttribute("data-dir"); if (d === "U") step(1); else if (d === "D") step(-1); else if (d === "L") move(-1); else if (d === "R") next(); return; }
    var a = t.closest("[data-a]"), slot = t.closest(".slot");
    if (slot && +slot.getAttribute("data-i") !== ent.pos) { ent.pos = +slot.getAttribute("data-i"); drawEntry(); if (!a) return; }
    if (!a) return;
    var act = a.getAttribute("data-a");
    if (act === "up") step(1); else if (act === "down") step(-1); else if (act === "end") finish();
  }
  ["keydown", "keyup", "keypress"].forEach(function (t) { window.addEventListener(t, onKey, true); });
  ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(function (t) { window.addEventListener(t, onPtr, { capture: true, passive: false }); });
  window.WTPHi = {
    init: function (o) { KEY = o.key; load(o.seed); css(); },
    render: function (el, o) { render(el, o); },
    qualifies: function (s) { return rankOf(s) >= 0; },
    gameOver: function (score, el, done) {
      if (rankOf(score) < 0) { render(el, {}); return false; }
      ent = { score: score, c: [0, 0, 0], pos: 0, el: el, done: done }; drawEntry(); return true;
    },
    get active() { return !!ent; },
    get table() { return table.map(function (r) { return r.slice(); }); }
  };
})();
