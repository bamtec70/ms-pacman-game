/**
 * MS. PAC-MAN — 1982 Midway Arcade Classic (BUILD V5)
 * Fluent mazes, rounded sprites, solid Web Audio — 4 mazes, Sue, path fruit, touch.
 */
(() => {
  "use strict";

  // ── Size ─────────────────────────────────────────────────────────────────
  const TILE = 24;
  const COLS = 28;
  const ROWS = 31;
  const W = COLS * TILE; // 672
  const H = ROWS * TILE; // 744
  const S = TILE / 16;
  const SPEED = 228; // px/sec base — step must exceed align epsilon

  const WALL = 0, DOT = 1, EMPTY = 2, POWER = 3, GATE = 4, HOUSE = 5;

  const L = { x: -1, y: 0, id: "L" };
  const R = { x: 1, y: 0, id: "R" };
  const U = { x: 0, y: -1, id: "U" };
  const D = { x: 0, y: 1, id: "D" };
  const ORDER = [U, L, D, R];
  const OPP = { L: R, R: L, U: D, D: U };





  // 0=wall 1=dot 2=empty 3=power 4=gate 5=house
  // Board schedule: see mazeIndexForLevel (arcade progression)
  // Arcade wall fill / outline / dot colors for the four boards
  const MAZE_META = [
    { name: "MAZE 1", fill: "#FFB8AE", line: "#FF0000", dot: "#DEDEFF" },
    { name: "MAZE 2", fill: "#47B8FF", line: "#DEDEFF", dot: "#FFFF00" },
    { name: "MAZE 3", fill: "#DE9751", line: "#DEDEFF", dot: "#FF0000" },
    { name: "MAZE 4", fill: "#2121FF", line: "#FFB851", dot: "#DEDEFF" },
  ];
  // Layouts re-entered by hand as tile text (0 wall,1 dot,2 empty,3 energizer,4 door,5 pen)
  const MAZES = [
    [
      "0000000000000000000000000000",
      "0111111001111111111001111110",
      "0300001001000000001001000030",
      "0100001001000000001001000010",
      "0111111111111111111111111110",
      "0001001000001001000001001000",
      "0001001000001001000001001000",
      "0001001000001001000001001000",
      "2221001111111001111111001222",
      "0001000002000000002000001000",
      "0001000002000000002000001000",
      "0001222222222222222222221000",
      "0001000002000440002000001000",
      "0001000002055555502000001000",
      "0001002222055555502222001000",
      "0001002002055555502002001000",
      "0001002002000000002002001000",
      "2221222002222222222002221222",
      "0001000000002002000000001000",
      "0001000000002002000000001000",
      "0001111111222002221111111000",
      "0001000001000000001000001000",
      "0001000001000000001000001000",
      "0111111111111221111111111110",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0100001001111001111001000010",
      "0300001001000000001001000030",
      "0100001001000000001001000010",
      "0111111111111111111111111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "2222222001111111111002222222",
      "0000002001000000001002000000",
      "0000002001000000001002000000",
      "0311111111111001111111111130",
      "0100000001001001001000000010",
      "0100000001001001001000000010",
      "0100111111001001001111110010",
      "0100100002001111002000010010",
      "0100100002000000002000010010",
      "0111111002000000002001111110",
      "0000001002222222222001000000",
      "0000001002000440002001000000",
      "0111111002055555502001111110",
      "0100001002055555502001000010",
      "0100001222055555502221000010",
      "0111001002000000002001001110",
      "0001001002222222222001001000",
      "0001001000020000200001001000",
      "0001001000020000200001001000",
      "0001111111110000111111111000",
      "0001000000010000100000001000",
      "0001000000010000100000001000",
      "2221111001112222111001111222",
      "0001001001000000001001001000",
      "0001001001000000001001001000",
      "0311001111111001111111001130",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0111111111111111111111111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "0111111111001111001111111110",
      "0100000001001001001000000010",
      "0300000001001001001000000030",
      "0100111111111001111111110010",
      "0100100100001001000010010010",
      "0111100100001001000010011110",
      "0000100100001001000010010000",
      "0000100111111111111110010000",
      "2111100002000000002000011112",
      "0100200002000000002000020010",
      "0100222222222222222222220010",
      "0100002002000440002002000010",
      "0100002002055555502002000010",
      "0122222002055555502002222210",
      "0100200002055555502000020010",
      "0100200002000000002000020010",
      "0100222222222222222222220010",
      "0100002000002002000002000010",
      "0100002000002002000002000010",
      "0111111001111001111001111110",
      "0001001001000000001001001000",
      "0001001001000000001001001000",
      "0311001111111221111111001130",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0111111001111001111001111110",
      "0100001001000000001001000010",
      "0100001001000000001001000010",
      "0111111001111111111001111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "0111111111111111111111111110",
      "0100100001000000001000010010",
      "0300100001000000001000010030",
      "0100100001001111001000010010",
      "0100111111001001001111110010",
      "0100001001001001001001000010",
      "0100001001001001001001000010",
      "0111111001111001111001111110",
      "0001000000002002000000001000",
      "0001000000002002000000001000",
      "0001111002222222222001111000",
      "0002001002000440002001002000",
      "2222001002055555502001002222",
      "0000001222055555502221000000",
      "0000001002055555502001000000",
      "2222001002000000002001002222",
      "0002001002222222222001002000",
      "0001111000002002000001111000",
      "0001001000002002000001001000",
      "0001001111222002221111001000",
      "0001000001002002001000001000",
      "0001000001002002001000001000",
      "0111111111002222001111111110",
      "0100001001000000001001000010",
      "0100001001000000001001000010",
      "0100111001111111111001110010",
      "0300100000001001000000010030",
      "0100100000001001000000010010",
      "0111111111111001111111111110",
      "0000000000000000000000000000",
    ],
  ];

  function mazeIndexForLevel(lv) {
    // Arcade: 1-2 maze 1, 3-5 maze 2, 6-9 maze 3, 10-13 maze 4,
    // then mazes 3 and 4 alternate every four levels.
    if (lv <= 2) return 0;
    if (lv <= 5) return 1;
    if (lv <= 9) return 2;
    if (lv <= 13) return 3;
    return ((((lv - 14) / 4) | 0) % 2) ? 3 : 2;
  }

  let mazeIndex = 0;
  let lastDrawnMaze = -1;

  function tunnelRows() {
    const L = MAZES[mazeIndex] || MAZES[0];
    const t = [];
    for (let r = 0; r < L.length; r++) if (L[r][0] !== "0") t.push(r);
    return t;
  }
  function isTunnelRow(r) { return tunnelRows().indexOf(r) >= 0; }

  function applyMazeTheme() {
    const meta = MAZE_META[mazeIndex] || MAZE_META[0];
    const wrap = document.getElementById("canvas-wrap");
    if (wrap) {
      wrap.style.borderColor = meta.line;
      wrap.style.boxShadow = "0 0 40px " + meta.fill + "55";
      wrap.style.background = "#000";
    }

  }





  // Scatter corners (classic — off-map targets so ghosts hug corners)
  // Ms. Pac-Man ghosts: Blinky, Pinky, Inky, and Sue (not Clyde)
  const SCATTER = {
    blinky: { x: 25, y: -3 },  // top-right
    pinky:  { x: 2,  y: -3 },  // top-left
    inky:   { x: 27, y: 32 },  // bottom-right
    sue:    { x: 0,  y: 32 },  // bottom-left (Sue)
  };

  // Arcade PRNG (16-bit LCG-ish) — breaks memorized Pac-Man patterns
  let rngState = 0x2A5F;
  function srand(seed) { rngState = (seed & 0xFFFF) || 1; }
  function rand16() {
    rngState = (rngState * 0x5D3 + 0x2A5F) & 0xFFFF;
    return rngState;
  }
  function rand01() { return rand16() / 65536; }
  function randInt(n) { return n <= 0 ? 0 : (rand16() * n) >> 16; }


  /**
   * Scatter/chase wave timings (ms) — same structure as Pac-Man family.
   * Ms. Pac-Man still reverses on mode changes; path choice is semi-random.
   */
  function modeSchedule(lv) {
    if (lv === 1) {
      return [
        ["scatter", 7000], ["chase", 20000],
        ["scatter", 7000], ["chase", 20000],
        ["scatter", 5000], ["chase", 20000],
        ["scatter", 5000], ["chase", 1e12],
      ];
    }
    if (lv < 5) {
      return [
        ["scatter", 7000], ["chase", 20000],
        ["scatter", 7000], ["chase", 20000],
        ["scatter", 5000], ["chase", 1033000],
        ["scatter", 17],   ["chase", 1e12],
      ];
    }
    return [
      ["scatter", 5000], ["chase", 20000],
      ["scatter", 5000], ["chase", 20000],
      ["scatter", 5000], ["chase", 1037000],
      ["scatter", 17],   ["chase", 1e12],
    ];
  }

  // Midway Ms. Pac-Man bonus foods (level 1→7+): same two fruits per board
  // Cherry 100, Strawberry 200, Orange 500, Pretzel 700, Apple 1000, Pear 2000, Banana 5000
  const FRUIT = [
    { id: "cherry",     e: "🍒", p: 100  },
    { id: "strawberry", e: "🍓", p: 200  },
    { id: "orange",     e: "🍊", p: 500  },
    { id: "pretzel",    e: "🥨", p: 700  },
    { id: "apple",      e: "🍎", p: 1000 },
    { id: "pear",       e: "🍐", p: 2000 },
    { id: "banana",     e: "🍌", p: 5000 },
  ];

  /**
   * Namco Pac-Man speed table (fraction of max).
   * Pac is always a bit faster than normal ghosts in the maze so you can outrun
   * them in a straightaway — except Cruise Elroy Blinky late in a level.
   */
  function params(lv) {
    const n = Math.min(Math.max(lv, 1), 21);
    // Level 1 slowest; level 2 same pink maze but clearly faster.
    let pac = 0.78;
    let ghost = 0.70;
    if (n === 2) { pac = 0.90; ghost = 0.86; }
    else if (n === 3 || n === 4) { pac = 0.94; ghost = 0.90; }
    else if (n >= 5 && n <= 8) { pac = 1.00; ghost = 0.96; }
    else if (n >= 9 && n <= 12) { pac = 1.00; ghost = 0.98; }
    else if (n >= 13 && n <= 20) { pac = 0.95; ghost = 0.95; }
    else if (n >= 21) { pac = 0.90; ghost = 0.95; }

    let fright = 0.48;
    if (n === 2) fright = 0.54;
    else if (n >= 3 && n <= 4) fright = 0.56;
    else if (n >= 5) fright = 0.60;

    let tunnel = 0.38;
    if (n === 2) tunnel = 0.44;
    else if (n >= 3 && n <= 4) tunnel = 0.46;
    else if (n >= 5) tunnel = 0.50;

    // Cruise Elroy (Blinky) — dots remaining thresholds + speeds
    let elroy1 = 20, elroy2 = 10, elroySpd1 = 0.80, elroySpd2 = 0.85;
    if (n === 2) { elroy1 = 30; elroy2 = 15; elroySpd1 = 0.90; elroySpd2 = 0.95; }
    else if (n === 3 || n === 4) { elroy1 = 40; elroy2 = 20; elroySpd1 = 0.90; elroySpd2 = 0.95; }
    else if (n >= 5 && n <= 8) { elroy1 = 40; elroy2 = 20; elroySpd1 = 1.00; elroySpd2 = 1.05; }
    else if (n >= 9 && n <= 11) { elroy1 = 50; elroy2 = 30; elroySpd1 = 1.00; elroySpd2 = 1.05; }
    else if (n >= 12 && n <= 14) { elroy1 = 80; elroy2 = 50; elroySpd1 = 1.00; elroySpd2 = 1.05; }
    else if (n >= 15 && n <= 18) { elroy1 = 100; elroy2 = 80; elroySpd1 = 1.00; elroySpd2 = 1.05; }
    else if (n >= 19) { elroy1 = 120; elroy2 = 100; elroySpd1 = 1.00; elroySpd2 = 1.05; }

    // Fright duration (ms) — shortens each level
    const frightTable = [
      6000, 5000, 4000, 3000, 2000, 5000, 2000, 2000, 1000, 5000,
      2000, 1000, 1000, 3000, 1000, 1000, 0, 1000, 0, 0, 0,
    ];
    const frightMs = frightTable[Math.min(n - 1, frightTable.length - 1)];

    // Dot counters before Inky / Sue leave the house (Ms. Pac-Man)
    let inkyDots = 30, sueDots = 60;
    if (n === 2) { inkyDots = 0; sueDots = 50; }
    else if (n >= 3) { inkyDots = 0; sueDots = 0; }

    const pacFright = n === 1 ? 0.90 : n <= 4 ? 0.95 : 1.00;
    return {
      pac, pacFright, ghost, fright, tunnel,
      elroy1, elroy2, elroySpd1, elroySpd2,
      frightMs,
      flashMs: Math.min(2000, frightMs),
      inkyDots, sueDots,
      fruit: Math.min(n - 1, 6), // banana from level 7 onward
      house: 0.40,   // slow bob / exit from house
      eyes: 1.35,    // eaten eyes race home (sub-stepped so they still corner)
    };
  }

  // ── DOM ──────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;
  document.documentElement.style.setProperty("--board-w", W + "px");
  document.documentElement.style.setProperty("--board-h", H + "px");

  const $score = document.getElementById("score");
  const $high = document.getElementById("high-score");
  const $level = document.getElementById("level");
  const $lives = document.getElementById("lives");
  const $fruit = document.getElementById("fruit-tray");
  const overlay = document.getElementById("overlay");
  const $title = document.getElementById("overlay-title");
  const $sub = document.getElementById("overlay-sub");
  const $hint = document.getElementById("overlay-hint");
  const $ctrl = document.getElementById("overlay-controls");

  // -- Audio (BUILD V5, Ms. Pac-Man): pure Web Audio oscillator synthesis, no samples ------
  // Recreates the *feel* of the cabinet's 3-voice wavetable sound by ear.
  let audio = null, master = null, muted = false, chompN = 0;
  let musicLockUntil = 0;
  let bg = null; // continuous background voice: siren / fright / eyes

  function unlockAudio() {
    try {
      if (!audio) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return Promise.resolve();
        audio = new AC();
        master = audio.createGain();
        master.gain.value = muted ? 0 : 0.9;
        master.connect(audio.destination);
      }
      if (audio.state === "suspended") return audio.resume().catch(function () {});
    } catch (_) {}
    return Promise.resolve();
  }
  function musicLocked() { return performance.now() < musicLockUntil; }
  function lockMusic(ms) { musicLockUntil = Math.max(musicLockUntil, performance.now() + ms); }

  // One note / sweep. freq can glide to slideTo (linear) over dur.
  function tone(freq, dur, type, vol, when, slideTo) {
    if (!audio || !master) return;
    try {
      const t = audio.currentTime + (when || 0);
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(Math.max(20, freq), t);
      if (slideTo != null) o.frequency.linearRampToValueAtTime(Math.max(20, slideTo), t + dur);
      const v = vol == null ? 0.05 : vol;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.004);
      g.gain.setValueAtTime(v, t + Math.max(0.005, dur - 0.012));
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  // Intermission music on its own bus so a skip can silence it instantly
  let interBus = null;
  function stopInterMusic() {
    if (!interBus || !audio) return;
    try { interBus.gain.cancelScheduledValues(audio.currentTime); interBus.gain.setValueAtTime(0, audio.currentTime);
      const b = interBus; setTimeout(() => { try { b.disconnect(); } catch (_) {} }, 50); } catch (_) {}
    interBus = null;
  }
  function itone(freq, dur, type, vol, when) {
    if (!audio || !interBus) return;
    const t = audio.currentTime + when, o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + Math.max(0.006, dur - 0.015)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(interBus); o.start(t); o.stop(t + dur + 0.02);
  }
  function playInterMusic(act) {
    if (!audio || !master) return;
    stopInterMusic();
    interBus = audio.createGain(); interBus.gain.value = 1; interBus.connect(master);
    // clapper "clack" at 1.0 s
    itone(1800, 0.03, "square", 0.08, 1.0); itone(240, 0.06, "triangle", 0.2, 1.0);
    // Short 3-voice intermission tunes in the 1982 style (composed by ear, swing feel)
    const TUNES = {
      1: { st: 0.15, mel: [72,0,74,1,76,2,79,3,77,5,76,6,74,7,72,8,76,9,79,10,84,11,83,13,81,14,79,15,
                           77,16,76,17,74,18,72,19,71,20,72,21,74,22,79,23,76,24,74,26,72,28], bass: [48,52,55,52,53,57,60,57,55,59,62,59,48,55,48] },
      2: { st: 0.12, mel: [76,0,76,1,79,2,76,3,81,4,79,6,76,7,74,8,74,9,77,10,74,11,79,12,77,14,74,15,
                           72,16,76,18,79,20,84,22,83,24,79,26,76,28,72,30], bass: [45,52,45,52,50,57,50,57,48,55,48,55,43,50,43,48] },
      3: { st: 0.17, mel: [67,0,72,1,76,2,72,3,74,4,77,6,74,7,71,8,74,9,79,10,77,11,76,12,72,14,
                           69,16,72,17,77,18,76,20,74,22,72,24,79,26,84,28], bass: [48,55,53,57,55,59,48,52,53,57,50,55,48,55,48] },
    };
    const tn = TUNES[act] || TUNES[1], st = tn.st, off = 1.3;
    for (let rep = 0; rep < 2; rep++) {
      const base = off + rep * 32 * st;
      for (let i = 0; i < tn.mel.length; i += 2) {
        const nb = i + 3 < tn.mel.length ? tn.mel[i + 3] - tn.mel[i + 1] : 3;
        itone(NOTE(tn.mel[i]), nb * st * 0.85, "square", 0.04, base + tn.mel[i + 1] * st);
      }
      tn.bass.forEach((n, i) => itone(NOTE(n), st * 1.6, "triangle", 0.12, base + i * 2 * st));
    }
  }

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

  // Background voice: carrier oscillator whose pitch is driven by an LFO.
  function bgEnsure() {
    if (!audio || !master || bg) return;
    try {
      const o = audio.createOscillator(), lfo = audio.createOscillator();
      const depth = audio.createGain(), g = audio.createGain();
      o.type = "triangle"; lfo.type = "triangle";
      o.frequency.value = 400; lfo.frequency.value = 2.5; depth.gain.value = 120; g.gain.value = 0;
      lfo.connect(depth); depth.connect(o.frequency); o.connect(g); g.connect(master);
      o.start(); lfo.start();
      bg = { o, lfo, depth, g, mode: "off" };
    } catch (_) { bg = null; }
  }
  // mode: off | siren | fright | eyes ; level01 = fraction of dots eaten
  function bgSet(mode, level01) {
    if (!audio) return;
    if (mode !== "off") bgEnsure();
    if (!bg) return;
    const t = audio.currentTime;
    try {
      if (bg.mode !== mode) {
        bg.mode = mode;
        if (mode === "siren") { bg.o.type = "triangle"; bg.lfo.type = "triangle"; }
        else { bg.o.type = "square"; bg.lfo.type = "sawtooth"; }
      }
      let f = 0, rate = 0, dep = 0, vol = 0;
      if (mode === "siren") {          // rising/falling wail, speeds up as dots go
        const k = Math.min(3, Math.floor((level01 || 0) * 5)); // 4 siren steps like the cabinet
        f = 520 + k * 90; rate = 3.2 + k * 0.7; dep = 110 + k * 25; vol = 0.045;
      } else if (mode === "fright") {   // low repeating "wow-wow" rising sweeps
        f = 380; rate = 7.5; dep = 220; vol = 0.035;
      } else if (mode === "eyes") {     // fast high rising sweeps
        f = 1100; rate = 11; dep = 500; vol = 0.022;
      }
      bg.o.frequency.setTargetAtTime(f || 400, t, 0.02);
      bg.lfo.frequency.setTargetAtTime(rate || 1, t, 0.02);
      bg.depth.gain.setTargetAtTime(dep, t, 0.02);
      bg.g.gain.setTargetAtTime(mode === "off" || musicLocked() ? 0 : vol, t, 0.03);
    } catch (_) {}
  }

  // -- Audio unlock (sound ON by default): first tap/click/key anywhere resumes Web Audio --
  (function () {
    function silentWav() {
      const n = 800, b = new Uint8Array(44 + n), v = new DataView(b.buffer);
      const s = (o, t) => { for (let i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
      s(0, "RIFF"); v.setUint32(4, 36 + n, true); s(8, "WAVEfmt "); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true);
      v.setUint16(32, 1, true); v.setUint16(34, 8, true); s(36, "data"); v.setUint32(40, n, true); b.fill(128, 44);
      let str = ""; for (let i = 0; i < b.length; i++) str += String.fromCharCode(b[i]);
      return "data:audio/wav;base64," + btoa(str);
    }
    let tag = null, kicked = null;
    function onGesture() {
      try { if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback"; } catch (_) {}
      try { if (!tag) { tag = new Audio(silentWav()); tag.setAttribute("playsinline", ""); tag.loop = true; tag.volume = 0.01; } if (tag.paused) { const p = tag.play(); if (p && p.catch) p.catch(function () {}); } } catch (_) {}
      try { unlockAudio(); } catch (_) {}
      try { if (master) master.gain.value = muted ? 0 : 0.9; } catch (_) {}
      try {
        const c = audio;
        if (c) {
          if (c.state !== "running" && c.resume) c.resume().catch(function () {});
          if (kicked !== c) { kicked = c; const sb = c.createBuffer(1, 1, 22050), src = c.createBufferSource(); src.buffer = sb; src.connect(c.destination); src.start(0); }
        }
      } catch (_) {}
    }
    ["pointerdown", "touchstart", "touchend", "mousedown", "click", "keydown"].forEach(function (t) {
      window.addEventListener(t, onGesture, { capture: true, passive: true });
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { try { const c = audio; if (c && c.state === "suspended") c.resume().catch(function () {}); } catch (_) {} } });
    window.__audioInfo = function () { const c = audio; return { ctx: c ? c.state : "none", muted: muted }; };
  })();

  function sfx(name) {
    unlockAudio();
    if (!audio) return;
    if (name === "chomp") {
      // Ms. Pac-Man munch: short rising blip, alternating pitch
      const hi = (chompN++ % 2) === 1;
      tone(hi ? 330 : 280, 0.07, "triangle", 0.15, 0, hi ? 900 : 760);
    } else if (name === "power") {
      tone(260, 0.14, "triangle", 0.12, 0, 90);
    } else if (name === "eat") {
      tone(130, 0.45, "square", 0.05, 0, 1500);
      tone(260, 0.45, "triangle", 0.06, 0, 2600);
    } else if (name === "bounce") {
      // fruit hop: soft low "bop"
      tone(180, 0.06, "triangle", 0.07, 0, 110);
    } else if (name === "fruit") {
      tone(600, 0.08, "square", 0.04, 0, 1400);
      tone(1400, 0.1, "square", 0.04, 0.08, 500);
      tone(700, 0.12, "triangle", 0.08, 0.18, 1600);
    } else if (name === "die") {
      lockMusic(2600);
      // spinning descent: wobbling falling sweeps
      let t = 0;
      for (let i = 0; i < 12; i++) {
        const top = 1200 - i * 80;
        tone(top, 0.08, "square", 0.04, t, top * 0.6);
        t += 0.09;
      }
      tone(300, 0.35, "triangle", 0.12, t, 60);
    } else if (name === "start") {
      lockMusic(4300);
      // Arcade Ms. Pac-Man start tune, recreated by ear (approximate), 3-voice synth
      const st = 0.13;
      const mel = [
        [64,0,1],[66,1,1],[68,2,1],[64,3,1],[69,4,2],[68,6,1],[66,7,1],
        [64,8,1],[61,9,1],[64,10,1],[66,11,1],[68,12,2],[64,14,2],
        [66,16,1],[68,17,1],[69,18,1],[71,19,1],[73,20,2],[71,22,1],[69,23,1],
        [68,24,1],[66,25,1],[68,26,1],[71,27,1],[76,28,4],
      ];
      for (const n of mel) tone(NOTE(n[0]), n[2] * st * 0.88, "square", 0.045, n[1] * st);
      const bass = [[40,0],[47,2],[45,4],[47,6],[37,8],[44,10],[45,12],[47,14],
        [42,16],[49,18],[45,20],[49,22],[47,24],[44,26],[40,28]];
      for (const b of bass) tone(NOTE(b[0]), st * 1.7, "triangle", 0.12, b[1] * st);
    } else if (name === "inter") {
      playInterMusic(interAct || 1);
    } else if (name === "1up") {
      for (let i = 0; i < 6; i++) tone(NOTE(88 + (i % 2) * 4), 0.1, "square", 0.04, i * 0.16);
    }
  }

  // ── State ────────────────────────────────────────────────────────────────
  let map = [];
  let dots = 0, totalDots = 244, freezeT = 0;
  let score = 0;
  let high = +localStorage.getItem("mspacman_high") || 0;
  let level = 1, lives = 3, extra = false;
  let state = "title";
  let readyT = 0, dieT = 0, clearT = 0, interT = 0, interAct = 0;
  let mode = "scatter", modeI = 0, modeT = 0;
  let frightT = 0, combo = 0;
  let eaten = 0;
  let fruit = null, fFlag = [0, 0], fGot = [];
  let time = 0, prev = 0, sirenT = 0;
  let pac, ghosts;
  let hold = null; // held dir

  let P = params(1);
  let WAVES = modeSchedule(1);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function buildMap() {
    mazeIndex = mazeIndexForLevel(level);
    const layout = MAZES[mazeIndex];
    map = [];
    for (let y = 0; y < ROWS; y++) {
      const row = layout[y] || "0".repeat(COLS);
      const cells = row.split("").map(Number);
      while (cells.length < COLS) cells.push(0);
      map.push(cells.slice(0, COLS));
    }
    dots = 0;
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (map[y][x] === DOT || map[y][x] === POWER) dots++;
    totalDots = dots;
    applyMazeTheme();
  }

  function tile(c, r) {
    if (isTunnelRow(r) && (c < 0 || c >= COLS)) return EMPTY;
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return WALL;
    return map[r][c];
  }

  function midX(c) { return c * TILE + TILE * 0.5; }
  function midY(r) { return r * TILE + TILE * 0.5; }
  function colOf(x) { return Math.floor(x / TILE); }
  function rowOf(y) { return Math.floor(y / TILE); }

  /** Round to nearest tile index from center position */
  function nearestCol(x) { return Math.round((x - TILE * 0.5) / TILE); }
  function nearestRow(y) { return Math.round((y - TILE * 0.5) / TILE); }

  /**
   * Walkable check.
   * kind: "pac" | "ghost"
   * g: ghost object (optional)
   */
  function walkable(c, r, kind, g) {
    const t = tile(c, r);
    if (t === WALL) return false;
    if (kind === "pac") return t !== GATE && t !== HOUSE;
    // Eaten eyes: maze corridors + gate + house (so they can enter the pen)
    if (g && g.state === "eyes") {
      return t === EMPTY || t === DOT || t === POWER || t === GATE || t === HOUSE;
    }
    if (g && g.inHouse) return t === HOUSE || t === GATE || t === EMPTY || t === DOT || t === POWER;
    return t !== HOUSE && t !== GATE;
  }

  // ── HUD ──────────────────────────────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, "0"); }
  function hud() {
    $score.textContent = pad(score);
    $high.textContent = pad(high);
    $level.textContent = String(level);
    $lives.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const c = document.createElement("canvas");
      c.width = 16; c.height = 16; c.className = "life-icon";
      drawPacIcon(c.getContext("2d"), 8, 8, 1, "R", 1);
      $lives.appendChild(c);
    }
    $fruit.innerHTML = "";
    for (const fi of fGot) {
      const c = document.createElement("canvas");
      c.width = 12; c.height = 12; c.className = "fruit-icon";
      drawFruitIcon(c.getContext("2d"), 6, 6, FRUIT[fi].id, 1);
      $fruit.appendChild(c);
    }
  }
  function addScore(n) {
    score += n;
    if (score > high) {
      high = score;
      localStorage.setItem("mspacman_high", String(high));
    }
    if (!extra && score >= 10000) { extra = true; lives++; sfx("1up"); }
    hud();
  }
  function showOV(title, sub, cls) {
    overlay.classList.remove("hidden", "ready", "paused", "gameover");
    if (cls) overlay.classList.add(cls);
    $title.textContent = title;
    $sub.textContent = sub || "";
    const home = title === "MS. PAC-MAN";
    if (window.WTPHi) { const $hs = document.getElementById("hs-table"); if (home) WTPHi.render($hs); else if (cls !== "gameover" && $hs) $hs.style.display = "none"; }
    if (home) {
      $hint.textContent = "BUILD V5 — PRESS SPACE OR TAP TO START";
      if ($ctrl) {
        $ctrl.innerHTML =
          "ARROWS / WASD / SWIPE / D-PAD — MOVE<br />" +
          "SPACE OR PAUSE — START / PAUSE<br />" +
          "M OR MUTE — SOUND";
      }
    }
    $hint.style.display = home ? "" : "none";
    if ($ctrl) $ctrl.style.display = home ? "" : "none";
  }
  function hideOV() { overlay.classList.add("hidden"); }

  // ── Actors ───────────────────────────────────────────────────────────────
  function spawn() {
    pac = {
      kind: "pac",
      x: midX(14), y: midY(23),
      dir: L, next: L,
      mouth: 0, open: true,
      dead: false, dieT: 0,
    };
    // Pinky free immediately; Inky/Sue wait on classic dot counters
    ghosts = [
      gh("blinky", "#ff0000", 14, 11, false, 0),
      gh("pinky",  "#ffb8ff", 14, 14, true, 0),
      gh("inky",   "#00ffff", 12, 14, true, P.inkyDots),
      gh("sue",    "#FFB852", 16, 14, true, P.sueDots),
    ];
  }

  function gh(name, color, c, r, inHouse, release) {
    return {
      kind: "ghost", name, color,
      x: midX(c), y: midY(r),
      dir: inHouse ? U : L,
      state: "normal", // normal | fright | eyes
      inHouse, release,
      bob: 0, pop: null, flash: false,
      // Eaten-eyes path following (list of tile waypoints home)
      homePath: null,
      pathI: 0,
    };
  }

  function fullReset(levelUp) {
    if (levelUp) {
      eaten = 0; fFlag = [0, 0]; fruit = null;
      WAVES = modeSchedule(level);
      modeI = 0;
      mode = WAVES[0][0];
      modeT = WAVES[0][1];
      frightT = 0; combo = 0;
    }
    spawn();
  }

  function beginLevel(n) {
    const prevMazeIdx = mazeIndexForLevel(level);
    level = n;
    P = params(level);
    WAVES = modeSchedule(level);
    srand((level * 0x9E37 + (score & 0xFFFF)) & 0xFFFF);
    buildMap(); // mazeIndex + wall color/pattern for this level
    fullReset(true);
    state = "ready";
    readyT = 2800;
    hud();

    // Arcade: levels 1–2 share PINK maze; NEW maze at 3, 6, and 10.
    const boardNames = ["PINK MAZE", "CYAN MAZE", "ORANGE MAZE", "BLUE MAZE"];
    const mazeChanged = level === 1 || mazeIndex !== prevMazeIdx;
    let sub;
    if (level === 1) sub = "PINK MAZE";
    else if (mazeChanged) sub = "NEW MAZE — " + boardNames[mazeIndex];
    else sub = "SAME MAZE — FASTER!";

    showOV("LEVEL " + level, sub, null);
    setTimeout(() => {
      if (state === "ready") showOV("READY!", boardNames[mazeIndex], null);
    }, 1400);
    setTimeout(() => {
      if (state === "ready") showOV("READY!", "", "ready");
    }, 2200);
    // Await AudioContext resume so start jingle is not scheduled while suspended
    Promise.resolve(unlockAudio()).then(function () {
      if (state === "ready") sfx("start");
    });
  }

  // Arcade schedule: Act 1 after board 2, Act 2 after 5, Act 3 after 9 then every 4 boards
  function interActFor(lv) {
    if (lv === 2) return 1;
    if (lv === 5) return 2;
    if (lv >= 9 && (lv - 9) % 4 === 0) return 3;
    return 0;
  }
  const INTER_DUR = { 1: 9800, 2: 0, 3: 10000 };
  let interDur = 9000, interFreeze = false;
  function startIntermission(clearedLevel, act) {
    interAct = act || interActFor(clearedLevel) || 1;
    interDur = interAct === 2 ? 1800 + chaseTotal() + 300 : INTER_DUR[interAct];
    state = "intermission";
    interT = interDur;
    fruit = null;
    bgSet("off");
    hideOV();
    Promise.resolve(unlockAudio()).then(function () { if (state === "intermission") sfx("inter"); });
  }


  function beginGame() {
    if (window.WTPShare) WTPShare.hide();
    srand((Date.now() & 0xFFFF) ^ 0xA5A5);
    score = 0; lives = 3; level = 1; extra = false; fGot = [];
    hold = null;
    Promise.resolve(unlockAudio()).then(function () {
      beginLevel(1);
    });
  }

  // ── MOVEMENT ─────────────────────────────────────────────────────────────
  // Align epsilon must be SMALLER than one frame of movement, or entities
  // snap-to-center every frame and never leave the tile (frozen sprites).
  const ALIGN = 1.0;

  function aligned(entity) {
    const c = nearestCol(entity.x);
    const r = nearestRow(entity.y);
    return Math.abs(entity.x - midX(c)) <= ALIGN && Math.abs(entity.y - midY(r)) <= ALIGN;
  }

  function centerOnTile(entity) {
    entity.x = midX(nearestCol(entity.x));
    entity.y = midY(nearestRow(entity.y));
  }

  function canGo(entity, dir) {
    if (!dir) return false;
    const c = nearestCol(entity.x);
    const r = nearestRow(entity.y);
    return walkable(c + dir.x, r + dir.y, entity.kind, entity);
  }

  /**
   * One movement slice. Capped so fast eyes never skip past a tile center
   * without getting an AI decision (that was why eyes sometimes never got home).
   */
  /** Distance from entity to nearest tile center (max axis). */
  function distToTileCenter(entity) {
    const c = nearestCol(entity.x);
    const r = nearestRow(entity.y);
    return Math.max(Math.abs(entity.x - midX(c)), Math.abs(entity.y - midY(r)));
  }

  /** Near-center turn window (~0.4 tile) so buffered corner turns fire like arcade. */
  function nearCenterForTurn(entity) {
    return distToTileCenter(entity) <= TILE * 0.4;
  }

  function moveSlice(entity, step) {
    if (step <= 0) return;

    // --- Pac turns ---
    if (entity.kind === "pac") {
      if (hold) entity.next = hold;
      if (entity.next) {
        if (entity.next.id === OPP[entity.dir.id].id) {
          // Reverse is always immediate
          entity.dir = entity.next;
        } else if (entity.next.id !== entity.dir.id && canGo(entity, entity.next)) {
          // Exact center OR near-center slack (~0.4 tile) for perpendicular turns
          if (aligned(entity) || nearCenterForTurn(entity)) {
            centerOnTile(entity);
            entity.dir = entity.next;
          }
        }
      }
    }

    // --- Ghost AI at tile centers (living ghosts only; eyes use moveEyes) ---
    if (entity.kind === "ghost" && entity.state !== "eyes" && aligned(entity)) {
      const before = entity.dir.id;
      pickGhostDir(entity);
      if (entity.dir.id !== before) centerOnTile(entity);
    }

    // --- Stop / repath if blocked at a center ---
    if (aligned(entity) && !canGo(entity, entity.dir)) {
      centerOnTile(entity);
      if (entity.kind === "pac") {
        if (entity.next && canGo(entity, entity.next)) entity.dir = entity.next;
        else return;
      } else {
        pickGhostDir(entity);
        if (!canGo(entity, entity.dir)) {
          // Last resort: reverse (especially important for eyes)
          const rev = OPP[entity.dir.id];
          if (canGo(entity, rev)) entity.dir = rev;
          else return;
        }
      }
    }

    // --- Integrate ---
    entity.x += entity.dir.x * step;
    entity.y += entity.dir.y * step;

    if (entity.dir.x !== 0) entity.y = midY(nearestRow(entity.y));
    else entity.x = midX(nearestCol(entity.x));

    let c = colOf(entity.x);
    let r = rowOf(entity.y);
    if (entity.x < 0) c = -1;
    if (entity.x >= W) c = COLS;
    if (!walkable(c, r, entity.kind, entity)) {
      entity.x -= entity.dir.x * step;
      entity.y -= entity.dir.y * step;
      centerOnTile(entity);
    }

    // Tunnel wrap (maze-defined tunnel rows)
    if (isTunnelRow(rowOf(entity.y))) {
      if (entity.x < -TILE * 0.5) entity.x = W + TILE * 0.5 - 1;
      if (entity.x > W + TILE * 0.5) entity.x = -TILE * 0.5 + 1;
    }
  }

  function move(entity, speedMul, dt) {
    const ox = entity.x, oy = entity.y;
    moveInner(entity, speedMul, dt);
    if (entity.kind === "pac") {
      const d = Math.abs(entity.x - ox) + Math.abs(entity.y - oy);
      if (d < TILE * 2) entity.dist = (entity.dist || 0) + d;
    }
  }
  function moveInner(entity, speedMul, dt) {
    let remaining = SPEED * speedMul * (dt / 1000);
    if (remaining <= 0) return;
    // Never travel more than ~40% of a tile without reassessing turns
    const maxStep = TILE * 0.4;
    let guard = 0;
    while (remaining > 0.0001 && guard++ < 12) {
      const step = Math.min(remaining, maxStep);
      moveSlice(entity, step);
      remaining -= step;
    }
  }

  // ── Ghost AI (classic Namco personalities) ───────────────────────────────
  /** Cruise Elroy: Blinky ignores scatter when few dots remain */
  function elroyTier() {
    if (dots <= P.elroy2) return 2;
    if (dots <= P.elroy1) return 1;
    return 0;
  }

  /** Door above pink gate; nest center inside house */
  const DOOR = { x: 14, y: 11 };
  const NEST = { x: 14, y: 14 };
  // Fixed entry corridor once eyes reach the door (arcade home sequence)
  const HOME_ENTRY = [
    { c: 14, r: 11 }, // door
    { c: 14, r: 12 }, // gate
    { c: 14, r: 13 }, // house
    { c: 14, r: 14 }, // nest
  ];

  function eyesWalkable(c, r) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) {
      if (isTunnelRow(r) && (c < 0 || c >= COLS)) return true;
      return false;
    }
    const t = tile(c, r);
    // Corridors + door/house only (never "ghost through walls")
    return t === EMPTY || t === DOT || t === POWER || t === GATE || t === HOUSE;
  }

  /**
   * BFS tile list from (sc,sr) to (tc,tr), excluding the start tile,
   * including the goal. Empty array if already there; null if unreachable.
   */
  function bfsTilePath(sc, sr, tc, tr) {
    if (sc === tc && sr === tr) return [];
    const key = (c, r) => c + "," + r;
    const q = [[sc, sr]];
    const came = new Map(); // child -> parent {c,r}
    came.set(key(sc, sr), null);
    let head = 0;
    let found = false;

    while (head < q.length) {
      const [c, r] = q[head++];
      if (c === tc && r === tr) {
        found = true;
        break;
      }
      for (const d of ORDER) {
        let nc = c + d.x, nr = r + d.y;
        if (isTunnelRow(nr) && nc < 0) nc = COLS - 1;
        if (isTunnelRow(nr) && nc >= COLS) nc = 0;
        const k = key(nc, nr);
        if (came.has(k)) continue;
        if (!eyesWalkable(nc, nr)) continue;
        came.set(k, { c, r });
        q.push([nc, nr]);
      }
    }
    if (!found) return null;

    // Reconstruct goal → start, reverse to start → goal, drop start
    const rev = [];
    let c = tc, r = tr;
    while (!(c === sc && r === sr)) {
      rev.push({ c, r });
      const p = came.get(key(c, r));
      if (!p) break;
      c = p.c;
      r = p.r;
    }
    rev.reverse();
    return rev;
  }

  /** Build a one-shot path: maze → door → gate → nest */
  function buildEyesHomePath(sc, sr) {
    // If already in house/gate, short path to nest
    const t0 = tile(sc, sr);
    if (t0 === HOUSE || t0 === GATE) {
      const inner = bfsTilePath(sc, sr, NEST.x, NEST.y);
      return inner || [{ c: NEST.x, r: NEST.y }];
    }

    let toDoor = bfsTilePath(sc, sr, DOOR.x, DOOR.y);
    if (!toDoor) {
      // Fallback: path straight to nest (side entry possible on row 14)
      const toNest = bfsTilePath(sc, sr, NEST.x, NEST.y);
      return toNest || [];
    }

    // Append fixed door→nest sequence (skip tiles already at end of path)
    const path = toDoor.slice();
    for (const step of HOME_ENTRY) {
      const last = path[path.length - 1];
      if (last && last.c === step.c && last.r === step.r) continue;
      // Don't duplicate if path already ends at door and step is door
      if (!last && step.c === sc && step.r === sr) continue;
      path.push(step);
    }
    return path;
  }

  function reviveEyes(g) {
    g.state = "normal";
    g.inHouse = true;
    g.release = 0;
    g.pop = null;
    g.homePath = null;
    g.pathI = 0;
    g.x = midX(NEST.x);
    g.y = midY(NEST.y);
    g.dir = U;
  }

  /**
   * Dedicated eyes mover — follows a committed waypoint list.
   * Avoids the L/R and U/D bouncing caused by re-picking dirs every frame.
   */
  function moveEyes(g, dt) {
    // Arrive / already home
    const tc0 = nearestCol(g.x), tr0 = nearestRow(g.y);
    if (tile(tc0, tr0) === HOUSE && tc0 >= 12 && tc0 <= 16) {
      reviveEyes(g);
      return;
    }

    if (!g.homePath || g.pathI >= g.homePath.length) {
      g.homePath = buildEyesHomePath(tc0, tr0);
      g.pathI = 0;
      if (!g.homePath.length) {
        // Already at door with empty path to door — force entry sequence
        g.homePath = HOME_ENTRY.slice();
        g.pathI = 0;
      }
    }

    let budget = SPEED * P.eyes * (dt / 1000);
    let guard = 0;

    while (budget > 0.01 && guard++ < 20) {
      if (g.pathI >= g.homePath.length) {
        reviveEyes(g);
        return;
      }

      const wp = g.homePath[g.pathI];
      const tx = midX(wp.c);
      const ty = midY(wp.r);
      const dx = tx - g.x;
      const dy = ty - g.y;
      const dist = Math.hypot(dx, dy);

      // Reached this waypoint
      if (dist <= 2.5) {
        g.x = tx;
        g.y = ty;
        g.pathI++;
        if (tile(wp.c, wp.r) === HOUSE) {
          reviveEyes(g);
          return;
        }
        continue;
      }

      // Face the waypoint (pupils follow movement — Namco style)
      if (Math.abs(dx) >= Math.abs(dy)) {
        g.dir = dx >= 0 ? R : L;
      } else {
        g.dir = dy >= 0 ? D : U;
      }

      const step = Math.min(budget, dist);
      g.x += (dx / dist) * step;
      g.y += (dy / dist) * step;
      budget -= step;

      if (isTunnelRow(rowOf(g.y))) {
        if (g.x < -TILE * 0.5) g.x = W + TILE * 0.5 - 1;
        if (g.x > W + TILE * 0.5) g.x = -TILE * 0.5 + 1;
      }
    }
  }

  /** Legacy name used on eat — builds the home path immediately */
  function pickEyesDir(g) {
    const c = nearestCol(g.x), r = nearestRow(g.y);
    g.homePath = buildEyesHomePath(c, r);
    g.pathI = 0;
    if (!g.homePath.length) g.homePath = HOME_ENTRY.slice();
    // Aim at first waypoint for pupil direction
    const wp = g.homePath[0];
    if (wp) {
      const dx = midX(wp.c) - g.x;
      const dy = midY(wp.r) - g.y;
      if (Math.abs(dx) >= Math.abs(dy)) g.dir = dx >= 0 ? R : L;
      else g.dir = dy >= 0 ? D : U;
    }
  }

  function ghostTarget(g) {
    const pc = nearestCol(pac.x), pr = nearestRow(pac.y), pd = pac.dir;

    // Eyes handled exclusively by pickEyesDir / BFS
    if (g.state === "eyes") return DOOR;

    if (g.inHouse) {
      if (eaten >= g.release) return DOOR;
      return { x: nearestCol(g.x), y: g.dir.id === "U" ? 13 : 15 };
    }

    if (g.state === "fright") {
      return { x: randInt(COLS), y: randInt(ROWS) };
    }

    let m = mode;
    if (g.name === "blinky" && elroyTier() > 0) m = "chase";
    if (m === "scatter") return SCATTER[g.name];

    if (g.name === "blinky") return { x: pc, y: pr };
    if (g.name === "pinky") {
      let x = pc + pd.x * 4, y = pr + pd.y * 4;
      if (pd.id === "U") x -= 4;
      return { x, y };
    }
    if (g.name === "inky") {
      let ax = pc + pd.x * 2, ay = pr + pd.y * 2;
      if (pd.id === "U") ax -= 2;
      const bx = nearestCol(ghosts[0].x), by = nearestRow(ghosts[0].y);
      return { x: ax + (ax - bx), y: ay + (ay - by) };
    }
    const d = Math.hypot(nearestCol(g.x) - pc, nearestRow(g.y) - pr);
    return d > 8 ? { x: pc, y: pr } : SCATTER.sue;
  }

  function pickGhostDir(g) {
    const c = nearestCol(g.x), r = nearestRow(g.y);

    // Eyes use moveEyes() path following — not this picker
    if (g.state === "eyes") return;

    // House exit (living ghosts)
    if (g.inHouse) {
      if (eaten < g.release) {
        if (!walkable(c, r + g.dir.y, "ghost", g)) g.dir = OPP[g.dir.id];
        return;
      }
      if (c !== 14) {
        g.dir = c < 14 ? R : L;
        if (!walkable(c + g.dir.x, r, "ghost", g)) g.dir = U;
        return;
      }
      g.dir = U;
      if (r <= 11) {
        g.inHouse = false;
        g.dir = L;
        if (!walkable(c - 1, r, "ghost", g)) g.dir = R;
      }
      return;
    }

    const tgt = ghostTarget(g);
    const rev = OPP[g.dir.id];
    let best = null, bestD = 1e15;
    const opts = [];

    // Tie-break: UP, LEFT, DOWN, RIGHT — never reverse (except fright random)
    for (const d of ORDER) {
      if (d.id === rev.id) continue;
      if (!walkable(c + d.x, r + d.y, "ghost", g)) continue;
      opts.push(d);
      if (g.state === "fright") continue;
      const dd = (c + d.x - tgt.x) ** 2 + (r + d.y - tgt.y) ** 2;
      if (dd < bestD) {
        bestD = dd;
        best = d;
      }
    }

    if (g.state === "fright") {
      // Frightened: pure PRNG pick among legal exits (arcade-style)
      best = opts.length ? opts[randInt(opts.length)] : rev;
    } else if (opts.length > 1 && mode === "scatter" && modeI === 0 &&
               (g.name === "blinky" || g.name === "pinky") && !(g.name === "blinky" && elroyTier() > 0)) {
      // Ms. Pac-Man: in the opening scatter period Blinky and Pinky pick
      // pseudo-random turns instead of heading for their corners
      best = opts[randInt(opts.length)];
    }
    g.dir = best || opts[0] || rev;
  }

  function reverseAll() {
    // Scatter↔chase wave change: every ghost outside the house about-faces.
    // This is a big part of the original's "erratic" feel.
    for (const g of ghosts) {
      if (g.inHouse || g.state === "eyes") continue;
      g.dir = OPP[g.dir.id];
    }
  }

  /** Speed multiplier for a ghost — Namco tables + Elroy + tunnel + house */
  function ghostSpeedMul(g) {
    // Eyes race home at high speed
    if (g.state === "eyes") return P.eyes;
    // Inside house — slow
    if (g.inHouse) return P.house;
    // Frightened — slow blue wander
    if (g.state === "fright") return P.fright;

    // Tunnel slowdown (ghosts only)
    const inTunnel =
      isTunnelRow(rowOf(g.y)) && (g.x < TILE * 6 || g.x > W - TILE * 6);
    if (inTunnel) return P.tunnel;

    // Cruise Elroy — only Blinky, only when not frightened
    if (g.name === "blinky") {
      const tier = elroyTier();
      if (tier === 2) return P.elroySpd2;
      if (tier === 1) return P.elroySpd1;
    }

    return P.ghost;
  }

  // ── Eat / collide ────────────────────────────────────────────────────────
  function eatDots() {
    const c = colOf(pac.x), r = rowOf(pac.y);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return;
    const v = map[r][c];
    if (v === DOT) {
      map[r][c] = EMPTY; dots--; eaten++;
      addScore(10); sfx("chomp");
      checkFruit();
      if (dots <= 0) { state = "clear"; clearT = 2000; fruit = null; }
    } else if (v === POWER) {
      map[r][c] = EMPTY; dots--; eaten++;
      addScore(50); sfx("power");
      frightT = P.frightMs; combo = 0;
      for (const g of ghosts) {
        if (g.state !== "eyes" && !g.inHouse) {
          g.state = "fright";
          // Instant reverse (classic power-pellet reaction)
          g.dir = OPP[g.dir.id];
        }
      }
      checkFruit();
      if (dots <= 0) { state = "clear"; clearT = 2000; fruit = null; }
    }

    if (fruit && !fruit.gone) {
      if (Math.hypot(pac.x - fruit.x, pac.y - fruit.y) < TILE * 0.85) {
        addScore(fruit.p);
        fGot.push(fruit.i);
        if (fGot.length > 8) fGot.shift();
        sfx("fruit");
        fruit.gone = true;
        fruit.t = 900;
        hud();
      }
    }
  }

  function fruitWalkable(c, r) {
    // No tunnel wrap here — fruit must tour the interior, not short-cut off-map
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return false;
    const t = map[r][c];
    return t === EMPTY || t === DOT || t === POWER;
  }

  /**
   * BFS through corridors only (no tunnel wrap).
   * Returns tile list from start→goal excluding start, including goal.
   */
  function fruitBfs(sc, sr, tc, tr) {
    if (sc === tc && sr === tr) return [];
    if (!fruitWalkable(sc, sr) || !fruitWalkable(tc, tr)) return null;
    const key = (c, r) => c + "," + r;
    const q = [[sc, sr]];
    const came = new Map();
    came.set(key(sc, sr), null);
    let head = 0, found = false;
    while (head < q.length) {
      const [c, r] = q[head++];
      if (c === tc && r === tr) { found = true; break; }
      for (const d of ORDER) {
        const nc = c + d.x, nr = r + d.y;
        const k = key(nc, nr);
        if (came.has(k)) continue;
        if (!fruitWalkable(nc, nr)) continue;
        came.set(k, { c, r });
        q.push([nc, nr]);
      }
    }
    if (!found) return null;
    const rev = [];
    let c = tc, r = tr;
    while (!(c === sc && r === sr)) {
      rev.push({ c, r });
      const p = came.get(key(c, r));
      if (!p) break;
      c = p.c; r = p.r;
    }
    rev.reverse();
    return rev;
  }

  function fruitIntersections() {
    const out = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (!fruitWalkable(c, r)) continue;
        let n = 0;
        for (const d of ORDER) if (fruitWalkable(c + d.x, r + d.y)) n++;
        if (n >= 3) out.push({ c, r });
      }
    }
    return out;
  }

  /**
   * Ms. Pac-Man style: enter a tunnel mouth, bounce through the maze
   * via several corridor junctions, exit the opposite tunnel.
   */
  function buildFruitPath(fromLeft, tr, er) {
    // Innermost walkable tiles at the tunnel mouths
    let startC = fromLeft ? 0 : COLS - 1;
    let endC = fromLeft ? COLS - 1 : 0;
    while (startC >= 0 && startC < COLS && !fruitWalkable(startC, tr)) {
      startC += fromLeft ? 1 : -1;
    }
    while (endC >= 0 && endC < COLS && !fruitWalkable(endC, er)) {
      endC += fromLeft ? -1 : 1;
    }
    if (startC < 0 || startC >= COLS || endC < 0 || endC >= COLS) return [];

    const inters = fruitIntersections();
    const upper = inters.filter((p) => p.r <= 11);
    const midA = inters.filter((p) => p.r >= 8 && p.r <= 13 && p.c !== 14);
    const lower = inters.filter((p) => p.r >= 17);
    const bottom = inters.filter((p) => p.r >= 20);

    function pick(arr, preferSide) {
      if (!arr || !arr.length) return null;
      // Bias away from entry side so path crosses the board
      let pool = arr;
      if (preferSide === "right") {
        const r = arr.filter((p) => p.c >= 14);
        if (r.length) pool = r;
      } else if (preferSide === "left") {
        const l = arr.filter((p) => p.c < 14);
        if (l.length) pool = l;
      }
      return pool[randInt(pool.length)];
    }

    // Build a multi-stop tour (enter → upper → lower → far side → exit)
    const near = fromLeft ? "left" : "right";
    const far = fromLeft ? "right" : "left";
    const stops = [{ c: startC, r: tr }];
    const s1 = pick(upper, far) || pick(midA, far) || pick(inters, far);
    const s2 = pick(lower, near) || pick(bottom, near) || pick(inters, near);
    const s3 = pick(bottom, far) || pick(lower, far) || pick(upper, far);
    const s4 = pick(upper, near) || pick(midA, near);
    if (s1) stops.push(s1);
    if (s2) stops.push(s2);
    if (s3) stops.push(s3);
    if (s4) stops.push(s4);
    stops.push({ c: endC, r: er });

    // Deduplicate consecutive stops
    const clean = [stops[0]];
    for (let i = 1; i < stops.length; i++) {
      const a = clean[clean.length - 1], b = stops[i];
      if (a.c !== b.c || a.r !== b.r) clean.push(b);
    }

    const path = [];
    for (let i = 0; i < clean.length - 1; i++) {
      const a = clean[i], b = clean[i + 1];
      const seg = fruitBfs(a.c, a.r, b.c, b.r);
      if (seg && seg.length) {
        for (const p of seg) path.push(p);
      } else {
        // Skip unreachable stop; try bridge via a mid intersection
        const bridge = pick(inters, null);
        if (bridge) {
          const s1b = fruitBfs(a.c, a.r, bridge.c, bridge.r);
          const s2b = fruitBfs(bridge.c, bridge.r, b.c, b.r);
          if (s1b && s2b) {
            for (const p of s1b) path.push(p);
            for (const p of s2b) path.push(p);
            continue;
          }
        }
      }
    }

    // Fallback: single BFS from entrance to exit through the maze interior
    if (path.length < 8) {
      const direct = fruitBfs(startC, tr, endC, er);
      if (direct && direct.length) {
        path.length = 0;
        for (const p of direct) path.push(p);
      }
    }

    // Exit off the far tunnel mouth (drawn path continues out of bounds)
    path.push({ c: fromLeft ? COLS : -1, r: er, exit: true });
    return path;
  }

  function spawnMovingFruit() {
    // Levels 1-7 fixed fruit; from level 8 a random one each time (arcade)
    const fi = level <= 7 ? P.fruit : randInt(FRUIT.length);
    const f = FRUIT[fi];
    const fromLeft = rand01() < 0.5;
    const tun = tunnelRows();
    const tr = tun[randInt(tun.length)], er = tun[randInt(tun.length)];
    const path = buildFruitPath(fromLeft, tr, er);
    if (!path.length) return; // safety

    const sc = fromLeft ? 0 : COLS - 1;
    let startC = sc;
    while (startC >= 0 && startC < COLS && !fruitWalkable(startC, tr)) {
      startC += fromLeft ? 1 : -1;
    }

    fruit = {
      i: fi, hop: 0, er,
      p: f.p,
      e: f.e,
      id: f.id,
      t: 12000, // stays long enough to complete a tour
      gone: false,
      x: midX(startC),
      y: midY(tr),
      // Begin slightly off-screen so it "enters" the tunnel
      // (then first path tiles pull it into the maze)
      dir: fromLeft ? R : L,
      path,
      pathI: 0,
      fromLeft,
    };
    // Nudge start just outside so entry is visible
    fruit.x = fromLeft ? -TILE * 0.4 : W + TILE * 0.4;
  }

  function moveFruit(dt) {
    if (!fruit || fruit.gone) return;
    // Slightly slower than Ms. Pac so she can catch it
    let remaining = SPEED * 0.48 * (dt / 1000);
    let guard = 0;
    while (remaining > 0.0001 && guard++ < 20) {
      if (!fruit.path || fruit.pathI >= fruit.path.length) {
        fruit = null;
        return;
      }
      const wp = fruit.path[fruit.pathI];
      let goalX, goalY;
      if (wp.exit || wp.c < 0 || wp.c >= COLS) {
        goalX = fruit.fromLeft ? W + TILE * 1.2 : -TILE * 1.2;
        goalY = midY(fruit.er);
      } else {
        goalX = midX(wp.c);
        goalY = midY(wp.r);
      }
      const dx = goalX - fruit.x;
      const dy = goalY - fruit.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 2.0) {
        fruit.x = goalX;
        fruit.y = goalY;
        fruit.pathI++;
        if (wp.exit || wp.c < 0 || wp.c >= COLS) {
          fruit = null;
          return;
        }
        continue;
      }
      if (Math.abs(dx) >= Math.abs(dy)) fruit.dir = dx >= 0 ? R : L;
      else fruit.dir = dy >= 0 ? D : U;
      const step = Math.min(remaining, dist, TILE * 0.45);
      fruit.x += (dx / dist) * step;
      fruit.y += (dy / dist) * step;
      const h0 = fruit.hop | 0;
      fruit.hop += step / (TILE * 1.33);
      if ((fruit.hop | 0) !== h0 && state === "play") sfx("bounce");
      remaining -= step;
    }
  }

  function checkFruit() {
    // Two bonuses per board (classic family timing ~70 / 170 dots)
    if (eaten === 70 && !fFlag[0]) {
      fFlag[0] = 1;
      spawnMovingFruit();
    } else if (eaten === 170 && !fFlag[1]) {
      fFlag[1] = 1;
      spawnMovingFruit();
    }
  }

  function hits() {
    for (const g of ghosts) {
      if (Math.hypot(pac.x - g.x, pac.y - g.y) < TILE * 0.6) {
        if (g.state === "fright") {
          g.state = "eyes";
          g.inHouse = false;
          combo++;
          const pts = 200 * (2 ** (combo - 1));
          addScore(pts); sfx("eat");
          g.pop = { p: pts, t: 1000 };
          freezeT = 1000;
          // Snap to tile and build a fixed path home (no bouncing)
          centerOnTile(g);
          g.homePath = null;
          g.pathI = 0;
          pickEyesDir(g);
          return;
        } else if (g.state === "normal") {
          lives--; hud(); sfx("die");
          state = "die"; dieT = 1700;
          pac.dead = true; pac.dieT = 0;
          return;
        }
      }
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────
  function update(dt) {
    time += dt;
    if (state !== "play") bgSet("off");

    if (state === "title" || state === "pause" || state === "over") return;

    if (state === "ready") {
      readyT -= dt;
      if (hold && pac) pac.next = hold;
      if (readyT <= 0) { state = "play"; hideOV(); }
      return;
    }

    if (state === "die") {
      dieT -= dt; pac.dieT += dt;
      if (dieT <= 0) {
        if (lives <= 0) {
          state = "over";
          showOV("GAME OVER", isTouchPrimary() ? "TAP TO RESTART" : "PRESS SPACE", "gameover");
          if (window.WTPShare) WTPShare.show(score);
          if (window.WTPHi && WTPHi.gameOver(score, document.getElementById("hs-table"), () => { $sub.textContent = isTouchPrimary() ? "TAP TO RESTART" : "PRESS SPACE"; })) $sub.textContent = "";
          return;
        }
        fullReset(false);
        state = "ready"; readyT = 1600;
        showOV("READY!", "", "ready");
      }
      return;
    }

    if (state === "clear") {
      clearT -= dt;
      if (clearT <= 0) {
        // Midway intermissions between boards
        const next = level + 1;
        if (interActFor(level)) {
          startIntermission(level);
        } else {
          beginLevel(next);
        }
      }
      return;
    }

    if (state === "intermission") {
      if (!interFreeze) interT -= dt;
      if (interT <= 0) {
        stopInterMusic();
        beginLevel(level + 1);
      }
      return;
    }

    // —— playing ——
    if (freezeT > 0) {
      freezeT -= dt;
      if (freezeT <= 0) { freezeT = 0; for (const g of ghosts) g.pop = null; }
      bgSet("off");
      return;
    }
    // Frightened timer; global scatter/chase clock PAUSES while blue (arcade)
    if (frightT > 0) {
      frightT -= dt;
      if (frightT <= 0) {
        frightT = 0;
        for (const g of ghosts) if (g.state === "fright") g.state = "normal";
      }
    } else {
      modeT -= dt;
      if (modeT <= 0) {
        modeI = Math.min(modeI + 1, WAVES.length - 1);
        mode = WAVES[modeI][0];
        modeT = WAVES[modeI][1];
        reverseAll(); // sudden about-face — feels "erratic"
      }
    }

    // mouth

    // PAC-MAN — full speed even in tunnels (arcade); only ghosts slow there
    if (hold) pac.next = hold;
    move(pac, frightT > 0 ? P.pacFright : P.pac, dt);
    eatDots();

    // GHOSTS — each uses Namco speed table
    for (const g of ghosts) {
      if (g.state === "eyes") {
        // Separate mover: committed maze path back to the house
        moveEyes(g, dt);
      } else {
        move(g, ghostSpeedMul(g), dt);
      }
      g.bob += dt;
      // Flash only in the last portion of fright time
      const flashWindow = Math.min(P.frightMs, 5 * 467);
      g.flash =
        g.state === "fright" &&
        frightT > 0 &&
        frightT < flashWindow &&
        ((frightT / 233) | 0) % 2 === 1;
      if (g.pop) { g.pop.t -= dt; if (g.pop.t <= 0) g.pop = null; }
    }

    if (fruit) {
      fruit.t -= dt;
      if (!fruit.gone) moveFruit(dt);
      if (fruit.t <= 0) fruit = null;
    }
    hits();

    const anyEyes = ghosts.some((g) => g.state === "eyes");
    bgSet(anyEyes ? "eyes" : frightT > 0 ? "fright" : "siren", 1 - dots / totalDots);
  }

  // -- Draw (BUILD V5): original hand-authored pixel art in the 1982 Ms. Pac-Man style -----
  // Arcade sprites are 16x16 on an 8px tile grid; here 1 art pixel = PX canvas px.
  const PX = TILE / 8; // 3
  const COL = {
    pac: "#FFFF00", wall: "#2121FF", dot: "#FFB8AE", gate: "#FFB8FF",
    fright: "#2121FF", frightFace: "#FFB8AE", flash: "#DEDEFF", flashFace: "#FF0000",
    eyeW: "#DEDEFF", pupil: "#2121FF",
  };
  const spriteCache = new Map();
  function makeSprite(key, w, h, paint) {
    let c = spriteCache.get(key);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = w; c.height = h;
    paint(c.getContext("2d"));
    spriteCache.set(key, c);
    return c;
  }
  // Draw a bitmap (array of strings) with a palette, 1 art px = 1 canvas px.
  function paintRows(cctx, rows, pal, ox, oy) {
    for (let y = 0; y < rows.length; y++)
      for (let x = 0; x < rows[y].length; x++) {
        const col = pal[rows[y][x]];
        if (col) { cctx.fillStyle = col; cctx.fillRect(ox + x, oy + y, 1, 1); }
      }
  }
  function blit(cctx, spr, cx, cy, px) {
    cctx.imageSmoothingEnabled = false;
    const w = spr.width * px, h = spr.height * px;
    cctx.drawImage(spr, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
  }

  // Ms. Pac-Man: 13px disc with bow, lipstick, eye and beauty mark.
  // Painted facing right, then mirrored for left / rotated for up & down.
  const MSP_MOUTH = [0.12, 0.5, 0.85];
  function msPacPaintR(c, half, px) {
    // px(x, y, color) in right-facing coordinates
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const dx = x + 0.5 - 8, dy = y + 0.5 - 8;
        if (dx * dx + dy * dy > 6.6 * 6.6) continue;
        if (Math.abs(Math.atan2(dy, dx)) < half && dx > 0.3) continue;
        px(x, y, COL.pac);
      }
    // lipstick on mouth edges (two red pixels each side near the tip)
    const lx = Math.round(8 + Math.cos(half) * 5.6), ly = Math.sin(half) * 5.6;
    for (const s of [-1, 1]) {
      const yy = Math.round(8 + s * ly - (s < 0 ? 1 : 0));
      px(lx - 1, yy, "#FF0000"); px(lx, yy, "#FF0000");
    }
    // eye (blue) with a black lash line above
    px(9, 4, "#2121FF"); px(10, 4, "#2121FF"); px(9, 5, "#2121FF"); px(10, 5, "#2121FF");
    px(9, 3, "#000"); px(10, 3, "#000"); px(11, 3, "#000");
    // bow (red with blue knot) on the crown, toward the back
    const BOW = ["RR.RR", "RRBRR", "RR.RR"];
    for (let y = 0; y < BOW.length; y++)
      for (let x = 0; x < 5; x++) {
        const ch = BOW[y][x];
        if (ch === "R") px(3 + x, 1 + y, "#FF0000");
        else if (ch === "B") px(3 + x, 1 + y, "#2121FF");
      }
  }
  function msPacSprite(dirId, frame) {
    return makeSprite("msp" + dirId + frame, 16, 16, (c) => {
      msPacPaintR(c, MSP_MOUTH[frame], (x, y, col) => {
        let X = x, Y = y;
        if (dirId === "L") X = 15 - x;
        else if (dirId === "U") { X = y; Y = 15 - x; }
        else if (dirId === "D") { X = 15 - y; Y = x; }
        c.fillStyle = col; c.fillRect(X, Y, 1, 1);
      });
    });
  }
  function drawPacIcon(cctx, cx, cy, px, dirId, frame) {
    blit(cctx, msPacSprite(dirId, frame == null ? 1 : frame), cx, cy, px);
  }

  function drawPac() {
    if (!pac || freezeT > 0) return;
    if (pac.dead) {
      // Ms. Pac-Man spins in place, then disappears
      const t = pac.dieT;
      if (t > 1450) return;
      const spin = ["U", "L", "D", "R"][Math.floor(t / 110) % 4];
      drawPacIcon(ctx, pac.x, pac.y, PX, t < 300 ? pac.dir.id : spin, 1);
      return;
    }
    const seqF = [0, 1, 2, 1];
    drawPacIcon(ctx, pac.x, pac.y, PX, pac.dir.id, seqF[(Math.floor((pac.dist || 0) / (PX * 2))) % 4]);
  }

  // Ghost body 14x14 (two skirt frames), hand-drawn.
  const GHOST_TOP = [
    ".....####.....",
    "...########...",
    "..##########..",
    ".############.",
    ".############.",
    ".############.",
    "##############",
    "##############",
    "##############",
    "##############",
    "##############",
    "##############",
  ];
  const SKIRT = [
    ["##.###..###.##", "#...##..##...#"],
    ["####.####.####", ".##...##...##."],
  ];
  // Eye whites (4x5) and pupils (2x2) offsets per direction
  const EYES = {
    L: { wx: -1, wy: 0, px: 0, py: 2 },
    R: { wx: 1, wy: 0, px: 2, py: 2 },
    U: { wx: 0, wy: -1, px: 1, py: 0 },
    D: { wx: 0, wy: 1, px: 1, py: 3 },
  };
  function paintEyes(c, dirId, ox, oy) {
    const e = EYES[dirId] || EYES.L;
    for (const ex of [2, 8]) {
      const x0 = ox + ex + e.wx, y0 = oy + 3 + e.wy;
      c.fillStyle = COL.eyeW;
      c.fillRect(x0 + 1, y0, 2, 5); c.fillRect(x0, y0 + 1, 4, 3);
      c.fillStyle = COL.pupil;
      c.fillRect(x0 + e.px, y0 + e.py, 2, 2);
    }
  }
  function ghostSprite(kind, color, frame, dirId) {
    return makeSprite("g" + kind + color + frame + dirId, 16, 16, (c) => {
      const body = GHOST_TOP.concat(SKIRT[frame]);
      if (kind !== "eyes") {
        const bc = kind === "fright" ? COL.fright : kind === "flash" ? COL.flash : color;
        paintRows(c, body, { "#": bc }, 1, 1);
      }
      if (kind === "fright" || kind === "flash") {
        c.fillStyle = kind === "flash" ? COL.flashFace : COL.frightFace;
        c.fillRect(1 + 4, 1 + 5, 2, 2); c.fillRect(1 + 8, 1 + 5, 2, 2);
        for (let x = 2; x <= 11; x++) {
          const m = (x - 2) % 4;
          if (m === 1 || m === 2) c.fillRect(1 + x, 1 + 9, 1, 1);
          else c.fillRect(1 + x, 1 + 10, 1, 1);
        }
      } else {
        paintEyes(c, dirId, 1, 1);
      }
    });
  }

  function drawGhost(g) {
    const x = g.x, y = g.y;
    if (g.pop && freezeT > 0) {
      // Arcade shows the bonus in cyan where the ghost was eaten
      ctx.fillStyle = "#00FFFF";
      ctx.font = Math.round(4 * PX) + "px 'Press Start 2P', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(g.pop.p), x, y);
      return;
    }
    const frame = ((g.bob / 133) | 0) % 2; // skirt toggles ~every 8 frames
    let kind = "normal";
    if (g.state === "eyes") kind = "eyes";
    else if (g.state === "fright") kind = g.flash ? "flash" : "fright";
    blit(ctx, ghostSprite(kind, g.color, frame, g.dir.id), x, y, PX);
  }

  // Bonus fruit 12x12, hand-drawn.
  const FRUIT_ART = {
    cherry: [["", ".........bb.", ".......bb.b.", "......b...b.", ".....b....b.", "..RRb....b..", ".RRRRR..b...",
      ".RWRRR.RRRR.", ".RRWRRRRRRRR", ".RRRRRRWRRRR", "..RRR.RRWRRR", ".......RRRR.", ""], { R: "#FF0000", W: "#DEDEFF", b: "#DE9751" }],
    strawberry: [[".....GG.....", "...GGGGGG...", "..RRGGGGRR..", ".RRRWRRWRRR.", ".RWRRRRRRWR.", ".RRRRWRRRRR.",
      ".RRWRRRRWRR.", "..RRRRWRRR..", "..RWRRRRRR..", "...RRRWRR...", "....RRRR....", ".....RR....."], { R: "#FF0000", W: "#DEDEFF", G: "#00DE00" }],
    orange: [["....GG.GG...", ".....GGG....", "...OOOOOO...", "..OOOOOOOO..", ".OOOOOOOOOO.", ".OOOOOOOOOO.",
      ".OOOOOOOOOO.", ".OOOOOOOOOO.", "..OOOOOOOO..", "...OOOOOO...", "", ""], { O: "#FFB852", G: "#00DE00" }],
    apple: [[".....b......", ".....b......", "..RRRbRRR...", ".RRRRRRRRR..", "RRWRRRRRRRR.", "RWRRRRRRRRR.",
      "RRRRRRRRRRR.", "RRRRRRRRRRR.", ".RRRRRRRRR..", ".RRRRRRRRR..", "..RRR.RRR...", ""], { R: "#FF0000", W: "#DEDEFF", b: "#DE9751" }],
    melon: [[".....b......", "....bbb.....", "..GGgGGgG...", ".GgGGgGGgG..", "GGgGGgGGgGG.", "GgGGgGGgGGg.",
      "GGgGGgGGgGG.", "GgGGgGGgGGg.", ".GGgGGgGGG..", "..GgGGgGG...", "...GGgGG....", ""], { G: "#00DE00", g: "#DEDEFF", b: "#00DE00" }],
    galaxian: [["", ".....R......", "....RRR.....", ".B.YYYYY.B..", ".BYYYYYYYB..", ".BYYRYRYYB..", ".B.YYYYY.B..",
      ".B..YYY..B..", ".....Y......", ".....Y......", "", ""], { Y: "#FFFF00", B: "#2121FF", R: "#FF0000" }],
    bell: [[".....YY.....", "....YYYY....", "...YYYYYY...", "..YWYYYYYY..", "..YWYYYYYY..", "..YWYYYYYY..",
      ".YWYYYYYYYY.", ".YYYYYYYYYY.", "YYYYYYYYYYYY", "YYYYYYYYYYYY", ".....bb.....", "....bbbb...."], { Y: "#FFFF00", W: "#DEDEFF", b: "#00FFFF" }],
    key: [["...bbbbbb...", "..bbbbbbbb..", "..b.bbbb.b..", "..bbbbbbbb..", "....WWWW....", ".....WW.....",
      ".....WWW....", ".....WW.....", ".....WWW....", ".....WW.....", ".....WWW....", ".....WW....."], { b: "#00FFFF", W: "#DEDEFF" }],
  };

  FRUIT_ART.pretzel = [["", "..bbb..bbb..", ".b...bb...b.", "b....bb....b", "b...b..b...b", ".b.b....b.b.",
    "..bb....bb..", ".b..b..b..b.", "b....bb....b", ".b..b..b..b.", "..bb....bb..", ""], { b: "#DE9751" }];
  FRUIT_ART.pear = [[".....b......", ".....bG.....", "....GGG.....", "....GGG.....", "...GGGGG....", "...GWGGG....",
    "..GWGGGGG...", ".GGGGGGGGG..", ".GGGGGGGGG..", ".GGGGGGGGG..", "..GGGGGGG...", "...GGGGG...."], { G: "#00DE00", W: "#FFFF00", b: "#DE9751" }];
  FRUIT_ART.banana = [["..........b.", ".........bY.", "........YYY.", ".......YYYY.", "......YYYYY.", ".....YYYYY..",
    "...YYYYYYY..", ".YYYYYYYW...", "YYYYYYWW....", ".YYYWW......", "..bb........", ""], { Y: "#FFFF00", W: "#DEDEFF", b: "#DE9751" }];
  function drawFruitIcon(cctx, cx, cy, id, px) {
    const art = FRUIT_ART[id] || FRUIT_ART.cherry;
    const spr = makeSprite("fruit" + id, 12, 12, (c) => paintRows(c, art[0], art[1], 0, 0));
    blit(cctx, spr, cx, cy, px);
  }

  // Maze: thin blue outline walls with rounded corners; double line on the
  // outer border and ghost pen, like the cabinet. Cached to an offscreen canvas.
  function wallAt(c, r) {
    if (isTunnelRow(r) && (c < 0 || c >= COLS)) return false;
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
    return MAZES[mazeIndex][r][c] === "0";
  }
  // Edge cells of a wall region: trace the boundary with a fixed inset (px
  // from the corridor), drawing straight runs and quarter arcs at corners.
  function strokeWalls(cctx, inset, only) {
    const T = TILE;
    cctx.beginPath();
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (!wallAt(c, r)) continue;
        if (only && !only.has(c + "," + r)) continue;
        const x = c * T, y = r * T;
        const o = { U: !wallAt(c, r - 1), D: !wallAt(c, r + 1), L: !wallAt(c - 1, r), R: !wallAt(c + 1, r) };
        const ins = inset;
        // straight edges
        if (o.U) { cctx.moveTo(x + (o.L ? ins + (T / 2 - ins) : 0), y + ins); cctx.lineTo(x + T - (o.R ? T / 2 : 0), y + ins); }
        if (o.D) { cctx.moveTo(x + (o.L ? T / 2 : 0), y + T - ins); cctx.lineTo(x + T - (o.R ? T / 2 : 0), y + T - ins); }
        if (o.L) { cctx.moveTo(x + ins, y + (o.U ? T / 2 : 0)); cctx.lineTo(x + ins, y + T - (o.D ? T / 2 : 0)); }
        if (o.R) { cctx.moveTo(x + T - ins, y + (o.U ? T / 2 : 0)); cctx.lineTo(x + T - ins, y + T - (o.D ? T / 2 : 0)); }
        const rr = T / 2 - ins;
        // outer (convex) corners
        if (o.U && o.L) { cctx.moveTo(x + ins, y + T / 2); cctx.arcTo(x + ins, y + ins, x + T / 2, y + ins, rr); cctx.lineTo(x + T / 2, y + ins); }
        if (o.U && o.R) { cctx.moveTo(x + T / 2, y + ins); cctx.arcTo(x + T - ins, y + ins, x + T - ins, y + T / 2, rr); cctx.lineTo(x + T - ins, y + T / 2); }
        if (o.D && o.L) { cctx.moveTo(x + ins, y + T / 2); cctx.arcTo(x + ins, y + T - ins, x + T / 2, y + T - ins, rr); cctx.lineTo(x + T / 2, y + T - ins); }
        if (o.D && o.R) { cctx.moveTo(x + T / 2, y + T - ins); cctx.arcTo(x + T - ins, y + T - ins, x + T - ins, y + T / 2, rr); cctx.lineTo(x + T - ins, y + T / 2); }
        // inner (concave) corners: wall on both sides but diagonal open
        const ri = ins;
        if (!o.U && !o.L && !wallAt(c - 1, r - 1)) { cctx.moveTo(x, y + ins); cctx.arcTo(x + ins, y + ins, x + ins, y, ri); cctx.lineTo(x + ins, y); }
        if (!o.U && !o.R && !wallAt(c + 1, r - 1)) { cctx.moveTo(x + T, y + ins); cctx.arcTo(x + T - ins, y + ins, x + T - ins, y, ri); cctx.lineTo(x + T - ins, y); }
        if (!o.D && !o.L && !wallAt(c - 1, r + 1)) { cctx.moveTo(x, y + T - ins); cctx.arcTo(x + ins, y + T - ins, x + ins, y + T, ri); cctx.lineTo(x + ins, y + T); }
        if (!o.D && !o.R && !wallAt(c + 1, r + 1)) { cctx.moveTo(x + T, y + T - ins); cctx.arcTo(x + T - ins, y + T - ins, x + T - ins, y + T, ri); cctx.lineTo(x + T - ins, y + T); }
      }
    cctx.stroke();
  }
  const mazeCache = {};
  function mazeCanvas(fill, line) {
    const key = mazeIndex + fill + line;
    if (mazeCache[key]) return mazeCache[key];
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const m = c.getContext("2d");
    const L = MAZES[mazeIndex];
    const ins = 3.5 * PX;
    // Ms. Pac-Man walls are solid-filled with a contrasting outline
    m.fillStyle = fill;
    for (let r = 0; r < ROWS; r++)
      for (let cc = 0; cc < COLS; cc++)
        if (L[r][cc] === "0") m.fillRect(cc * TILE, r * TILE, TILE, TILE);
    m.fillStyle = "#000";
    for (let r = 0; r < ROWS; r++)
      for (let cc = 0; cc < COLS; cc++)
        if (L[r][cc] !== "0") {
          m.beginPath();
          m.roundRect(cc * TILE - ins, r * TILE - ins, TILE + 2 * ins, TILE + 2 * ins, ins);
          m.fill();
        }
    m.strokeStyle = line; m.lineWidth = PX; m.lineCap = "butt";
    strokeWalls(m, ins - PX / 2, null);
    m.fillStyle = COL.gate;
    for (let r = 0; r < ROWS; r++)
      for (let cc = 0; cc < COLS; cc++)
        if (L[r][cc] === "4") m.fillRect(cc * TILE, r * TILE + 5 * PX, TILE, 2 * PX);
    mazeCache[key] = c;
    return c;
  }
  function drawMaze() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const meta = MAZE_META[mazeIndex] || MAZE_META[0];
    const flash = state === "clear" && clearT < 1700 && ((time / 233) | 0) % 2 === 0;
    ctx.drawImage(flash ? mazeCanvas("#000", "#DEDEFF") : mazeCanvas(meta.fill, meta.line), 0, 0);
  }
  function drawDots() {
    const meta = MAZE_META[mazeIndex] || MAZE_META[0];
    ctx.fillStyle = meta.dot;
    const blinkOn = state !== "play" || ((time / 167) | 0) % 2 === 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const v = map[r][c];
        const x = c * TILE, y = r * TILE;
        if (v === DOT) ctx.fillRect(x + 3 * PX, y + 3 * PX, 2 * PX, 2 * PX);
        else if (v === POWER && blinkOn) {
          ctx.fillRect(x + 1 * PX, y + 0, 6 * PX, 8 * PX);
          ctx.fillRect(x, y + 1 * PX, 8 * PX, 6 * PX);
        }
      }
  }

  function drawFruit() {
    if (!fruit) return;
    const fx = fruit.x != null ? fruit.x : W / 2;
    const fy = fruit.y != null ? fruit.y : midY(17);
    if (fruit.gone) {
      ctx.fillStyle = "#FFB8FF";
      ctx.font = Math.round(4 * PX) + "px 'Press Start 2P', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(fruit.p), fx, fy);
      return;
    }
    // bounce: hop of up to 3 art px, one hop per ~tile of travel
    const ph = ((fruit.hop || 0) % 1);
    const lift = Math.round(Math.sin(ph * Math.PI) * 3) * PX;
    drawFruitIcon(ctx, fx, fy - lift - PX, fruit.id || FRUIT[fruit.i].id, PX);
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    if (state === "intermission") {
      drawIntermission();
      return;
    }
    drawMaze();
    drawDots();
    if (state !== "clear") drawFruit();
    if (state !== "die") for (const g of ghosts) drawGhost(g);
    if (pac) drawPac();

    if (state === "ready") {
      const meta = MAZE_META[mazeIndex] || MAZE_META[0];
      ctx.fillStyle = meta.line;
      ctx.font = `${Math.round(8 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(meta.name + "  L" + level, W / 2, midY(11));
      ctx.fillStyle = "#ffff00";
      ctx.font = `${Math.round(14 * S)}px 'Press Start 2P', monospace`;
      ctx.fillText("READY!", W / 2, midY(17));
    }
  }

  // -- Intermissions (BUILD V5): hand-made recreations of the three 1982 acts ------------
  function pacManSprite(dirId, frame) {
    return makeSprite("pm" + dirId + frame, 16, 16, (c) => {
      const half = [0.05, 0.5, 0.9][frame];
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
          const dx = x + 0.5 - 8, dy = y + 0.5 - 8;
          if (dx * dx + dy * dy > 6.6 * 6.6) continue;
          if (Math.abs(Math.atan2(dy, dx)) < half && dx > 0.3) continue;
          let X = x, Y = y;
          if (dirId === "L") X = 15 - x;
          else if (dirId === "U") { X = y; Y = 15 - x; }
          else if (dirId === "D") { X = 15 - y; Y = x; }
          c.fillStyle = COL.pac; c.fillRect(X, Y, 1, 1);
        }
    });
  }
  const anim3 = (ms) => [0, 1, 2, 1][Math.floor(ms / 70) % 4];
  function drawPM(x, y, d, ms, px) { blit(ctx, pacManSprite(d, anim3(ms)), x, y, px || PX); }
  function drawMS(x, y, d, ms, px) { blit(ctx, msPacSprite(d, anim3(ms)), x, y, px || PX); }
  function drawGh(x, y, color, d, ms) { blit(ctx, ghostSprite("normal", color, Math.floor(ms / 130) % 2, d), x, y, PX); }
  const HEART = [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."];
  const STORK = [
    [ // wings up
      "..........WW............",
      ".........WWWW...........",
      "........WWWWW...........",
      "..WW...WWWWW............",
      "OOOWWWWWWWWWWWWWW.......",
      "..WWWWWWWWWWWWWWWWW.....",
      "...........WWWWWWWWWW...",
      "...........B.B..........",
      "...........O.O..........",
      "..........O...O.........",
    ],
    [ // wings down
      "........................",
      "........................",
      "........................",
      "..WW....................",
      "OOOWWWWWWWWWWWWWW.......",
      "..WWWWWWWWWWWWWWWWW.....",
      ".......WWWWWW.WWWWWWWW..",
      "........WWWWW...........",
      ".........WWW.O..........",
      "..........W.O.O.........",
    ],
  ];
  const BAG = ["..BB..", ".BBBB.", "BBBBBB", "BBBBBB", "BBBBBB", ".BBBB."];
  const pal = { R: "#FF0000", W: "#DEDEFF", O: "#FFB851", B: "#2121FF", K: "#000" };
  function art(rows, x, y, px, flip) {
    const k = rows[0].length;
    blit(ctx, makeSprite("art" + rows.join("") + (flip ? "f" : ""), k, rows.length, (c) => {
      paintRows(c, flip ? rows.map((r) => r.split("").reverse().join("")) : rows, pal, 0, 0);
    }), x, y, px);
  }
  const txt = (s, x, y, col, sz) => {
    ctx.fillStyle = col; ctx.font = Math.round(sz * S) + "px 'Press Start 2P', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s, x, y);
  };
  const ACT_TITLES = { 1: "THEY MEET", 2: "THE CHASE", 3: "JUNIOR" };
  function drawClapper(ms) {
    const bx = W * 0.2, by = H * 0.42, bw = 120, bh = 84;
    ctx.fillStyle = "#DEDEFF"; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#000"; ctx.fillRect(bx + 6, by + 6, bw - 12, bh - 12);
    txt(String(interAct), bx + bw / 2, by + bh / 2 + 2, "#DEDEFF", 22);
    // hinged clapper arm: open then snaps shut at 1.0 s
    const ang = ms < 700 ? -0.55 : ms < 1000 ? -0.55 * (1 - (ms - 700) / 300) : 0;
    ctx.save(); ctx.translate(bx, by - 2); ctx.rotate(ang);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#000" : "#DEDEFF"; ctx.fillRect(i * bw / 6, -18, bw / 6, 18); }
    ctx.strokeStyle = "#DEDEFF"; ctx.lineWidth = 2; ctx.strokeRect(0, -18, bw, 18);
    ctx.restore();
    txt("ACT " + interAct, W * 0.62, by + 22, "#FFB8FF", 10);
    txt(ACT_TITLES[interAct], W * 0.62, by + 62, "#DEDEFF", 10);
  }
  // Act 2 passes: [rowFrac, dir(+1 right/-1 left), leader('ms'|'pm'), speed px/ms]
  const CHASE = [[0.34, 1, "ms", 0.28], [0.62, -1, "pm", 0.34], [0.48, 1, "pm", 0.46],
    [0.34, -1, "ms", 0.62], [0.62, 1, "ms", 0.85], [0.48, -1, "pm", 1.15], [0.34, 1, "ms", 1.5], [0.62, -1, "pm", 1.9]];
  const GAP = 70, LANE = W + 260;
  function chaseTotal() { return CHASE.reduce((a, p) => a + LANE / p[3], 0); }

  function drawIntermission() {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const el = interDur - Math.max(0, interT);
    if (el < 1800) { drawClapper(el); return; }
    const t = el - 1800;
    txt(ACT_TITLES[interAct], W / 2, H * 0.12, "#FFB8FF", 8);
    if (interAct === 1) act1(t); else if (interAct === 2) act2(t); else act3(t);
  }

  function act1(t) {
    const y1 = H * 0.32, y2 = H * 0.5, y3 = H * 0.68, v = 0.3; // px/ms
    if (t < 2700) { // top: Pac-Man chased by Inky ->, bottom: Ms. chased by Pinky <-
      const x = -40 + t * v;
      drawPM(x, y1, "R", t); drawGh(x - 70, y1, "#00FFFF", "R", t);
      drawMS(W - x, y3, "L", t); drawGh(W - x + 70, y3, "#FFB8FF", "L", t);
      return;
    }
    const u = t - 2700, cx = W / 2, meet = (cx - 22 + 40) / v; // time to reach center
    let px = Math.min(-40 + u * v, cx - 22), gx = -110 + u * v;
    // couple hops up out of the way as they meet; ghosts collide underneath
    let hop = 0;
    if (u > meet) hop = Math.min(1, (u - meet) / 350);
    let land = u > meet + 1400 ? Math.min(1, (u - meet - 1400) / 400) : 0;
    const cy = y2 - 60 * hop + 0 * land;
    const pmD = u > meet ? "R" : "R", msD = "L";
    drawPM(px, cy, pmD, u > meet + 500 ? 70 : u);
    drawMS(W - px, cy, msD, u > meet + 500 ? 70 : u);
    const hit = (cx - 24 + 110) / v;
    if (u < hit) {
      drawGh(gx, y2, "#00FFFF", "R", u); drawGh(W - gx, y2, "#FFB8FF", "L", u);
    } else {
      const k = u - hit; // bounce back & tumble down
      if (k < 900) {
        const dx = k * 0.08, dy = -40 * Math.sin(Math.min(1, k / 450) * Math.PI) + Math.max(0, k - 450) * 0.15;
        drawGh(cx - 24 - dx, y2 + dy, "#00FFFF", "U", u); drawGh(cx + 24 + dx, y2 + dy, "#FFB8FF", "U", u);
        if (k < 250) txt("*", cx, y2 - 18, "#FFFF00", 14);
      }
    }
    if (u > meet + 1200) {
      const k = Math.min(1, (u - meet - 1200) / 300);
      art(HEART, cx, cy - 60, PX * 2 * k + 0.01, false);
    }
  }

  function act2(t) {
    let acc = 0;
    for (const p of CHASE) {
      const d = LANE / p[3];
      if (t < acc + d) {
        const u = t - acc, y = H * p[0], dir = p[1];
        const lead = -130 + u * p[3] + GAP, follow = lead - GAP;
        const X = (s) => dir > 0 ? s : W - s, D = dir > 0 ? "R" : "L";
        if (p[2] === "ms") { drawMS(X(lead), y, D, u); drawPM(X(follow), y, D, u); }
        else { drawPM(X(lead), y, D, u); drawMS(X(follow), y, D, u); }
        return;
      }
      acc += d;
    }
  }

  function act3(t) {
    const fy = H * 0.66, pmx = W * 0.2, msx = W * 0.3;
    // Couple waits on the left, facing the incoming stork
    drawPM(pmx, fy, "R", 70); drawMS(msx, fy, "R", 70);
    const sv = 0.16, sx = W + 80 - t * sv, sy = H * 0.3;
    if (sx > -120) art(STORK[Math.floor(t / 220) % 2], sx, sy, PX, false);
    const dropX = W * 0.62, tDrop = (W + 80 - dropX) / sv;
    if (t < tDrop) { art(BAG, sx - 34, sy + 26, PX, false); return; }
    // bag falls, drifting left, then bounces twice on the floor
    const k = t - tDrop, g = 0.0009;
    const fall = fy - (sy + 26), tFall = Math.sqrt(2 * fall / g);
    let bx = dropX - 34 - Math.min(k, tFall + 900) * 0.05, by;
    if (k < tFall) by = sy + 26 + 0.5 * g * k * k;
    else {
      const b = k - tFall, hops = [[450, 40], [300, 16]];
      by = fy; let a = 0;
      for (const [dur, h] of hops) { if (b < a + dur) { const q = (b - a) / dur; by = fy - 4 * h * q * (1 - q); break; } a += dur; }
    }
    const open = tFall + 1100;
    if (k < open) art(BAG, bx, by, PX, false);
    else {
      // Junior pops out: tiny Pac-Man wearing a beanie
      drawPM(bx, fy + 6, "L", k, PX * 0.6);
      ctx.fillStyle = "#2121FF"; ctx.fillRect(bx - 6, fy - 4, 10, 3);
      ctx.fillStyle = "#FF0000"; ctx.fillRect(bx - 1, fy - 7, 2, 3);
      if (k > open + 600) art(HEART, (pmx + bx) / 2, fy - 60, PX, false);
    }
  }

  // ── Loop ─────────────────────────────────────────────────────────────────
  function tick(ts) {
    if (!prev) prev = ts;
    let dt = ts - prev;
    prev = ts;
    if (dt > 40) dt = 40;
    if (dt < 0) dt = 0;
    update(dt);
    render();
    requestAnimationFrame(tick);
  }

  // ── Input ────────────────────────────────────────────────────────────────
  function readDir(e) {
    const k = e.key, c = e.code;
    if (k === "ArrowLeft" || k === "a" || k === "A" || c === "KeyA") return L;
    if (k === "ArrowRight" || k === "d" || k === "D" || c === "KeyD") return R;
    if (k === "ArrowUp" || k === "w" || k === "W" || c === "KeyW") return U;
    if (k === "ArrowDown" || k === "s" || k === "S" || c === "KeyS") return D;
    return null;
  }

  const DIR_BY_ID = { L, R, U, D };

  /** Queue a direction (keyboard, swipe, or on-screen D-pad). */
  function setDir(d) {
    if (!d) return;
    hold = d;
    if (pac && (state === "play" || state === "ready")) {
      pac.next = d;
      if (state === "play" && d.id === OPP[pac.dir.id].id) pac.dir = d;
    }
  }

  /**
   * Arcade sticky buffer: last pressed direction stays until a new one is pressed.
   * Keyup / D-pad pointerup must NOT wipe hold or pac.next.
   */
  function clearDir(_d) {
    // no-op (sticky). Visual D-pad active state is cleared by bindHoldButton.
  }

  function isTouchPrimary() {
    return window.matchMedia("(pointer: coarse)").matches
      || window.matchMedia("(max-width: 820px)").matches
      || ("ontouchstart" in window);
  }

  function resumeHint() {
    return isTouchPrimary() ? "TAP TO RESUME" : "SPACE TO RESUME";
  }

  function togglePauseOrStart() {
    unlockAudio();
    if (state === "title" || state === "over") beginGame();
    else if (state === "intermission") { interT = 0; } // skip act
    else if (state === "play") {
      state = "pause";
      showOV("PAUSED", resumeHint(), "paused");
    } else if (state === "pause") {
      state = "play";
      hideOV();
    }
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 1;
    const btn = document.getElementById("btn-mute");
    if (btn) {
      btn.textContent = muted ? "✕" : "♪";
      btn.classList.toggle("active", muted);
      btn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") { toggleMute(); return; }

    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      togglePauseOrStart();
      return;
    }

    const d = readDir(e);
    if (!d) return;
    e.preventDefault();
    setDir(d);
  }, { passive: false });

  window.addEventListener("keyup", (e) => {
    const d = readDir(e);
    clearDir(d);
  });

  canvas.tabIndex = 0;
  canvas.style.outline = "none";

  // ── Swipe / tap on the maze (touch + mouse) ───────────────────────────────
  const SWIPE_MIN = 12;
  let swipe = null;

  function applySwipe(dx, dy, force) {
    if (!pac || (state !== "play" && state !== "ready")) return false;
    if (Math.hypot(dx, dy) < SWIPE_MIN) return false;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? R : L) : (dy > 0 ? D : U);
    // Always setDir on direction change (and on forced end-swipe)
    if (!force && hold && hold.id === d.id) return true;
    setDir(d);
    return true;
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus();
    canvas.setPointerCapture?.(e.pointerId);
    swipe = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    unlockAudio();
    if (state === "title" || state === "over") beginGame();
    else if (state === "intermission") { interT = 0; }
    else if (state === "pause") { state = "play"; hideOV(); }
  }, { passive: false });

  canvas.addEventListener("pointermove", (e) => {
    if (!swipe || swipe.id !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (applySwipe(dx, dy, false)) {
      swipe.moved = true;
      // Reset origin so successive swipes can chain mid-gesture
      swipe.x = e.clientX;
      swipe.y = e.clientY;
    }
  }, { passive: false });

  function endSwipe(e) {
    if (!swipe || (e && swipe.id !== e.pointerId)) return;
    if (e) e.preventDefault();
    if (!swipe.moved && pac) {
      const dx = (e ? e.clientX : swipe.x) - swipe.x;
      const dy = (e ? e.clientY : swipe.y) - swipe.y;
      applySwipe(dx, dy, true);
    }
    swipe = null;
  }

  canvas.addEventListener("pointerup", endSwipe, { passive: false });
  canvas.addEventListener("pointercancel", endSwipe, { passive: false });

  // Block browser scroll / pinch while touching the game area
  document.getElementById("game-wrapper").addEventListener("touchmove", (e) => {
    e.preventDefault();
  }, { passive: false });

  overlay.style.pointerEvents = "auto";
  overlay.addEventListener("click", () => {
    unlockAudio();
    if (state === "title" || state === "over") beginGame();
    else if (state === "pause") { state = "play"; hideOV(); }
  });

  // ── On-screen D-pad + pause / mute ───────────────────────────────────────
  function bindHoldButton(el, onDown, onUp) {
    if (!el) return;
    const down = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (el.classList.contains("active")) return;
      el.classList.add("active");
      el.setPointerCapture?.(e.pointerId);
      unlockAudio();
      onDown(e);
    };
    const up = (e) => {
      if (!el.classList.contains("active")) return;
      e.preventDefault?.();
      e.stopPropagation?.();
      el.classList.remove("active");
      onUp(e);
    };
    el.addEventListener("pointerdown", down, { passive: false });
    el.addEventListener("pointerup", up, { passive: false });
    el.addEventListener("pointercancel", up, { passive: false });
    el.addEventListener("lostpointercapture", up, { passive: false });
    // Avoid synthetic mouse click after touch
    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });
  }

  document.querySelectorAll(".dpad-btn[data-dir]").forEach((btn) => {
    const d = DIR_BY_ID[btn.getAttribute("data-dir")];
    bindHoldButton(
      btn,
      () => {
        setDir(d);
        if (state === "title" || state === "over") beginGame();
        else if (state === "pause") { state = "play"; hideOV(); }
      },
      () => { /* sticky: keep hold / pac.next after pointerup */ }
    );
  });

  bindHoldButton(
    document.getElementById("btn-pause"),
    () => togglePauseOrStart(),
    () => {}
  );

  bindHoldButton(
    document.getElementById("btn-mute"),
    () => toggleMute(),
    () => {}
  );

  // -- Layout (BUILD V5): one logical stage scaled uniformly & centered ------
  const STAGE_W = 680, STAGE_H = 852;
  const $stage = document.getElementById("stage");
  const $box = document.getElementById("stage-box");
  const $mc = document.getElementById("mobile-controls");
  const $dpad = document.getElementById("dpad");
  const $side = document.querySelector(".mobile-side");
  function touchUI() {
    return window.matchMedia("(pointer: coarse)").matches || ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
  }
  function layout() {
    const vv = window.visualViewport;
    const vw = Math.round(vv ? vv.width : window.innerWidth);
    const vh = Math.round(vv ? vv.height : window.innerHeight);
    if (!vw || !vh) return;
    const touch = touchUI() || vw <= 820;
    let mode = "desktop", ax = 4, ay = 4, aw = vw - 8, ah = vh - 8;
    if (touch && vh >= vw) {
      mode = "portrait";
      const b = Math.max(44, Math.min(64, vh * 0.065, vw * 0.15));
      const ch = b * 3 + b * 0.16 + 16;
      ah = vh - ch - 8;
      $mc.style.cssText = `left:0;right:0;bottom:0;height:${ch}px;--b:${b}px`;
      $dpad.style.cssText = `left:${Math.max(12, vw * 0.05)}px;top:8px`;
      $side.style.cssText = `right:${Math.max(12, vw * 0.05)}px;top:${(ch - b * 2.25) / 2}px`;
    } else if (touch) {
      mode = "landscape";
      const b = Math.max(36, Math.min(60, vh * 0.15));
      const sw = b * 3 + b * 0.16 + 16;
      ax = sw; aw = vw - 2 * sw;
      $mc.style.cssText = `left:0;top:0;width:${vw}px;height:${vh}px;--b:${b}px`;
      $dpad.style.cssText = `left:8px;bottom:${Math.max(8, vh * 0.06)}px`;
      $side.style.cssText = `right:${8 + b}px;bottom:${Math.max(8, vh * 0.06)}px`;
    }
    document.body.setAttribute("data-layout", mode);
    const k = Math.max(0.05, Math.min(aw / STAGE_W, ah / STAGE_H));
    const bw = STAGE_W * k, bh = STAGE_H * k;
    $box.style.width = bw + "px";
    $box.style.height = bh + "px";
    $box.style.left = Math.round(ax + (aw - bw) / 2) + "px";
    $box.style.top = Math.round(ay + (ah - bh) / 2) + "px";
    $stage.style.transform = `scale(${k})`;
  }
  let layoutRaf = 0;
  function scheduleLayout() {
    cancelAnimationFrame(layoutRaf);
    layoutRaf = requestAnimationFrame(layout);
  }
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("orientationchange", () => { scheduleLayout(); setTimeout(layout, 250); setTimeout(layout, 600); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleLayout);
    window.visualViewport.addEventListener("scroll", scheduleLayout);
  }
  layout();
  window.mspacmanLayout = layout;


  // ── Boot + self-test ─────────────────────────────────────────────────────
  function selfTest() {
    const wasMuted = muted;
    muted = true;
    buildMap();
    fullReset(true);
    state = "play";
    modeT = 1e12;
    frightT = 0;
    pac.dir = L; pac.next = L; hold = L;
    const p0x = pac.x, p0y = pac.y;
    for (let i = 0; i < 120; i++) update(16);
    const pacOk = Math.hypot(pac.x - p0x, pac.y - p0y) > TILE * 3;
    const b0x = ghosts[0].x, b0y = ghosts[0].y;
    for (let i = 0; i < 200; i++) update(16);
    const blinkyOk = Math.hypot(ghosts[0].x - b0x, ghosts[0].y - b0y) > TILE * 2;
    const pinkyOk = !ghosts[1].inHouse || ghosts[1].y < midY(13);
    muted = wasMuted;
    if (master) master.gain.value = muted ? 0 : 0.9; // fix: self-test must not leave the game silent
    return { pacOk, blinkyOk, pinkyOk, pacDist: Math.round(Math.hypot(pac.x - p0x, pac.y - p0y)), board: W + "x" + H };
  }

  window.mspacmanTest = () => {
    const r = selfTest();
    console.log("[MS PAC-MAN test]", r);
    buildMap(); fullReset(true);
    state = "title"; score = 0; lives = 3; hold = null;
    showOV("MS. PAC-MAN", "INSERT COIN", null); hud(); $lives.innerHTML = ""; prev = 0;
    return r;
  };

  $high.textContent = pad(high);
  buildMap();
  fullReset(true);
  if (window.WTPHi) WTPHi.init({ key: "mspacman_hiscores_v1", seed: [[30000,"GCC"],[25000,"MSP"],[20000,"SUE"],[18000,"INK"],[16000,"PKY"],[14000,"BLK"],[12000,"JR "],[10000,"ANA"],[8000,"MID"],[5000,"WAY"]] });
  state = "title";
  showOV("MS. PAC-MAN", "INSERT COIN", null);
  hud();
  $lives.innerHTML = "";

  try {
    const r = selfTest();
    console.log("[MS PAC-MAN boot test]", r);
    if (!r.pacOk || !r.blinkyOk) console.warn("Movement issue detected", r);
  } catch (err) {
    console.error("boot test error", err);
  }

  buildMap();
  fullReset(true);
  state = "title";
  score = 0; lives = 3; hold = null;
  showOV("MS. PAC-MAN", "INSERT COIN", null);
  hud();
  $lives.innerHTML = "";
  prev = 0;

  console.log("[MS. PAC-MAN BUILD V5] scaled stage, pixel art, synth audio");
  window.__sfx = sfx;
  // QA hook: jump to a level (maze check) and spawn a fruit
  window.__mspDebug = { inter: (act, ms, freeze) => { if (state !== "intermission") startIntermission(level, act); interAct = act; interDur = act === 2 ? 1800 + chaseTotal() + 300 : INTER_DUR[act]; interT = interDur - (ms || 0); interFreeze = !!freeze; }, level: (n) => { beginLevel(n); }, fruit: () => { spawnMovingFruit(); }, power: () => { frightT = P.frightMs || 3000; for (const g of ghosts) if (!g.inHouse && g.state === "normal") g.state = "fright"; } };
  requestAnimationFrame(tick);
})();
