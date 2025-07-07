// Simple Chess Game with working chess.js integration
class ChessGame {
    constructor() {
        this.chess = null;
        this.selectedSquare = null;
        this.gameMode = 'ai';
        this.playerColor = 'white';
        this.gameState = 'playing';
        
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: Date.now()
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Initialize chess.js
        if (typeof Chess !== 'undefined') {
            try {
                this.chess = new Chess();
                console.log('Chess.js initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Chess.js:', error);
                return;
            }
        } else {
            console.error('Chess.js library not loaded!');
            return;
        }
        
        this.createBoard();
        this.updatePieces();
        this.updateDisplay();
        this.bindEvents();
    }
    
    createBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (!boardElement) {
            console.error('Board element not found!');
            return;
        }
        
        boardElement.innerHTML = '';
        
        // Create 8x8 board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add square coloring
                if ((row + col) % 2 === 0) {
                    square.classList.add('light-square');
                } else {
                    square.classList.add('dark-square');
                }
                
                // Add click event
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                
                boardElement.appendChild(square);
            }
        }
        
        console.log('Board created successfully');
    }
    
    updatePieces() {
        if (!this.chess) return;
        
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Clear previous piece
            square.innerHTML = '';
            
            // Get piece from chess.js
            const algebraicSquare = this.rowColToAlgebraic(row, col);
            const piece = this.chess.get(algebraicSquare);
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                
                // Add piece symbol
                pieceElement.innerHTML = this.getPieceSymbol(piece);
                
                // Add color class
                if (piece.color === 'w') {
                    pieceElement.classList.add('white-piece');
                } else {
                    pieceElement.classList.add('black-piece');
                }\n                
                square.appendChild(pieceElement);
            }
        });
        
        console.log('Pieces updated');
    }
    
    getPieceSymbol(piece) {
        const symbols = {
            'p': { 'w': '♙', 'b': '♟' },
            'r': { 'w': '♖', 'b': '♜' },
            'n': { 'w': '♘', 'b': '♞' },
            'b': { 'w': '♗', 'b': '♝' },
            'q': { 'w': '♕', 'b': '♛' },
            'k': { 'w': '♔', 'b': '♚' }
        };
        
        return symbols[piece.type] ? symbols[piece.type][piece.color] : '';
    }
    
    rowColToAlgebraic(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[col] + ranks[row];
    }
    
    algebraicToRowCol(algebraic) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        const col = files.indexOf(algebraic[0]);
        const row = ranks.indexOf(algebraic[1]);
        return { row, col };
    }
    
    handleSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.gameState !== 'playing') return;
        
        // Check if it's player's turn
        if (this.gameMode === 'ai' && this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            return;
        }
        
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const piece = this.chess.get(algebraicSquare);
        
        if (this.selectedSquare) {
            // Try to make a move
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.clearSelection();
                
                // AI move after player move
                if (this.gameMode === 'ai' && !this.chess.isGameOver()) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            } else {
                this.clearSelection();
                if (piece && piece.color === this.chess.turn()) {
                    this.selectSquare(row, col);
                }
            }
        } else {
            // Select piece if it belongs to current player
            if (piece && piece.color === this.chess.turn()) {
                this.selectSquare(row, col);
            }
        }
    }
    
    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = { row, col };
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
        
        this.highlightValidMoves(row, col);
    }
    
    clearSelection() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
        this.selectedSquare = null;
    }
    
    highlightValidMoves(row, col) {
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const moves = this.chess.moves({ square: algebraicSquare, verbose: true });
        
        moves.forEach(move => {
            const { row: toRow, col: toCol } = this.algebraicToRowCol(move.to);
            const square = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
            
            if (square) {
                if (move.captured) {
                    square.classList.add('capture-move');
                } else {
                    square.classList.add('valid-move');
                }
            }
        });
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        const moves = this.chess.moves({ verbose: true });
        return moves.some(move => move.from === from && move.to === to);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        try {
            const move = this.chess.move({ from, to, promotion: 'q' });
            
            if (move) {
                this.gameStats.totalMoves++;
                
                if (move.captured) {
                    this.gameStats.captures++;
                }
                
                if (this.chess.inCheck()) {
                    this.gameStats.checks++;
                }
                
                this.updatePieces();
                this.updateDisplay();
                this.checkGameState();
                
                console.log('Move made:', move);
            }
        } catch (error) {
            console.error('Invalid move:', error);
        }
    }
    
    makeAIMove() {
        if (!this.chess || this.chess.isGameOver()) return;
        
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return;
        
        // Simple random move for AI
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        try {
            const move = this.chess.move(randomMove);
            
            if (move) {
                this.gameStats.totalMoves++;
                
                if (move.captured) {
                    this.gameStats.captures++;
                }
                
                if (this.chess.inCheck()) {
                    this.gameStats.checks++;
                }
                
                this.updatePieces();
                this.updateDisplay();
                this.checkGameState();
                
                console.log('AI move made:', move);
            }
        } catch (error) {
            console.error('AI move error:', error);
        }
    }
    
    updateDisplay() {
        if (!this.chess) return;
        
        const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
        const turnElement = document.getElementById('currentTurn');
        if (turnElement) {
            turnElement.textContent = turn;
        }
        
        this.updateGameStats();
        this.updateMoveHistory();
    }
    
    updateGameStats() {
        const elements = {
            totalMoves: document.getElementById('totalMoves'),
            captures: document.getElementById('captures'),
            checks: document.getElementById('checks'),
            gameTime: document.getElementById('gameTime')
        };
        
        if (elements.totalMoves) {
            elements.totalMoves.textContent = this.gameStats.totalMoves;
        }
        
        if (elements.captures) {
            elements.captures.textContent = this.gameStats.captures;
        }
        
        if (elements.checks) {
            elements.checks.textContent = this.gameStats.checks;
        }
        
        if (elements.gameTime) {
            const elapsed = Math.floor((Date.now() - this.gameStats.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elements.gameTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        if (!moveList || !this.chess) return;
        
        moveList.innerHTML = '';
        const history = this.chess.history();
        
        for (let i = 0; i < history.length; i += 2) {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = history[i] || '';
            const blackMove = history[i + 1] || '';
            
            moveItem.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span>${whiteMove} ${blackMove}</span>
            `;
            
            moveList.appendChild(moveItem);
        }
        
        moveList.scrollTop = moveList.scrollHeight;
    }
    
    checkGameState() {
        if (!this.chess) return;
        
        if (this.chess.isGameOver()) {
            this.gameState = 'ended';
            
            let winner = 'Draw';
            let reason = 'unknown';
            
            if (this.chess.isCheckmate()) {
                winner = this.chess.turn() === 'w' ? 'Black' : 'White';
                reason = 'checkmate';
            } else if (this.chess.isStalemate()) {
                reason = 'stalemate';
            } else if (this.chess.isDraw()) {
                reason = 'draw';
            }
            
            this.showGameOver(winner, reason);
        }
    }
    
    showGameOver(winner, reason) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (title) {
            title.textContent = winner === 'Draw' ? 'Draw!' : `${winner} Wins!`;
        }
        
        if (message) {
            const reasonText = {
                'checkmate': 'by Checkmate',
                'stalemate': 'by Stalemate',
                'draw': 'by Draw'
            }[reason] || '';
            message.textContent = `Game ended ${reasonText}`;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    newGame() {
        if (this.chess) {
            this.chess.reset();
        }
        
        this.selectedSquare = null;
        this.gameState = 'playing';
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: Date.now()
        };
        
        this.updatePieces();
        this.updateDisplay();
        this.clearSelection();
        
        // Close game over modal
        const modal = document.getElementById('gameOverModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    flipBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            const isFlipped = boardElement.style.transform === 'rotate(180deg)';
            
            if (isFlipped) {
                boardElement.style.transform = 'rotate(0deg)';
                document.querySelectorAll('.piece').forEach(piece => {
                    piece.style.transform = 'rotate(0deg)';
                });
            } else {
                boardElement.style.transform = 'rotate(180deg)';
                document.querySelectorAll('.piece').forEach(piece => {
                    piece.style.transform = 'rotate(180deg)';
                });
            }
        }
    }
    
    bindEvents() {
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }
        
        const flipBoardBtn = document.getElementById('flipBoardBtn');
        if (flipBoardBtn) {
            flipBoardBtn.addEventListener('click', () => this.flipBoard());
        }
        
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.newGame());
        }
        
        const closeGameOverBtn = document.getElementById('closeGameOver');
        if (closeGameOverBtn) {
            closeGameOverBtn.addEventListener('click', () => {
                const modal = document.getElementById('gameOverModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chess game...');
    
    // Check if Chess.js is loaded
    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not loaded!');
        
        // Show error message to user
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            boardElement.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Chess.js library failed to load. Please refresh the page.</div>';
        }
        return;
    }
    
    console.log('Chess.js loaded successfully');
    
    try {
        window.game = new ChessGame();
        console.log('Chess game initialized successfully');
        
        // Update game statistics every second
        setInterval(() => {
            if (window.game && window.game.gameStats.startTime && window.game.gameState === 'playing') {
                window.game.updateGameStats();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize chess game:', error);
        
        // Show error message to user
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            boardElement.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Failed to initialize chess game. Please refresh the page.</div>';
        }
    }
});