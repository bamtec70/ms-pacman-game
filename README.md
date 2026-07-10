# MS. PAC-MAN — 1982 Arcade Classic

A browser recreation of Midway’s **Ms. Pac-Man**, built as a companion to [PAC-MAN](https://bamtec70.github.io/pacman-game/).

## Play

**Live:** after GitHub Pages is enabled — `https://bamtec70.github.io/ms-pacman-game/`

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

## What’s different from Pac-Man

- **Four rotating mazes** (pink → cyan → orange → blue) as levels progress  
- **Ms. Pac-Man** sprite — pink bow, lipstick, beauty mark  
- **Moving bonus fruit** that wanders in from the tunnels  
- **Less predictable ghosts** — random turns at some intersections  
- Ms. Pac-Man-style **fruit set** (cherries through bananas)

## Shared features

- Power pellets, frightened ghosts, chain scoring  
- Scatter / chase waves, side tunnels, lives & high score  
- Retro beeps via Web Audio API  
- Full **touch / mobile** controls (same style as Pac-Man)

## Files

- `index.html` — page shell  
- `style.css` — pink arcade framing + mobile D-pad  
- `game.js` — full game engine  

## Board size

Internal resolution uses `TILE = 24` → **672×744** (same as the Pac-Man build).
