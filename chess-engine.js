// Enhanced Chess Engine using chess.js library
// This provides proper move validation and game logic

class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.chess = new Chess(); // chess.js instance
        this.depths = {
            'easy': 2,
            'medium': 3,
            'hard': 4
        };
        
        // Piece values for evaluation
        this.pieceValues = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
            'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
        };
        
        // Position evaluation tables
        this.positionTables = {
            'p': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            'n': [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            'b': [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            'r': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            'q': [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            'k': [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ]
        };
    }
    
    // Load a position from FEN
    loadPosition(fen) {
        return this.chess.load(fen);
    }
    
    // Get current FEN
    getFen() {
        return this.chess.fen();
    }
    
    // Get current board state
    getBoard() {
        return this.chess.board();
    }
    
    // Check if game is over
    isGameOver() {
        return this.chess.isGameOver();
    }
    
    // Check if in check
    inCheck() {
        return this.chess.inCheck();
    }
    
    // Check if in checkmate
    inCheckmate() {
        return this.chess.isCheckmate();
    }
    
    // Check if in stalemate
    inStalemate() {
        return this.chess.isStalemate();
    }
    
    // Get whose turn it is
    getTurn() {
        return this.chess.turn();
    }
    
    // Get all legal moves
    getLegalMoves(square = null) {
        return this.chess.moves({ square: square, verbose: true });
    }
    
    // Make a move
    makeMove(move) {
        return this.chess.move(move);
    }
    
    // Undo last move
    undoMove() {
        return this.chess.undo();
    }
    
    // Get move history
    getHistory() {
        return this.chess.history({ verbose: true });
    }
    
    // Reset game
    reset() {
        this.chess.reset();
    }
    
    // Set difficulty
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    // Get AI move
    getBestMove() {
        if (this.chess.isGameOver()) {
            return null;
        }
        
        const depth = this.depths[this.difficulty];
        const moves = this.chess.moves({ verbose: true });
        
        if (moves.length === 0) {
            return null;
        }
        
        // Add some randomness for easy difficulty
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            this.chess.move(move);
            const score = this.minimax(depth - 1, -Infinity, Infinity, false);
            this.chess.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    // Minimax algorithm with alpha-beta pruning
    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.chess.isGameOver()) {
            return this.evaluatePosition();
        }
        
        const moves = this.chess.moves({ verbose: true });
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                this.chess.move(move);
                const score = this.minimax(depth - 1, alpha, beta, false);
                this.chess.undo();
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                this.chess.move(move);
                const score = this.minimax(depth - 1, alpha, beta, true);
                this.chess.undo();
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return minScore;
        }
    }
    
    // Evaluate current position
    evaluatePosition() {
        let score = 0;
        const board = this.chess.board();
        
        // Check for checkmate/stalemate
        if (this.chess.isCheckmate()) {
            return this.chess.turn() === 'w' ? -20000 : 20000;
        }
        
        if (this.chess.isStalemate() || this.chess.isDraw()) {
            return 0;
        }
        
        // Evaluate material and position
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceValue = this.pieceValues[piece.type];
                    const positionValue = this.getPositionValue(piece.type, row, col, piece.color);
                    const totalValue = pieceValue + positionValue;
                    
                    if (piece.color === 'w') {
                        score += totalValue;
                    } else {
                        score -= totalValue;
                    }
                }
            }
        }
        
        // Add bonus for controlling center
        score += this.evaluateCenterControl();
        
        // Add bonus for piece development
        score += this.evaluateDevelopment();
        
        // Add bonus for king safety
        score += this.evaluateKingSafety();
        
        return score;
    }
    
    // Get position value for a piece
    getPositionValue(pieceType, row, col, color) {
        if (!this.positionTables[pieceType]) {
            return 0;
        }
        
        const table = this.positionTables[pieceType];
        
        // Flip the table for black pieces
        if (color === 'b') {
            return table[7 - row][col];
        } else {
            return table[row][col];
        }
    }
    
    // Evaluate center control
    evaluateCenterControl() {
        let score = 0;
        const board = this.chess.board();
        const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        
        for (const [row, col] of centerSquares) {
            const piece = board[row][col];
            if (piece) {
                const bonus = piece.color === 'w' ? 10 : -10;
                score += bonus;
            }
        }
        
        return score;
    }
    
    // Evaluate piece development
    evaluateDevelopment() {
        let score = 0;
        const board = this.chess.board();
        
        // Check if knights and bishops are developed
        const initialPositions = {
            'wn': [[7, 1], [7, 6]],
            'wb': [[7, 2], [7, 5]],
            'bn': [[0, 1], [0, 6]],
            'bb': [[0, 2], [0, 5]]
        };
        
        for (const [key, positions] of Object.entries(initialPositions)) {
            const color = key[0];
            const pieceType = key[1];
            
            for (const [row, col] of positions) {
                const piece = board[row][col];
                if (!piece || piece.type !== pieceType || piece.color !== color) {
                    // Piece has moved (developed)
                    const bonus = color === 'w' ? 15 : -15;
                    score += bonus;
                }
            }
        }
        
        return score;
    }
    
    // Evaluate king safety
    evaluateKingSafety() {
        let score = 0;
        
        // Basic king safety - penalize exposed king
        if (this.chess.inCheck()) {
            score -= this.chess.turn() === 'w' ? 50 : -50;
        }
        
        return score;
    }
    
    // Convert chess.js move to our format
    convertMove(move) {
        return {
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            flags: move.flags,
            piece: move.piece,
            captured: move.captured,
            san: move.san
        };
    }
    
    // Validate move
    isValidMove(from, to) {
        const moves = this.chess.moves({ verbose: true });
        return moves.some(move => move.from === from && move.to === to);
    }
    
    // Get piece at square
    getPieceAt(square) {
        return this.chess.get(square);
    }
    
    // Get all pieces
    getAllPieces() {
        const board = this.chess.board();
        const pieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    pieces.push({
                        ...piece,
                        square: String.fromCharCode(97 + col) + (8 - row)
                    });
                }
            }
        }
        
        return pieces;
    }
    
    // Get game status
    getGameStatus() {
        if (this.chess.isCheckmate()) {
            return this.chess.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
        }
        
        if (this.chess.isStalemate()) {
            return 'Draw by stalemate';
        }
        
        if (this.chess.isDraw()) {
            return 'Draw';
        }
        
        if (this.chess.inCheck()) {
            return this.chess.turn() === 'w' ? 'White in check' : 'Black in check';
        }
        
        return this.chess.turn() === 'w' ? 'White to move' : 'Black to move';
    }
    
    // Get PGN
    getPgn() {
        return this.chess.pgn();
    }
    
    // Load PGN
    loadPgn(pgn) {
        return this.chess.loadPgn(pgn);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}
