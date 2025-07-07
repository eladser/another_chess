# 🎮 Another Chess - Enhanced Chess Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chess.js](https://img.shields.io/badge/Chess.js-0.10.3-blue.svg)](https://github.com/jhlywa/chess.js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-green.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-brightgreen.svg)](https://github.com/eladser/another_chess)

A modern, feature-rich chess game built with vanilla JavaScript featuring an advanced AI engine, beautiful themes, and comprehensive gameplay features.

## 🚀 **Major Version 2.0 Updates**

### ✅ **Fixed Major Issues**
- **🔧 Movement Bug Fixed**: Pieces now move properly from game start
- **🎯 Enhanced AI**: Smarter opponent with 4 difficulty levels
- **🔍 Better Engine**: Improved check detection, game win conditions, and move validation
- **🎨 Beautiful Pieces**: Enhanced piece designs with better visual effects
- **🖱️ Full Drag & Drop**: Complete drag and drop support with visual feedback
- **💎 Better Design**: Modern UI with improved animations and responsiveness
- **🗂️ Fixed Coordinates**: Proper a-h and 1-8 coordinate display

## ✨ Features

### 🤖 **Advanced AI System**
- **4 Difficulty Levels**: Easy (900), Medium (1400), Hard (1800), Expert (2200)
- **Realistic Play**: AI makes human-like decisions with occasional blunders on easier levels
- **Smart Evaluation**: Advanced position evaluation with piece-square tables
- **Tactical Awareness**: Recognizes threats, captures, and tactical patterns
- **Opening Book**: Varied opening play for interesting games

### 🎨 **Beautiful Interface**
- **4 Board Themes**: Classic, Wooden, Marble, Glass
- **Smooth Animations**: Piece movements, highlights, and transitions
- **Visual Feedback**: Move highlights, possible moves, check indicators
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Modern dark interface with gradient backgrounds

### 🎮 **Enhanced Gameplay**
- **Click or Drag**: Choose your preferred way to move pieces
- **Move Validation**: Proper chess rules enforcement
- **Special Moves**: Castling, en passant, pawn promotion
- **Game States**: Check, checkmate, stalemate detection
- **Undo Function**: Take back moves when needed
- **Board Flipping**: View from either perspective

### 📊 **Game Analysis**
- **Real-time Evaluation**: Position analysis with visual bar
- **Move History**: Complete game record with algebraic notation
- **Statistics Tracking**: Moves, captures, checks, accuracy
- **Captured Pieces**: Visual display of taken pieces
- **Game Timer**: Track your game duration

### 🔊 **Audio & Settings**
- **Sound Effects**: Move, capture, check, checkmate sounds
- **Customizable Settings**: Adjust all preferences
- **Coordinate Display**: Toggle a-h and 1-8 labels
- **Move Indicators**: Show/hide possible moves
- **Animation Control**: Enable/disable animations

### 📱 **Mobile Optimized**
- **Touch Controls**: Tap and drag on mobile devices
- **Responsive Layout**: Adapts to any screen size
- **Optimized Performance**: Smooth gameplay on all devices
- **Accessible Design**: Screen reader friendly

## 🎯 How to Play

### **Basic Controls**
1. **🖱️ Click to Move**: Click a piece, then click destination
2. **🖱️ Drag & Drop**: Drag pieces to their destination
3. **⌨️ Escape**: Cancel current selection
4. **🖱️ Right-click**: Also cancels selection

### **Special Moves**
- **🏰 Castling**: Click king, then click 2 squares toward rook
- **👻 En Passant**: Automatically available when legal
- **👑 Promotion**: Choose piece when pawn reaches end

### **Game Modes**
- **🤖 vs AI**: Play against computer (4 difficulty levels)
- **👥 Two Players**: Play with a friend (coming soon)
- **🔍 Analysis**: Analyze positions (coming soon)

## 🛠️ Technical Features

### **Built With**
- **Vanilla JavaScript**: No frameworks, pure performance
- **Chess.js**: Robust chess logic and validation
- **CSS Grid**: Modern responsive layout
- **Web Audio API**: Generated sound effects
- **LocalStorage**: Settings persistence

### **AI Engine**
- **Minimax Algorithm**: With alpha-beta pruning
- **Iterative Deepening**: Progressively deeper search
- **Transposition Table**: Avoid recalculating positions
- **Move Ordering**: Optimize search efficiency
- **Quiescence Search**: Tactical stability

### **Performance**
- **Optimized Rendering**: Efficient DOM updates
- **Lazy Loading**: Features loaded as needed
- **Memory Management**: Proper cleanup and garbage collection
- **Mobile Optimized**: Touch-friendly interface

## 🎪 Game Features

### **Statistics**
- Total moves played
- Pieces captured
- Checks given
- Game duration
- Move accuracy (coming soon)

### **Export Options**
- **PGN Export**: Save games in standard format
- **Game Analysis**: Review your games
- **Statistics Export**: Track your progress

### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects motion preferences

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/eladser/another_chess.git
```

2. **Open in browser**
```bash
cd another_chess
open index.html
```

3. **Or visit the live demo**
[Play Another Chess](https://eladser.github.io/another_chess/)

## 📝 Game Rules

### **Objective**
Checkmate your opponent's king by attacking it in a way that it cannot escape.

### **How Pieces Move**
- **♔ King**: One square in any direction
- **♕ Queen**: Any number of squares in any direction
- **♖ Rook**: Any number of squares horizontally or vertically
- **♗ Bishop**: Any number of squares diagonally
- **♘ Knight**: L-shaped: 2 squares in one direction, 1 perpendicular
- **♙ Pawn**: One square forward (two on first move), captures diagonally

### **Special Rules**
- **Castling**: King and rook swap positions under specific conditions
- **En Passant**: Capture pawn that just moved two squares
- **Promotion**: Pawn reaching the end becomes any piece (usually queen)

## 🔧 Development

### **File Structure**
```
another_chess/
├── index.html          # Main HTML file
├── styles.css          # Enhanced styles
├── game.js            # Main game logic
├── chess-engine.js    # AI engine
├── board-fixes.js     # Board enhancements
└── README.md          # This file
```

### **Key Components**
- **ChessGame**: Main game controller
- **ChessEngine**: AI opponent logic
- **Board Management**: Square and piece handling
- **UI Controls**: Settings, modals, interactions

## 🎨 Customization

### **Themes**
Easily add new board themes by extending the CSS theme system:

```css
.board-theme-custom .square.light-square {
    background: #your-light-color;
}

.board-theme-custom .square.dark-square {
    background: #your-dark-color;
}
```

### **AI Difficulty**
Adjust AI parameters in `chess-engine.js`:

```javascript
this.difficulties = {
    'custom': {
        depth: 4,
        randomness: 0.1,
        thinking: 1000,
        blunderChance: 0.05
    }
};
```

## 🐛 Bug Reports

Found a bug? Please report it on [GitHub Issues](https://github.com/eladser/another_chess/issues) with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chess.js**: Excellent chess logic library
- **Chess community**: For feedback and suggestions
- **Open source**: For making this possible

## 📊 Stats

- **Lines of Code**: ~2,500+
- **Features**: 25+
- **Supported Browsers**: All modern browsers
- **Mobile Support**: Full
- **Accessibility**: WCAG 2.1 compliant

---

**🎮 Ready to play? [Start a game now!](https://eladser.github.io/another_chess/)**

*Made with ❤️ by chess enthusiasts, for chess enthusiasts.*