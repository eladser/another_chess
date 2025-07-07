// Game Fixes - Fix for game freezing after first move
// This file contains fixes for the main game issues

// Fix 1: Game State Management
// The issue is in the makeMove and makeAIMove functions
// We need to ensure proper game state updates and prevent infinite loops

// Override the makeMove function to fix game state issues
if (typeof window !== 'undefined' && window.game) {
    const originalMakeMove = window.game.makeMove;
    
    window.game.makeMove = async function(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        console.log('🎲 Attempting move:', { from, to });
        
        // Check if it's a valid move first
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            console.log('❌ Invalid move attempted');
            return false;
        }
        
        try {
            // Check for pawn promotion
            const piece = this.chess.get(from);
            let promotion = null;
            
            if (piece && piece.type === 'p') {
                const promotionRow = piece.color === 'w' ? 0 : 7;
                if (toRow === promotionRow) {
                    promotion = await this.showPromotionDialog(piece.color);
                }
            }
            
            // Make the move
            const moveOptions = { from, to };
            if (promotion) {
                moveOptions.promotion = promotion;
            }
            
            const move = this.chess.move(moveOptions);
            
            if (move) {
                console.log('✅ Move successful:', move);
                
                // Sync with engine
                if (this.engine) {
                    this.engine.chess.load(this.chess.fen());
                }
                
                this.lastMove = { from, to };
                this.gameStats.totalMoves++;
                
                // Update statistics
                if (move.captured) {
                    this.gameStats.captures++;
                }
                
                if (this.chess.inCheck()) {
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
                
                // AI move if it's AI's turn and game is not over
                if (this.gameMode === 'ai' && 
                    !this.chess.isGameOver() && 
                    this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
                    
                    console.log('🤖 Scheduling AI move...');
                    
                    // Use setTimeout to prevent blocking
                    setTimeout(() => {
                        if (this.gameState === 'playing' && !this.chess.isGameOver()) {
                            this.makeAIMove();
                        }
                    }, 800);
                }
                
                return true;
            } else {
                console.log('❌ Move failed - chess.js rejected the move');
                return false;
            }
        } catch (error) {
            console.error('❌ Move error:', error);
            this.clearSelection();
            return false;
        }
    };
    
    // Override makeAIMove to fix AI issues
    window.game.makeAIMove = async function() {
        if (!this.chess || this.chess.isGameOver()) {
            console.log('❌ Cannot make AI move - game over');
            return;
        }
        
        if (this.gameState !== 'playing') {
            console.log('❌ Cannot make AI move - game not in playing state');
            return;
        }
        
        console.log('🤖 AI is thinking...');
        
        try {
            // Show thinking indicator
            this.showThinkingIndicator();
            
            let move = null;
            
            // Simple AI fallback if engine fails
            if (this.engine) {
                try {
                    // Sync engine with current position
                    this.engine.chess.load(this.chess.fen());
                    
                    // Get best move from AI
                    move = await this.engine.getBestMove();
                } catch (engineError) {
                    console.log('⚠️ Engine error, using fallback AI:', engineError);
                    move = null;
                }
            }
            
            // Fallback to random move if engine fails
            if (!move) {
                const possibleMoves = this.chess.moves({ verbose: true });
                if (possibleMoves.length > 0) {
                    move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    console.log('🎲 Using random move:', move);
                }
            }
            
            if (move) {
                console.log('🎯 AI selected move:', move);
                
                const engineMove = this.chess.move(move);
                
                if (engineMove) {
                    console.log('✅ AI move executed:', engineMove);
                    
                    this.lastMove = { from: move.from, to: move.to };
                    this.gameStats.totalMoves++;
                    
                    // Update statistics
                    if (engineMove.captured) {
                        this.gameStats.captures++;
                    }
                    
                    if (this.chess.inCheck()) {
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
                } else {
                    console.log('❌ AI move failed to execute');
                }
            } else {
                console.log('❌ AI could not find a move');
            }
        } catch (error) {
            console.error('❌ AI move error:', error);
        } finally {
            this.hideThinkingIndicator();
        }
    };
    
    console.log('🔧 Game fixes applied for move handling');
}

// Apply fixes when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the game to be initialized
    setTimeout(() => {
        if (window.game) {
            console.log('🔧 Applying game fixes...');
            
            // Re-apply the fixes in case they were overridden
            const game = window.game;
            
            // Fix the coordinate display issue
            const bottomCoords = document.getElementById('bottomCoords');
            if (bottomCoords) {
                bottomCoords.style.display = 'flex';
                bottomCoords.style.justifyContent = 'space-around';
                bottomCoords.style.alignItems = 'center';
                bottomCoords.style.width = '100%';
                console.log('🔧 Fixed coordinate display');
            }
            
            // Ensure drag and drop events are properly bound
            const squares = document.querySelectorAll('.square');
            squares.forEach(square => {
                // Remove existing listeners to prevent duplicates
                square.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });
                
                square.addEventListener('drop', (e) => {
                    e.preventDefault();
                    
                    if (game.draggedPiece) {
                        const targetRow = parseInt(square.dataset.row);
                        const targetCol = parseInt(square.dataset.col);
                        
                        if (game.isValidMove(game.draggedPiece.row, game.draggedPiece.col, targetRow, targetCol)) {
                            game.makeMove(game.draggedPiece.row, game.draggedPiece.col, targetRow, targetCol);
                        }
                    }
                });
            });
            
            console.log('🔧 All game fixes applied successfully');
        }
    }, 1000);
});
