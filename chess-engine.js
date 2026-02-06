// Chess.js v0.10.3 compatibility (snake_case API)
const ChessCompat = {
    isGameOver: c => c.game_over(),
    inCheck: c => c.in_check(),
    isCheckmate: c => c.in_checkmate(),
    isStalemate: c => c.in_stalemate(),
    isDraw: c => c.in_draw(),
    isThreefoldRepetition: c => c.in_threefold_repetition(),
    isInsufficientMaterial: c => c.insufficient_material()
};

class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.chess = new Chess();
        this.transpositionTable = new Map();
        this.killerMoves = [];
        this.historyTable = {};
        this.ttMaxSize = 500000;
        this.ttGeneration = 0;

        this.difficulties = {
            'easy':   { depth: 3, randomness: 0.35, thinking: 300, blunderChance: 0.25, rating: 1000 },
            'medium': { depth: 4, randomness: 0.10, thinking: 800, blunderChance: 0.05, rating: 1500 },
            'hard':   { depth: 5, randomness: 0.02, thinking: 1200, blunderChance: 0.01, rating: 1900 },
            'expert': { depth: 6, randomness: 0.00, thinking: 2000, blunderChance: 0.00, rating: 2300 }
        };

        this.pieceValues = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };

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

        this._buildOpeningBook();
        this.initializeTables();
    }

    _buildOpeningBook() {
        // Keyed by SAN move sequence. Each value: array of {san, weight}.
        this.openingBook = {
            '': [
                { san: 'e4', weight: 40 }, { san: 'd4', weight: 35 },
                { san: 'Nf3', weight: 15 }, { san: 'c4', weight: 10 }
            ],
            'e4': [
                { san: 'e5', weight: 30 }, { san: 'c5', weight: 30 },
                { san: 'e6', weight: 15 }, { san: 'c6', weight: 15 },
                { san: 'd5', weight: 10 }
            ],
            'e4 e5': [
                { san: 'Nf3', weight: 60 }, { san: 'Bc4', weight: 15 },
                { san: 'Nc3', weight: 15 }, { san: 'f4', weight: 10 }
            ],
            'e4 e5 Nf3': [
                { san: 'Nc6', weight: 60 }, { san: 'Nf6', weight: 25 },
                { san: 'd6', weight: 15 }
            ],
            'e4 e5 Nf3 Nc6': [
                { san: 'Bb5', weight: 40 }, { san: 'Bc4', weight: 35 },
                { san: 'd4', weight: 15 }, { san: 'Nc3', weight: 10 }
            ],
            'e4 e5 Nf3 Nc6 Bb5': [
                { san: 'a6', weight: 50 }, { san: 'Nf6', weight: 30 },
                { san: 'Bc5', weight: 20 }
            ],
            'e4 e5 Nf3 Nc6 Bb5 a6': [
                { san: 'Ba4', weight: 60 }, { san: 'Bxc6', weight: 40 }
            ],
            'e4 e5 Nf3 Nc6 Bc4': [
                { san: 'Bc5', weight: 40 }, { san: 'Nf6', weight: 40 },
                { san: 'd6', weight: 20 }
            ],
            'e4 e5 Nf3 Nc6 Bc4 Bc5': [
                { san: 'c3', weight: 40 }, { san: 'd3', weight: 30 },
                { san: 'b4', weight: 30 }
            ],
            'e4 c5': [
                { san: 'Nf3', weight: 60 }, { san: 'Nc3', weight: 20 },
                { san: 'c3', weight: 20 }
            ],
            'e4 c5 Nf3': [
                { san: 'd6', weight: 40 }, { san: 'Nc6', weight: 30 },
                { san: 'e6', weight: 30 }
            ],
            'e4 c5 Nf3 d6': [
                { san: 'd4', weight: 80 }, { san: 'Bb5+', weight: 20 }
            ],
            'e4 c5 Nf3 d6 d4': [
                { san: 'cxd4', weight: 90 }, { san: 'Nf6', weight: 10 }
            ],
            'e4 c5 Nf3 d6 d4 cxd4': [
                { san: 'Nxd4', weight: 100 }
            ],
            'e4 c5 Nf3 d6 d4 cxd4 Nxd4': [
                { san: 'Nf6', weight: 60 }, { san: 'g6', weight: 20 },
                { san: 'Nc6', weight: 20 }
            ],
            'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6': [
                { san: 'Nc3', weight: 90 }, { san: 'f3', weight: 10 }
            ],
            'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3': [
                { san: 'a6', weight: 40 }, { san: 'e5', weight: 30 },
                { san: 'Nc6', weight: 30 }
            ],
            'e4 e6': [
                { san: 'd4', weight: 80 }, { san: 'd3', weight: 20 }
            ],
            'e4 e6 d4': [
                { san: 'd5', weight: 90 }, { san: 'b6', weight: 10 }
            ],
            'e4 e6 d4 d5': [
                { san: 'Nc3', weight: 40 }, { san: 'Nd2', weight: 30 },
                { san: 'e5', weight: 30 }
            ],
            'e4 c6': [
                { san: 'd4', weight: 70 }, { san: 'Nc3', weight: 20 },
                { san: 'Nf3', weight: 10 }
            ],
            'e4 c6 d4': [
                { san: 'd5', weight: 90 }, { san: 'g6', weight: 10 }
            ],
            'e4 c6 d4 d5': [
                { san: 'Nc3', weight: 40 }, { san: 'Nd2', weight: 30 },
                { san: 'e5', weight: 20 }, { san: 'exd5', weight: 10 }
            ],
            'e4 d5': [
                { san: 'exd5', weight: 70 }, { san: 'e5', weight: 20 },
                { san: 'Nc3', weight: 10 }
            ],
            'e4 e5 Nf3 Nf6': [
                { san: 'Nxe5', weight: 50 }, { san: 'Nc3', weight: 30 },
                { san: 'd4', weight: 20 }
            ],
            'd4': [
                { san: 'd5', weight: 30 }, { san: 'Nf6', weight: 40 },
                { san: 'e6', weight: 15 }, { san: 'f5', weight: 15 }
            ],
            'd4 d5': [
                { san: 'c4', weight: 50 }, { san: 'Nf3', weight: 25 },
                { san: 'Bf4', weight: 25 }
            ],
            'd4 d5 c4': [
                { san: 'e6', weight: 35 }, { san: 'dxc4', weight: 25 },
                { san: 'c6', weight: 25 }, { san: 'Nf6', weight: 15 }
            ],
            'd4 d5 c4 e6': [
                { san: 'Nc3', weight: 50 }, { san: 'Nf3', weight: 40 },
                { san: 'cxd5', weight: 10 }
            ],
            'd4 d5 c4 e6 Nc3': [
                { san: 'Nf6', weight: 50 }, { san: 'Be7', weight: 30 },
                { san: 'c6', weight: 20 }
            ],
            'd4 d5 c4 dxc4': [
                { san: 'Nf3', weight: 40 }, { san: 'e3', weight: 40 },
                { san: 'e4', weight: 20 }
            ],
            'd4 d5 c4 c6': [
                { san: 'Nf3', weight: 50 }, { san: 'Nc3', weight: 40 },
                { san: 'e3', weight: 10 }
            ],
            'd4 d5 Bf4': [
                { san: 'Nf6', weight: 40 }, { san: 'c5', weight: 30 },
                { san: 'e6', weight: 30 }
            ],
            'd4 Nf6': [
                { san: 'c4', weight: 50 }, { san: 'Nf3', weight: 25 },
                { san: 'Bf4', weight: 25 }
            ],
            'd4 Nf6 c4': [
                { san: 'g6', weight: 30 }, { san: 'e6', weight: 35 },
                { san: 'e5', weight: 20 }, { san: 'c5', weight: 15 }
            ],
            'd4 Nf6 c4 g6': [
                { san: 'Nc3', weight: 60 }, { san: 'Nf3', weight: 30 },
                { san: 'g3', weight: 10 }
            ],
            'd4 Nf6 c4 g6 Nc3': [
                { san: 'Bg7', weight: 80 }, { san: 'd5', weight: 20 }
            ],
            'd4 Nf6 c4 g6 Nc3 Bg7': [
                { san: 'e4', weight: 50 }, { san: 'Nf3', weight: 40 },
                { san: 'g3', weight: 10 }
            ],
            'd4 Nf6 c4 e6': [
                { san: 'Nc3', weight: 50 }, { san: 'Nf3', weight: 40 },
                { san: 'g3', weight: 10 }
            ],
            'd4 Nf6 c4 e6 Nc3': [
                { san: 'Bb4', weight: 40 }, { san: 'd5', weight: 35 },
                { san: 'Be7', weight: 25 }
            ],
            'Nf3': [
                { san: 'd5', weight: 35 }, { san: 'Nf6', weight: 35 },
                { san: 'c5', weight: 20 }, { san: 'g6', weight: 10 }
            ],
            'c4': [
                { san: 'e5', weight: 30 }, { san: 'Nf6', weight: 30 },
                { san: 'c5', weight: 20 }, { san: 'e6', weight: 20 }
            ],
            'e4 e5 f4': [
                { san: 'exf4', weight: 50 }, { san: 'd5', weight: 30 },
                { san: 'Bc5', weight: 20 }
            ]
        };
    }

    initializeTables() {
        this.killerMoves = Array(20).fill(null).map(() => []);
        this.historyTable = {};
    }

    reset() {
        this.chess.reset();
        this.transpositionTable.clear();
        this.initializeTables();
    }

    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) this.difficulty = difficulty;
    }

    isGameOver() { return ChessCompat.isGameOver(this.chess); }
    inCheck() { return ChessCompat.inCheck(this.chess); }
    inCheckmate() { return ChessCompat.isCheckmate(this.chess); }
    inStalemate() { return ChessCompat.isStalemate(this.chess); }
    isDraw() { return ChessCompat.isDraw(this.chess); }

    _getBookMove() {
        const history = this.chess.history();
        if (history.length > 14) return null; // past book depth
        const key = history.join(' ');
        const entries = this.openingBook[key];
        if (!entries || entries.length === 0) return null;

        const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;
        for (const entry of entries) {
            roll -= entry.weight;
            if (roll <= 0) {
                const moves = this.chess.moves({ verbose: true });
                return moves.find(m => m.san === entry.san) || null;
            }
        }
        return null;
    }

    async getBestMove() {
        if (this.isGameOver()) return null;

        const settings = this.difficulties[this.difficulty];
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        if (moves.length === 1) {
            await new Promise(r => setTimeout(r, 200));
            return moves[0];
        }

        await new Promise(r => setTimeout(r, settings.thinking));

        const bookMove = this._getBookMove();
        if (bookMove) return bookMove;

        if (Math.random() < settings.randomness) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        if (settings.blunderChance > 0 && Math.random() < settings.blunderChance) {
            const blunder = this._pickBlunderMove(moves);
            if (blunder) return blunder;
        }

        this.ttGeneration++;
        let bestMove = moves[0];
        for (let depth = 1; depth <= settings.depth; depth++) {
            const result = this._searchRoot(moves, depth);
            if (result.move) bestMove = result.move;
        }

        return bestMove;
    }

    _pickBlunderMove(moves) {
        const quiet = moves.filter(m => !m.captured && !m.promotion);
        if (quiet.length === 0) return null;
        const shuffled = quiet.sort(() => Math.random() - 0.5);
        for (const move of shuffled.slice(0, 8)) {
            this.chess.move(move);
            const oppMoves = this.chess.moves({ verbose: true });
            const hangs = oppMoves.some(om => om.captured && this.pieceValues[om.captured] >= 200);
            this.chess.undo();
            if (hangs) return move;
        }
        return null;
    }

    _checkMateInOne() {
        const moves = this.chess.moves({ verbose: true });
        for (const move of moves) {
            this.chess.move(move);
            if (this.inCheckmate()) { this.chess.undo(); return move; }
            this.chess.undo();
        }
        return null;
    }

    _searchRoot(moves, depth) {
        const mateMove = this._checkMateInOne();
        if (mateMove) return { move: mateMove, score: 50000 };

        const ttEntry = this.transpositionTable.get(this._zobristKey());
        const ttMove = ttEntry ? ttEntry.move : null;
        const ordered = this._orderMoves(moves, ttMove);

        let bestMove = ordered[0];
        let bestScore = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;

        for (let i = 0; i < ordered.length; i++) {
            const move = ordered[i];
            this.chess.move(move);
            let score;

            // LMR
            if (i >= 4 && depth >= 3 && !move.captured && !move.promotion && !move.san.includes('+')) {
                score = -this._negamax(depth - 2, -beta, -alpha);
                if (score > alpha) score = -this._negamax(depth - 1, -beta, -alpha);
            } else {
                score = -this._negamax(depth - 1, -beta, -alpha);
            }
            this.chess.undo();

            if (score > bestScore) { bestScore = score; bestMove = move; }
            alpha = Math.max(alpha, score);
        }

        return { move: bestMove, score: bestScore };
    }

    _negamax(depth, alpha, beta) {
        const alphaOrig = alpha;
        const key = this._zobristKey();

        const ttEntry = this.transpositionTable.get(key);
        if (ttEntry && ttEntry.depth >= depth && ttEntry.generation === this.ttGeneration) {
            if (ttEntry.flag === 'exact') return ttEntry.score;
            if (ttEntry.flag === 'lower') alpha = Math.max(alpha, ttEntry.score);
            else if (ttEntry.flag === 'upper') beta = Math.min(beta, ttEntry.score);
            if (alpha >= beta) return ttEntry.score;
        }

        if (depth <= 0 || this.isGameOver()) {
            return this._quiesce(alpha, beta, 0);
        }

        const ttMove = ttEntry ? ttEntry.move : null;
        const moves = this._orderMoves(this.chess.moves({ verbose: true }), ttMove);
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            this.chess.move(move);
            let score;

            // LMR
            if (i >= 4 && depth >= 3 && !move.captured && !move.promotion && !move.san.includes('+')) {
                score = -this._negamax(depth - 2, -beta, -alpha);
                if (score > alpha) score = -this._negamax(depth - 1, -beta, -alpha);
            } else {
                score = -this._negamax(depth - 1, -beta, -alpha);
            }
            this.chess.undo();

            if (score > bestScore) { bestScore = score; bestMove = move; }
            alpha = Math.max(alpha, score);
            if (alpha >= beta) {
                this._storeKiller(move, depth);
                break;
            }
        }

        const flag = bestScore <= alphaOrig ? 'upper' : bestScore >= beta ? 'lower' : 'exact';
        if (this.transpositionTable.size >= this.ttMaxSize) this.transpositionTable.clear();
        this.transpositionTable.set(key, {
            depth, score: bestScore, flag, move: bestMove, generation: this.ttGeneration
        });

        return bestScore;
    }

    _quiesce(alpha, beta, qdepth) {
        const standPat = this._evaluate();
        if (qdepth >= 5) return standPat;
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        const captures = this.chess.moves({ verbose: true })
            .filter(m => m.captured || m.san.includes('+'));
        if (captures.length === 0) return alpha;

        const ordered = this._orderMoves(captures, null);
        for (const move of ordered) {
            this.chess.move(move);
            const score = -this._quiesce(-beta, -alpha, qdepth + 1);
            this.chess.undo();
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    _orderMoves(moves, ttMove) {
        return moves.sort((a, b) => this._moveScore(b, ttMove) - this._moveScore(a, ttMove));
    }

    _moveScore(move, ttMove) {
        let s = 0;
        if (ttMove && move.from === ttMove.from && move.to === ttMove.to) s += 10000;
        if (move.captured) s += 1000 + this.pieceValues[move.captured] - this.pieceValues[move.piece];
        if (move.promotion) s += 900;
        if (move.san.includes('+')) s += 100;
        if (move.flags.includes('k') || move.flags.includes('q')) s += 50;
        s += this.historyTable[move.san] || 0;
        if (this.killerMoves.some(level => level.includes(move.san))) s += 80;
        return s;
    }

    _storeKiller(move, depth) {
        if (depth < 0 || depth >= this.killerMoves.length) return;
        const killers = this.killerMoves[depth];
        if (!killers.includes(move.san)) {
            killers.unshift(move.san);
            if (killers.length > 2) killers.pop();
        }
    }

    _evaluate() {
        if (this.inCheckmate()) return -50000;
        if (this.inStalemate() || this.isDraw()) return 0;

        const board = this.chess.board();
        const turn = this.chess.turn();

        let whiteMaterial = 0, blackMaterial = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece) continue;
                if (piece.color === 'w') whiteMaterial += this.pieceValues[piece.type];
                else blackMaterial += this.pieceValues[piece.type];
            }
        }

        let score = 0;
        let whiteKingPos = null, blackKingPos = null;
        let whiteBishops = 0, blackBishops = 0;
        let whiteRooks = [], blackRooks = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece) continue;

                const val = this.pieceValues[piece.type];
                const posVal = this._positionValue(piece, row, col, whiteMaterial, blackMaterial);
                const total = val + posVal;

                if (piece.color === 'w') {
                    score += total;
                    if (piece.type === 'k') whiteKingPos = { row, col };
                    if (piece.type === 'b') whiteBishops++;
                    if (piece.type === 'r') whiteRooks.push({ row, col });
                } else {
                    score -= total;
                    if (piece.type === 'k') blackKingPos = { row, col };
                    if (piece.type === 'b') blackBishops++;
                    if (piece.type === 'r') blackRooks.push({ row, col });
                }
            }
        }

        if (whiteBishops >= 2) score += 50;
        if (blackBishops >= 2) score -= 50;

        score += this._evaluateRooks(whiteRooks, board, 'w');
        score -= this._evaluateRooks(blackRooks, board, 'b');
        score += this._evaluatePawnStructure(board);
        score += this._evaluatePassedPawns(board);

        const totalMat = whiteMaterial + blackMaterial - 40000;
        if (totalMat > 2500) {
            score += this._kingSafety(whiteKingPos, board, 'w');
            score -= this._kingSafety(blackKingPos, board, 'b');
        }

        score += this._centerControl(board);
        score += this._development(board);

        if (this.inCheck()) score += turn === 'w' ? -30 : 30;

        if (totalMat < 2000 && whiteKingPos && blackKingPos) {
            if (whiteMaterial > blackMaterial + 200) {
                score += this._matingDrive(blackKingPos, whiteKingPos);
            } else if (blackMaterial > whiteMaterial + 200) {
                score -= this._matingDrive(whiteKingPos, blackKingPos);
            }
        }

        return turn === 'w' ? score : -score;
    }

    _positionValue(piece, row, col, whiteMat, blackMat) {
        if (piece.type === 'k') {
            const totalMat = whiteMat + blackMat - 40000;
            const table = totalMat < 2000 ? this.endgameKingTable : this.positionTables['k'];
            const r = piece.color === 'b' ? 7 - row : row;
            return table[r][col];
        }
        const table = this.positionTables[piece.type];
        if (!table) return 0;
        const r = piece.color === 'b' ? 7 - row : row;
        return table[r][col];
    }

    _evaluateRooks(rooks, board, color) {
        let score = 0;
        for (const rook of rooks) {
            let friendlyPawn = false, enemyPawn = false;
            for (let r = 0; r < 8; r++) {
                const p = board[r][rook.col];
                if (p && p.type === 'p') {
                    if (p.color === color) friendlyPawn = true;
                    else enemyPawn = true;
                }
            }
            if (!friendlyPawn && !enemyPawn) score += 25;
            else if (!friendlyPawn) score += 15;

            const seventhRank = color === 'w' ? 1 : 6;
            if (rook.row === seventhRank) score += 20;
        }
        if (rooks.length === 2) {
            if (rooks[0].row === rooks[1].row || rooks[0].col === rooks[1].col) {
                score += 15;
            }
        }
        return score;
    }

    _evaluatePawnStructure(board) {
        let score = 0;
        for (let col = 0; col < 8; col++) {
            let wp = 0, bp = 0;
            for (let row = 0; row < 8; row++) {
                const p = board[row][col];
                if (p && p.type === 'p') { if (p.color === 'w') wp++; else bp++; }
            }
            if (wp > 1) score -= (wp - 1) * 25;
            if (bp > 1) score += (bp - 1) * 25;
            if (wp > 0 && this._isIsolated(col, 'w', board)) score -= 20;
            if (bp > 0 && this._isIsolated(col, 'b', board)) score += 20;
        }
        return score;
    }

    _isIsolated(col, color, board) {
        for (const adjCol of [col - 1, col + 1]) {
            if (adjCol < 0 || adjCol > 7) continue;
            for (let row = 0; row < 8; row++) {
                const p = board[row][adjCol];
                if (p && p.type === 'p' && p.color === color) return false;
            }
        }
        return true;
    }

    _evaluatePassedPawns(board) {
        let score = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const p = board[row][col];
                if (!p || p.type !== 'p') continue;
                if (this._isPassed(row, col, p.color, board)) {
                    const rank = p.color === 'w' ? (7 - row) : row;
                    const bonus = [0, 10, 20, 40, 60, 100, 150, 0][rank];
                    score += p.color === 'w' ? bonus : -bonus;
                }
            }
        }
        return score;
    }

    _isPassed(row, col, color, board) {
        const dir = color === 'w' ? -1 : 1;
        const end = color === 'w' ? 0 : 7;
        for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
            for (let r = row + dir; color === 'w' ? r >= end : r <= end; r += dir) {
                const p = board[r][c];
                if (p && p.type === 'p' && p.color !== color) return false;
            }
        }
        return true;
    }

    _kingSafety(kingPos, board, color) {
        if (!kingPos) return 0;
        let safety = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = kingPos.row + dr, c = kingPos.col + dc;
                if (r < 0 || r > 7 || c < 0 || c > 7) continue;
                const p = board[r][c];
                if (p && p.color === color) safety += p.type === 'p' ? 10 : 5;
            }
        }
        return safety;
    }

    _centerControl(board) {
        let score = 0;
        const center = [[3,3],[3,4],[4,3],[4,4]];
        const extended = [[2,2],[2,3],[2,4],[2,5],[3,2],[3,5],[4,2],[4,5],[5,2],[5,3],[5,4],[5,5]];
        for (const [r,c] of center) {
            const p = board[r][c];
            if (p) score += p.color === 'w' ? 30 : -30;
        }
        for (const [r,c] of extended) {
            const p = board[r][c];
            if (p) score += p.color === 'w' ? 10 : -10;
        }
        return score;
    }

    _development(board) {
        let score = 0;
        const starts = { wn: [[7,1],[7,6]], wb: [[7,2],[7,5]], bn: [[0,1],[0,6]], bb: [[0,2],[0,5]] };
        for (const [key, positions] of Object.entries(starts)) {
            const color = key[0], type = key[1];
            for (const [r, c] of positions) {
                const p = board[r][c];
                if (!p || p.type !== type || p.color !== color) {
                    score += color === 'w' ? 15 : -15;
                }
            }
        }
        const castling = this.chess.fen().split(' ')[2];
        if (castling.includes('K')) score += 20;
        if (castling.includes('Q')) score += 15;
        if (castling.includes('k')) score -= 20;
        if (castling.includes('q')) score -= 15;
        return score;
    }

    _matingDrive(losingKingPos, winningKingPos) {
        const centerDist = Math.abs(3.5 - losingKingPos.col) + Math.abs(3.5 - losingKingPos.row);
        const kingDist = Math.abs(winningKingPos.row - losingKingPos.row) + Math.abs(winningKingPos.col - losingKingPos.col);
        return centerDist * 10 + (14 - kingDist) * 5;
    }

    _zobristKey() {
        return this.chess.fen().split(' ').slice(0, 4).join(' ');
    }

    getCurrentEvaluation() {
        if (this.isGameOver()) {
            if (this.inCheckmate()) return this.chess.turn() === 'w' ? -999 : 999;
            return 0;
        }
        const relScore = this._evaluate();
        const whiteScore = this.chess.turn() === 'w' ? relScore : -relScore;
        return Math.max(-999, Math.min(999, whiteScore / 100));
    }

    getBestMoveSuggestion() {
        const moves = this.chess.moves({ verbose: true });
        if (moves.length === 0) return null;
        const result = this._searchRoot(moves, 3);
        return result.move || moves[0];
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}
