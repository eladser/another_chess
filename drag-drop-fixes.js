// Enhanced Drag and Drop Fixes
// This file contains additional fixes for drag and drop functionality

console.log('🎯 Loading drag and drop enhancements...');

// Enhanced drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing drag and drop enhancements...');
    
    // Wait for game to be ready
    setTimeout(() => {
        if (window.game) {
            enhanceDragAndDrop();
        } else {
            console.log('⚠️ Game not ready, retrying in 1 second...');
            setTimeout(() => {
                if (window.game) {
                    enhanceDragAndDrop();
                }
            }, 1000);
        }
    }, 500);
});

function enhanceDragAndDrop() {
    console.log('🔧 Enhancing drag and drop functionality...');
    
    const game = window.game;
    
    // Override the handleDragStart method
    const originalHandleDragStart = game.handleDragStart;
    game.handleDragStart = function(event) {
        console.log('🎯 Enhanced drag start triggered');
        
        if (this.gameState !== 'playing') {
            event.preventDefault();
            return;
        }
        
        const square = event.target.parentElement;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.chess.get(this.rowColToAlgebraic(row, col));
        
        // Check if it's player's turn
        if (this.gameMode === 'ai' && this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            event.preventDefault();
            return;
        }
        
        // Check if piece belongs to current player
        if (!piece || piece.color !== this.chess.turn()) {
            event.preventDefault();
            return;
        }
        
        // Set drag data
        this.draggedPiece = { row, col, piece };
        this.draggedElement = event.target;
        
        // Add dragging class
        event.target.classList.add('dragging');
        
        // Set drag image
        const dragImage = event.target.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.left = '-1000px';
        dragImage.style.transform = 'scale(1.2)';
        dragImage.style.opacity = '0.9';
        document.body.appendChild(dragImage);
        
        event.dataTransfer.setDragImage(dragImage, 40, 40);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
        
        // Remove drag image after setting
        setTimeout(() => {
            if (document.body.contains(dragImage)) {
                document.body.removeChild(dragImage);
            }
        }, 0);
        
        // Select the square and show possible moves
        this.selectSquare(row, col);
        
        console.log('✅ Enhanced drag started successfully');
    };
    
    // Override the handleDrop method
    const originalHandleDrop = game.handleDrop;
    game.handleDrop = function(event) {
        console.log('🎯 Enhanced drop triggered');
        
        event.preventDefault();
        
        if (!this.draggedPiece) {
            console.log('❌ No piece being dragged');
            return;
        }
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Remove all drag-related classes
        this.clearDragHighlights();
        
        // Try to make the move
        if (this.isValidMove(this.draggedPiece.row, this.draggedPiece.col, row, col)) {
            console.log('✅ Valid drop - making move');
            this.makeMove(this.draggedPiece.row, this.draggedPiece.col, row, col);
        } else {
            console.log('❌ Invalid drop');
        }
        
        // Clean up drag state
        this.draggedPiece = null;
        this.draggedElement = null;
        
        console.log('✅ Enhanced drop completed');
    };
    
    // Override the handleDragEnd method
    const originalHandleDragEnd = game.handleDragEnd;
    game.handleDragEnd = function(event) {
        console.log('🎯 Enhanced drag end triggered');
        
        // Remove dragging class
        if (event.target) {
            event.target.classList.remove('dragging');
        }
        
        // Clear all drag highlights
        this.clearDragHighlights();
        
        // Clean up drag state
        this.draggedPiece = null;
        this.draggedElement = null;
        
        console.log('✅ Enhanced drag end completed');
    };
    
    // Override the handleDragOver method
    const originalHandleDragOver = game.handleDragOver;
    game.handleDragOver = function(event) {
        if (!this.draggedPiece) return;
        
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Clear previous highlights
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
        
        // Check if this is a valid drop target
        if (this.isValidMove(this.draggedPiece.row, this.draggedPiece.col, row, col)) {
            square.classList.add('drop-target');
        }
    };
    
    // Add touch support for mobile devices
    let touchStartPos = null;
    let touchDraggedPiece = null;
    
    function handleTouchStart(event) {
        if (game.gameState !== 'playing') return;
        
        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('piece')) {
            const square = element.parentElement;
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = game.chess.get(game.rowColToAlgebraic(row, col));
            
            // Check if it's player's turn and valid piece
            if (game.gameMode === 'ai' && game.chess.turn() !== (game.playerColor === 'white' ? 'w' : 'b')) {
                return;
            }
            
            if (!piece || piece.color !== game.chess.turn()) {
                return;
            }
            
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            touchDraggedPiece = { row, col, piece, element };
            
            // Add visual feedback
            element.classList.add('dragging');
            game.selectSquare(row, col);
            
            event.preventDefault();
        }
    }
    
    function handleTouchMove(event) {
        if (!touchDraggedPiece) return;
        
        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Clear previous highlights
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
        
        if (element && element.classList.contains('square')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            
            if (game.isValidMove(touchDraggedPiece.row, touchDraggedPiece.col, row, col)) {
                element.classList.add('drop-target');
            }
        }
        
        event.preventDefault();
    }
    
    function handleTouchEnd(event) {
        if (!touchDraggedPiece) return;
        
        const touch = event.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Remove visual feedback
        touchDraggedPiece.element.classList.remove('dragging');
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
        
        if (element && element.classList.contains('square')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            
            if (game.isValidMove(touchDraggedPiece.row, touchDraggedPiece.col, row, col)) {
                game.makeMove(touchDraggedPiece.row, touchDraggedPiece.col, row, col);
            } else {
                game.clearSelection();
            }
        } else {
            game.clearSelection();
        }
        
        touchStartPos = null;
        touchDraggedPiece = null;
        
        event.preventDefault();
    }
    
    // Add touch event listeners
    const boardElement = document.getElementById('chessBoard');
    if (boardElement) {
        boardElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        boardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        boardElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Ensure all squares have proper drag event listeners
    function rebindDragEvents() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            // Remove existing listeners (if any)
            square.removeEventListener('dragover', game.handleDragOver);
            square.removeEventListener('drop', game.handleDrop);
            square.removeEventListener('dragenter', game.handleDragEnter);
            square.removeEventListener('dragleave', game.handleDragLeave);
            
            // Add new listeners
            square.addEventListener('dragover', (e) => game.handleDragOver(e));
            square.addEventListener('drop', (e) => game.handleDrop(e));
            square.addEventListener('dragenter', (e) => game.handleDragEnter(e));
            square.addEventListener('dragleave', (e) => game.handleDragLeave(e));
        });
        
        // Rebind piece drag events
        const pieces = document.querySelectorAll('.piece');
        pieces.forEach(piece => {
            piece.removeEventListener('dragstart', game.handleDragStart);
            piece.removeEventListener('dragend', game.handleDragEnd);
            
            piece.addEventListener('dragstart', (e) => game.handleDragStart(e));
            piece.addEventListener('dragend', (e) => game.handleDragEnd(e));
        });
    }
    
    // Rebind events initially
    rebindDragEvents();
    
    // Rebind events after pieces are updated
    const originalUpdatePieces = game.updatePieces;
    game.updatePieces = function() {
        originalUpdatePieces.call(this);
        setTimeout(() => {
            rebindDragEvents();
        }, 100);
    };
    
    // Add keyboard support for accessibility
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            game.clearSelection();
            game.draggedPiece = null;
            game.draggedElement = null;
            document.querySelectorAll('.dragging').forEach(el => {
                el.classList.remove('dragging');
            });
            document.querySelectorAll('.drop-target').forEach(el => {
                el.classList.remove('drop-target');
            });
        }
    });
    
    // Add right-click support to cancel selection
    document.addEventListener('contextmenu', (event) => {
        if (event.target.closest('.chess-board')) {
            event.preventDefault();
            game.clearSelection();
            game.draggedPiece = null;
            game.draggedElement = null;
        }
    });
    
    console.log('✅ Drag and drop enhancements applied successfully');
}

// Add visual feedback for better user experience
function addVisualFeedback() {
    const style = document.createElement('style');
    style.textContent = `
        .piece.dragging {
            opacity: 0.8 !important;
            transform: scale(1.2) rotate(5deg) !important;
            z-index: 1000 !important;
            pointer-events: none !important;
        }
        
        .square.drop-target {
            background: rgba(34, 197, 94, 0.6) !important;
            border: 3px solid rgba(34, 197, 94, 0.9) !important;
            transform: scale(1.05) !important;
            transition: all 0.2s ease !important;
            z-index: 5 !important;
        }
        
        .square.drag-hover {
            background: rgba(102, 126, 234, 0.3) !important;
            transform: scale(1.02) !important;
        }
        
        .piece:hover {
            cursor: grab !important;
        }
        
        .piece.dragging:hover {
            cursor: grabbing !important;
        }
    `;
    document.head.appendChild(style);
}

// Apply visual feedback
addVisualFeedback();

console.log('🎯 Drag and drop enhancements loaded successfully');
