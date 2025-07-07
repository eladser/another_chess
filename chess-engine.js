// Enhanced Chess Engine with Fixed AI Logic
class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = {
            'easy': 2,
            'medium': 4,
            'hard': 6
        };
        this.pieceValues = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
            'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
        };
        
        // Enhanced position value tables
        this.positionValues = {
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
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    // Get the best move for the AI
    getBestMove(board, isWhite) {
        const depth = this.depths[this.difficulty];
        const result = this.minimax(board, depth, -Infinity, Infinity, isWhite);
        
        // Add some randomness for easy difficulty
        if (this.difficulty === 'easy' && Math.random() < 0.2) {
            const allMoves = this.getAllValidMoves(board, isWhite);
            if (allMoves.length > 0) {
                return allMoves[Math.floor(Math.random() * allMoves.length)];
            }
        }
        
        return result.move;
    }
    
    // Enhanced minimax with better evaluation
    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.isGameOver(board)) {
            return { score: this.evaluateBoard(board), move: null };
        }
        
        const moves = this.getAllValidMoves(board, isMaximizing);
        
        if (moves.length === 0) {
            const score = this.isInCheck(board, isMaximizing) ? -20000 : 0;
            return { score: isMaximizing ? score : -score, move: null };
        }
        
        // Sort moves for better pruning
        moves.sort((a, b) => this.scoreMoveQuick(board, b) - this.scoreMoveQuick(board, a));
        
        let bestMove = null;
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const result = this.minimax(newBoard, depth - 1, alpha, beta, false);
                
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const result = this.minimax(newBoard, depth - 1, alpha, beta, true);
                
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            
            return { score: minScore, move: bestMove };
        }
    }
    
    scoreMoveQuick(board, move) {
        let score = 0;
        const capturedPiece = board[move.to.row][move.to.col];
        
        if (capturedPiece) {
            score += this.pieceValues[capturedPiece];
        }
        
        return score;
    }
    
    // Enhanced board evaluation
    evaluateBoard(board) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece !== null) {
                    const pieceValue = this.pieceValues[piece];
                    const positionValue = this.getPositionValue(piece, row, col);
                    
                    if (piece === piece.toUpperCase()) {
                        // White piece
                        score += pieceValue + positionValue;
                    } else {
                        // Black piece
                        score -= pieceValue + positionValue;
                    }
                }
            }
        }
        
        // Add bonus for castling rights, pawn structure, etc.
        score += this.evaluateSpecialFeatures(board);
        
        return score;
    }
    
    evaluateSpecialFeatures(board) {
        let score = 0;
        
        // Bonus for controlling center
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [row, col] of centerSquares) {
            const piece = board[row][col];
            if (piece) {
                const bonus = piece === piece.toUpperCase() ? 10 : -10;
                score += bonus;
            }
        }
        
        // Bonus for piece development
        score += this.evaluateDevelopment(board);
        
        return score;
    }
    
    evaluateDevelopment(board) {
        let score = 0;
        
        // Check if knights and bishops are developed
        const initialPositions = {
            'N': [[7,1], [7,6]],
            'B': [[7,2], [7,5]],
            'n': [[0,1], [0,6]],
            'b': [[0,2], [0,5]]
        };
        
        for (const [piece, positions] of Object.entries(initialPositions)) {
            for (const [row, col] of positions) {
                if (board[row][col] !== piece) {
                    // Piece has moved (developed)
                    const bonus = piece === piece.toUpperCase() ? 15 : -15;
                    score += bonus;
                }
            }
        }
        
        return score;
    }
    
    // Enhanced position value calculation
    getPositionValue(piece, row, col) {
        const pieceType = piece.toLowerCase();
        if (!this.positionValues[pieceType]) return 0;
        
        const table = this.positionValues[pieceType];
        
        // Flip the table for black pieces
        if (piece === piece.toLowerCase()) {
            return table[7 - row][col];
        } else {
            return table[row][col];
        }
    }
    
    // Check if king is in check
    isInCheck(board, isWhite) {
        const kingSymbol = isWhite ? 'K' : 'k';
        let kingPos = null;
        
        // Find king position
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === kingSymbol) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && (piece === piece.toUpperCase()) !== isWhite) {
                    const moves = this.getValidMoves(board, row, col);
                    for (const move of moves) {
                        if (move.to.row === kingPos.row && move.to.col === kingPos.col) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    // Get all valid moves for a color
    getAllValidMoves(board, isWhite) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece !== null) {
                    const pieceIsWhite = piece === piece.toUpperCase();
                    if (pieceIsWhite === isWhite) {
                        const pieceMoves = this.getValidMoves(board, row, col);
                        moves.push(...pieceMoves);
                    }
                }
            }
        }
        
        return moves;
    }
    
    // Get valid moves for a piece at a specific position
    getValidMoves(board, row, col) {
        const piece = board[row][col];
        if (piece === null) return [];
        
        const moves = [];
        const pieceType = piece.toLowerCase();
        const isWhite = piece === piece.toUpperCase();
        
        switch (pieceType) {
            case 'p':
                moves.push(...this.getPawnMoves(board, row, col, isWhite));
                break;
            case 'r':
                moves.push(...this.getRookMoves(board, row, col, isWhite));
                break;
            case 'n':
                moves.push(...this.getKnightMoves(board, row, col, isWhite));
                break;
            case 'b':
                moves.push(...this.getBishopMoves(board, row, col, isWhite));
                break;
            case 'q':
                moves.push(...this.getQueenMoves(board, row, col, isWhite));
                break;
            case 'k':
                moves.push(...this.getKingMoves(board, row, col, isWhite));
                break;
        }
        
        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(board, move, isWhite));
    }
    
    wouldBeInCheck(board, move, isWhite) {
        const newBoard = this.makeMove(board, move);
        return this.isInCheck(newBoard, isWhite);
    }
    
    // Enhanced pawn moves
    getPawnMoves(board, row, col, isWhite) {
        const moves = [];
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Forward move
        if (this.isValidSquare(row + direction, col) && board[row + direction][col] === null) {
            moves.push({ from: { row, col }, to: { row: row + direction, col } });
            
            // Double move from starting position
            if (row === startRow && board[row + 2 * direction][col] === null) {
                moves.push({ from: { row, col }, to: { row: row + 2 * direction, col } });
            }
        }
        
        // Capture moves
        for (const captureCol of [col - 1, col + 1]) {
            if (this.isValidSquare(row + direction, captureCol)) {
                const targetPiece = board[row + direction][captureCol];
                if (targetPiece !== null && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                    moves.push({ from: { row, col }, to: { row: row + direction, col: captureCol } });
                }
            }
        }
        
        return moves;
    }
    
    getRookMoves(board, row, col, isWhite) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const targetPiece = board[newRow][newCol];
                if (targetPiece === null) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                } else {
                    if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                        moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }
    
    getKnightMoves(board, row, col, isWhite) {
        const moves = [];
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (targetPiece === null || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                }
            }
        }
        
        return moves;
    }
    
    getBishopMoves(board, row, col, isWhite) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const targetPiece = board[newRow][newCol];
                if (targetPiece === null) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                } else {
                    if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                        moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }
    
    getQueenMoves(board, row, col, isWhite) {
        return [...this.getRookMoves(board, row, col, isWhite), ...this.getBishopMoves(board, row, col, isWhite)];
    }
    
    getKingMoves(board, row, col, isWhite) {
        const moves = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (targetPiece === null || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                }
            }
        }
        
        return moves;
    }
    
    // Helper methods
    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    makeMove(board, move) {
        const newBoard = board.map(row => [...row]);
        const { from, to } = move;
        
        newBoard[to.row][to.col] = newBoard[from.row][from.col];
        newBoard[from.row][from.col] = null;
        
        return newBoard;
    }
    
    isGameOver(board) {
        // Check for insufficient material, etc.
        return false;
    }
}