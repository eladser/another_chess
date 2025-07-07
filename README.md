# ♔ Another Chess

A modern, sleek chess game website with AI opponent and multiplayer support. Built with vanilla JavaScript, HTML, and CSS.

## 🎮 Features

### Core Gameplay
- **Full Chess Implementation**: Complete chess rules with proper piece movement
- **AI Opponent**: Play against a smart chess engine with 3 difficulty levels
- **Multiplayer Support**: Play against another human player locally
- **Move Validation**: Only legal moves are allowed
- **Game State Detection**: Automatic detection of checkmate and stalemate

### Visual & UX
- **Modern Design**: Beautiful, responsive interface with smooth animations
- **Multiple Themes**: Choose from Classic, Modern, Dark, or Neon board themes
- **Piece Styles**: Different piece design options
- **Smooth Animations**: Piece movements with elegant transitions
- **Board Flipping**: Rotate the board to play from either perspective
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Advanced Features
- **Move History**: Complete game notation with move-by-move history
- **Captured Pieces**: Visual display of captured pieces for both players
- **Last Move Highlighting**: Visual indication of the most recent move
- **Player Color Choice**: Choose to play as white or black
- **Settings Panel**: Comprehensive game configuration options
- **Thinking Animation**: Visual feedback when AI is calculating moves

## 🚀 Live Demo

Play the game live at: [https://eladser.github.io/another_chess/](https://eladser.github.io/another_chess/)

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox/Grid, animations, and glassmorphism effects
- **JavaScript (ES6+)**: Game logic, AI engine, and interactive features
- **GitHub Pages**: Hosting and deployment

## 🎯 AI Engine

The chess engine features:
- **Minimax Algorithm**: With alpha-beta pruning for optimal performance
- **Position Evaluation**: Considers piece values and positioning
- **Multiple Difficulty Levels**:
  - Easy: 2-depth search with some randomness
  - Medium: 3-depth search with balanced play
  - Hard: 4-depth search with strong tactical awareness

## 🎨 Customization Options

### Board Themes
- **Classic**: Traditional brown and cream colors
- **Modern**: Clean purple and white design
- **Dark**: Sleek dark theme for night play
- **Neon**: Futuristic cyberpunk-inspired design

### Game Modes
- **vs AI**: Play against the computer with adjustable difficulty
- **vs Human**: Local multiplayer for two players

### Player Options
- Choose your color (White or Black)
- Flip board orientation
- Multiple piece style options

## 🚀 Getting Started

### Online Play
Just visit the [live demo](https://eladser.github.io/another_chess/) and start playing!

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/eladser/another_chess.git
```

2. Open `index.html` in your browser:
```bash
cd another_chess
open index.html
```

That's it! No build process or dependencies required.

## 🎮 How to Play

1. **Start a Game**: Click "New Game" to begin
2. **Make Moves**: Click on a piece to select it, then click on a valid square to move
3. **Valid Moves**: Green dots show possible moves, red circles show captures
4. **Settings**: Click the settings button to customize your experience
5. **Flip Board**: Use the "Flip Board" button to rotate the perspective

## 📱 Mobile Support

The game is fully responsive and works great on:
- 📱 Mobile phones (iOS & Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔧 Technical Details

### File Structure
```
another_chess/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling and animations
├── game.js            # Main game logic and UI
├── chess-engine.js    # AI chess engine implementation
└── README.md          # This file
```

### Key Classes
- `ChessGame`: Main game controller
- `ChessEngine`: AI opponent with minimax algorithm
- Modular design for easy extension and maintenance

## 🎯 Future Enhancements

- [ ] Online multiplayer support
- [ ] Game analysis and hints
- [ ] Opening book for stronger AI
- [ ] Puzzle mode with chess problems
- [ ] Game saving and loading
- [ ] Enhanced piece animation effects
- [ ] Sound effects and music
- [ ] Tournament mode

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chess piece Unicode symbols for clean, accessible design
- Modern web technologies for smooth performance
- The chess community for game rule references

---

**Enjoy playing chess! ♔♕♖♗♘♙**