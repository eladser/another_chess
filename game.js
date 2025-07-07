// Enhanced Chess Game with Drag & Drop and Advanced Features
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
            difficulty: 'medium',
            enableSound: true,
            enableAnimations: true,
            showLegalMoves: true,
            enableDragDrop: true
        };
        
        // Drag and drop state
        this.draggedPiece = null;
        this.draggedFrom = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Game statistics
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: null,
            endTime: null
        };
        
        // Sound effects
        this.audioContext = null;
        this.sounds = {};
        
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
    
    async initializeGame() {
        this.gameStats.startTime = Date.now();
        await this.initializeAudio();
        this.createBoard();
        this.updateDisplay();
        this.bindEvents();
        this.applyTheme();
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sounds = {
                move: { frequency: 400, duration: 0.1 },
                capture: { frequency: 600, duration: 0.15 },
                check: { frequency: 800, duration: 0.2 },
                gameOver: { frequency: 200, duration: 0.5 }
            };
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }
    
    playSound(soundName) {
        if (!this.settings.enableSound || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = sound.frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
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
                
                // Add event listeners
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                
                // Drag and drop event listeners
                square.addEventListener('dragover', (e) => this.handleDragOver(e));
                square.addEventListener('drop', (e) => this.handleDrop(e));
                square.addEventListener('dragenter', (e) => this.handleDragEnter(e));
                square.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                
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
                pieceElement.draggable = this.settings.enableDragDrop;
                
                // Add drag event listeners
                if (this.settings.enableDragDrop) {
                    pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                    pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                }
                
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
    
    // Drag and drop handlers
    handleDragStart(event, row, col) {
        if (this.gameState !== 'playing') {
            event.preventDefault();
            return;
        }
        
        if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
            event.preventDefault();
            return;
        }
        
        const piece = this.board[row][col];
        if (!piece || !this.isPieceOwnedByCurrentPlayer(piece)) {
            event.preventDefault();
            return;
        }
        
        this.draggedPiece = piece;
        this.draggedFrom = { row, col };
        
        event.dataTransfer.setData('text/plain', `${row},${col}`);
        event.dataTransfer.effectAllowed = 'move';
        
        event.target.classList.add('dragging');
        
        this.clearSelection();
        this.selectedSquare = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        
        if (this.settings.showLegalMoves) {
            this.highlightValidMoves();
        }
    }
    
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        this.clearDragHighlights();
        
        if (!this.draggedPiece) {
            this.clearSelection();
        }
        
        this.draggedPiece = null;
        this.draggedFrom = null;
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    
    handleDragEnter(event) {
        event.preventDefault();
        
        if (this.draggedPiece) {
            const row = parseInt(event.currentTarget.dataset.row);
            const col = parseInt(event.currentTarget.dataset.col);
            
            if (this.isValidMove(this.draggedFrom.row, this.draggedFrom.col, row, col)) {
                event.currentTarget.classList.add('drag-over');
            } else {
                event.currentTarget.classList.add('drag-invalid');
            }
        }
    }
    
    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over', 'drag-invalid');
    }
    
    handleDrop(event) {
        event.preventDefault();
        
        const row = parseInt(event.currentTarget.dataset.row);
        const col = parseInt(event.currentTarget.dataset.col);
        
        event.currentTarget.classList.remove('drag-over', 'drag-invalid');
        
        if (this.draggedPiece && this.draggedFrom) {
            if (this.isValidMove(this.draggedFrom.row, this.draggedFrom.col, row, col)) {
                this.makeMove(this.draggedFrom.row, this.draggedFrom.col, row, col);
                this.clearSelection();
                
                if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            }
        }
    }
    
    clearDragHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('drag-over', 'drag-invalid');
        });
    }
    
    handleSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.gameState !== 'playing') return;
        
        if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
            return;
        }
        
        if (this.selectedSquare) {
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.clearSelection();
                
                if (this.gameMode === 'ai' && this.currentPlayer !== this.playerColor) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            } else {
                this.selectSquare(row, col);
            }
        } else {
            this.selectSquare(row, col);
        }
    }
    
    selectSquare(row, col) {
        const piece = this.board[row][col];
        
        this.clearSelection();
        
        if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
            this.selectedSquare = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.highlightSquare(row, col, 'selected');
            
            if (this.settings.showLegalMoves) {
                this.highlightValidMoves();
            }
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
        
        if (capturedPiece) {
            const capturedColor = capturedPiece === capturedPiece.toUpperCase() ? 'white' : 'black';
            this.capturedPieces[capturedColor].push(capturedPiece);
            this.updateCapturedPieces();
            this.gameStats.captures++;
            this.playSound('capture');
        } else {
            this.playSound('move');
        }
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            notation: moveNotation,
            timestamp: Date.now()
        });
        
        this.gameStats.totalMoves++;
        
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        this.highlightLastMove();
        
        if (this.settings.enableAnimations) {
            this.animateMove(fromRow, fromCol, toRow, toCol);
        }
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        this.updateDisplay();
        this.updatePieces();
        
        this.checkGameState();
    }
    
    makeAIMove() {
        if (this.gameState !== 'playing') return;
        
        const boardElement = document.getElementById('chessBoard');
        boardElement.classList.add('thinking');
        
        const thinkingTime = {
            'easy': 500,
            'medium': 1000,
            'hard': 2000
        }[this.settings.difficulty] || 1000;
        
        setTimeout(() => {
            const aiMove = this.engine.getBestMove(this.board, this.currentPlayer === 'white');
            
            if (aiMove) {
                this.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
            }
            
            boardElement.classList.remove('thinking');
        }, thinkingTime);
    }
    
    animateMove(fromRow, fromCol, toRow, toCol) {
        const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        
        if (toSquare) {
            const piece = toSquare.querySelector('.piece');
            if (piece) {
                piece.classList.add('piece-moved');
                setTimeout(() => {
                    piece.classList.remove('piece-moved');
                }, 600);
            }
        }
    }
    
    highlightLastMove() {
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
        
        if (this.engine.isInCheck(this.board, this.currentPlayer === 'white')) {
            const nextPlayerMoves = this.engine.getAllValidMoves(this.board, this.currentPlayer === 'white');
            if (nextPlayerMoves.length === 0) {
                notation += '#';
            } else {
                notation += '+';
                this.gameStats.checks++;
                this.playSound('check');
            }
        }
        
        return notation;
    }
    
    updateDisplay() {
        document.getElementById('currentTurn').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        this.updateMoveHistory();
        
        document.getElementById('gameMode').textContent = 
            this.gameMode === 'ai' ? 'vs AI' : 'vs Human';
        
        document.getElementById('difficulty').textContent = 
            this.settings.difficulty.charAt(0).toUpperCase() + this.settings.difficulty.slice(1);
        
        this.updateGameStats();
    }
    
    updateGameStats() {
        const statsElements = {
            totalMoves: document.getElementById('totalMoves'),
            captures: document.getElementById('captures'),
            checks: document.getElementById('checks'),
            gameTime: document.getElementById('gameTime')
        };
        
        if (statsElements.totalMoves) {
            statsElements.totalMoves.textContent = this.gameStats.totalMoves;
        }
        
        if (statsElements.captures) {
            statsElements.captures.textContent = this.gameStats.captures;
        }
        
        if (statsElements.checks) {
            statsElements.checks.textContent = this.gameStats.checks;
        }
        
        if (statsElements.gameTime && this.gameStats.startTime) {
            const elapsed = Math.floor((Date.now() - this.gameStats.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            statsElements.gameTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
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
        const currentPlayerMoves = this.engine.getAllValidMoves(this.board, this.currentPlayer === 'white');
        
        if (currentPlayerMoves.length === 0) {
            if (this.engine.isInCheck(this.board, this.currentPlayer === 'white')) {
                this.gameState = 'checkmate';
                this.gameStats.endTime = Date.now();
                this.showGameOver(this.currentPlayer === 'white' ? 'Black' : 'White', 'checkmate');
                this.playSound('gameOver');
            } else {
                this.gameState = 'stalemate';
                this.gameStats.endTime = Date.now();
                this.showGameOver('Draw', 'stalemate');
                this.playSound('gameOver');
            }
        } else if (this.engine.isInCheck(this.board, this.currentPlayer === 'white')) {
            this.gameState = 'check';
            this.highlightKingInCheck();
        } else {
            this.gameState = 'playing';
            this.clearCheckHighlight();
        }
    }
    
    highlightKingInCheck() {
        const kingSymbol = this.currentPlayer === 'white' ? 'K' : 'k';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === kingSymbol) {
                    this.highlightSquare(row, col, 'in-check');
                    break;
                }
            }
        }
    }
    
    clearCheckHighlight() {
        document.querySelectorAll('.in-check').forEach(square => {
            square.classList.remove('in-check');
        });
    }
    
    showGameOver(winner, reason) {
        const gameOverElement = document.createElement('div');
        gameOverElement.className = 'game-over';
        
        const reasonText = {
            'checkmate': 'by Checkmate',
            'stalemate': 'by Stalemate',
            'timeout': 'by Timeout',
            'resignation': 'by Resignation'
        }[reason] || '';
        
        const gameTime = this.gameStats.endTime ? 
            Math.floor((this.gameStats.endTime - this.gameStats.startTime) / 1000) : 0;
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        
        gameOverElement.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over</h2>
                <p>${winner === 'Draw' ? 'Draw' : winner + ' wins'} ${reasonText}</p>
                <div class="game-stats">
                    <p>Total Moves: ${this.gameStats.totalMoves}</p>
                    <p>Captures: ${this.gameStats.captures}</p>
                    <p>Checks: ${this.gameStats.checks}</p>
                    <p>Game Time: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                </div>
                <div class="game-over-actions">
                    <button class="btn btn-primary" onclick="game.newGame()">New Game</button>
                    <button class="btn btn-secondary" onclick="game.analyzeGame()">Analyze</button>
                </div>
            </div>
        `;
        document.body.appendChild(gameOverElement);
    }
    
    analyzeGame() {
        const analysis = {
            totalMoves: this.gameStats.totalMoves,
            captures: this.gameStats.captures,
            checks: this.gameStats.checks,
            averageTimePerMove: this.gameStats.endTime ? 
                (this.gameStats.endTime - this.gameStats.startTime) / this.gameStats.totalMoves : 0,
            openingMoves: this.moveHistory.slice(0, 10).map(m => m.notation).join(' '),
            longestSequence: this.findLongestSequenceWithoutCapture()
        };
        
        alert(`Game Analysis:\n\nTotal Moves: ${analysis.totalMoves}\nCaptures: ${analysis.captures}\nChecks: ${analysis.checks}\nAverage Time per Move: ${Math.round(analysis.averageTimePerMove / 1000)}s\nOpening: ${analysis.openingMoves}\nLongest Sequence without Capture: ${analysis.longestSequence} moves`);
    }
    
    findLongestSequenceWithoutCapture() {
        let maxSequence = 0;
        let currentSequence = 0;
        
        for (const move of this.moveHistory) {
            if (move.captured) {
                maxSequence = Math.max(maxSequence, currentSequence);
                currentSequence = 0;
            } else {
                currentSequence++;
            }
        }
        
        return Math.max(maxSequence, currentSequence);
    }
    
    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        const boardElement = document.getElementById('chessBoard');
        
        if (this.boardFlipped) {
            boardElement.style.transform = 'rotate(180deg)';
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
                coord.textContent = String.fromCharCode(104 - index);
            });
        } else {
            leftCoords.forEach((coord, index) => {
                coord.textContent = 8 - index;
            });
            bottomCoords.forEach((coord, index) => {
                coord.textContent = String.fromCharCode(97 + index);
            });
        }
    }
    
    newGame() {
        const gameOverElement = document.querySelector('.game-over');
        if (gameOverElement) {
            gameOverElement.remove();
        }
        
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameState = 'playing';
        this.lastMove = null;
        
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: Date.now(),
            endTime: null
        };
        
        this.updatePieces();
        this.updateDisplay();
        this.updateCapturedPieces();
        this.clearSelection();
        this.clearCheckHighlight();
        
        document.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
    }
    
    applySettings(settings) {
        this.settings = { ...this.settings, ...settings };
        
        this.engine.setDifficulty(this.settings.difficulty);
        
        this.gameMode = settings.gameMode || this.gameMode;
        
        if (settings.playerColor && settings.playerColor !== this.playerColor) {
            this.playerColor = settings.playerColor;
            this.updatePlayerInfo();
        }
        
        this.applyTheme();
        this.updatePieces();
        this.updateDisplay();
    }
    
    applyTheme() {
        const boardElement = document.getElementById('chessBoard');
        
        boardElement.classList.remove('classic', 'modern', 'dark', 'neon');
        boardElement.classList.add(this.settings.boardTheme);
        
        if (!this.settings.enableAnimations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
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
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('flipBoardBtn').addEventListener('click', () => {
            this.flipBoard();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        document.getElementById('applySettings').addEventListener('click', () => {
            this.applySettingsFromModal();
        });
        
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.hideSettings();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    handleKeyPress(event) {
        if (event.key === 'Escape') {
            this.clearSelection();
        }
        
        if (event.key === 'n' || event.key === 'N') {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.newGame();
            }
        }
        
        if (event.key === 'f' || event.key === 'F') {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.flipBoard();
            }
        }
        
        if (event.key === 's' || event.key === 'S') {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.showSettings();
            }
        }
    }
    
    showSettings() {
        const modal = document.getElementById('settingsModal');
        
        document.getElementById('gameModeSelect').value = this.gameMode;
        document.getElementById('difficultySelect').value = this.settings.difficulty;
        document.getElementById('playerColorSelect').value = this.playerColor;
        document.getElementById('boardThemeSelect').value = this.settings.boardTheme;
        document.getElementById('pieceStyleSelect').value = this.settings.pieceStyle;
        
        const soundToggle = document.getElementById('enableSoundToggle');
        const animationsToggle = document.getElementById('enableAnimationsToggle');
        const legalMovesToggle = document.getElementById('showLegalMovesToggle');
        const dragDropToggle = document.getElementById('enableDragDropToggle');
        
        if (soundToggle) soundToggle.checked = this.settings.enableSound;
        if (animationsToggle) animationsToggle.checked = this.settings.enableAnimations;
        if (legalMovesToggle) legalMovesToggle.checked = this.settings.showLegalMoves;
        if (dragDropToggle) dragDropToggle.checked = this.settings.enableDragDrop;
        
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
        
        const soundToggle = document.getElementById('enableSoundToggle');
        const animationsToggle = document.getElementById('enableAnimationsToggle');
        const legalMovesToggle = document.getElementById('showLegalMovesToggle');
        const dragDropToggle = document.getElementById('enableDragDropToggle');
        
        if (soundToggle) newSettings.enableSound = soundToggle.checked;
        if (animationsToggle) newSettings.enableAnimations = animationsToggle.checked;
        if (legalMovesToggle) newSettings.showLegalMoves = legalMovesToggle.checked;
        if (dragDropToggle) newSettings.enableDragDrop = dragDropToggle.checked;
        
        this.applySettings(newSettings);
        this.hideSettings();
    }
    
    exportGame() {
        const gameData = {
            moves: this.moveHistory.map(m => m.notation),
            result: this.gameState,
            settings: this.settings,
            stats: this.gameStats
        };
        
        const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-game-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    importGame(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                console.log('Game imported:', gameData);
            } catch (error) {
                alert('Error importing game: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ChessGame();
    
    // Update game statistics every second
    setInterval(() => {
        if (window.game && window.game.gameStats.startTime && window.game.gameState === 'playing') {
            window.game.updateGameStats();
        }
    }, 1000);
});