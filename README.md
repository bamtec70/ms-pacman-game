# MS. PAC-MAN — 1982 Arcade Classic

A browser recreation of Midway’s **Ms. Pac-Man**, companion to [PAC-MAN](https://bamtec70.github.io/pacman-game/).

## Play

**Live:** https://bamtec70.github.io/ms-pacman-game/

Or open `index.html` locally:

```powershell
start index.html
```

## Controls

### Desktop

| Key | Action |
|-----|--------|
| **Arrow keys** or **WASD** | Move |
| **Space** | Start / Pause / Resume |
| **M** | Mute sound |
| **Click** | Start game |

### Phone / touch screen

| Input | Action |
|-------|--------|
| **On-screen D-pad** | Move |
| **Swipe** on the maze | Move |
| **Tap** maze / overlay | Start or resume |
| **❚❚ button** | Pause / resume / start |
| **♪ button** | Mute / unmute |

## Arcade-faithful features

| Feature | Behavior |
|---------|----------|
| **Four mazes** | **Pink** (lv 1–2) → **Cyan dual-tunnel** (3–5) → **Orange** (6–9) → **Dark blue** (10+); wall color + layout change each board |
| **Ms. Pac-Man** | Pink bow, lipstick, beauty mark |
| **Ghosts** | Blinky, Pinky, Inky, **Sue** (not Clyde) |
| **Ghost AI** | Semi-random PRNG turns — patterns from Pac-Man fail |
| **Bonus fruit** | Enters a tunnel mouth, tours corridors (not a straight side-to-side), exits the opposite tunnel |
| **Fruit types** | Cherry 100 · Strawberry 200 · Orange 500 · Pretzel 700 · Apple 1000 · Pear 2000 · Banana 5000 (level 1→7+) |
| **Intermissions** | After boards 2, 5, 9, 13, 17 — *They Meet*, *The Chase*, *Junior* |
| **Touch** | Full D-pad / swipe / pause / mute |

Also: power pellets, frightened chain scores, scatter/chase waves, side tunnels, lives, saved high score, retro sound.

## Files

- `index.html` — page shell  
- `style.css` — pink arcade framing + mobile D-pad  
- `game.js` — full game engine  

## Board size

`TILE = 24` → **672×744** internal resolution.
