// Simple Chess Engine Implementation
class ChessEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = {
            'easy': 2,
            'medium': 3,
            'hard': 4
        };
        this.pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0,
            'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
        };
        
        // Position value tables for better AI decisions
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
    
    // Get the best move using minimax algorithm
    getBestMove(board, isWhite) {
        const depth = this.depths[this.difficulty];
        const result = this.minimax(board, depth, -Infinity, Infinity, !isWhite);
        return result.move;
    }
    
    // Minimax algorithm with alpha-beta pruning
    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.isGameOver(board)) {
            return { score: this.evaluateBoard(board), move: null };
        }
        
        const moves = this.getAllValidMoves(board, isMaximizing);
        
        if (moves.length === 0) {
            return { score: isMaximizing ? -Infinity : Infinity, move: null };
        }
        
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
    
    // Evaluate the board position
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
        
        return score;
    }
    
    // Get position value for a piece
    getPositionValue(piece, row, col) {
        const pieceType = piece.toLowerCase();
        if (!this.positionValues[pieceType]) return 0;
        
        const table = this.positionValues[pieceType];
        
        // Flip the table for black pieces
        if (piece === piece.toLowerCase()) {
            return table[7 - row][col] * 0.1; // Scale down position values
        } else {
            return table[row][col] * 0.1;
        }
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
        
        return moves;
    }
    
    // Individual piece movement methods
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
        // Simple check - in a real implementation, you'd check for checkmate/stalemate
        return false;
    }
    
    // Add some randomness to easy difficulty
    addRandomness(moves) {
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        return null;
    }
}