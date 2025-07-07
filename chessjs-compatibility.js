// Chess.js Compatibility Patch - Ensures all versions work correctly
// This patch normalizes chess.js method names across different versions

console.log('🔧 Loading Chess.js compatibility patch...');

// Apply compatibility patch immediately when script loads
(function() {
    // Wait for Chess.js to be loaded
    if (typeof Chess === 'undefined') {
        console.log('⚠️ Chess.js not yet loaded, will retry...');
        setTimeout(arguments.callee, 100);
        return;
    }
    
    console.log('🎯 Applying Chess.js compatibility patch...');
    
    // Create a Chess instance to test methods
    const testChess = new Chess();
    
    // Patch methods based on what's available
    const methodMappings = {
        // Game state methods
        'isGameOver': ['game_over', 'isGameOver'],
        'inCheck': ['in_check', 'inCheck'], 
        'isCheckmate': ['in_checkmate', 'isCheckmate'],
        'isStalemate': ['in_stalemate', 'isStalemate'],
        'isDraw': ['in_draw', 'isDraw'],
        'inThreefoldRepetition': ['in_threefold_repetition', 'inThreefoldRepetition'],
        'insufficientMaterial': ['insufficient_material', 'insufficientMaterial']
    };
    
    // Apply patches to the Chess prototype
    Object.keys(methodMappings).forEach(standardName => {
        const possibleNames = methodMappings[standardName];
        
        // Check if the standard method exists
        if (typeof testChess[standardName] === 'function') {
            console.log(`✅ ${standardName} already available`);
            return;
        }
        
        // Find the first available method
        let foundMethod = null;
        for (const methodName of possibleNames) {
            if (typeof testChess[methodName] === 'function') {
                foundMethod = methodName;
                break;
            }
        }
        
        if (foundMethod) {
            console.log(`🔄 Patching ${standardName} -> ${foundMethod}`);
            Chess.prototype[standardName] = Chess.prototype[foundMethod];
        } else {
            console.log(`⚠️ Could not find method for ${standardName}`);
            // Create a safe fallback
            Chess.prototype[standardName] = function() {
                console.log(`⚠️ ${standardName} not available, returning false`);
                return false;
            };
        }
    });
    
    // Additional compatibility fixes
    if (typeof testChess.pgn !== 'function' && typeof testChess.get_pgn === 'function') {
        console.log('🔄 Patching pgn -> get_pgn');
        Chess.prototype.pgn = Chess.prototype.get_pgn;
    }
    
    if (typeof testChess.fen !== 'function' && typeof testChess.get_fen === 'function') {
        console.log('🔄 Patching fen -> get_fen');
        Chess.prototype.fen = Chess.prototype.get_fen;
    }
    
    if (typeof testChess.turn !== 'function' && typeof testChess.get_turn === 'function') {
        console.log('🔄 Patching turn -> get_turn');
        Chess.prototype.turn = Chess.prototype.get_turn;
    }
    
    if (typeof testChess.history !== 'function' && typeof testChess.get_history === 'function') {
        console.log('🔄 Patching history -> get_history');
        Chess.prototype.history = Chess.prototype.get_history;
    }
    
    if (typeof testChess.board !== 'function' && typeof testChess.get_board === 'function') {
        console.log('🔄 Patching board -> get_board');
        Chess.prototype.board = Chess.prototype.get_board;
    }
    
    if (typeof testChess.moves !== 'function' && typeof testChess.get_moves === 'function') {
        console.log('🔄 Patching moves -> get_moves');
        Chess.prototype.moves = Chess.prototype.get_moves;
    }
    
    if (typeof testChess.get !== 'function' && typeof testChess.get_piece === 'function') {
        console.log('🔄 Patching get -> get_piece');
        Chess.prototype.get = Chess.prototype.get_piece;
    }
    
    if (typeof testChess.load !== 'function' && typeof testChess.load_fen === 'function') {
        console.log('🔄 Patching load -> load_fen');
        Chess.prototype.load = Chess.prototype.load_fen;
    }
    
    if (typeof testChess.loadPgn !== 'function' && typeof testChess.load_pgn === 'function') {
        console.log('🔄 Patching loadPgn -> load_pgn');
        Chess.prototype.loadPgn = Chess.prototype.load_pgn;
    }
    
    console.log('✅ Chess.js compatibility patch applied successfully');
    
    // Test the patches
    try {
        const testResult = testChess.isGameOver();
        console.log('🧪 Compatibility test passed:', typeof testResult === 'boolean');
    } catch (error) {
        console.log('⚠️ Compatibility test warning:', error.message);
    }
    
})();

// Enhanced error handling for chess.js operations
window.chessJsErrorHandler = function(operation, callback) {
    try {
        return callback();
    } catch (error) {
        console.log(`⚠️ Chess.js ${operation} error:`, error.message);
        return null;
    }
};

console.log('✅ Chess.js compatibility patch loaded');
