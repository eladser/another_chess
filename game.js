// Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameMode = 'ai'; // 'ai' or 'human'
        this.playerColor = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameState = 'playing'; // 'playing', 'check', 'checkmate', 'stalemate'
        this.lastMove = null;
        this.boardFlipped = false;
        this.settings = {
            boardTheme: 'classic',
            pieceStyle: 'classic',
            difficulty: 'medium'
        };
        
        this.engine = new ChessEngine(this.settings.difficulty);
        this.initializeGame();
    }
    
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pieces in starting position
        // Black pieces (top)
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board[1] = Array(8).fill('p');
        
        // White pieces (bottom)
        board[6] = Array(8).fill('P');
        board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        
        return board;
    }
    
    initializeGame() {
        this.createBoard();
        this.updateDisplay();
        this.bindEvents();
        this.applyTheme();
    }
    
    createBoard() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add alternating colors
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }
                
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                boardElement.appendChild(square);
            }
        }
        
        this.updatePieces();
    }
    
    updatePieces() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];
            
            // Clear previous piece
            square.innerHTML = '';
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.innerHTML = this.getPieceSymbol(piece);
                square.appendChild(pieceElement);
            }
        });
    }
    
    getPieceSymbol(piece) {
        const pieces = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return pieces[piece] || '';
    }
    
    handleSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.gameState !== 'playing') return;
        
        // If it's AI's turn, don't allow human moves
        if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
            return;
        }
        
        if (this.selectedSquare) {
            // Try to make a move
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.clearSelection();
                
                // If playing against AI, trigger AI move
                if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            } else {
                // Select new piece or deselect
                this.selectSquare(row, col);
            }
        } else {
            // Select a piece
            this.selectSquare(row, col);
        }
    }
    
    selectSquare(row, col) {
        const piece = this.board[row][col];
        
        // Clear previous selection
        this.clearSelection();
        
        // Check if the piece belongs to the current player
        if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
            this.selectedSquare = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.highlightSquare(row, col, 'selected');
            this.highlightValidMoves();
        }
    }
    
    clearSelection() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
        this.selectedSquare = null;
        this.validMoves = [];
    }
    
    highlightSquare(row, col, className) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add(className);
        }
    }
    
    highlightValidMoves() {
        this.validMoves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                if (this.board[move.row][move.col]) {
                    square.classList.add('capture-move');
                } else {
                    square.classList.add('valid-move');
                }
            }
        });
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(move => move.row === toRow && move.col === toCol);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Handle captured piece
        if (capturedPiece) {
            const capturedColor = capturedPiece === capturedPiece.toUpperCase() ? 'white' : 'black';
            this.capturedPieces[capturedColor].push(capturedPiece);
            this.updateCapturedPieces();
        }
        
        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Record move
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            notation: moveNotation
        });
        
        // Update last move highlighting
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        this.highlightLastMove();
        
        // Animate the move
        this.animateMove(fromRow, fromCol, toRow, toCol);
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update display
        this.updateDisplay();
        this.updatePieces();
        
        // Check for game end conditions
        this.checkGameState();
    }
    
    makeAIMove() {
        if (this.gameState !== 'playing') return;
        
        // Show thinking animation
        const boardElement = document.getElementById('chessBoard');
        boardElement.classList.add('thinking');
        
        // Get AI move
        setTimeout(() => {
            const aiMove = this.engine.getBestMove(this.board, this.currentPlayer === 'white');
            
            if (aiMove) {
                this.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
            }
            
            boardElement.classList.remove('thinking');
        }, 1000); // Add delay for better UX
    }
    
    animateMove(fromRow, fromCol, toRow, toCol) {
        const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        
        if (fromSquare && toSquare) {
            const piece = fromSquare.querySelector('.piece');
            if (piece) {
                piece.classList.add('piece-moved');
                setTimeout(() => {
                    piece.classList.remove('piece-moved');
                }, 600);
            }
        }
    }
    
    highlightLastMove() {
        // Clear previous last move highlights
        document.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
        
        if (this.lastMove) {
            this.highlightSquare(this.lastMove.from.row, this.lastMove.from.col, 'last-move');
            this.highlightSquare(this.lastMove.to.row, this.lastMove.to.col, 'last-move');
        }
    }
    
    getValidMoves(row, col) {
        const moves = this.engine.getValidMoves(this.board, row, col);
        return moves.map(move => move.to);
    }
    
    isPieceOwnedByCurrentPlayer(piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        return (this.currentPlayer === 'white' && isWhitePiece) || 
               (this.currentPlayer === 'black' && !isWhitePiece);
    }
    
    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        const fromSquare = files[fromCol] + ranks[fromRow];
        const toSquare = files[toCol] + ranks[toRow];
        
        let notation = '';
        
        if (piece.toLowerCase() !== 'p') {
            notation += piece.toUpperCase();
        }
        
        if (captured) {
            if (piece.toLowerCase() === 'p') {
                notation += files[fromCol];
            }
            notation += 'x';
        }
        
        notation += toSquare;
        
        return notation;
    }
    
    updateDisplay() {
        // Update current turn
        document.getElementById('currentTurn').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        // Update move history
        this.updateMoveHistory();
        
        // Update game mode display
        document.getElementById('gameMode').textContent = 
            this.gameMode === 'ai' ? 'vs AI' : 'vs Human';
        
        // Update difficulty display
        document.getElementById('difficulty').textContent = 
            this.settings.difficulty.charAt(0).toUpperCase() + this.settings.difficulty.slice(1);
    }
    
    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        moveList.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            
            moveItem.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span>${whiteMove.notation} ${blackMove ? blackMove.notation : ''}</span>
            `;
            
            moveList.appendChild(moveItem);
        }
        
        // Auto-scroll to bottom
        moveList.scrollTop = moveList.scrollHeight;
    }
    
    updateCapturedPieces() {
        const topCaptured = document.getElementById('topCaptured');
        const bottomCaptured = document.getElementById('bottomCaptured');
        
        const playerCaptured = this.playerColor === 'white' ? 'black' : 'white';
        const opponentCaptured = this.playerColor === 'white' ? 'white' : 'black';
        
        topCaptured.innerHTML = this.capturedPieces[opponentCaptured]
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
        
        bottomCaptured.innerHTML = this.capturedPieces[playerCaptured]
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
    }
    
    checkGameState() {
        // Simple game state check - in a real implementation, you'd check for checkmate/stalemate
        const currentPlayerMoves = this.engine.getAllValidMoves(this.board, this.currentPlayer === 'white');
        
        if (currentPlayerMoves.length === 0) {
            this.gameState = 'checkmate';
            this.showGameOver(this.currentPlayer === 'white' ? 'Black' : 'White');
        }
    }
    
    showGameOver(winner) {
        const gameOverElement = document.createElement('div');
        gameOverElement.className = 'game-over';
        gameOverElement.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over</h2>
                <p>${winner} wins!</p>
                <button class="btn btn-primary" onclick="game.newGame()">New Game</button>
            </div>
        `;
        document.body.appendChild(gameOverElement);
    }
    
    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        const boardElement = document.getElementById('chessBoard');
        
        if (this.boardFlipped) {
            boardElement.style.transform = 'rotate(180deg)';
            // Rotate pieces back to normal
            document.querySelectorAll('.piece').forEach(piece => {
                piece.style.transform = 'rotate(180deg)';
            });
        } else {
            boardElement.style.transform = 'rotate(0deg)';
            document.querySelectorAll('.piece').forEach(piece => {
                piece.style.transform = 'rotate(0deg)';
            });
        }
        
        this.updateCoordinates();
    }
    
    updateCoordinates() {
        const leftCoords = document.querySelectorAll('.coordinates-left .coord');
        const bottomCoords = document.querySelectorAll('.coordinates-bottom .coord');
        
        if (this.boardFlipped) {
            leftCoords.forEach((coord, index) => {
                coord.textContent = index + 1;
            });
            bottomCoords.forEach((coord, index) => {
                coord.textContent = String.fromCharCode(104 - index); // h to a
            });
        } else {
            leftCoords.forEach((coord, index) => {
                coord.textContent = 8 - index;
            });
            bottomCoords.forEach((coord, index) => {
                coord.textContent = String.fromCharCode(97 + index); // a to h
            });
        }
    }
    
    newGame() {
        // Remove game over screen
        const gameOverElement = document.querySelector('.game-over');
        if (gameOverElement) {
            gameOverElement.remove();
        }
        
        // Reset game state
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameState = 'playing';
        this.lastMove = null;
        
        // Update display
        this.updatePieces();
        this.updateDisplay();
        this.updateCapturedPieces();
        this.clearSelection();
        
        // Clear last move highlights
        document.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
    }
    
    applySettings(settings) {
        this.settings = { ...this.settings, ...settings };
        
        // Update AI difficulty
        this.engine.setDifficulty(this.settings.difficulty);
        
        // Update game mode
        this.gameMode = settings.gameMode || this.gameMode;
        
        // Update player color
        if (settings.playerColor && settings.playerColor !== this.playerColor) {
            this.playerColor = settings.playerColor;
            this.updatePlayerInfo();
        }
        
        // Apply visual themes
        this.applyTheme();
        
        // Update display
        this.updateDisplay();
    }
    
    applyTheme() {
        const boardElement = document.getElementById('chessBoard');
        
        // Remove existing theme classes
        boardElement.classList.remove('classic', 'modern', 'dark', 'neon');
        
        // Add new theme
        boardElement.classList.add(this.settings.boardTheme);
        
        // Apply piece style (you can extend this for different piece sets)
        document.documentElement.style.setProperty('--piece-style', this.settings.pieceStyle);
    }
    
    updatePlayerInfo() {
        const topPlayer = document.getElementById('topPlayer');
        const bottomPlayer = document.getElementById('bottomPlayer');
        
        if (this.playerColor === 'white') {
            topPlayer.querySelector('.player-name').textContent = 
                this.gameMode === 'ai' ? 'AI Opponent' : 'Player 2';
            bottomPlayer.querySelector('.player-name').textContent = 
                this.gameMode === 'ai' ? 'You' : 'Player 1';
        } else {
            topPlayer.querySelector('.player-name').textContent = 
                this.gameMode === 'ai' ? 'You' : 'Player 1';
            bottomPlayer.querySelector('.player-name').textContent = 
                this.gameMode === 'ai' ? 'AI Opponent' : 'Player 2';
        }
    }
    
    bindEvents() {
        // New Game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Flip Board button
        document.getElementById('flipBoardBtn').addEventListener('click', () => {
            this.flipBoard();
        });
        
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Settings modal events
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('applySettings').addEventListener('click', () => {
            this.applySettingsFromModal();
        });
        
        // Close modal when clicking outside
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.hideSettings();
            }
        });
    }
    
    showSettings() {
        const modal = document.getElementById('settingsModal');
        
        // Populate current settings
        document.getElementById('gameModeSelect').value = this.gameMode;
        document.getElementById('difficultySelect').value = this.settings.difficulty;
        document.getElementById('playerColorSelect').value = this.playerColor;
        document.getElementById('boardThemeSelect').value = this.settings.boardTheme;
        document.getElementById('pieceStyleSelect').value = this.settings.pieceStyle;
        
        modal.style.display = 'flex';
    }
    
    hideSettings() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
    }
    
    applySettingsFromModal() {
        const newSettings = {
            gameMode: document.getElementById('gameModeSelect').value,
            difficulty: document.getElementById('difficultySelect').value,
            playerColor: document.getElementById('playerColorSelect').value,
            boardTheme: document.getElementById('boardThemeSelect').value,
            pieceStyle: document.getElementById('pieceStyleSelect').value
        };
        
        this.applySettings(newSettings);
        this.hideSettings();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ChessGame();
});
