// Chess.js Integration Fixes - Complete Fix for All Chess.js Issues
// This file fixes all the TypeError issues with chess.js library methods

console.log('🔧 Loading Chess.js integration fixes...');

// Fix for Chess.js method calls and integration issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Chess.js integration fixes...');
    
    // Wait for game to be ready
    setTimeout(() => {
        if (window.game) {
            applyChessJSFixes();
        } else {
            console.log('⚠️ Game not ready, retrying Chess.js fixes...');
            setTimeout(() => {
                if (window.game) {
                    applyChessJSFixes();
                }
            }, 1000);
        }
    }, 500);
});

function applyChessJSFixes() {
    console.log('🔧 Applying Chess.js integration fixes...');
    
    const game = window.game;
    
    // Fix makeMove method - handle chess.js method calls correctly
    const originalMakeMove = game.makeMove;
    game.makeMove = async function(fromRow, fromCol, toRow, toCol) {
        const from = this.rowColToAlgebraic(fromRow, fromCol);
        const to = this.rowColToAlgebraic(toRow, toCol);
        
        console.log('🎲 Fixed makeMove attempting:', { from, to });
        
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
                
                // Sync with engine safely
                if (this.engine && this.engine.chess) {
                    try {
                        this.engine.chess.load(this.chess.fen());
                    } catch (engineError) {
                        console.log('⚠️ Engine sync error:', engineError);
                    }
                }
                
                this.lastMove = { from, to };
                this.gameStats.totalMoves++;
                
                // Update statistics with safe method calls
                if (move.captured) {
                    this.gameStats.captures++;
                }
                
                // Safe check for inCheck
                try {
                    if (this.chess.in_check && this.chess.in_check()) {
                        this.gameStats.checks++;
                    }
                } catch (checkError) {
                    console.log('⚠️ Check detection error:', checkError);
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
                    !this.isGameOver() && 
                    this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
                    
                    console.log('🤖 Scheduling AI move...');
                    setTimeout(() => {
                        if (this.gameState === 'playing' && !this.isGameOver()) {
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
    
    // Fix checkGameState method
    const originalCheckGameState = game.checkGameState;
    game.checkGameState = function() {
        if (!this.chess) return;
        
        try {
            if (this.isGameOver()) {
                this.gameState = 'ended';
                
                let winner = 'Draw';
                let reason = 'unknown';
                
                if (this.isCheckmate()) {
                    winner = this.chess.turn() === 'w' ? 'Black' : 'White';
                    reason = 'checkmate';
                } else if (this.isStalemate()) {
                    reason = 'stalemate';
                } else if (this.isDraw()) {
                    reason = 'draw';
                }
                
                console.log('🏁 Game over:', { winner, reason });
                setTimeout(() => this.showGameOver(winner, reason), 1000);
            } else if (this.isInCheck()) {
                // Highlight king in check
                this.highlightKingInCheck();
            }
        } catch (error) {
            console.log('⚠️ Game state check error:', error);
        }
    };
    
    // Add safe helper methods for chess.js
    game.isGameOver = function() {
        try {
            return this.chess.game_over ? this.chess.game_over() : this.chess.isGameOver();
        } catch (error) {
            console.log('⚠️ isGameOver error:', error);
            return false;
        }
    };
    
    game.isCheckmate = function() {
        try {
            return this.chess.in_checkmate ? this.chess.in_checkmate() : this.chess.isCheckmate();
        } catch (error) {
            console.log('⚠️ isCheckmate error:', error);
            return false;
        }
    };
    
    game.isStalemate = function() {
        try {
            return this.chess.in_stalemate ? this.chess.in_stalemate() : this.chess.isStalemate();
        } catch (error) {
            console.log('⚠️ isStalemate error:', error);
            return false;
        }
    };
    
    game.isDraw = function() {
        try {
            return this.chess.in_draw ? this.chess.in_draw() : this.chess.isDraw();
        } catch (error) {
            console.log('⚠️ isDraw error:', error);
            return false;
        }
    };
    
    game.isInCheck = function() {
        try {
            return this.chess.in_check ? this.chess.in_check() : this.chess.inCheck();
        } catch (error) {
            console.log('⚠️ isInCheck error:', error);
            return false;
        }
    };
    
    // Fix updateEngineAnalysis method
    const originalUpdateEngineAnalysis = game.updateEngineAnalysis;
    game.updateEngineAnalysis = function() {
        if (!this.engine || !this.chess) return;
        
        try {
            const evaluation = this.engine.getCurrentEvaluation();
            const evalBar = document.getElementById('evalBar');
            const evalText = document.getElementById('evalText');
            
            if (evalBar && evalText) {
                // Update evaluation bar
                const percentage = Math.max(0, Math.min(100, (evaluation + 10) * 5));
                evalBar.style.width = `${percentage}%`;
                
                // Update evaluation text
                if (Math.abs(evaluation) > 5) {
                    evalText.textContent = evaluation > 0 ? '+M' : '-M';
                } else {
                    evalText.textContent = evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
                }
            }
        } catch (error) {
            console.log('🔍 Engine analysis error (fixed):', error);
            // Set default values on error
            const evalBar = document.getElementById('evalBar');
            const evalText = document.getElementById('evalText');
            if (evalBar) evalBar.style.width = '50%';
            if (evalText) evalText.textContent = '0.0';
        }
    };
    
    // Fix playMoveSound method
    const originalPlayMoveSound = game.playMoveSound;
    game.playMoveSound = function(move) {
        if (!this.gameSettings.enableSounds) return;
        
        try {
            if (this.isCheckmate()) {
                this.sounds.checkmate.play();
            } else if (this.isInCheck()) {
                this.sounds.check.play();
            } else if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
                this.sounds.castle.play();
            } else if (move.captured) {
                this.sounds.capture.play();
            } else {
                this.sounds.move.play();
            }
        } catch (error) {
            console.log('🔊 Sound play error (fixed):', error);
        }
    };
    
    // Fix engine methods
    if (game.engine) {
        const originalEngineGetCurrentEvaluation = game.engine.getCurrentEvaluation;
        game.engine.getCurrentEvaluation = function() {
            try {
                if (this.chess.game_over ? this.chess.game_over() : this.chess.isGameOver()) {
                    if (this.chess.in_checkmate ? this.chess.in_checkmate() : this.chess.isCheckmate()) {
                        return this.chess.turn() === 'w' ? -999 : 999;
                    }
                    return 0;
                }
                
                const evaluation = this.evaluatePosition();
                return Math.max(-999, Math.min(999, evaluation / 100));
            } catch (error) {
                console.log('🔍 Engine evaluation error (fixed):', error);
                return 0;
            }
        };
        
        // Fix engine helper methods
        game.engine.isGameOver = function() {
            try {
                return this.chess.game_over ? this.chess.game_over() : this.chess.isGameOver();
            } catch (error) {
                return false;
            }
        };
        
        game.engine.inCheck = function() {
            try {
                return this.chess.in_check ? this.chess.in_check() : this.chess.inCheck();
            } catch (error) {
                return false;
            }
        };
        
        game.engine.inCheckmate = function() {
            try {
                return this.chess.in_checkmate ? this.chess.in_checkmate() : this.chess.isCheckmate();
            } catch (error) {
                return false;
            }
        };
        
        game.engine.inStalemate = function() {
            try {
                return this.chess.in_stalemate ? this.chess.in_stalemate() : this.chess.isStalemate();
            } catch (error) {
                return false;
            }
        };
        
        game.engine.isDraw = function() {
            try {
                return this.chess.in_draw ? this.chess.in_draw() : this.chess.isDraw();
            } catch (error) {
                return false;
            }
        };
    }
    
    // Fix makeAIMove method
    const originalMakeAIMove = game.makeAIMove;
    game.makeAIMove = async function() {
        if (!this.chess || this.isGameOver()) {
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
                    
                    if (this.isInCheck()) {
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
            console.error('❌ AI move error (fixed):', error);
        } finally {
            this.hideThinkingIndicator();
        }
    };
    
    console.log('✅ Chess.js integration fixes applied successfully');
}

// Fix service worker registration error
if ('serviceWorker' in navigator) {
    // Override the service worker registration to avoid 404 errors
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'load' && listener.toString().includes('serviceWorker')) {
            // Skip the service worker registration
            console.log('🔧 Skipping service worker registration to avoid 404 error');
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
}

console.log('✅ Chess.js integration fixes loaded successfully');
