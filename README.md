# ♔ Another Chess

A modern, sleek chess game website with AI opponent, drag & drop functionality, and advanced features. Built with vanilla JavaScript, HTML, and CSS.

## 🎮 **Live Demo**

**Play now at: [https://eladser.github.io/another_chess/](https://eladser.github.io/another_chess/)**

## ✨ **Key Features**

### 🚀 **Core Gameplay**
- **Complete Chess Implementation** - Full chess rules with proper piece movement validation
- **Enhanced AI Opponent** - Play against a smart chess engine with 3 difficulty levels
- **Local Multiplayer** - Play against friends on the same device
- **Drag & Drop Interface** - Intuitive piece movement with visual feedback
- **Move Validation** - Only legal moves are allowed with real-time highlighting
- **Game State Detection** - Automatic detection of check, checkmate, and stalemate

### 🎨 **Modern UI & UX**
- **Sleek Dark Theme** - Beautiful dark interface with neon accents and gradients
- **Smooth Animations** - Fluid piece movements and UI transitions
- **Multiple Board Themes** - Classic, Modern, Dark, and Neon themes
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Visual Indicators** - Clear highlighting for moves, captures, and game states
- **Sound Effects** - Audio feedback for moves, captures, and game events

### 🎯 **Advanced Features**
- **Game Statistics** - Track moves, captures, checks, and game time
- **Move History** - Complete game notation with clickable move details
- **Export/Import Games** - Save and load games as JSON files
- **Keyboard Shortcuts** - Quick access to common actions
- **Game Analysis** - Post-game statistics and performance metrics
- **Help System** - Comprehensive in-game tutorial and controls guide

### ⚙️ **Customization Options**
- **Advanced Settings Panel** - Tabbed interface for all game options
- **AI Difficulty Levels** - Easy, Medium, Hard with different thinking times
- **Player Color Choice** - Play as White or Black
- **Board Orientation** - Flip board for different perspectives
- **Accessibility Options** - Sound, animations, and visual aid toggles

## 🎮 **How to Play**

### **Basic Controls**
- **Click** to select and move pieces
- **Drag & Drop** pieces for intuitive movement
- **ESC** to clear current selection
- **F1** for help and tutorials

### **Keyboard Shortcuts**
- `Ctrl+N` - Start new game
- `Ctrl+F` - Flip board
- `Ctrl+S` - Open settings
- `F1` - Show help
- `ESC` - Clear selection or close modals

### **Visual Indicators**
- 🔵 **Blue Highlight** - Selected piece
- 🟢 **Green Dots** - Valid moves
- 🔴 **Red Circles** - Capture moves
- 🟡 **Yellow Outline** - Last move made
- 🔴 **Red Pulse** - King in check
- ⚙️ **Spin Animation** - AI thinking

## 🤖 **AI Engine Features**

The chess engine includes:
- **Minimax Algorithm** with alpha-beta pruning for optimal performance
- **Position Evaluation** considering piece values and strategic positioning
- **Opening Book** for varied and interesting early game play
- **Check Detection** and legal move validation
- **Multiple Difficulty Levels**:
  - **Easy**: 2-depth search with randomness for learning
  - **Medium**: 4-depth search with balanced strategic play
  - **Hard**: 6-depth search with strong tactical awareness

## 🎨 **Theme Gallery**

### **Board Themes**
- **Classic** - Traditional brown and cream colors
- **Modern** - Clean purple and white design
- **Dark** - Sleek dark theme for night gaming
- **Neon** - Futuristic cyberpunk-inspired design with glowing effects

### **Piece Styles**
- **Classic** - Traditional Unicode chess symbols
- **Modern** - Contemporary piece designs
- **Minimal** - Clean, simplified pieces

## 🛠️ **Technical Features**

### **Built With**
- **Pure Vanilla JavaScript** - No frameworks, lightweight and fast
- **CSS3** - Advanced styling with animations and modern effects
- **HTML5** - Semantic markup and accessibility
- **Web Audio API** - Dynamic sound generation
- **Drag & Drop API** - Native browser drag and drop support

### **Performance Optimizations**
- **Efficient Game Logic** - Optimized move generation and validation
- **Smooth Animations** - Hardware-accelerated CSS transitions
- **Responsive Images** - Scalable vector graphics for all screen sizes
- **Memory Management** - Clean code with proper event handling

### **Accessibility**
- **Keyboard Navigation** - Full game playable with keyboard
- **High Contrast Support** - Automatic contrast adjustments
- **Reduced Motion** - Respects user motion preferences
- **Screen Reader Friendly** - Semantic HTML and ARIA labels

## 📱 **Cross-Platform Support**

Works perfectly on:
- 🖥️ **Desktop** - Windows, macOS, Linux
- 📱 **Mobile** - iOS Safari, Android Chrome
- 📟 **Tablet** - iPad, Android tablets
- 🌐 **Browsers** - Chrome, Firefox, Safari, Edge

## 🚀 **Getting Started**

### **Play Online**
Just visit the [live demo](https://eladser.github.io/another_chess/) and start playing immediately!

### **Local Development**

1. **Clone the repository:**
```bash
git clone https://github.com/eladser/another_chess.git
```

2. **Open in browser:**
```bash
cd another_chess
open index.html
```

That's it! No build process, dependencies, or setup required.

## 🎯 **Game Modes**

### **vs AI Mode**
- Choose your difficulty level
- Play as White or Black
- AI provides challenging and varied gameplay
- Dynamic thinking time based on difficulty

### **vs Human Mode**
- Local multiplayer on same device
- Turn-based gameplay
- Perfect for playing with friends and family

## 📊 **Game Statistics**

Track your performance with:
- **Total Moves** - Number of moves made
- **Captures** - Pieces captured during the game
- **Checks** - Times you put opponent in check
- **Game Time** - Total time spent playing
- **Move History** - Complete game notation
- **Post-Game Analysis** - Detailed game breakdown

## 🔧 **Advanced Settings**

### **Basic Settings**
- Game mode selection (AI vs Human)
- AI difficulty adjustment
- Player color preference

### **Advanced Options**
- Sound effects toggle
- Animation preferences
- Legal move highlighting
- Drag & drop functionality

### **Appearance**
- Board theme selection
- Piece style customization
- Visual effect preferences

## 📁 **File Structure**
```
another_chess/
├── index.html          # Main game interface
├── styles.css          # Sleek dark theme and animations
├── game.js            # Enhanced game logic with drag & drop
├── chess-engine.js    # Improved AI with opening book
├── README.md          # This comprehensive guide
└── LICENSE            # MIT License
```

## 🎓 **Learning Features**

### **For Beginners**
- Visual move highlighting shows legal moves
- Comprehensive help system with tutorials
- Multiple difficulty levels for gradual improvement
- Game analysis helps understand mistakes

### **For Advanced Players**
- Strong AI opponent for challenging games
- Complete move notation for game review
- Export functionality for external analysis
- Fast, responsive interface for blitz games

## 🚀 **Future Enhancements**

- [ ] **Online Multiplayer** - Play against opponents worldwide
- [ ] **Chess Puzzles** - Daily tactical challenges
- [ ] **Tournament Mode** - Bracket-style competitions
- [ ] **Game Database** - Save and organize multiple games
- [ ] **Opening Trainer** - Learn chess openings interactively
- [ ] **Engine Analysis** - Computer evaluation of positions
- [ ] **Time Controls** - Blitz, rapid, and classical time formats
- [ ] **Player Profiles** - Track long-term statistics

## 🤝 **Contributing**

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clean, documented code
4. **Test thoroughly** across different browsers and devices
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a detailed description

### **Areas for Contribution**
- 🎨 **UI/UX Improvements** - Design enhancements and user experience
- 🤖 **AI Enhancement** - Stronger chess engine algorithms
- 🎵 **Sound Design** - Better audio effects and music
- 🌐 **Accessibility** - Improved support for all users
- 📱 **Mobile Optimization** - Enhanced mobile experience
- 🔧 **Performance** - Speed and efficiency improvements

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Chess Community** for game rules and notation standards
- **Unicode Consortium** for chess piece symbols
- **Modern Web Standards** for enabling rich browser experiences
- **Open Source Community** for inspiration and best practices

---

## 🎮 **Ready to Play?**

**[🚀 Start Playing Now!](https://eladser.github.io/another_chess/)**

*Experience the most modern and feature-rich chess game in your browser!*

**Enjoy the game! ♔♕♖♗♘♙**