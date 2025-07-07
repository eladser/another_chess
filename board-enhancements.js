// Enhanced Chess Board Features and Fixes
// This file contains additional enhancements and bug fixes for the chess game

// Board Enhancement Class
class ChessBoardEnhancement {
    constructor(game) {
        this.game = game;
        this.animationQueue = [];
        this.soundEnabled = true;
        this.pieceAnimations = new Map();
        this.boardEffects = new Map();
        this.touchSupport = 'ontouchstart' in window;
        
        this.initializeEnhancements();
    }
    
    initializeEnhancements() {
        console.log('🎨 Initializing board enhancements...');
        
        // Enhanced piece animation system
        this.setupPieceAnimations();
        
        // Advanced drag and drop features
        this.setupAdvancedDragDrop();
        
        // Board visual effects
        this.setupBoardEffects();
        
        // Touch and mobile optimizations
        this.setupTouchSupport();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Advanced move validation feedback
        this.setupMoveValidationFeedback();
        
        console.log('✅ Board enhancements initialized');
    }
    
    // Enhanced piece animations
    setupPieceAnimations() {
        // Smooth piece movement animations
        this.animateMove = (from, to, piece, duration = 300) => {
            return new Promise((resolve) => {
                const fromSquare = document.querySelector(`[data-square="${from}"]`);
                const toSquare = document.querySelector(`[data-square="${to}"]`);
                const pieceElement = fromSquare?.querySelector('.piece');
                
                if (!pieceElement || !toSquare) {
                    resolve();
                    return;
                }
                
                const fromRect = fromSquare.getBoundingClientRect();
                const toRect = toSquare.getBoundingClientRect();
                
                const deltaX = toRect.left - fromRect.left;
                const deltaY = toRect.top - fromRect.top;
                
                // Create moving piece clone
                const movingPiece = pieceElement.cloneNode(true);
                movingPiece.style.position = 'fixed';
                movingPiece.style.left = fromRect.left + 'px';
                movingPiece.style.top = fromRect.top + 'px';
                movingPiece.style.zIndex = '1000';
                movingPiece.style.pointerEvents = 'none';
                movingPiece.classList.add('moving');
                
                document.body.appendChild(movingPiece);
                
                // Hide original piece
                pieceElement.style.opacity = '0';
                
                // Animate to destination
                requestAnimationFrame(() => {
                    movingPiece.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    movingPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    
                    setTimeout(() => {
                        document.body.removeChild(movingPiece);
                        pieceElement.style.opacity = '1';
                        resolve();
                    }, duration);
                });
            });
        };
        
        // Capture animation
        this.animateCapture = (square, capturedPiece) => {
            const squareElement = document.querySelector(`[data-square="${square}"]`);
            const pieceElement = squareElement?.querySelector('.piece');
            
            if (pieceElement) {
                pieceElement.style.transition = 'all 0.3s ease';
                pieceElement.style.transform = 'scale(0) rotate(180deg)';
                pieceElement.style.opacity = '0';
                
                // Add capture effect
                this.addCaptureEffect(square);
            }
        };
        
        // Piece placement animation
        this.animatePlacement = (square, piece) => {
            const squareElement = document.querySelector(`[data-square="${square}"]`);
            const pieceElement = squareElement?.querySelector('.piece');
            
            if (pieceElement) {
                pieceElement.style.transform = 'scale(0) rotate(-180deg)';
                pieceElement.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    pieceElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    pieceElement.style.transform = 'scale(1) rotate(0deg)';
                    pieceElement.style.opacity = '1';
                });
            }
        };
    }
    
    // Advanced drag and drop
    setupAdvancedDragDrop() {
        // Enhanced drag preview
        this.createDragPreview = (piece, event) => {
            const preview = piece.cloneNode(true);
            preview.style.position = 'fixed';
            preview.style.pointerEvents = 'none';
            preview.style.zIndex = '10000';
            preview.style.transform = 'scale(1.3)';
            preview.style.opacity = '0.9';
            preview.classList.add('drag-preview');
            
            document.body.appendChild(preview);
            
            // Follow mouse/touch
            const updatePreview = (e) => {
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                
                preview.style.left = (clientX - 25) + 'px';
                preview.style.top = (clientY - 25) + 'px';
            };
            
            document.addEventListener('mousemove', updatePreview);
            document.addEventListener('touchmove', updatePreview);
            
            // Cleanup function
            return () => {
                document.removeEventListener('mousemove', updatePreview);
                document.removeEventListener('touchmove', updatePreview);
                if (document.body.contains(preview)) {
                    document.body.removeChild(preview);
                }
            };
        };
        
        // Magnetic snap effect
        this.addMagneticSnap = (draggedPiece, targetSquare) => {
            const piece = draggedPiece.element;
            const square = targetSquare.element;
            
            if (piece && square) {
                const squareRect = square.getBoundingClientRect();
                const pieceRect = piece.getBoundingClientRect();
                
                // Calculate snap distance
                const centerX = squareRect.left + squareRect.width / 2;
                const centerY = squareRect.top + squareRect.height / 2;
                const pieceCenterX = pieceRect.left + pieceRect.width / 2;
                const pieceCenterY = pieceRect.top + pieceRect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(centerX - pieceCenterX, 2) + 
                    Math.pow(centerY - pieceCenterY, 2)
                );
                
                // Snap if close enough
                if (distance < 40) {
                    square.classList.add('magnetic-snap');
                    piece.style.transform = 'scale(1.1)';
                    
                    setTimeout(() => {
                        square.classList.remove('magnetic-snap');
                        piece.style.transform = '';
                    }, 200);
                }
            }
        };
    }
    
    // Board visual effects
    setupBoardEffects() {
        // Capture effect
        this.addCaptureEffect = (square) => {
            const squareElement = document.querySelector(`[data-square="${square}"]`);
            if (!squareElement) return;
            
            // Create explosion effect
            const explosion = document.createElement('div');
            explosion.className = 'capture-explosion';
            explosion.style.position = 'absolute';
            explosion.style.top = '50%';
            explosion.style.left = '50%';
            explosion.style.width = '100%';
            explosion.style.height = '100%';
            explosion.style.transform = 'translate(-50%, -50%)';
            explosion.style.pointerEvents = 'none';
            explosion.style.background = 'radial-gradient(circle, rgba(255,100,100,0.8) 0%, transparent 70%)';
            explosion.style.borderRadius = '50%';
            explosion.style.animation = 'captureExplosion 0.5s ease-out';
            
            squareElement.appendChild(explosion);
            
            setTimeout(() => {
                if (squareElement.contains(explosion)) {
                    squareElement.removeChild(explosion);
                }
            }, 500);
        };
        
        // Check effect
        this.addCheckEffect = (kingSquare) => {
            const squareElement = document.querySelector(`[data-square="${kingSquare}"]`);
            if (!squareElement) return;
            
            squareElement.classList.add('king-in-check');
            
            // Add pulsing red border
            const checkBorder = document.createElement('div');
            checkBorder.className = 'check-border';
            checkBorder.style.position = 'absolute';
            checkBorder.style.top = '0';
            checkBorder.style.left = '0';
            checkBorder.style.right = '0';
            checkBorder.style.bottom = '0';
            checkBorder.style.border = '3px solid #ff0000';
            checkBorder.style.borderRadius = '8px';
            checkBorder.style.animation = 'checkPulse 1s infinite';
            checkBorder.style.pointerEvents = 'none';
            
            squareElement.appendChild(checkBorder);
            
            // Remove after 3 seconds
            setTimeout(() => {
                squareElement.classList.remove('king-in-check');
                if (squareElement.contains(checkBorder)) {
                    squareElement.removeChild(checkBorder);
                }
            }, 3000);
        };
        
        // Checkmate effect
        this.addCheckmateEffect = () => {
            const board = document.getElementById('chessBoard');
            if (!board) return;
            
            // Add victory/defeat overlay
            const overlay = document.createElement('div');
            overlay.className = 'checkmate-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,0,0,0.3))';
            overlay.style.animation = 'checkmateGlow 2s ease-in-out';
            overlay.style.pointerEvents = 'none';
            overlay.style.borderRadius = '12px';
            
            board.appendChild(overlay);
            
            setTimeout(() => {
                if (board.contains(overlay)) {
                    board.removeChild(overlay);
                }
            }, 2000);
        };
    }
    
    // Touch and mobile support
    setupTouchSupport() {
        if (!this.touchSupport) return;
        
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        // Enhanced touch handling
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Long press detection for piece selection
            if (touchDuration > 500) {
                const target = e.target.closest('.piece');
                if (target) {
                    target.classList.add('long-press-selected');
                    
                    // Add haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }
        });
        
        // Touch move optimization
        document.addEventListener('touchmove', (e) => {
            // Prevent scrolling during piece drag
            if (e.target.closest('.piece')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // Don't interfere with input fields
            }
            
            switch (e.key) {
                case 'Escape':
                    this.game.clearSelection();
                    break;
                case 'u':
                case 'U':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.undoMove();
                    }
                    break;
                case 'n':
                case 'N':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.newGame();
                    }
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.flipBoard();
                    }
                    break;
                case 's':
                case 'S':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.game.showSettings();
                    }
                    break;
                case 'h':
                case 'H':
                case '?':
                    if (!e.ctrlKey && !e.metaKey) {
                        const helpModal = document.getElementById('helpModal');
                        if (helpModal) {
                            helpModal.style.display = 'flex';
                        }
                    }
                    break;
                case 'ArrowLeft':
                    // Navigate through move history
                    e.preventDefault();
                    this.navigateMoveHistory(-1);
                    break;
                case 'ArrowRight':
                    // Navigate through move history
                    e.preventDefault();
                    this.navigateMoveHistory(1);
                    break;
            }
        });
    }
    
    // Move validation feedback
    setupMoveValidationFeedback() {
        // Visual feedback for invalid moves
        this.showInvalidMoveWarning = (fromSquare, toSquare) => {
            const fromElement = document.querySelector(`[data-square="${fromSquare}"]`);
            const toElement = document.querySelector(`[data-square="${toSquare}"]`);
            
            [fromElement, toElement].forEach(element => {
                if (element) {
                    element.classList.add('invalid-move');
                    
                    // Add shake animation
                    element.style.animation = 'shake 0.5s ease-in-out';
                    
                    setTimeout(() => {
                        element.classList.remove('invalid-move');
                        element.style.animation = '';
                    }, 500);
                }
            });
            
            // Play error sound
            if (this.soundEnabled) {
                this.playErrorSound();
            }
        };
        
        // Highlight legal moves more prominently
        this.enhanceLegalMoveHighlighting = (square) => {
            const moves = this.game.chess.moves({ square: square, verbose: true });
            
            moves.forEach(move => {
                const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
                if (targetSquare) {
                    // Add move type indicators
                    const indicator = document.createElement('div');
                    indicator.className = 'move-indicator';
                    
                    if (move.captured) {
                        indicator.classList.add('capture-indicator');
                        indicator.innerHTML = '×';
                    } else if (move.flags.includes('c')) {
                        indicator.classList.add('castle-indicator');
                        indicator.innerHTML = '♜';
                    } else if (move.flags.includes('e')) {
                        indicator.classList.add('en-passant-indicator');
                        indicator.innerHTML = '👻';
                    } else if (move.promotion) {
                        indicator.classList.add('promotion-indicator');
                        indicator.innerHTML = '👑';
                    } else {
                        indicator.classList.add('normal-move-indicator');
                        indicator.innerHTML = '•';
                    }
                    
                    targetSquare.appendChild(indicator);
                }
            });
        };
    }
    
    // Navigation through move history
    navigateMoveHistory(direction) {
        // This would integrate with the main game's move history
        // For now, just log the action
        console.log(`📚 Navigate move history: ${direction > 0 ? 'forward' : 'backward'}`);
    }
    
    // Enhanced sound system
    playErrorSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('🔊 Error sound generation failed:', error);
        }
    }
    
    // Cleanup method
    cleanup() {
        // Remove all event listeners and clear animations
        this.animationQueue.forEach(animation => {
            if (animation.cancel) {
                animation.cancel();
            }
        });
        this.animationQueue = [];
        this.pieceAnimations.clear();
        this.boardEffects.clear();
        
        console.log('🧹 Board enhancements cleaned up');
    }
}

// Add CSS animations via JavaScript
function addEnhancementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes captureExplosion {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        @keyframes checkPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        @keyframes checkmateGlow {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes magneticSnap {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .capture-explosion {
            z-index: 100;
        }
        
        .king-in-check {
            position: relative;
        }
        
        .checkmate-overlay {
            z-index: 200;
        }
        
        .invalid-move {
            background: rgba(255, 0, 0, 0.3) !important;
        }
        
        .long-press-selected {
            background: rgba(255, 255, 0, 0.4) !important;
        }
        
        .move-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 10;
        }
        
        .capture-indicator {
            color: #ff4444;
            animation: captureHint 1s infinite;
        }
        
        .castle-indicator {
            color: #4444ff;
            animation: castleHint 1s infinite;
        }
        
        .en-passant-indicator {
            color: #ff44ff;
            animation: enPassantHint 1s infinite;
        }
        
        .promotion-indicator {
            color: #ffff44;
            animation: promotionHint 1s infinite;
        }
        
        .normal-move-indicator {
            color: #44ff44;
            animation: normalHint 1s infinite;
        }
        
        @keyframes castleHint {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes enPassantHint {
            0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
            50% { transform: translate(-50%, -50%) scale(1.2) rotate(10deg); }
        }
        
        @keyframes promotionHint {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        
        @keyframes normalHint {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .magnetic-snap {
            animation: magneticSnap 0.2s ease-in-out;
        }
        
        .drag-preview {
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.8));
        }
        
        /* Touch device specific styles */
        @media (hover: none) and (pointer: coarse) {
            .move-indicator {
                font-size: 20px;
            }
            
            .piece {
                touch-action: none;
            }
            
            .square {
                touch-action: manipulation;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add enhancement styles
    addEnhancementStyles();
    
    // Initialize enhancements after game is ready
    setTimeout(() => {
        if (window.game) {
            window.game.enhancements = new ChessBoardEnhancement(window.game);
            console.log('🎨 Board enhancements activated');
        }
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessBoardEnhancement;
}
