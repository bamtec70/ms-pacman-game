/**
 * MS. PAC-MAN — 1982 Midway Arcade Classic
 * Arcade-faithful: 4 mazes, Sue, semi-random ghosts, path fruit, intermissions, touch.
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
  const SPEED = 200; // px/sec base — step must exceed align epsilon

  const WALL = 0, DOT = 1, EMPTY = 2, POWER = 3, GATE = 4, HOUSE = 5;

  const L = { x: -1, y: 0, id: "L" };
  const R = { x: 1, y: 0, id: "R" };
  const U = { x: 0, y: -1, id: "U" };
  const D = { x: 0, y: 1, id: "D" };
  const ORDER = [U, L, D, R];
  const OPP = { L: R, R: L, U: D, D: U };



  // 0=wall 1=dot 2=empty 3=power 4=gate 5=house
  // Four Midway-style boards. House/gate/nest fixed for engine.
  // Arcade palette: pink → cyan → orange → blue.
  const MAZE_META = [
    { name: "A", wall: "#ff69b4", flash: "#ffffff", tunnels: [14] },
    { name: "B", wall: "#00ffff", flash: "#ffffff", tunnels: [14] },
    { name: "C", wall: "#ffb852", flash: "#ffffff", tunnels: [14] },
    { name: "D", wall: "#2121de", flash: "#ffffff", tunnels: [14] },
  ];

  const MAZES = [
    [
      "0000000000000000000000000000",
      "0111111111111001111111111110",
      "0300001000001001000001000030",
      "0100001000001001000001000010",
      "0111111111111111111111111110",
      "0100001001000000001001000010",
      "0100001001111001111001000010",
      "0111111001001001001001111110",
      "0000001001001001001001000000",
      "0000001001000000001001000000",
      "0000001001111221111001000000",
      "0000001001111221111001000000",
      "0000001001000440001001000000",
      "0000001001055555501001000000",
      "2222221111055555501111222222",
      "0000001001055555501001000000",
      "0000001001000000001001000000",
      "0000001001111111111001000000",
      "0000001001000000001001000000",
      "0111111111001001001111111110",
      "0100000000001001000000000010",
      "0300001111111221111111000030",
      "0111001001000000001001001110",
      "0111001111111221111111001110",
      "0100000001001001001000000010",
      "0100000001001001001000000010",
      "0111111111001001001111111110",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0111111111111111111111111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "0111111111111111111111111110",
      "0100001000001001000001000010",
      "0300001000001001000001000030",
      "0111111001111001111001111110",
      "0001001001000000001001001000",
      "0001001001000000001001001000",
      "0111111111111001111111111110",
      "0100000000001001000000000010",
      "0100001111111221111111000010",
      "0111001001111221111001001110",
      "0000001001111221111001000000",
      "0000001001000440001001000000",
      "0000001001055555501001000000",
      "2222221111055555501111222222",
      "0000001001055555501001000000",
      "0000001001000000001001000000",
      "0111111001111111111001111110",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0311111111111001111111111130",
      "0001001001000000001001001000",
      "0001001001000000001001001000",
      "0111111001111221111001111110",
      "0100000000001001000000000010",
      "0100000000001001000000000010",
      "0111111111111221111111111110",
      "0100001000001001000001000010",
      "0100001000001001000001000010",
      "0111111111111001111111111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "0111111001111111111001111110",
      "0100001001000000001001000010",
      "0300001001000000001001000030",
      "0111111111111001111111111110",
      "0100000001001001001000000010",
      "0100000001001001001000000010",
      "0111111111001001001111111110",
      "0000001000001001000001000000",
      "0000001001111221111001000000",
      "0111111001001221001001111110",
      "0000001001111221111001000000",
      "0000001001000440001001000000",
      "0000001001055555501001000000",
      "2222221111055555501111222222",
      "0000001001055555501001000000",
      "0000001001000000001001000000",
      "0111111001111111111001111110",
      "0001001000001001000001001000",
      "0001001000001001000001001000",
      "0111111111111001111111111110",
      "0100001000000000000001000010",
      "0300001000000000000001000030",
      "0111001111111221111111001110",
      "0001001001000000001001001000",
      "0001001001000000001001001000",
      "0111111001111001111001111110",
      "0100000000001001000000000010",
      "0100000000001001000000000010",
      "0111111111111111111111111110",
      "0000000000000000000000000000",
    ],
    [
      "0000000000000000000000000000",
      "0111111111111001111111111110",
      "0100000000001001000000000010",
      "0301111111111111111111111030",
      "0101001000001001000001001010",
      "0111001000001001000001001110",
      "0001001111111001111111001000",
      "0001001000000000000001001000",
      "0111111000001001000001111110",
      "0100001000001001000001000010",
      "0100001001111221111001000010",
      "0000001001111221111001000000",
      "0000001001000440001001000000",
      "0000001001055555501001000000",
      "2222221111055555501111222222",
      "0000001001055555501001000000",
      "0000001001000000001001000000",
      "0100001001111111111001000010",
      "0100001001000000001001000010",
      "0111111111001001001111111110",
      "0100000000001001000000000010",
      "0100000000001001000000000010",
      "0311111111111221111111111130",
      "0101001111111221111111001010",
      "0101001001000000001001001010",
      "0101001001000000001001001010",
      "0111001111111001111111001110",
      "0001001000001001000001001000",
      "0001001000001001000001001000",
      "0111111111111111111111111110",
      "0000000000000000000000000000",
    ],
  ];

  function mazeIndexForLevel(lv) {
    // Arcade: maze 1 (lv 1–2), maze 2 (3–5), maze 3 (6–9), maze 4 (10+)
    if (lv <= 2) return 0;
    if (lv <= 5) return 1;
    if (lv <= 9) return 2;
    return 3;
  }

  let mazeIndex = 0;

  function tunnelRows() {
    const m = MAZE_META[mazeIndex] || MAZE_META[0];
    return m.tunnels || [14];
  }
  function isTunnelRow(r) { return tunnelRows().indexOf(r) >= 0; }



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
    // Pac-Man
    let pac = 0.80;
    if (n >= 2 && n <= 4) pac = 0.90;
    else if (n >= 5 && n <= 20) pac = 1.00;
    else if (n >= 21) pac = 0.90;

    // Ghosts — normal maze
    let ghost = 0.75;
    if (n >= 2 && n <= 4) ghost = 0.85;
    else if (n >= 5) ghost = 0.95;

    // Frightened
    let fright = 0.50;
    if (n >= 2 && n <= 4) fright = 0.55;
    else if (n >= 5) fright = 0.60;

    // Tunnel (ghosts only — Pac keeps full speed)
    let tunnel = 0.40;
    if (n >= 2 && n <= 4) tunnel = 0.45;
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

    return {
      pac, ghost, fright, tunnel,
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

  // ── Audio ────────────────────────────────────────────────────────────────
  let audio = null, muted = false, chompN = 0;
  function unlockAudio() {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
  }
  function tone(freq, dur, type = "square", vol = 0.04, when = 0) {
    if (muted || !audio) return;
    const t = audio.currentTime + when;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audio.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function sfx(name) {
    unlockAudio();
    if (name === "chomp") { tone(140 + (chompN++ % 2) * 50, 0.03, "square", 0.025); }
    else if (name === "power") { tone(220, 0.06); tone(340, 0.06, "square", 0.04, 0.06); tone(460, 0.1, "square", 0.04, 0.12); }
    else if (name === "eat") { tone(500, 0.05); tone(750, 0.1, "square", 0.04, 0.05); }
    else if (name === "die") { for (let i = 0; i < 9; i++) tone(440 - i * 40, 0.07, "sawtooth", 0.035, i * 0.06); }
    else if (name === "fruit") { tone(800, 0.05); tone(1100, 0.08, "square", 0.04, 0.05); }
    else if (name === "start") {
      // Short Ms. Pac-Man-ish fanfare
      [392, 494, 523, 659, 784].forEach((f, i) => tone(f, 0.09, "square", 0.035, i * 0.09));
    }
    else if (name === "inter") {
      [523, 587, 659, 784, 880, 784].forEach((f, i) => tone(f, 0.1, "square", 0.03, i * 0.12));
    }
    else if (name === "1up") { [523, 659, 784].forEach((f, i) => tone(f, 0.08, "square", 0.04, i * 0.08)); }
    else if (name === "siren") { tone(frightT > 0 ? 240 : 160, 0.035, "triangle", 0.012); }
  }

  // ── State ────────────────────────────────────────────────────────────────
  let map = [];
  let dots = 0;
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
      const d = document.createElement("div");
      d.className = "life-icon";
      $lives.appendChild(d);
    }
    $fruit.textContent = fGot.map((i) => FRUIT[i].e).join("");
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
      gh("sue",    "#ffb852", 16, 14, true, P.sueDots),
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
    level = n;
    P = params(level);
    WAVES = modeSchedule(level);
    srand((level * 0x9E37 + (score & 0xFFFF)) & 0xFFFF);
    buildMap();
    fullReset(true);
    state = "ready";
    readyT = 2000;
    hud();
    showOV("READY!", "", "ready");
    sfx("start");
  }

  function startIntermission(clearedLevel) {
    // Acts cycle: 1 They Meet, 2 The Chase, 3 Junior
    if (clearedLevel === 2 || clearedLevel === 13) interAct = 1;
    else if (clearedLevel === 5 || clearedLevel === 17) interAct = 2;
    else interAct = 3;
    state = "intermission";
    interT = 4200;
    fruit = null;
    hideOV(); // canvas plays the act (overlay would cover it)
    sfx("inter");
  }

  function beginGame() {
    unlockAudio();
    srand((Date.now() & 0xFFFF) ^ 0xA5A5);
    score = 0; lives = 3; level = 1; extra = false; fGot = [];
    hold = null;
    beginLevel(1);
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
  function moveSlice(entity, step) {
    if (step <= 0) return;

    // --- Pac turns ---
    if (entity.kind === "pac") {
      if (hold) entity.next = hold;
      if (entity.next) {
        if (entity.next.id === OPP[entity.dir.id].id) {
          entity.dir = entity.next;
        } else if (entity.next.id !== entity.dir.id && aligned(entity) && canGo(entity, entity.next)) {
          centerOnTile(entity);
          entity.dir = entity.next;
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
    } else if (opts.length > 1) {
      // Ms. Pac-Man hallmark: semi-random pathing (patterns fail)
      // ~45% full random among legal turns; else prefer target but
      // randomize among the two closest options when close.
      if (rand01() < 0.45) {
        best = opts[randInt(opts.length)];
      } else {
        // rank by distance to target
        const ranked = opts.slice().sort((a, b) => {
          const da = (c + a.x - tgt.x) ** 2 + (r + a.y - tgt.y) ** 2;
          const db = (c + b.x - tgt.x) ** 2 + (r + b.y - tgt.y) ** 2;
          return da - db;
        });
        if (ranked.length >= 2 && rand01() < 0.35) best = ranked[1];
        else best = ranked[0];
      }
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
  function buildFruitPath(fromLeft) {
    const tr = 14;
    // Innermost walkable tiles at the tunnel mouths
    let startC = fromLeft ? 0 : COLS - 1;
    let endC = fromLeft ? COLS - 1 : 0;
    while (startC >= 0 && startC < COLS && !fruitWalkable(startC, tr)) {
      startC += fromLeft ? 1 : -1;
    }
    while (endC >= 0 && endC < COLS && !fruitWalkable(endC, tr)) {
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
    stops.push({ c: endC, r: tr });

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
      const direct = fruitBfs(startC, tr, endC, tr);
      if (direct && direct.length) {
        path.length = 0;
        for (const p of direct) path.push(p);
      }
    }

    // Exit off the far tunnel mouth (drawn path continues out of bounds)
    path.push({ c: fromLeft ? COLS : -1, r: tr, exit: true });
    return path;
  }

  function spawnMovingFruit() {
    const f = FRUIT[P.fruit];
    const fromLeft = rand01() < 0.5;
    const path = buildFruitPath(fromLeft);
    if (!path.length) return; // safety

    // Start just inside the tunnel mouth
    const tr = 14;
    const sc = fromLeft ? 0 : COLS - 1;
    let startC = sc;
    while (startC >= 0 && startC < COLS && !fruitWalkable(startC, tr)) {
      startC += fromLeft ? 1 : -1;
    }

    fruit = {
      i: P.fruit,
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
        goalY = midY(14);
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
          g.pop = { p: pts, t: 700 };
          // Snap to tile and build a fixed path home (no bouncing)
          centerOnTile(g);
          g.homePath = null;
          g.pathI = 0;
          pickEyesDir(g);
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
        if (level === 2 || level === 5 || level === 9 || level === 13 || level === 17) {
          startIntermission(level);
        } else {
          beginLevel(next);
        }
      }
      return;
    }

    if (state === "intermission") {
      interT -= dt;
      if (interT <= 0) {
        beginLevel(level + 1);
      }
      return;
    }

    // —— playing ——
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
    pac.mouth += dt * 0.02;
    if (pac.mouth >= 1) { pac.mouth = 0; pac.open = !pac.open; }

    // PAC-MAN — full speed even in tunnels (arcade); only ghosts slow there
    if (hold) pac.next = hold;
    move(pac, P.pac, dt);
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
      const flashWindow = Math.min(P.flashMs, P.frightMs * 0.4);
      g.flash =
        g.state === "fright" &&
        frightT > 0 &&
        frightT < flashWindow &&
        ((frightT / 160) | 0) % 2 === 0;
      if (g.pop) { g.pop.t -= dt; if (g.pop.t <= 0) g.pop = null; }
    }

    if (fruit) {
      fruit.t -= dt;
      if (!fruit.gone) moveFruit(dt);
      if (fruit.t <= 0) fruit = null;
    }
    hits();

    sirenT += dt;
    if (sirenT > (frightT > 0 ? 140 : 260)) { sirenT = 0; sfx("siren"); }
  }

  // ── Draw ─────────────────────────────────────────────────────────────────
  function drawMaze() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    const flash = state === "clear" && ((time / 200) | 0) % 2 === 0;
    const meta = MAZE_META[mazeIndex] || MAZE_META[0];
    ctx.strokeStyle = flash ? meta.flash : meta.wall;
    ctx.lineWidth = 2 * S;
    ctx.lineCap = "square";

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] !== WALL) continue;
        const x = c * TILE, y = r * TILE, i = 3.2 * S;
        const up = r > 0 && map[r - 1][c] === WALL;
        const dn = r < ROWS - 1 && map[r + 1][c] === WALL;
        const lf = c > 0 && map[r][c - 1] === WALL;
        const rt = c < COLS - 1 && map[r][c + 1] === WALL;
        if (!up) { ctx.beginPath(); ctx.moveTo(x + i, y + i); ctx.lineTo(x + TILE - i, y + i); ctx.stroke(); }
        if (!dn) { ctx.beginPath(); ctx.moveTo(x + i, y + TILE - i); ctx.lineTo(x + TILE - i, y + TILE - i); ctx.stroke(); }
        if (!lf) { ctx.beginPath(); ctx.moveTo(x + i, y + i); ctx.lineTo(x + i, y + TILE - i); ctx.stroke(); }
        if (!rt) { ctx.beginPath(); ctx.moveTo(x + TILE - i, y + i); ctx.lineTo(x + TILE - i, y + TILE - i); ctx.stroke(); }
      }
    }

    // pink gate
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (map[r][c] === GATE) {
          ctx.fillStyle = "#ffb8ff";
          ctx.fillRect(c * TILE + 3 * S, r * TILE + TILE / 2 - S, TILE - 6 * S, 2 * S);
        }
  }

  function drawDots() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = map[r][c];
        const x = midX(c), y = midY(r);
        if (v === DOT) {
          ctx.fillStyle = "#ffb897";
          ctx.fillRect(x - 1.6 * S, y - 1.6 * S, 3.2 * S, 3.2 * S);
        } else if (v === POWER && ((time / 180) | 0) % 2 === 0) {
          ctx.fillStyle = "#ffb897";
          ctx.beginPath();
          ctx.arc(x, y, 6 * S, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawPac() {
    const rad = TILE * 0.42;
    if (pac.dead) {
      const p = Math.min(1, pac.dieT / 1500);
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.moveTo(pac.x, pac.y);
      ctx.arc(pac.x, pac.y, rad, -Math.PI / 2 + p * Math.PI, -Math.PI / 2 + Math.PI * 2 - p * Math.PI);
      ctx.closePath();
      ctx.fill();
      return;
    }
    const gap = 0.22 + (pac.open ? pac.mouth : 1 - pac.mouth) * 0.6;
    const rot = { R: 0, D: Math.PI / 2, L: Math.PI, U: -Math.PI / 2 }[pac.dir.id];
    ctx.save();
    ctx.translate(pac.x, pac.y);
    ctx.rotate(rot);

    // Body
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, rad, gap, Math.PI * 2 - gap);
    ctx.closePath();
    ctx.fill();

    // Pink bow
    ctx.fillStyle = "#ff69b4";
    ctx.beginPath();
    ctx.ellipse(-rad * 0.15, -rad * 0.78, rad * 0.28, rad * 0.18, -0.4, 0, Math.PI * 2);
    ctx.ellipse(rad * 0.22, -rad * 0.72, rad * 0.28, rad * 0.18, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rad * 0.02, -rad * 0.7, rad * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Beauty mark
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(rad * 0.38, rad * 0.12, rad * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Lipstick along mouth edge
    ctx.strokeStyle = "#ff0044";
    ctx.lineWidth = 1.6 * S;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.92, gap + 0.05, Math.PI * 2 - gap - 0.05);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Namco-style eyes: large white ovals + dark blue pupils that shift
   * toward the direction of travel (arcade ghost / floating eyes).
   */
  function ghostEyes(g, x, y, R, eyesOnly) {
    // Scale: floating eyes are a bit larger/clearer when body is gone
    const scale = eyesOnly ? 1.15 : 1;
    const whiteRX = R * 0.30 * scale;
    const whiteRY = R * 0.36 * scale;
    const gap = R * 0.36 * scale;
    const baseY = eyesOnly ? y : y - R * 0.16;
    // Pupil offset hard toward facing direction (classic look)
    const look = eyesOnly ? 0.55 : 0.42;
    const ox = g.dir.x * whiteRX * look;
    const oy = g.dir.y * whiteRY * look;
    const pupilR = R * (eyesOnly ? 0.16 : 0.14) * scale;

    // Whites
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x - gap, baseY, whiteRX, whiteRY, 0, 0, Math.PI * 2);
    ctx.ellipse(x + gap, baseY, whiteRX, whiteRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark pupils (arcade blue-black), looking in movement direction
    ctx.fillStyle = "#2121de";
    ctx.beginPath();
    ctx.arc(x - gap + ox, baseY + oy, pupilR, 0, Math.PI * 2);
    ctx.arc(x + gap + ox, baseY + oy, pupilR, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Classic Namco-style ghost body + eyes */
  function drawGhost(g) {
    const x = g.x, y = g.y;
    const R = TILE * 0.44;

    // Score popup when just eaten — still draw floating eyes underneath
    if (g.pop) {
      if (g.state === "eyes") ghostEyes(g, x, y, R, true);
      ctx.fillStyle = "#00ffff";
      ctx.font = `bold ${Math.round(10 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(g.pop.p), x, y - R * 0.9);
      return;
    }

    // Eaten: only the eyes travel home
    if (g.state === "eyes") {
      ghostEyes(g, x, y, R, true);
      return;
    }

    const body = g.state === "fright"
      ? (g.flash ? "#ffffff" : "#2121de")
      : g.color;

    const phase = ((g.bob / 100) | 0) % 2;

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y - R * 0.05, R, Math.PI, 0, false);
    ctx.lineTo(x + R, y + R * 0.9);
    const n = 4;
    for (let i = n; i >= 0; i--) {
      const sx = x + R - (i / n) * (R * 2);
      const dip = ((i + phase) & 1) ? R * 0.38 : 0;
      ctx.lineTo(sx, y + R * 0.9 - dip);
    }
    ctx.closePath();
    ctx.fill();

    if (g.state === "fright") {
      const fc = g.flash ? "#ff0000" : "#ffb8ff";
      ctx.fillStyle = fc;
      ctx.beginPath();
      ctx.arc(x - R * 0.3, y - R * 0.15, R * 0.12, 0, Math.PI * 2);
      ctx.arc(x + R * 0.3, y - R * 0.15, R * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = fc;
      ctx.lineWidth = 1.8 * S;
      ctx.beginPath();
      const my = y + R * 0.3;
      ctx.moveTo(x - R * 0.5, my);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(x - R * 0.5 + (i + 0.5) * R * 0.25, my + R * 0.15);
        ctx.lineTo(x - R * 0.5 + (i + 1) * R * 0.25, my);
      }
      ctx.stroke();
    } else {
      ghostEyes(g, x, y, R, false);
    }
  }

  /** Draw arcade-style fruit sprites (not emoji) for authentic look */
  function drawFruitSprite(id, x, y) {
    const s = TILE * 0.42;
    ctx.save();
    ctx.translate(x, y);
    if (id === "cherry") {
      // Twin cherries + stems
      ctx.strokeStyle = "#00aa00";
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.2, -s * 0.35, s * 0.05);
      ctx.moveTo(0, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.2, -s * 0.2, s * 0.35, s * 0.05);
      ctx.stroke();
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(-s * 0.35, s * 0.15, s * 0.32, 0, Math.PI * 2);
      ctx.arc(s * 0.35, s * 0.15, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6666";
      ctx.beginPath();
      ctx.arc(-s * 0.45, s * 0.05, s * 0.1, 0, Math.PI * 2);
      ctx.arc(s * 0.25, s * 0.05, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "strawberry") {
      ctx.fillStyle = "#ff2040";
      ctx.beginPath();
      ctx.moveTo(0, s * 0.55);
      ctx.quadraticCurveTo(s * 0.55, s * 0.1, s * 0.4, -s * 0.25);
      ctx.quadraticCurveTo(0, -s * 0.45, -s * 0.4, -s * 0.25);
      ctx.quadraticCurveTo(-s * 0.55, s * 0.1, 0, s * 0.55);
      ctx.fill();
      ctx.fillStyle = "#00cc44";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.35);
      ctx.lineTo(-s * 0.28, -s * 0.55);
      ctx.lineTo(s * 0.28, -s * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffff88";
      for (let i = 0; i < 5; i++) {
        const a = -0.6 + i * 0.3;
        ctx.fillRect(Math.sin(a) * s * 0.22 - S, Math.cos(a) * s * 0.15 - S, 2 * S, 2 * S);
      }
    } else if (id === "orange") {
      ctx.fillStyle = "#ff8c00";
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#00aa00";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.4, s * 0.18, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffaa44";
      ctx.lineWidth = 1 * S;
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.3, 0.2, 1.2);
      ctx.stroke();
    } else if (id === "pretzel") {
      // Brown twisted pretzel
      ctx.strokeStyle = "#c47a2c";
      ctx.lineWidth = 4.2 * S;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, s * 0.35);
      ctx.bezierCurveTo(-s * 0.7, -s * 0.4, s * 0.1, -s * 0.7, s * 0.05, 0);
      ctx.bezierCurveTo(0, s * 0.5, -s * 0.5, s * 0.2, -s * 0.15, -s * 0.1);
      ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.7, s * 0.1, s * 0.4, s * 0.4);
      ctx.stroke();
      ctx.fillStyle = "#fff8dc";
      for (const [px, py] of [[-0.2, -0.15], [0.15, -0.05], [0.0, 0.2]]) {
        ctx.beginPath();
        ctx.arc(px * s, py * s, 1.4 * S, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === "apple") {
      ctx.fillStyle = "#e02020";
      ctx.beginPath();
      ctx.arc(-s * 0.12, s * 0.05, s * 0.4, 0, Math.PI * 2);
      ctx.arc(s * 0.12, s * 0.05, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6b3a1f";
      ctx.lineWidth = 1.8 * S;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.25);
      ctx.lineTo(0, -s * 0.55);
      ctx.stroke();
      ctx.fillStyle = "#22cc44";
      ctx.beginPath();
      ctx.ellipse(s * 0.22, -s * 0.4, s * 0.18, s * 0.1, 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "pear") {
      ctx.fillStyle = "#c8e020";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.2, s * 0.38, s * 0.42, 0, 0, Math.PI * 2);
      ctx.ellipse(0, -s * 0.15, s * 0.26, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6b3a1f";
      ctx.lineWidth = 1.6 * S;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(0, -s * 0.6);
      ctx.stroke();
      ctx.fillStyle = "#22aa33";
      ctx.beginPath();
      ctx.ellipse(s * 0.18, -s * 0.48, s * 0.14, s * 0.08, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "banana") {
      ctx.strokeStyle = "#ffd000";
      ctx.lineWidth = 5.5 * S;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, s * 0.25);
      ctx.quadraticCurveTo(0, -s * 0.55, s * 0.5, s * 0.15);
      ctx.stroke();
      ctx.strokeStyle = "#c9a000";
      ctx.lineWidth = 1.2 * S;
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, s * 0.15);
      ctx.quadraticCurveTo(0, -s * 0.35, s * 0.4, s * 0.05);
      ctx.stroke();
    } else {
      // Fallback emoji
      ctx.font = `${Math.round(16 * S)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fruit.e || "?", 0, 0);
    }
    ctx.restore();
  }

  function drawFruit() {
    if (!fruit) return;
    const fx = fruit.x != null ? fruit.x : W / 2;
    const fy = fruit.y != null ? fruit.y : midY(17);
    if (fruit.gone) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.round(8 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(fruit.p), fx, fy);
      return;
    }
    drawFruitSprite(fruit.id || FRUIT[fruit.i]?.id, fx, fy);
  }

  function render() {
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
      ctx.fillStyle = "#ffff00";
      ctx.font = `${Math.round(14 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("READY!", W / 2, midY(17));
    }
  }

  /** Simple Midway-style intermission acts */
  function drawIntermission() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const t = 1 - Math.max(0, interT) / 4200;
    const y = H * 0.48;
    // Stage floor
    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, y + 40);
    ctx.lineTo(W - 40, y + 40);
    ctx.stroke();

    // Ms. Pac runs across; ghost chases on act 2; baby on act 3
    const msX = 60 + t * (W - 120);
    const ghostX = msX - 70;
    // Ms Pac
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(msX, y, 16, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(msX, y);
    ctx.fill();
    ctx.fillStyle = "#ff69b4";
    ctx.beginPath();
    ctx.arc(msX + 4, y - 14, 5, 0, Math.PI * 2);
    ctx.arc(msX - 6, y - 12, 5, 0, Math.PI * 2);
    ctx.fill();

    if (interAct === 1) {
      // Pac-Man approaches from left, they meet center
      const px = 40 + t * (W * 0.42);
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(px, y, 16, 0.3, Math.PI * 2 - 0.3);
      ctx.lineTo(px, y);
      ctx.fill();
      ctx.fillStyle = "#ffb8ff";
      ctx.font = `${Math.round(10 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.fillText("THEY MEET", W / 2, y - 60);
    } else if (interAct === 2) {
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(ghostX, y, 15, Math.PI, 0);
      ctx.lineTo(ghostX + 15, y + 14);
      ctx.lineTo(ghostX - 15, y + 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#00ffff";
      ctx.font = `${Math.round(10 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.fillText("THE CHASE", W / 2, y - 60);
    } else {
      // Junior
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(msX - 28, y + 6, 9, 0.3, Math.PI * 2 - 0.3);
      ctx.lineTo(msX - 28, y + 6);
      ctx.fill();
      ctx.fillStyle = "#ffb852";
      ctx.font = `${Math.round(10 * S)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.fillText("JUNIOR", W / 2, y - 60);
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

  function clearDir(d) {
    if (d && hold && d.id === hold.id) hold = null;
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
  const SWIPE_MIN = 18;
  let swipe = null;

  function applySwipe(dx, dy, force) {
    if (!pac || (state !== "play" && state !== "ready")) return false;
    if (Math.hypot(dx, dy) < SWIPE_MIN) return false;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? R : L) : (dy > 0 ? D : U);
    // Only re-queue when direction changes (avoids spam during long swipe)
    if (!force && hold && hold.id === d.id && pac.next && pac.next.id === d.id) return true;
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
      () => clearDir(d)
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

  requestAnimationFrame(tick);
})();
