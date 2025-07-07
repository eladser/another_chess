// Enhanced Chess Engine with Advanced AI and Multiple Difficulty Levels
class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.chess = new Chess();
        this.transpositionTable = new Map();
        this.killerMoves = [];
        this.historyTable = {};
        
        // Difficulty settings
        this.difficulties = {
            'easy': { depth: 2, randomness: 0.3, thinking: 500 },
            'medium': { depth: 3, randomness: 0.1, thinking: 1000 },
            'hard': { depth: 4, randomness: 0.05, thinking: 1500 },
            'expert': { depth: 5, randomness: 0.02, thinking: 2000 }
        };
        
        // Enhanced piece values
        this.pieceValues = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
        };
        
        // Position evaluation tables (piece-square tables)
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
        
        // Initialize tables
        this.initializeTables();
    }
    
    initializeTables() {
        this.killerMoves = Array(10).fill(null).map(() => []);
        this.historyTable = {};
        this.transpositionTable.clear();
    }
    
    // Load position from FEN
    loadPosition(fen) {
        const result = this.chess.load(fen);
        if (result) this.initializeTables();
        return result;
    }
    
    // Basic getters
    getFen() { return this.chess.fen(); }
    getBoard() { return this.chess.board(); }
    isGameOver() { return this.chess.isGameOver(); }
    inCheck() { return this.chess.inCheck(); }
    inCheckmate() { return this.chess.isCheckmate(); }
    inStalemate() { return this.chess.isStalemate(); }
    getTurn() { return this.chess.turn(); }
    getHistory() { return this.chess.history({ verbose: true }); }
    reset() { 
        this.chess.reset(); 
        this.initializeTables();
    }
    
    // Get legal moves
    getLegalMoves(square = null) {
        return this.chess.moves({ square: square, verbose: true });
    }
    
    // Make a move
    makeMove(move) {
        const result = this.chess.move(move);
        if (result) this.updateHistoryTable(result);
        return result;
    }
    
    // Undo move
    undoMove() {
        return this.chess.undo();
    }
    
    // Set difficulty
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.difficulty = difficulty;
        }
    }
    
    // Get AI move with thinking time
    async getBestMove() {
        if (this.chess.isGameOver()) return null;
        
        const settings = this.difficulties[this.difficulty];
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        
        // Add thinking time simulation
        await new Promise(resolve => setTimeout(resolve, settings.thinking));
        
        // Add randomness for easier difficulties
        if (Math.random() < settings.randomness) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        // Use iterative deepening
        let bestMove = null;
        let bestScore = -Infinity;
        
        try {
            for (let depth = 1; depth <= settings.depth; depth++) {
                const result = this.searchBestMove(depth);
                if (result) {
                    bestMove = result.move;
                    bestScore = result.score;
                }
            }
        } catch (error) {
            console.error('Error in AI calculation:', error);
        }
        
        return bestMove || moves[0];
    }
    
    // Search for best move
    searchBestMove(depth) {
        const moves = this.orderMoves(this.chess.moves({ verbose: true }));
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            this.chess.move(move);
            const score = -this.minimax(depth - 1, -Infinity, Infinity, false);
            this.chess.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return { move: bestMove, score: bestScore };
    }
    
    // Enhanced minimax with alpha-beta pruning
    minimax(depth, alpha, beta, isMaximizing) {
        const alphaOrig = alpha;
        const zobristKey = this.getZobristKey();
        const ttEntry = this.transpositionTable.get(zobristKey);
        
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === 'exact') return ttEntry.score;
            else if (ttEntry.flag === 'lowerbound') alpha = Math.max(alpha, ttEntry.score);
            else if (ttEntry.flag === 'upperbound') beta = Math.min(beta, ttEntry.score);
            
            if (alpha >= beta) return ttEntry.score;
        }
        
        if (depth === 0 || this.chess.isGameOver()) {
            return this.evaluatePosition();
        }
        
        const moves = this.orderMoves(this.chess.moves({ verbose: true }));
        let bestScore = isMaximizing ? -Infinity : Infinity;
        
        for (const move of moves) {
            this.chess.move(move);
            const score = this.minimax(depth - 1, alpha, beta, !isMaximizing);
            this.chess.undo();
            
            if (isMaximizing) {
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
            } else {
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
            }
            
            if (beta <= alpha) {
                this.storeKillerMove(move, depth);
                break;
            }
        }
        
        // Store in transposition table
        const ttFlag = bestScore <= alphaOrig ? 'upperbound' : 
                      bestScore >= beta ? 'lowerbound' : 'exact';
        
        this.transpositionTable.set(zobristKey, {
            depth: depth,
            score: bestScore,
            flag: ttFlag
        });
        
        return bestScore;
    }
    
    // Move ordering for better pruning
    orderMoves(moves) {
        return moves.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            
            // Prioritize captures
            if (a.captured) scoreA += 1000 + this.pieceValues[a.captured];
            if (b.captured) scoreB += 1000 + this.pieceValues[b.captured];
            
            // Prioritize promotions
            if (a.promotion) scoreA += 900;
            if (b.promotion) scoreB += 900;
            
            // History table bonus
            scoreA += this.historyTable[a.san] || 0;
            scoreB += this.historyTable[b.san] || 0;
            
            return scoreB - scoreA;
        });
    }
    
    // Enhanced position evaluation
    evaluatePosition() {
        if (this.chess.isCheckmate()) {
            return this.chess.turn() === 'w' ? -20000 : 20000;
        }
        
        if (this.chess.isStalemate() || this.chess.isDraw()) {
            return 0;
        }
        
        let score = 0;
        const board = this.chess.board();
        
        // Material and positional evaluation
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceValue = this.pieceValues[piece.type];
                    const positionValue = this.getPositionValue(piece.type, row, col, piece.color);
                    const totalValue = pieceValue + positionValue;
                    
                    score += piece.color === 'w' ? totalValue : -totalValue;
                }
            }
        }
        
        // Additional evaluation factors
        score += this.evaluateMobility();
        score += this.evaluatePawnStructure();
        score += this.evaluateKingSafety();
        score += this.evaluateCenterControl();
        score += this.evaluateDevelopment();
        
        return score;
    }
    
    // Position value from piece-square tables
    getPositionValue(pieceType, row, col, color) {
        if (!this.positionTables[pieceType]) return 0;
        
        const table = this.positionTables[pieceType];
        return color === 'b' ? table[7 - row][col] : table[row][col];
    }
    
    // Evaluate mobility
    evaluateMobility() {
        const currentTurn = this.chess.turn();
        const currentMoves = this.chess.moves().length;
        
        // Count opponent moves
        const fen = this.chess.fen();
        const parts = fen.split(' ');
        parts[1] = currentTurn === 'w' ? 'b' : 'w';
        
        this.chess.load(parts.join(' '));
        const opponentMoves = this.chess.moves().length;
        this.chess.load(fen);
        
        return (currentMoves - opponentMoves) * 5;
    }
    
    // Evaluate pawn structure
    evaluatePawnStructure() {
        let score = 0;
        const board = this.chess.board();
        
        for (let col = 0; col < 8; col++) {
            let whitePawns = 0, blackPawns = 0;
            
            for (let row = 0; row < 8; row++) {
                const piece = board[row][col];
                if (piece && piece.type === 'p') {
                    if (piece.color === 'w') whitePawns++;
                    else blackPawns++;
                }
            }
            
            // Penalty for doubled pawns
            if (whitePawns > 1) score -= (whitePawns - 1) * 20;
            if (blackPawns > 1) score += (blackPawns - 1) * 20;
        }
        
        return score;
    }
    
    // Evaluate king safety
    evaluateKingSafety() {
        let score = 0;
        
        if (this.chess.inCheck()) {
            score += this.chess.turn() === 'w' ? -50 : 50;
        }
        
        return score;
    }
    
    // Evaluate center control
    evaluateCenterControl() {
        let score = 0;
        const board = this.chess.board();
        const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        
        for (const [row, col] of centerSquares) {
            const piece = board[row][col];
            if (piece) {
                score += piece.color === 'w' ? 20 : -20;
            }
        }
        
        return score;
    }
    
    // Evaluate development
    evaluateDevelopment() {
        let score = 0;
        const board = this.chess.board();
        
        const initialPositions = {
            'wn': [[7, 1], [7, 6]], 'wb': [[7, 2], [7, 5]],
            'bn': [[0, 1], [0, 6]], 'bb': [[0, 2], [0, 5]]
        };
        
        for (const [key, positions] of Object.entries(initialPositions)) {
            const color = key[0];
            const pieceType = key[1];
            
            for (const [row, col] of positions) {
                const piece = board[row][col];
                if (!piece || piece.type !== pieceType || piece.color !== color) {
                    score += color === 'w' ? 15 : -15;
                }
            }
        }
        
        return score;
    }
    
    // Store killer move
    storeKillerMove(move, depth) {
        if (depth < this.killerMoves.length) {
            const killers = this.killerMoves[depth];
            if (!killers.includes(move.san)) {
                killers.unshift(move.san);
                if (killers.length > 2) killers.pop();
            }
        }
    }
    
    // Update history table
    updateHistoryTable(move) {
        this.historyTable[move.san] = (this.historyTable[move.san] || 0) + 1;
    }
    
    // Simple Zobrist key
    getZobristKey() {
        return this.chess.fen().split(' ')[0];
    }
    
    // Get current evaluation
    getCurrentEvaluation() {
        if (this.chess.isGameOver()) {
            if (this.chess.isCheckmate()) {
                return this.chess.turn() === 'w' ? -999 : 999;
            }
            return 0;
        }
        
        const evaluation = this.evaluatePosition();
        return Math.max(-999, Math.min(999, evaluation / 100));
    }
    
    // Get best move suggestion
    getBestMoveSuggestion() {
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves.slice(0, 5)) {
            this.chess.move(move);
            const score = -this.evaluatePosition();
            this.chess.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
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
    
    // Get game status
    getGameStatus() {
        if (this.chess.isCheckmate()) {
            return this.chess.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
        }
        if (this.chess.isStalemate()) return 'Draw by stalemate';
        if (this.chess.isDraw()) return 'Draw';
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
        const result = this.chess.loadPgn(pgn);
        if (result) this.initializeTables();
        return result;
    }
    
    // Get material balance
    getMaterialBalance() {
        const board = this.chess.board();
        let whiteValue = 0, blackValue = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    if (piece.color === 'w') whiteValue += value;
                    else blackValue += value;
                }
            }
        }
        
        return { white: whiteValue, black: blackValue, difference: whiteValue - blackValue };
    }
    
    // Check if position is tactical
    isTacticalPosition() {
        const moves = this.chess.moves({ verbose: true });
        return moves.some(move => move.captured || move.promotion);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}