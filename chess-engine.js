// Enhanced Chess Engine with Advanced AI and Multiple Difficulty Levels - Fixed Version
class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.chess = new Chess();
        this.transpositionTable = new Map();
        this.killerMoves = [];
        this.historyTable = {};
        this.principalVariation = [];
        
        // Enhanced difficulty settings with more realistic AI behavior
        this.difficulties = {
            'easy': { 
                depth: 2, 
                randomness: 0.4, 
                thinking: 300,
                blunderChance: 0.3,
                rating: 900
            },
            'medium': { 
                depth: 3, 
                randomness: 0.15, 
                thinking: 800,
                blunderChance: 0.1,
                rating: 1400
            },
            'hard': { 
                depth: 4, 
                randomness: 0.05, 
                thinking: 1200,
                blunderChance: 0.03,
                rating: 1800
            },
            'expert': { 
                depth: 5, 
                randomness: 0.02, 
                thinking: 1800,
                blunderChance: 0.01,
                rating: 2200
            }
        };
        
        // Enhanced piece values with positional considerations
        this.pieceValues = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
        };
        
        // Improved piece-square tables
        this.positionTables = {
            'p': [
                [0,   0,   0,   0,   0,   0,   0,   0],
                [50,  50,  50,  50,  50,  50,  50,  50],
                [10,  10,  20,  30,  30,  20,  10,  10],
                [5,   5,   10,  27,  27,  10,  5,   5],
                [0,   0,   0,   25,  25,  0,   0,   0],
                [5,   -5,  -10, 0,   0,   -10, -5,  5],
                [5,   10,  10,  -25, -25, 10,  10,  5],
                [0,   0,   0,   0,   0,   0,   0,   0]
            ],
            'n': [
                [-50, -40, -30, -30, -30, -30, -40, -50],
                [-40, -20, 0,   0,   0,   0,   -20, -40],
                [-30, 0,   10,  15,  15,  10,  0,   -30],
                [-30, 5,   15,  20,  20,  15,  5,   -30],
                [-30, 0,   15,  20,  20,  15,  0,   -30],
                [-30, 5,   10,  15,  15,  10,  5,   -30],
                [-40, -20, 0,   5,   5,   0,   -20, -40],
                [-50, -40, -20, -30, -30, -20, -40, -50]
            ],
            'b': [
                [-20, -10, -10, -10, -10, -10, -10, -20],
                [-10, 0,   0,   0,   0,   0,   0,   -10],
                [-10, 0,   5,   10,  10,  5,   0,   -10],
                [-10, 5,   5,   10,  10,  5,   5,   -10],
                [-10, 0,   10,  10,  10,  10,  0,   -10],
                [-10, 10,  10,  10,  10,  10,  10,  -10],
                [-10, 5,   0,   0,   0,   0,   5,   -10],
                [-20, -10, -40, -10, -10, -40, -10, -20]
            ],
            'r': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5,  10, 10, 10, 10, 10, 10, 5],
                [-5, 0,  0,  0,  0,  0,  0,  -5],
                [-5, 0,  0,  0,  0,  0,  0,  -5],
                [-5, 0,  0,  0,  0,  0,  0,  -5],
                [-5, 0,  0,  0,  0,  0,  0,  -5],
                [-5, 0,  0,  0,  0,  0,  0,  -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            'q': [
                [-20, -10, -10, -5, -5, -10, -10, -20],
                [-10, 0,   0,   0,  0,  0,   0,   -10],
                [-10, 0,   5,   5,  5,  5,   0,   -10],
                [-5,  0,   5,   5,  5,  5,   0,   -5],
                [0,   0,   5,   5,  5,  5,   0,   -5],
                [-10, 5,   5,   5,  5,  5,   0,   -10],
                [-10, 0,   5,   0,  0,  0,   0,   -10],
                [-20, -10, -10, -5, -5, -10, -10, -20]
            ],
            'k': [
                [-30, -40, -40, -50, -50, -40, -40, -30],
                [-30, -40, -40, -50, -50, -40, -40, -30],
                [-30, -40, -40, -50, -50, -40, -40, -30],
                [-30, -40, -40, -50, -50, -40, -40, -30],
                [-20, -30, -30, -40, -40, -30, -30, -20],
                [-10, -20, -20, -20, -20, -20, -20, -10],
                [20,  20,  0,   0,   0,   0,   20,  20],
                [20,  30,  10,  0,   0,   10,  30,  20]
            ]
        };
        
        // Endgame king position table
        this.endgameKingTable = [
            [-50, -40, -30, -20, -20, -30, -40, -50],
            [-30, -20, -10, 0,   0,   -10, -20, -30],
            [-30, -10, 20,  30,  30,  20,  -10, -30],
            [-30, -10, 30,  40,  40,  30,  -10, -30],
            [-30, -10, 30,  40,  40,  30,  -10, -30],
            [-30, -10, 20,  30,  30,  20,  -10, -30],
            [-30, -30, 0,   0,   0,   0,   -30, -30],
            [-50, -30, -30, -30, -30, -30, -30, -50]
        ];
        
        this.initializeTables();
    }
    
    initializeTables() {
        this.killerMoves = Array(10).fill(null).map(() => []);
        this.historyTable = {};
        this.transpositionTable.clear();
        this.principalVariation = [];
    }
    
    // Safe chess.js method wrappers
    isGameOver() {
        try {
            return this.chess.game_over ? this.chess.game_over() : 
                   this.chess.isGameOver ? this.chess.isGameOver() : false;
        } catch (error) {
            console.log('⚠️ Engine isGameOver error:', error);
            return false;
        }
    }
    
    inCheck() {
        try {
            return this.chess.in_check ? this.chess.in_check() : 
                   this.chess.inCheck ? this.chess.inCheck() : false;
        } catch (error) {
            console.log('⚠️ Engine inCheck error:', error);
            return false;
        }
    }
    
    inCheckmate() {
        try {
            return this.chess.in_checkmate ? this.chess.in_checkmate() : 
                   this.chess.isCheckmate ? this.chess.isCheckmate() : false;
        } catch (error) {
            console.log('⚠️ Engine inCheckmate error:', error);
            return false;
        }
    }
    
    inStalemate() {
        try {
            return this.chess.in_stalemate ? this.chess.in_stalemate() : 
                   this.chess.isStalemate ? this.chess.isStalemate() : false;
        } catch (error) {
            console.log('⚠️ Engine inStalemate error:', error);
            return false;
        }
    }
    
    isDraw() {
        try {
            return this.chess.in_draw ? this.chess.in_draw() : 
                   this.chess.isDraw ? this.chess.isDraw() : false;
        } catch (error) {
            console.log('⚠️ Engine isDraw error:', error);
            return false;
        }
    }
    
    // Basic methods
    loadPosition(fen) {
        const result = this.chess.load(fen);
        if (result) this.initializeTables();
        return result;
    }
    
    getFen() { return this.chess.fen(); }
    getBoard() { return this.chess.board(); }
    getTurn() { return this.chess.turn(); }
    getHistory() { return this.chess.history({ verbose: true }); }
    
    reset() { 
        this.chess.reset(); 
        this.initializeTables();
    }
    
    getLegalMoves(square = null) {
        return this.chess.moves({ square: square, verbose: true });
    }
    
    makeMove(move) {
        const result = this.chess.move(move);
        if (result) this.updateHistoryTable(result);
        return result;
    }
    
    undoMove() {
        return this.chess.undo();
    }
    
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.difficulty = difficulty;
            console.log(`🎯 AI difficulty set to: ${difficulty} (${this.difficulties[difficulty].rating} rating)`);
        }
    }
    
    // Enhanced AI move selection
    async getBestMove() {
        if (this.isGameOver()) return null;
        
        const settings = this.difficulties[this.difficulty];
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        
        console.log(`🤖 AI thinking (${this.difficulty} difficulty)...`);
        
        // Add realistic thinking time
        await new Promise(resolve => setTimeout(resolve, settings.thinking));
        
        try {
            // Check for immediate threats/opportunities
            const forcedMove = this.checkForForcedMoves();
            if (forcedMove) {
                console.log('⚡ Found forced move:', forcedMove.san);
                return forcedMove;
            }
            
            // Add some randomness for easier difficulties
            if (Math.random() < settings.randomness) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                console.log('🎲 Playing random move:', randomMove.san);
                return randomMove;
            }
            
            // Simulate blunders for easier difficulties
            if (Math.random() < settings.blunderChance) {
                const blunderMove = this.getBlunderMove(moves);
                if (blunderMove) {
                    console.log('😵 AI blundered:', blunderMove.san);
                    return blunderMove;
                }
            }
            
            // Use iterative deepening for best move
            let bestMove = null;
            let bestScore = -Infinity;
            
            for (let depth = 1; depth <= settings.depth; depth++) {
                const result = this.searchBestMove(depth);
                if (result && result.move) {
                    bestMove = result.move;
                    bestScore = result.score;
                    console.log(`🔍 Depth ${depth}: ${bestMove.san} (${bestScore.toFixed(2)})`);
                }
            }
            
            return bestMove || moves[0];
            
        } catch (error) {
            console.error('❌ AI calculation error:', error);
            return moves[0]; // Fallback to first legal move
        }
    }
    
    // Check for forced moves (checkmate, check evasion, captures)
    checkForForcedMoves() {
        const moves = this.chess.moves({ verbose: true });
        
        // Check for checkmate in one
        for (const move of moves) {
            this.chess.move(move);
            if (this.inCheckmate()) {
                this.chess.undo();
                return move;
            }
            this.chess.undo();
        }
        
        // If in check, prioritize check evasion
        if (this.inCheck()) {
            return moves[0]; // First legal move when in check
        }
        
        // Look for good captures
        const captures = moves.filter(move => move.captured);
        if (captures.length > 0) {
            // Sort captures by captured piece value
            captures.sort((a, b) => this.pieceValues[b.captured] - this.pieceValues[a.captured]);
            
            // Return best capture if it's clearly winning
            const bestCapture = captures[0];
            if (this.pieceValues[bestCapture.captured] >= this.pieceValues[bestCapture.piece]) {
                return bestCapture;
            }
        }
        
        return null;
    }
    
    // Generate a blunder move for easier difficulties
    getBlunderMove(moves) {
        const badMoves = moves.filter(move => {
            this.chess.move(move);
            const isBlunder = this.inCheck() || this.isHangingPiece(move.to);
            this.chess.undo();
            return isBlunder;
        });
        
        if (badMoves.length > 0) {
            return badMoves[Math.floor(Math.random() * badMoves.length)];
        }
        
        return null;
    }
    
    // Check if a piece is hanging (undefended)
    isHangingPiece(square) {
        const piece = this.chess.get(square);
        if (!piece) return false;
        
        // Simple hanging piece detection
        const attackers = this.getAttackers(square, piece.color === 'w' ? 'b' : 'w');
        const defenders = this.getAttackers(square, piece.color);
        
        return attackers.length > 0 && defenders.length === 0;
    }
    
    // Get pieces attacking a square
    getAttackers(square, color) {
        const moves = this.chess.moves({ verbose: true });
        return moves.filter(move => move.to === square && this.chess.get(move.from).color === color);
    }
    
    // Enhanced minimax search
    searchBestMove(depth) {
        const moves = this.orderMoves(this.chess.moves({ verbose: true }));
        let bestMove = null;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;
        
        for (const move of moves) {
            this.chess.move(move);
            const score = -this.minimax(depth - 1, -beta, -alpha, false);
            this.chess.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        
        return { move: bestMove, score: bestScore };
    }
    
    // Minimax with alpha-beta pruning and enhancements
    minimax(depth, alpha, beta, isMaximizing) {
        const alphaOrig = alpha;
        const zobristKey = this.getZobristKey();
        
        // Transposition table lookup
        const ttEntry = this.transpositionTable.get(zobristKey);
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === 'exact') return ttEntry.score;
            else if (ttEntry.flag === 'lowerbound') alpha = Math.max(alpha, ttEntry.score);
            else if (ttEntry.flag === 'upperbound') beta = Math.min(beta, ttEntry.score);
            
            if (alpha >= beta) return ttEntry.score;
        }
        
        // Terminal node evaluation
        if (depth === 0 || this.isGameOver()) {
            return this.quiescenceSearch(alpha, beta, 0);
        }
        
        const moves = this.orderMoves(this.chess.moves({ verbose: true }));
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let bestMove = null;
        
        for (const move of moves) {
            this.chess.move(move);
            const score = this.minimax(depth - 1, alpha, beta, !isMaximizing);
            this.chess.undo();
            
            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, score);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
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
            flag: ttFlag,
            move: bestMove
        });
        
        return bestScore;
    }
    
    // Quiescence search for tactical stability
    quiescenceSearch(alpha, beta, depth) {
        const maxDepth = 4;
        
        const standPat = this.evaluatePosition();
        
        if (depth >= maxDepth) return standPat;
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;
        
        // Only consider captures and checks
        const moves = this.chess.moves({ verbose: true })
            .filter(move => move.captured || move.san.includes('+'));
        
        if (moves.length === 0) return standPat;
        
        const orderedMoves = this.orderMoves(moves);
        
        for (const move of orderedMoves) {
            this.chess.move(move);
            const score = -this.quiescenceSearch(-beta, -alpha, depth + 1);
            this.chess.undo();
            
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        
        return alpha;
    }
    
    // Enhanced move ordering for better pruning
    orderMoves(moves) {
        return moves.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            
            // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
            if (a.captured) {
                scoreA += 1000 + this.pieceValues[a.captured] - this.pieceValues[a.piece];
            }
            if (b.captured) {
                scoreB += 1000 + this.pieceValues[b.captured] - this.pieceValues[b.piece];
            }
            
            // Promotions
            if (a.promotion) scoreA += 900;
            if (b.promotion) scoreB += 900;
            
            // Checks
            if (a.san.includes('+')) scoreA += 100;
            if (b.san.includes('+')) scoreB += 100;
            
            // Castling
            if (a.flags.includes('k') || a.flags.includes('q')) scoreA += 50;
            if (b.flags.includes('k') || b.flags.includes('q')) scoreB += 50;
            
            // History table
            scoreA += this.historyTable[a.san] || 0;
            scoreB += this.historyTable[b.san] || 0;
            
            // Killer moves
            if (this.killerMoves.some(level => level.includes(a.san))) scoreA += 80;
            if (this.killerMoves.some(level => level.includes(b.san))) scoreB += 80;
            
            return scoreB - scoreA;
        });
    }
    
    // Enhanced position evaluation
    evaluatePosition() {
        if (this.inCheckmate()) {
            return this.chess.turn() === 'w' ? -20000 : 20000;
        }
        
        if (this.inStalemate() || this.isDraw()) {
            return 0;
        }
        
        let score = 0;
        const board = this.chess.board();
        
        // Material and positional evaluation
        let whiteKingPos = null, blackKingPos = null;
        let whitePieces = 0, blackPieces = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceValue = this.pieceValues[piece.type];
                    let positionValue = 0;
                    
                    if (piece.type === 'k') {
                        if (piece.color === 'w') whiteKingPos = { row, col };
                        else blackKingPos = { row, col };
                        
                        // Use endgame king table if few pieces remain
                        if (whitePieces + blackPieces < 10) {
                            positionValue = this.getPositionValue('k', row, col, piece.color, this.endgameKingTable);
                        } else {
                            positionValue = this.getPositionValue('k', row, col, piece.color);
                        }
                    } else {
                        positionValue = this.getPositionValue(piece.type, row, col, piece.color);
                    }
                    
                    const totalValue = pieceValue + positionValue;
                    
                    if (piece.color === 'w') {
                        score += totalValue;
                        whitePieces++;
                    } else {
                        score -= totalValue;
                        blackPieces++;
                    }
                }
            }
        }
        
        // Additional evaluation factors
        score += this.evaluateMobility();
        score += this.evaluatePawnStructure();
        score += this.evaluateKingSafety();
        score += this.evaluateCenterControl();
        score += this.evaluateDevelopment();
        score += this.evaluatePieceCoordination();
        
        return score;
    }
    
    // Get position value from piece-square tables
    getPositionValue(pieceType, row, col, color, customTable = null) {
        const table = customTable || this.positionTables[pieceType];
        if (!table) return 0;
        
        const adjustedRow = color === 'b' ? 7 - row : row;
        return table[adjustedRow][col];
    }
    
    // Evaluate mobility (number of legal moves)
    evaluateMobility() {
        const currentTurn = this.chess.turn();
        const currentMoves = this.chess.moves().length;
        
        // Temporarily switch turns to count opponent moves
        const fen = this.chess.fen();
        const parts = fen.split(' ');
        parts[1] = currentTurn === 'w' ? 'b' : 'w';
        
        try {
            this.chess.load(parts.join(' '));
            const opponentMoves = this.chess.moves().length;
            this.chess.load(fen);
            
            return (currentMoves - opponentMoves) * 3;
        } catch (error) {
            this.chess.load(fen);
            return 0;
        }
    }
    
    // Evaluate pawn structure
    evaluatePawnStructure() {
        let score = 0;
        const board = this.chess.board();
        
        // Check for doubled, isolated, and passed pawns
        for (let col = 0; col < 8; col++) {
            let whitePawns = [], blackPawns = [];
            
            for (let row = 0; row < 8; row++) {
                const piece = board[row][col];
                if (piece && piece.type === 'p') {
                    if (piece.color === 'w') whitePawns.push(row);
                    else blackPawns.push(row);
                }
            }
            
            // Doubled pawns penalty
            if (whitePawns.length > 1) score -= (whitePawns.length - 1) * 25;
            if (blackPawns.length > 1) score += (blackPawns.length - 1) * 25;
            
            // Isolated pawns penalty
            if (whitePawns.length > 0 && this.isIsolatedPawn(col, 'w', board)) score -= 20;
            if (blackPawns.length > 0 && this.isIsolatedPawn(col, 'b', board)) score += 20;
        }
        
        return score;
    }
    
    // Check if pawn is isolated
    isIsolatedPawn(col, color, board) {
        const adjacentCols = [col - 1, col + 1].filter(c => c >= 0 && c < 8);
        
        for (const adjCol of adjacentCols) {
            for (let row = 0; row < 8; row++) {
                const piece = board[row][adjCol];
                if (piece && piece.type === 'p' && piece.color === color) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Evaluate king safety
    evaluateKingSafety() {
        let score = 0;
        
        if (this.inCheck()) {
            score += this.chess.turn() === 'w' ? -50 : 50;
        }
        
        // Penalize exposed king
        const board = this.chess.board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k') {
                    const kingSafety = this.calculateKingSafety(row, col, piece.color, board);
                    score += piece.color === 'w' ? kingSafety : -kingSafety;
                }
            }
        }
        
        return score;
    }
    
    // Calculate king safety based on surrounding pieces
    calculateKingSafety(row, col, color, board) {
        let safety = 0;
        const directions = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const piece = board[newRow][newCol];
                if (piece && piece.color === color) {
                    safety += piece.type === 'p' ? 10 : 5;
                }
            }
        }
        
        return safety;
    }
    
    // Evaluate center control
    evaluateCenterControl() {
        let score = 0;
        const board = this.chess.board();
        const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        const extendedCenter = [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 5], [4, 2], [4, 5], [5, 2], [5, 3], [5, 4], [5, 5]];
        
        // Center control
        for (const [row, col] of centerSquares) {
            const piece = board[row][col];
            if (piece) {
                score += piece.color === 'w' ? 30 : -30;
            }
        }
        
        // Extended center control
        for (const [row, col] of extendedCenter) {
            const piece = board[row][col];
            if (piece) {
                score += piece.color === 'w' ? 10 : -10;
            }
        }
        
        return score;
    }
    
    // Evaluate piece development
    evaluateDevelopment() {
        let score = 0;
        const board = this.chess.board();
        
        // Knights and bishops developed
        const startingPositions = {
            'wn': [[7, 1], [7, 6]], 'wb': [[7, 2], [7, 5]],
            'bn': [[0, 1], [0, 6]], 'bb': [[0, 2], [0, 5]]
        };
        
        for (const [key, positions] of Object.entries(startingPositions)) {
            const color = key[0];
            const pieceType = key[1];
            
            for (const [row, col] of positions) {
                const piece = board[row][col];
                if (!piece || piece.type !== pieceType || piece.color !== color) {
                    score += color === 'w' ? 15 : -15;
                }
            }
        }
        
        // Castling rights
        const castlingRights = this.chess.fen().split(' ')[2];
        if (castlingRights.includes('K')) score += 20;
        if (castlingRights.includes('Q')) score += 15;
        if (castlingRights.includes('k')) score -= 20;
        if (castlingRights.includes('q')) score -= 15;
        
        return score;
    }
    
    // Evaluate piece coordination
    evaluatePieceCoordination() {
        let score = 0;
        const moves = this.chess.moves({ verbose: true });
        
        // Bonus for pieces that can support each other
        const supportingMoves = moves.filter(move => {
            this.chess.move(move);
            const newMoves = this.chess.moves({ verbose: true });
            this.chess.undo();
            return newMoves.length > moves.length;
        });
        
        score += supportingMoves.length * 2;
        
        return score;
    }
    
    // Store killer move
    storeKillerMove(move, depth) {
        if (depth >= 0 && depth < this.killerMoves.length) {
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
    
    // Simple Zobrist key for transposition table
    getZobristKey() {
        return this.chess.fen().split(' ').slice(0, 2).join(' ');
    }
    
    // Get current evaluation for display
    getCurrentEvaluation() {
        try {
            if (this.isGameOver()) {
                if (this.inCheckmate()) {
                    return this.chess.turn() === 'w' ? -999 : 999;
                }
                return 0;
            }
            
            const evaluation = this.evaluatePosition();
            return Math.max(-999, Math.min(999, evaluation / 100));
        } catch (error) {
            console.log('🔍 Engine getCurrentEvaluation error:', error);
            return 0;
        }
    }
    
    // Get best move suggestion for analysis
    getBestMoveSuggestion() {
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves.slice(0, 8)) {
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
    
    // Get enhanced game status
    getGameStatus() {
        if (this.inCheckmate()) {
            return this.chess.turn() === 'w' ? '🏆 Black wins by checkmate!' : '🏆 White wins by checkmate!';
        }
        if (this.inStalemate()) return '🤝 Draw by stalemate';
        if (this.isDraw()) return '🤝 Draw by repetition/50-move rule';
        if (this.inCheck()) {
            return this.chess.turn() === 'w' ? '⚠️ White is in check!' : '⚠️ Black is in check!';
        }
        return this.chess.turn() === 'w' ? '⚪ White to move' : '⚫ Black to move';
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
        const tacticalMoves = moves.filter(move => 
            move.captured || move.promotion || move.san.includes('+') || move.san.includes('#')
        );
        return tacticalMoves.length > 0;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}
