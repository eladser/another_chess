// Advanced Chess Game with Enhanced Features
class ChessGame {
    constructor() {
        this.engine = null;
        this.selectedSquare = null;
        this.gameMode = 'ai';
        this.playerColor = 'white';
        this.gameState = 'playing';
        this.isFlipped = false;
        this.lastMove = null;
        this.draggedPiece = null;
        this.draggedElement = null;
        this.gameSettings = {
            difficulty: 'medium',
            playerColor: 'white',
            showCoordinates: true,
            highlightLastMove: true,
            showPossibleMoves: true,
            enableAnimations: true,
            enableSounds: true,
            volume: 50,
            boardTheme: 'classic'
        };
        
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: Date.now(),
            accuracy: 0
        };
        
        this.sounds = {
            move: this.createSound('move'),
            capture: this.createSound('capture'),
            check: this.createSound('check'),
            checkmate: this.createSound('checkmate'),
            castle: this.createSound('castle')
        };
        
        this.initializeGame();
    }
    
    // Initialize the game
    async initializeGame() {
        console.log('Initializing chess game...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        try {
            // Check if Chess.js is loaded
            if (typeof Chess === 'undefined') {
                throw new Error('Chess.js library not loaded!');
            }
            
            // Initialize chess engine
            this.engine = new ChessEngine(this.gameSettings.difficulty);
            console.log('Chess engine initialized successfully');
            
            // Load settings
            this.loadSettings();
            
            // Create board and setup game
            this.createBoard();
            this.updatePieces();
            this.updateDisplay();
            this.bindEvents();
            
            // Apply board theme
            this.applyBoardTheme();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
            this.showError('Failed to initialize chess game: ' + error.message);
        }
    }
    
    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    // Show error message
    showError(message) {
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            boardElement.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">${message}</div>`;
        }
        this.hideLoadingScreen();
    }
    
    // Create chess board
    createBoard() {
        const boardElement = document.getElementById('chessBoard');
        if (!boardElement) {
            throw new Error('Board element not found!');
        }
        
        boardElement.innerHTML = '';
        
        // Create 8x8 board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = this.rowColToAlgebraic(row, col);
                
                // Add click and drag event listeners
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                square.addEventListener('dragover', (e) => this.handleDragOver(e));
                square.addEventListener('drop', (e) => this.handleDrop(e));
                
                boardElement.appendChild(square);
            }
        }
        
        console.log('Board created successfully');
    }
    
    // Update pieces on board
    updatePieces() {
        if (!this.engine) return;
        
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Clear previous piece
            square.innerHTML = '';
            
            // Get piece from engine
            const algebraicSquare = this.rowColToAlgebraic(row, col);
            const piece = this.engine.getPieceAt(algebraicSquare);
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.draggable = true;
                
                // Add piece symbol
                pieceElement.innerHTML = this.getPieceSymbol(piece);
                
                // Add color class
                pieceElement.classList.add(piece.color === 'w' ? 'white-piece' : 'black-piece');
                
                // Add drag event listeners
                pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                pieceElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                
                square.appendChild(pieceElement);
            }
        });
        
        // Update captured pieces
        this.updateCapturedPieces();
        
        console.log('Pieces updated');
    }
    
    // Get piece symbol
    getPieceSymbol(piece) {
        const symbols = {
            'p': { 'w': '♙', 'b': '♟' },
            'r': { 'w': '♖', 'b': '♜' },
            'n': { 'w': '♘', 'b': '♞' },
            'b': { 'w': '♗', 'b': '♝' },
            'q': { 'w': '♕', 'b': '♛' },
            'k': { 'w': '♔', 'b': '♚' }
        };
        return symbols[piece.type][piece.color] || '?';
    }
    
    // Convert row/col to algebraic notation
    rowColToAlgebraic(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[col] + ranks[row];
    }
    
    // Convert algebraic to row/col
    algebraicToRowCol(algebraic) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        const col = files.indexOf(algebraic[0]);
        const row = ranks.indexOf(algebraic[1]);
        return { row, col };
    }
    
    // Handle square click
    handleSquareClick(event) {
        if (this.gameState !== 'playing') return;
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Check if it's player's turn
        if (this.gameMode === 'ai' && this.engine.getTurn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            return;
        }
        
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const piece = this.engine.getPieceAt(algebraicSquare);
        
        if (this.selectedSquare) {
            // Try to make a move
            if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
            } else {
                this.clearSelection();
                if (piece && piece.color === this.engine.getTurn()) {
                    this.selectSquare(row, col);
                }
            }
        } else {
            // Select piece if it belongs to current player
            if (piece && piece.color === this.engine.getTurn()) {
                this.selectSquare(row, col);
            }
        }
    }
    
    // Handle drag start
    handleDragStart(event) {
        if (this.gameState !== 'playing') {
            event.preventDefault();
            return;
        }
        
        const square = event.target.parentElement;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.engine.getPieceAt(this.rowColToAlgebraic(row, col));
        
        // Check if it's player's turn
        if (this.gameMode === 'ai' && this.engine.getTurn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            event.preventDefault();
            return;
        }
        
        // Check if piece belongs to current player
        if (!piece || piece.color !== this.engine.getTurn()) {
            event.preventDefault();
            return;
        }
        
        this.draggedPiece = { row, col, piece };
        this.draggedElement = event.target;
        
        // Add dragging class
        event.target.classList.add('dragging');
        
        // Set drag data
        event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
        event.dataTransfer.effectAllowed = 'move';
        
        // Select the square
        this.selectSquare(row, col);
    }
    
    // Handle drag over
    handleDragOver(event) {
        if (!this.draggedPiece) return;
        
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Check if this is a valid drop target
        if (this.isValidMove(this.draggedPiece.row, this.draggedPiece.col, row, col)) {
            square.classList.add('drop-target');
        }
    }
    
    // Handle drop
    handleDrop(event) {
        event.preventDefault();
        
        if (!this.draggedPiece) return;
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Remove drop target highlighting
        document.querySelectorAll('.drop-target').forEach(sq => {
            sq.classList.remove('drop-target');
        });
        
        // Try to make the move
        if (this.isValidMove(this.draggedPiece.row, this.draggedPiece.col, row, col)) {
            this.makeMove(this.draggedPiece.row, this.draggedPiece.col, row, col);
        }
        
        this.draggedPiece = null;
    }
    
    // Handle drag end
    handleDragEnd(event) {
        // Remove dragging class
        event.target.classList.remove('dragging');
        
        // Remove drop target highlighting
        document.querySelectorAll('.drop-target').forEach(square => {
            square.classList.remove('drop-target');
        });
        
        this.draggedPiece = null;
        this.draggedElement = null;
    }
    
    // Select square
    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = { row, col };
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
        
        if (this.gameSettings.showPossibleMoves) {
            this.highlightValidMoves(row, col);
        }
    }
    
    // Clear selection
    clearSelection() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
        this.selectedSquare = null;
    }
    
    // Highlight valid moves
    highlightValidMoves(row, col) {
        const algebraicSquare = this.rowColToAlgebraic(row, col);
        const moves = this.engine.getLegalMoves(algebraicSquare);
        
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
    
    // Check if move is valid
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        return this.engine.isValidMove(from, to);
    }
    
    // Make a move
    async makeMove(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        try {
            // Check for pawn promotion
            const piece = this.engine.getPieceAt(from);
            let promotion = null;
            
            if (piece && piece.type === 'p') {
                const promotionRow = piece.color === 'w' ? 0 : 7;
                if (toRow === promotionRow) {
                    promotion = await this.showPromotionDialog(piece.color);
                }
            }
            
            // Make the move
            const move = this.engine.makeMove({ from, to, promotion });
            
            if (move) {
                this.lastMove = { from, to };
                this.gameStats.totalMoves++;
                
                // Update statistics
                if (move.captured) {
                    this.gameStats.captures++;
                }
                
                if (this.engine.inCheck()) {
                    this.gameStats.checks++;
                }
                
                // Play sound
                this.playMoveSound(move);
                
                // Update display
                this.clearSelection();
                this.updatePieces();
                this.updateDisplay();
                this.highlightLastMove();
                
                // Check game state
                this.checkGameState();
                
                // AI move if it's AI's turn
                if (this.gameMode === 'ai' && !this.engine.isGameOver()) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
                
                console.log('Move made:', move);
            }
        } catch (error) {
            console.error('Invalid move:', error);
            this.clearSelection();
        }
    }
    
    // Make AI move
    async makeAIMove() {
        if (!this.engine || this.engine.isGameOver()) return;
        
        try {
            // Show thinking indicator
            this.showThinkingIndicator();
            
            // Get best move from AI
            const move = await this.engine.getBestMove();
            
            if (move) {
                const engineMove = this.engine.makeMove(move);
                
                if (engineMove) {
                    this.lastMove = { from: move.from, to: move.to };
                    this.gameStats.totalMoves++;
                    
                    // Update statistics
                    if (engineMove.captured) {
                        this.gameStats.captures++;
                    }
                    
                    if (this.engine.inCheck()) {
                        this.gameStats.checks++;
                    }
                    
                    // Play sound
                    this.playMoveSound(engineMove);
                    
                    // Update display
                    this.updatePieces();
                    this.updateDisplay();
                    this.highlightLastMove();
                    
                    // Check game state
                    this.checkGameState();
                    
                    console.log('AI move made:', engineMove);
                }
            }
        } catch (error) {
            console.error('AI move error:', error);
        } finally {
            this.hideThinkingIndicator();
        }
    }
    
    // Show promotion dialog
    showPromotionDialog(color) {
        return new Promise((resolve) => {
            const modal = document.getElementById('promotionModal');
            const pieces = modal.querySelectorAll('.promotion-piece');
            
            // Update piece colors
            pieces.forEach(piece => {
                const pieceType = piece.dataset.piece;
                const symbols = {
                    'q': color === 'w' ? '♕' : '♛',
                    'r': color === 'w' ? '♖' : '♜',
                    'b': color === 'w' ? '♗' : '♝',
                    'n': color === 'w' ? '♘' : '♞'
                };
                piece.innerHTML = symbols[pieceType];
                piece.style.color = color === 'w' ? '#ffffff' : '#2a2a2a';
            });
            
            // Show modal
            modal.style.display = 'flex';
            
            // Handle selection
            const handleSelection = (e) => {
                const selectedPiece = e.target.dataset.piece;
                modal.style.display = 'none';
                
                // Remove event listeners
                pieces.forEach(p => p.removeEventListener('click', handleSelection));
                
                resolve(selectedPiece);
            };
            
            pieces.forEach(piece => {
                piece.addEventListener('click', handleSelection);
            });
        });
    }
    
    // Show thinking indicator
    showThinkingIndicator() {
        const bestMove = document.getElementById('bestMove');
        if (bestMove) {
            bestMove.textContent = 'AI is thinking...';
            bestMove.style.color = '#fbbf24';
        }
    }
    
    // Hide thinking indicator
    hideThinkingIndicator() {
        const bestMove = document.getElementById('bestMove');
        if (bestMove) {
            bestMove.textContent = 'Ready';
            bestMove.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    }
    
    // Play move sound
    playMoveSound(move) {
        if (!this.gameSettings.enableSounds) return;
        
        try {
            if (this.engine.inCheckmate()) {
                this.sounds.checkmate.play();
            } else if (this.engine.inCheck()) {
                this.sounds.check.play();
            } else if (move.flags && move.flags.includes('c')) {
                this.sounds.castle.play();
            } else if (move.captured) {
                this.sounds.capture.play();
            } else {
                this.sounds.move.play();
            }
        } catch (error) {
            console.log('Sound play error:', error);
        }
    }
    
    // Create sound
    createSound(type) {
        const audio = new Audio();
        // Simple sound generation using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const frequencies = {
            'move': 440,
            'capture': 330,
            'check': 660,
            'checkmate': 220,
            'castle': 550
        };
        
        return {
            play: () => {
                if (!this.gameSettings.enableSounds) return;
                
                try {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequencies[type];
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.gameSettings.volume / 100 * 0.1, audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (error) {
                    console.log('Sound generation error:', error);
                }
            }
        };
    }
    
    // Update captured pieces
    updateCapturedPieces() {
        const history = this.engine.getHistory();
        const capturedWhite = [];
        const capturedBlack = [];
        
        history.forEach(move => {
            if (move.captured) {
                const symbols = {
                    'p': { 'w': '♙', 'b': '♟' },
                    'r': { 'w': '♖', 'b': '♜' },
                    'n': { 'w': '♘', 'b': '♞' },
                    'b': { 'w': '♗', 'b': '♝' },
                    'q': { 'w': '♕', 'b': '♛' }
                };
                
                const symbol = symbols[move.captured][move.color === 'w' ? 'b' : 'w'];
                if (move.color === 'w') {
                    capturedWhite.push(symbol);
                } else {
                    capturedBlack.push(symbol);
                }
            }
        });
        
        // Update display
        const topCaptured = document.getElementById('topCaptured');
        const bottomCaptured = document.getElementById('bottomCaptured');
        
        if (topCaptured) {
            topCaptured.innerHTML = capturedBlack.map(p => `<span class="captured-piece">${p}</span>`).join('');
        }
        
        if (bottomCaptured) {
            bottomCaptured.innerHTML = capturedWhite.map(p => `<span class="captured-piece">${p}</span>`).join('');
        }
    }
    
    // Highlight last move
    highlightLastMove() {
        // Clear previous highlights
        document.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
        
        if (this.gameSettings.highlightLastMove && this.lastMove) {
            const { from, to } = this.lastMove;
            const fromPos = this.algebraicToRowCol(from);
            const toPos = this.algebraicToRowCol(to);
            
            const fromSquare = document.querySelector(`[data-row="${fromPos.row}"][data-col="${fromPos.col}"]`);
            const toSquare = document.querySelector(`[data-row="${toPos.row}"][data-col="${toPos.col}"]`);
            
            if (fromSquare) fromSquare.classList.add('last-move');
            if (toSquare) toSquare.classList.add('last-move');
        }
    }
    
    // Update display
    updateDisplay() {
        if (!this.engine) return;
        
        const turn = this.engine.getTurn() === 'w' ? 'White' : 'Black';
        const turnElement = document.getElementById('currentTurn');
        if (turnElement) {
            turnElement.textContent = turn;
        }
        
        this.updateGameStats();
        this.updateMoveHistory();
        this.updateEngineAnalysis();
    }
    
    // Update game statistics
    updateGameStats() {
        const elements = {
            totalMoves: document.getElementById('totalMoves'),
            captures: document.getElementById('captures'),
            checks: document.getElementById('checks'),
            accuracy: document.getElementById('accuracy'),
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
        
        if (elements.accuracy) {
            elements.accuracy.textContent = this.gameStats.accuracy > 0 ? `${this.gameStats.accuracy}%` : '--';
        }
        
        if (elements.gameTime) {
            const elapsed = Math.floor((Date.now() - this.gameStats.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elements.gameTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Update move history
    updateMoveHistory() {
        const moveList = document.getElementById('moveList');
        if (!moveList || !this.engine) return;
        
        moveList.innerHTML = '';
        const history = this.engine.getHistory();
        
        for (let i = 0; i < history.length; i += 2) {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = history[i] ? history[i].san : '';
            const blackMove = history[i + 1] ? history[i + 1].san : '';
            
            moveItem.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span>${whiteMove} ${blackMove}</span>
            `;
            
            moveList.appendChild(moveItem);
        }
        
        moveList.scrollTop = moveList.scrollHeight;
    }
    
    // Update engine analysis
    updateEngineAnalysis() {
        if (!this.engine) return;
        
        const evaluation = this.engine.getCurrentEvaluation();
        const evalBar = document.getElementById('evalBar');
        const evalText = document.getElementById('evalText');
        
        if (evalBar && evalText) {
            // Update evaluation bar
            const percentage = Math.max(0, Math.min(100, (evaluation + 10) * 5));
            evalBar.style.background = `linear-gradient(90deg, #dc2626 0%, #fbbf24 50%, #16a34a 100%)`;
            evalBar.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            
            // Update evaluation text
            if (Math.abs(evaluation) > 5) {
                evalText.textContent = evaluation > 0 ? '+M' : '-M';
            } else {
                evalText.textContent = evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
            }
        }
    }
    
    // Check game state
    checkGameState() {
        if (!this.engine) return;
        
        if (this.engine.isGameOver()) {
            this.gameState = 'ended';
            
            let winner = 'Draw';
            let reason = 'unknown';
            
            if (this.engine.inCheckmate()) {
                winner = this.engine.getTurn() === 'w' ? 'Black' : 'White';
                reason = 'checkmate';
            } else if (this.engine.inStalemate()) {
                reason = 'stalemate';
            } else if (this.engine.chess.isDraw()) {
                reason = 'draw';
            }
            
            setTimeout(() => this.showGameOver(winner, reason), 1000);
        } else if (this.engine.inCheck()) {
            // Highlight king in check
            this.highlightKingInCheck();
        }
    }
    
    // Highlight king in check
    highlightKingInCheck() {
        // Remove previous check highlights
        document.querySelectorAll('.in-check').forEach(square => {
            square.classList.remove('in-check');
        });
        
        // Find and highlight king in check
        const board = this.engine.getBoard();
        const currentPlayer = this.engine.getTurn();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k' && piece.color === currentPlayer) {
                    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (square) {
                        square.classList.add('in-check');
                    }
                    break;
                }
            }
        }
    }
    
    // Show game over modal
    showGameOver(winner, reason) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const result = document.getElementById('gameResult');
        const message = document.getElementById('gameOverMessage');
        
        if (title) {
            title.textContent = winner === 'Draw' ? 'Draw!' : `${winner} Wins!`;
        }
        
        if (result) {
            result.textContent = winner === 'Draw' ? 'Draw' : `${winner} Wins!`;
        }
        
        if (message) {
            const reasonText = {
                'checkmate': 'by Checkmate',
                'stalemate': 'by Stalemate',
                'draw': 'by Draw'
            }[reason] || '';
            message.textContent = `Game ended ${reasonText}`;
        }
        
        // Update final statistics
        this.updateFinalStats();
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    // Update final statistics
    updateFinalStats() {
        const elements = {
            finalMoves: document.getElementById('finalMoves'),
            finalTime: document.getElementById('finalTime'),
            finalCaptures: document.getElementById('finalCaptures'),
            finalAccuracy: document.getElementById('finalAccuracy')
        };
        
        if (elements.finalMoves) {
            elements.finalMoves.textContent = this.gameStats.totalMoves;
        }
        
        if (elements.finalTime) {
            const elapsed = Math.floor((Date.now() - this.gameStats.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (elements.finalCaptures) {
            elements.finalCaptures.textContent = this.gameStats.captures;
        }
        
        if (elements.finalAccuracy) {
            elements.finalAccuracy.textContent = this.gameStats.accuracy > 0 ? `${this.gameStats.accuracy}%` : '--';
        }
    }
    
    // New game
    newGame() {
        if (this.engine) {
            this.engine.reset();
        }
        
        this.selectedSquare = null;
        this.gameState = 'playing';
        this.lastMove = null;
        this.gameStats = {
            totalMoves: 0,
            captures: 0,
            checks: 0,
            startTime: Date.now(),
            accuracy: 0
        };
        
        this.updatePieces();
        this.updateDisplay();
        this.clearSelection();
        
        // Close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // If player is black, make AI move first
        if (this.playerColor === 'black') {
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }
    
    // Undo move
    undoMove() {
        if (!this.engine || this.gameStats.totalMoves === 0) return;
        
        // Undo player move
        const undoneMove = this.engine.undoMove();
        if (undoneMove) {
            this.gameStats.totalMoves--;
            
            // Undo AI move if in AI mode
            if (this.gameMode === 'ai' && this.gameStats.totalMoves > 0) {
                const aiMove = this.engine.undoMove();
                if (aiMove) {
                    this.gameStats.totalMoves--;
                }
            }
            
            this.gameState = 'playing';
            this.updatePieces();
            this.updateDisplay();
            this.clearSelection();
        }
    }
    
    // Flip board
    flipBoard() {
        const boardElement = document.getElementById('chessBoard');
        const leftCoords = document.getElementById('leftCoords');
        const bottomCoords = document.getElementById('bottomCoords');
        
        if (boardElement) {
            this.isFlipped = !this.isFlipped;
            
            if (this.isFlipped) {
                boardElement.classList.add('flipped');
                
                // Reverse coordinates
                if (leftCoords) {
                    leftCoords.innerHTML = '<div class="coord">1</div><div class="coord">2</div><div class="coord">3</div><div class="coord">4</div><div class="coord">5</div><div class="coord">6</div><div class="coord">7</div><div class="coord">8</div>';
                }
                if (bottomCoords) {
                    bottomCoords.innerHTML = '<div class="coord">h</div><div class="coord">g</div><div class="coord">f</div><div class="coord">e</div><div class="coord">d</div><div class="coord">c</div><div class="coord">b</div><div class="coord">a</div>';
                }
            } else {
                boardElement.classList.remove('flipped');
                
                // Reset coordinates
                if (leftCoords) {
                    leftCoords.innerHTML = '<div class="coord">8</div><div class="coord">7</div><div class="coord">6</div><div class="coord">5</div><div class="coord">4</div><div class="coord">3</div><div class="coord">2</div><div class="coord">1</div>';
                }
                if (bottomCoords) {
                    bottomCoords.innerHTML = '<div class="coord">a</div><div class="coord">b</div><div class="coord">c</div><div class="coord">d</div><div class="coord">e</div><div class="coord">f</div><div class="coord">g</div><div class="coord">h</div>';
                }
            }
        }
    }
    
    // Apply board theme
    applyBoardTheme() {
        const boardElement = document.getElementById('chessBoard');
        if (boardElement) {
            // Remove existing theme classes
            boardElement.classList.remove('board-theme-classic', 'board-theme-wooden', 'board-theme-marble', 'board-theme-glass');
            
            // Add new theme class
            boardElement.classList.add(`board-theme-${this.gameSettings.boardTheme}`);
            
            // Update CSS variables
            const themes = {
                'classic': { light: '#f0d9b5', dark: '#b58863' },
                'wooden': { light: '#d4a574', dark: '#8b4513' },
                'marble': { light: '#e8e8e8', dark: '#696969' },
                'glass': { light: 'rgba(255, 255, 255, 0.8)', dark: 'rgba(0, 0, 0, 0.6)' }
            };
            
            const theme = themes[this.gameSettings.boardTheme];
            if (theme) {
                document.documentElement.style.setProperty('--light-square', theme.light);
                document.documentElement.style.setProperty('--dark-square', theme.dark);
            }
        }
    }
    
    // Load settings
    loadSettings() {
        const saved = localStorage.getItem('chess-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.gameSettings = { ...this.gameSettings, ...settings };
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
    
    // Save settings
    saveSettings() {
        try {
            localStorage.setItem('chess-settings', JSON.stringify(this.gameSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    // Apply settings
    applySettings() {
        // Apply difficulty
        if (this.engine) {
            this.engine.setDifficulty(this.gameSettings.difficulty);
        }
        
        // Apply board theme
        this.applyBoardTheme();
        
        // Apply coordinate visibility
        const coords = document.querySelectorAll('.coordinates');
        coords.forEach(coord => {
            coord.style.display = this.gameSettings.showCoordinates ? 'flex' : 'none';
        });
        
        // Update difficulty display
        const difficultyElement = document.getElementById('difficulty');
        if (difficultyElement) {
            const difficultyNames = {
                'easy': 'Easy',
                'medium': 'Medium',
                'hard': 'Hard',
                'expert': 'Expert'
            };
            difficultyElement.textContent = difficultyNames[this.gameSettings.difficulty];
        }
        
        // Update AI rating
        const aiRating = document.getElementById('aiRating');
        if (aiRating) {
            const ratings = {
                'easy': '900',
                'medium': '1400',
                'hard': '1800',
                'expert': '2200'
            };
            aiRating.textContent = ratings[this.gameSettings.difficulty];
        }
    }
    
    // Show settings modal
    showSettings() {
        const modal = document.getElementById('settingsModal');
        
        // Update form values
        document.getElementById('difficultySelect').value = this.gameSettings.difficulty;
        document.getElementById('playerColorSelect').value = this.gameSettings.playerColor;
        document.getElementById('boardThemeSelect').value = this.gameSettings.boardTheme;
        document.getElementById('showCoordinates').checked = this.gameSettings.showCoordinates;
        document.getElementById('highlightLastMove').checked = this.gameSettings.highlightLastMove;
        document.getElementById('showPossibleMoves').checked = this.gameSettings.showPossibleMoves;
        document.getElementById('enableAnimations').checked = this.gameSettings.enableAnimations;
        document.getElementById('enableSounds').checked = this.gameSettings.enableSounds;
        document.getElementById('volumeSlider').value = this.gameSettings.volume;
        document.getElementById('volumeValue').textContent = this.gameSettings.volume + '%';
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    // Export game as PGN
    exportGame() {
        if (!this.engine) return;
        
        const pgn = this.engine.getPgn();
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Bind events
    bindEvents() {
        // Game control buttons
        document.getElementById('newGameBtn')?.addEventListener('click', () => this.newGame());
        document.getElementById('flipBoardBtn')?.addEventListener('click', () => this.flipBoard());
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undoMove());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'flex';
        });
        
        // Modal controls
        document.getElementById('closeSettings')?.addEventListener('click', () => {
            document.getElementById('settingsModal').style.display = 'none';
        });
        
        document.getElementById('closeGameOver')?.addEventListener('click', () => {
            document.getElementById('gameOverModal').style.display = 'none';
        });
        
        document.getElementById('closeHelp')?.addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'none';
        });
        
        document.getElementById('closeHelpBtn')?.addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'none';
        });
        
        // Game over modal buttons
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.newGame());
        document.getElementById('exportGameBtn')?.addEventListener('click', () => this.exportGame());
        
        // Settings modal buttons
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettingsFromForm();
            document.getElementById('settingsModal').style.display = 'none';
        });
        
        document.getElementById('resetSettings')?.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Volume slider
        document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    // Save settings from form
    saveSettingsFromForm() {
        this.gameSettings.difficulty = document.getElementById('difficultySelect').value;
        this.gameSettings.playerColor = document.getElementById('playerColorSelect').value;
        this.gameSettings.boardTheme = document.getElementById('boardThemeSelect').value;
        this.gameSettings.showCoordinates = document.getElementById('showCoordinates').checked;
        this.gameSettings.highlightLastMove = document.getElementById('highlightLastMove').checked;
        this.gameSettings.showPossibleMoves = document.getElementById('showPossibleMoves').checked;
        this.gameSettings.enableAnimations = document.getElementById('enableAnimations').checked;
        this.gameSettings.enableSounds = document.getElementById('enableSounds').checked;
        this.gameSettings.volume = parseInt(document.getElementById('volumeSlider').value);
        
        this.saveSettings();
        this.applySettings();
        
        // Set player color
        this.playerColor = this.gameSettings.playerColor === 'random' ? 
            (Math.random() > 0.5 ? 'white' : 'black') : 
            this.gameSettings.playerColor;
    }
    
    // Reset settings
    resetSettings() {
        this.gameSettings = {
            difficulty: 'medium',
            playerColor: 'white',
            showCoordinates: true,
            highlightLastMove: true,
            showPossibleMoves: true,
            enableAnimations: true,
            enableSounds: true,
            volume: 50,
            boardTheme: 'classic'
        };
        
        this.saveSettings();
        this.applySettings();
        
        // Update form
        document.getElementById('difficultySelect').value = this.gameSettings.difficulty;
        document.getElementById('playerColorSelect').value = this.gameSettings.playerColor;
        document.getElementById('boardThemeSelect').value = this.gameSettings.boardTheme;
        document.getElementById('showCoordinates').checked = this.gameSettings.showCoordinates;
        document.getElementById('highlightLastMove').checked = this.gameSettings.highlightLastMove;
        document.getElementById('showPossibleMoves').checked = this.gameSettings.showPossibleMoves;
        document.getElementById('enableAnimations').checked = this.gameSettings.enableAnimations;
        document.getElementById('enableSounds').checked = this.gameSettings.enableSounds;
        document.getElementById('volumeSlider').value = this.gameSettings.volume;
        document.getElementById('volumeValue').textContent = this.gameSettings.volume + '%';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chess game...');
    
    // Check if Chess.js is loaded
    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not loaded!');
        return;
    }
    
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
    }
});