// Enhanced Chess Game with chess.js integration and beautiful pieces
class ChessGame {
    constructor() {
        // Initialize chess.js if available
        this.chess = typeof Chess !== 'undefined' ? new Chess() : null;
        this.engine = null;
        
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameMode = 'ai';
        this.playerColor = 'white';
        this.gameState = 'playing';
        this.lastMove = null;
        this.boardFlipped = false;
        
        this.settings = {
            boardTheme: 'modern',
            pieceStyle: 'modern',
            difficulty: 'medium',
            enableSound: true,
            enableAnimations: true,
            showLegalMoves: true,
            enableDragDrop: true
        };
        
        // Drag and drop state
        this.draggedPiece = null;
        this.draggedFrom = null;
        
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
        
        this.initializeGame();
    }
    
    async initializeGame() {
        this.gameStats.startTime = Date.now();
        
        // Initialize chess engine
        if (typeof ChessEngine !== 'undefined') {
            this.engine = new ChessEngine(this.settings.difficulty);
        }
        
        await this.initializeAudio();
        this.createBoard();
        this.updateDisplay();
        this.bindEvents();
        this.applyTheme();
        this.updatePieces();
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
    }
    
    updatePieces() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Clear previous piece
            square.innerHTML = '';
            
            // Get piece from chess.js if available
            let piece = null;
            if (this.chess) {
                const algebraicSquare = this.rowColToAlgebraic(row, col);
                const chessJsPiece = this.chess.get(algebraicSquare);
                if (chessJsPiece) {
                    piece = chessJsPiece.color === 'w' ? 
                        chessJsPiece.type.toUpperCase() : 
                        chessJsPiece.type.toLowerCase();
                }
            }
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                
                // Add color class
                if (piece === piece.toUpperCase()) {
                    pieceElement.classList.add('white-piece');
                } else {
                    pieceElement.classList.add('black-piece');
                }
                
                // Use beautiful Unicode symbols
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
        // Beautiful Unicode chess symbols
        const pieces = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return pieces[piece] || '';
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
    
    // Drag and drop handlers
    handleDragStart(event, row, col) {
        if (this.gameState !== 'playing') {
            event.preventDefault();
            return;
        }
        
        if (this.gameMode === 'ai' && this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            event.preventDefault();
            return;
        }
        
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const piece = this.chess ? this.chess.get(algebraicSquare) : null;
        
        if (!piece || (this.chess && this.chess.turn() !== piece.color)) {
            event.preventDefault();
            return;
        }
        
        this.draggedFrom = { row, col };
        event.dataTransfer.setData('text/plain', `${row},${col}`);
        event.dataTransfer.effectAllowed = 'move';
        event.target.classList.add('dragging');
        
        this.clearSelection();
        this.selectedSquare = { row, col };
        this.updateValidMoves();
        
        if (this.settings.showLegalMoves) {
            this.highlightValidMoves();
        }
    }
    
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        this.clearDragHighlights();
        
        if (!this.draggedFrom) {
            this.clearSelection();
        }
        
        this.draggedFrom = null;
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    
    handleDragEnter(event) {
        event.preventDefault();
        
        if (this.draggedFrom) {
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
        
        if (this.draggedFrom) {
            if (this.isValidMove(this.draggedFrom.row, this.draggedFrom.col, row, col)) {
                this.makeMove(this.draggedFrom.row, this.draggedFrom.col, row, col);
                this.clearSelection();
                
                if (this.gameMode === 'ai' && !this.chess.isGameOver()) {
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
        
        if (this.gameMode === 'ai' && this.chess && this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            return;
        }
        
        if (this.selectedSquare) {
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.clearSelection();
                
                if (this.gameMode === 'ai' && !this.chess.isGameOver()) {
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
        this.clearSelection();
        
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const piece = this.chess ? this.chess.get(algebraicSquare) : null;
        
        if (piece && this.chess && this.chess.turn() === piece.color) {
            this.selectedSquare = { row, col };
            this.updateValidMoves();
            this.highlightSquare(row, col, 'selected');
            
            if (this.settings.showLegalMoves) {
                this.highlightValidMoves();
            }
        }
    }
    
    updateValidMoves() {
        this.validMoves = [];
        
        if (this.selectedSquare && this.chess) {
            const algebraicSquare = this.rowColToAlgebraic(this.selectedSquare.row, this.selectedSquare.col);
            const moves = this.chess.moves({ square: algebraicSquare, verbose: true });
            
            this.validMoves = moves.map(move => {
                const { row, col } = this.algebraicToRowCol(move.to);
                return { row, col, move };
            });
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
        this.validMoves.forEach(({ row, col, move }) => {
            const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
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
        return this.validMoves.some(move => move.row === toRow && move.col === toCol);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.chess) return;
        
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        // Try to make the move
        const move = this.chess.move({ from, to, promotion: 'q' });
        
        if (move) {
            this.gameStats.totalMoves++;
            
            if (move.captured) {
                this.gameStats.captures++;
                this.updateCapturedPieces();
                this.playSound('capture');
            } else {
                this.playSound('move');
            }
            
            this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
            this.highlightLastMove();
            
            if (this.settings.enableAnimations) {
                this.animateMove(fromRow, fromCol, toRow, toCol);
            }
            
            this.updateDisplay();
            this.updatePieces();
            this.checkGameState();
        }
    }
    
    makeAIMove() {
        if (!this.chess || this.chess.isGameOver()) return;
        
        const boardElement = document.getElementById('chessBoard');
        boardElement.classList.add('thinking');
        
        const thinkingTime = {
            'easy': 500,
            'medium': 1000,
            'hard': 2000
        }[this.settings.difficulty] || 1000;
        
        setTimeout(() => {
            let move = null;
            
            if (this.engine) {
                // Use the enhanced AI engine
                move = this.engine.getBestMove();
            } else {
                // Fallback to random move
                const moves = this.chess.moves({ verbose: true });
                if (moves.length > 0) {
                    move = moves[Math.floor(Math.random() * moves.length)];
                }
            }
            
            if (move) {
                const chessMove = this.chess.move(move);
                
                if (chessMove) {
                    const { row: fromRow, col: fromCol } = this.algebraicToRowCol(chessMove.from);
                    const { row: toRow, col: toCol } = this.algebraicToRowCol(chessMove.to);
                    
                    this.gameStats.totalMoves++;
                    
                    if (chessMove.captured) {
                        this.gameStats.captures++;
                        this.updateCapturedPieces();
                        this.playSound('capture');
                    } else {
                        this.playSound('move');
                    }
                    
                    this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
                    this.highlightLastMove();
                    
                    if (this.settings.enableAnimations) {
                        this.animateMove(fromRow, fromCol, toRow, toCol);
                    }
                    
                    this.updateDisplay();
                    this.updatePieces();
                    this.checkGameState();
                }
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
                }, 800);
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
    
    updateDisplay() {
        if (this.chess) {
            const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
            document.getElementById('currentTurn').textContent = turn;
            
            // Update check status
            if (this.chess.inCheck()) {
                this.gameStats.checks++;
                this.highlightKingInCheck();
            } else {
                this.clearCheckHighlight();
            }
        }
        
        this.updateMoveHistory();
        this.updateGameStats();
        
        document.getElementById('gameMode').textContent = this.gameMode === 'ai' ? 'vs AI' : 'vs Human';
        document.getElementById('difficulty').textContent = 
            this.settings.difficulty.charAt(0).toUpperCase() + this.settings.difficulty.slice(1);
    }
    
    highlightKingInCheck() {
        if (!this.chess || !this.chess.inCheck()) return;
        
        const kingColor = this.chess.turn();
        const board = this.chess.board();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k' && piece.color === kingColor) {
                    this.highlightSquare(row, col, 'in-check');
                    this.playSound('check');
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
        
        if (this.chess) {
            const history = this.chess.history();
            
            for (let i = 0; i < history.length; i += 2) {
                const moveItem = document.createElement('div');
                moveItem.className = 'move-item';
                
                const moveNumber = Math.floor(i / 2) + 1;
                const whiteMove = history[i];
                const blackMove = history[i + 1];
                
                moveItem.innerHTML = `
                    <span class="move-number">${moveNumber}.</span>
                    <span>${whiteMove || ''} ${blackMove || ''}</span>
                `;
                
                moveList.appendChild(moveItem);
            }
        }
        
        moveList.scrollTop = moveList.scrollHeight;
    }
    
    updateCapturedPieces() {
        const topCaptured = document.getElementById('topCaptured');
        const bottomCaptured = document.getElementById('bottomCaptured');
        
        if (this.chess) {
            const history = this.chess.history({ verbose: true });
            const whiteCaptured = [];
            const blackCaptured = [];
            
            history.forEach(move => {
                if (move.captured) {
                    if (move.color === 'w') {
                        blackCaptured.push(move.captured);
                    } else {
                        whiteCaptured.push(move.captured);
                    }
                }
            });
            
            const playerCaptured = this.playerColor === 'white' ? blackCaptured : whiteCaptured;
            const opponentCaptured = this.playerColor === 'white' ? whiteCaptured : blackCaptured;
            
            topCaptured.innerHTML = opponentCaptured
                .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
                .join('');
            
            bottomCaptured.innerHTML = playerCaptured
                .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece.toUpperCase())}</span>`)
                .join('');
        }
    }
    
    checkGameState() {
        if (!this.chess) return;
        
        if (this.chess.isGameOver()) {
            this.gameStats.endTime = Date.now();
            
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
            
            this.gameState = 'ended';
            this.showGameOver(winner, reason);
            this.playSound('gameOver');
        }
    }
    
    showGameOver(winner, reason) {
        const gameOverModal = document.getElementById('gameOverModal');
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        gameOverTitle.textContent = winner === 'Draw' ? 'Draw!' : `${winner} Wins!`;
        
        const reasonText = {
            'checkmate': 'by Checkmate',
            'stalemate': 'by Stalemate',
            'draw': 'by Draw',
            'timeout': 'by Timeout',
            'resignation': 'by Resignation'
        }[reason] || '';
        
        gameOverMessage.textContent = `Game ended ${reasonText}`;
        
        // Update final stats
        const gameTime = this.gameStats.endTime ? 
            Math.floor((this.gameStats.endTime - this.gameStats.startTime) / 1000) : 0;
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        
        document.getElementById('finalMoves').textContent = this.gameStats.totalMoves;
        document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('finalCaptures').textContent = this.gameStats.captures;
        
        gameOverModal.style.display = 'flex';
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
        // Close any open modals
        document.getElementById('gameOverModal').style.display = 'none';
        
        // Reset chess.js instance
        if (this.chess) {
            this.chess.reset();
        }
        
        // Reset game state
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
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
        
        if (this.engine) {
            this.engine.setDifficulty(this.settings.difficulty);
        }
        
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
        // Game control buttons
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('flipBoardBtn').addEventListener('click', () => {
            this.flipBoard();
        });
        
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
        
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.hideSettings();
            }
        });
        
        // Keyboard shortcuts
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
        
        // Populate current settings
        document.getElementById('gameModeSelect').value = this.gameMode;
        document.getElementById('difficultySelect').value = this.settings.difficulty;
        document.getElementById('playerColorSelect').value = this.playerColor;
        document.getElementById('boardThemeSelect').value = this.settings.boardTheme;
        document.getElementById('pieceStyleSelect').value = this.settings.pieceStyle;
        
        // Update checkboxes
        document.getElementById('enableSoundToggle').checked = this.settings.enableSound;
        document.getElementById('enableAnimationsToggle').checked = this.settings.enableAnimations;
        document.getElementById('showLegalMovesToggle').checked = this.settings.showLegalMoves;
        document.getElementById('enableDragDropToggle').checked = this.settings.enableDragDrop;
        
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
            pieceStyle: document.getElementById('pieceStyleSelect').value,
            enableSound: document.getElementById('enableSoundToggle').checked,
            enableAnimations: document.getElementById('enableAnimationsToggle').checked,
            showLegalMoves: document.getElementById('showLegalMovesToggle').checked,
            enableDragDrop: document.getElementById('enableDragDropToggle').checked
        };
        
        this.applySettings(newSettings);
        this.hideSettings();
    }
    
    exportGame() {
        const gameData = {
            pgn: this.chess ? this.chess.pgn() : '',
            fen: this.chess ? this.chess.fen() : '',
            settings: this.settings,
            stats: this.gameStats,
            result: this.gameState
        };
        
        const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-game-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make sure chess.js is loaded
    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not loaded!');
        return;
    }
    
    window.game = new ChessGame();
    
    // Update game statistics every second
    setInterval(() => {
        if (window.game && window.game.gameStats.startTime && window.game.gameState === 'playing') {
            window.game.updateGameStats();
        }
    }, 1000);
});