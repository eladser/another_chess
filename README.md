# Another Chess

A chess game that runs in the browser. Play against an AI opponent with four difficulty levels, or use it to review games via PGN import.

## Features

- AI opponent with four difficulty levels (Easy, Medium, Hard, Expert)
- Opening book with 50+ recognized openings
- Click-to-move and drag-and-drop
- Touch support for mobile
- Move animations
- Real-time position evaluation and best-move hint
- Move accuracy tracking
- PGN export and import
- Auto-save and restore
- Four board themes (Classic, Wooden, Marble, Glass)
- Chess clocks (bullet, blitz, rapid, classical)
- Keyboard shortcuts
- Accessible (ARIA labels, screen reader announcements, reduced motion support)

## Running locally

Open `index.html` in a browser. No build step or server required.

For a local dev server:

```
npx http-server . -p 8080
```

## Tech stack

- Vanilla JavaScript (no frameworks)
- [chess.js](https://github.com/jhlywa/chess.js) v0.10.3 for rules and move validation
- Custom negamax engine with alpha-beta pruning, transposition table, and quiescence search
- [Cburnett](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces) SVG piece set (GPL)
- Web Audio API for sound effects
- CSS Grid layout, CSS custom properties for theming

## File structure

```
index.html        Main page
styles.css        All styles and themes
game.js           Game controller, clock, settings, PGN
chess-engine.js   AI engine (negamax, evaluation, opening book)
piece-svg.js      SVG data for all 12 pieces
ui.js             Board rendering, drag/drop, modals, DOM
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Ctrl+N | New game |
| Ctrl+U | Undo move |
| Ctrl+F | Flip board |
| Ctrl+S | Settings |
| Arrow Left/Right | Navigate move history |
| Home/End | First/last move |
| H or ? | Help |
| Escape | Cancel selection / close modal |

## License

MIT
