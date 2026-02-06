/* Opening name lookup - longest prefix match against move history */
const OPENINGS = {
    'e4': "King's Pawn Opening",
    'e4 e5': 'Open Game',
    'e4 e5 Nf3 Nc6 Bb5': 'Ruy Lopez',
    'e4 e5 Nf3 Nc6 Bb5 a6': 'Ruy Lopez: Morphy Defense',
    'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O': 'Ruy Lopez: Closed',
    'e4 e5 Nf3 Nc6 Bc4': 'Italian Game',
    'e4 e5 Nf3 Nc6 Bc4 Bc5': 'Giuoco Piano',
    'e4 e5 Nf3 Nc6 Bc4 Nf6': 'Two Knights Defense',
    'e4 e5 Nf3 Nc6 d4': 'Scotch Game',
    'e4 e5 Nf3 Nf6': "Petrov's Defense",
    'e4 e5 Nf3 d6': 'Philidor Defense',
    'e4 e5 f4': "King's Gambit",
    'e4 c5': 'Sicilian Defense',
    'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6': 'Sicilian: Najdorf',
    'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e5': 'Sicilian: Sveshnikov',
    'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6': 'Sicilian: Classical',
    'e4 c5 Nf3 e6 d4 cxd4 Nxd4': 'Sicilian: Taimanov',
    'e4 c5 Nf3 Nc6': 'Sicilian Defense',
    'e4 c5 c3': 'Sicilian: Alapin',
    'e4 e6': 'French Defense',
    'e4 e6 d4 d5': 'French Defense',
    'e4 e6 d4 d5 Nc3': 'French: Classical',
    'e4 e6 d4 d5 Nd2': 'French: Tarrasch',
    'e4 e6 d4 d5 e5': 'French: Advance',
    'e4 d5': 'Scandinavian Defense',
    'e4 c6': 'Caro-Kann Defense',
    'e4 c6 d4 d5': 'Caro-Kann Defense',
    'e4 c6 d4 d5 Nc3': 'Caro-Kann: Classical',
    'e4 c6 d4 d5 e5': 'Caro-Kann: Advance',
    'e4 d6 d4 Nf6 Nc3': 'Pirc Defense',
    'e4 g6': 'Modern Defense',
    'd4': "Queen's Pawn Opening",
    'd4 d5': 'Closed Game',
    'd4 d5 c4': "Queen's Gambit",
    'd4 d5 c4 e6': "Queen's Gambit Declined",
    'd4 d5 c4 dxc4': "Queen's Gambit Accepted",
    'd4 d5 c4 c6': 'Slav Defense',
    'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6': 'Semi-Slav Defense',
    'd4 Nf6 c4 e6 Nc3 Bb4': 'Nimzo-Indian Defense',
    'd4 Nf6 c4 e6 Nf3 b6': "Queen's Indian Defense",
    'd4 Nf6 c4 e6 g3': 'Catalan Opening',
    'd4 Nf6 c4 g6 Nc3 Bg7': "King's Indian Defense",
    'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6': "King's Indian: Classical",
    'd4 Nf6 c4 g6 Nc3 d5': 'Gruenfeld Defense',
    'd4 Nf6 c4 c5 d5 e6': 'Modern Benoni',
    'c4': 'English Opening',
    'c4 e5': 'English: Reversed Sicilian',
    'c4 c5': 'English: Symmetrical',
    'Nf3': 'Reti Opening',
    'Nf3 d5 c4': 'Reti Opening',
    'b3': 'Nimzo-Larsen Attack',
    'f4': "Bird's Opening",
};

/* Settings form <-> gameSettings mapping */
const SETTINGS_MAP = [
    { id: 'difficultySelect', key: 'difficulty', prop: 'value' },
    { id: 'playerColorSelect', key: 'playerColor', prop: 'value' },
    { id: 'boardThemeSelect', key: 'boardTheme', prop: 'value' },
    { id: 'gameModeSelect', key: 'gameMode', prop: 'value' },
    { id: 'timeControlSelect', key: 'timeControl', prop: 'value' },
    { id: 'showCoordinates', key: 'showCoordinates', prop: 'checked' },
    { id: 'highlightLastMove', key: 'highlightLastMove', prop: 'checked' },
    { id: 'showPossibleMoves', key: 'showPossibleMoves', prop: 'checked' },
    { id: 'enableAnimations', key: 'enableAnimations', prop: 'checked' },
    { id: 'enableSounds', key: 'enableSounds', prop: 'checked' },
    { id: 'volumeSlider', key: 'volume', prop: 'value', parse: parseInt },
];

class ChessClock {
    constructor(whiteMs, blackMs, incrementMs = 0) {
        this.time = { w: whiteMs, b: blackMs };
        this.increment = incrementMs;
        this.running = null;
        this._interval = null;
        this._lastTick = null;
        this.onTick = null;
        this.onTimeout = null;
    }

    start(color) {
        this.stop();
        this.running = color;
        this._lastTick = performance.now();
        this._interval = setInterval(() => this._tick(), 100);
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
        if (this.running && this.increment) {
            this.time[this.running] += this.increment;
        }
        this.running = null;
    }

    _tick() {
        if (!this.running) return;
        const now = performance.now();
        this.time[this.running] -= (now - this._lastTick);
        this._lastTick = now;
        if (this.onTick) this.onTick(this.running, this.time);
        if (this.time[this.running] <= 0) {
            this.time[this.running] = 0;
            const loser = this.running;
            this.running = null;
            clearInterval(this._interval);
            this._interval = null;
            if (this.onTimeout) this.onTimeout(loser);
        }
    }

    reset(whiteMs, blackMs) {
        this.stop();
        this.time = { w: whiteMs, b: blackMs };
    }

    getTime(color) {
        return Math.max(0, this.time[color]);
    }

    static formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

class ChessGame {
    constructor() {
        this.chess = null;
        this.engine = null;
        this.ui = null;
        this.clock = null;
        this.playerColor = 'white';
        this.gameState = 'playing';
        this.isFlipped = false;
        this.lastMove = null;
        this.selectedSquare = null;
        this._aiMoveInProgress = false;
        this._aiMoveTimer = null;
        this._audioContext = null;
        this._historyViewIndex = -1;
        this._playerMoveScores = [];
        this._lastSuggestion = null;
        this._analysisTimer = null;
        this._premove = null;

        this.gameSettings = {
            difficulty: 'medium', playerColor: 'white', gameMode: 'ai',
            timeControl: 'none', showCoordinates: true, highlightLastMove: true,
            showPossibleMoves: true, enableAnimations: true, enableSounds: true,
            volume: 50, boardTheme: 'classic'
        };

        this.gameStats = {
            totalMoves: 0, captures: 0, checks: 0,
            startTime: Date.now(), accuracy: 0
        };

        this.sounds = {};
        this._initSounds();
        this.initializeGame().catch(err => {
            console.error('Init error:', err);
            if (this.ui) this.ui.hideLoading();
        });
    }

    get gameMode() { return this.gameSettings.gameMode; }

    _getAudioContext() {
        if (!this._audioContext) {
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioContext.state === 'suspended') this._audioContext.resume();
        return this._audioContext;
    }

    _initSounds() {
        const types = {
            move: { freq: 440, duration: 0.15 },
            capture: { freq: 330, duration: 0.2 },
            check: { freq: 660, duration: 0.25 },
            checkmate: { freq: 220, duration: 0.4 },
            castle: { freq: 550, duration: 0.2 }
        };
        for (const [name, config] of Object.entries(types)) {
            this.sounds[name] = { play: () => this._playTone(config.freq, config.duration) };
        }
    }

    _playTone(frequency, duration) {
        if (!this.gameSettings.enableSounds) return;
        try {
            const ctx = this._getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = frequency;
            osc.type = 'sine';
            const vol = this.gameSettings.volume / 100 * 0.1;
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* AudioContext may not be available */ }
    }

    playMoveSound(move) {
        if (!this.gameSettings.enableSounds) return;
        if (ChessCompat.isCheckmate(this.chess)) this.sounds.checkmate.play();
        else if (ChessCompat.inCheck(this.chess)) this.sounds.check.play();
        else if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) this.sounds.castle.play();
        else if (move.captured) this.sounds.capture.play();
        else this.sounds.move.play();
    }

    async initializeGame() {
        if (typeof Chess === 'undefined') throw new Error('Chess.js not loaded');

        this.chess = new Chess();
        this.engine = new ChessEngine(this.gameSettings.difficulty);
        this.ui = new ChessUI(this);

        this.loadSettings();
        this.ui.init();
        this.applySettings();
        this._loadAutoSave();
        this._refreshBoard();
        this._deferAnalysis();
        this.ui.hideLoading();

        window.addEventListener('beforeunload', () => this._autoSave());
    }

    handleSquareClick(row, col) {
        if (this.gameState !== 'playing') return;
        if (this._historyViewIndex !== -1) { this.goToLive(); return; }

        const playerTurnColor = this.playerColor === 'white' ? 'w' : 'b';

        if (this._aiMoveInProgress && this.gameMode === 'ai') {
            const algebraic = this._rowColToAlgebraic(row, col);
            const piece = this.chess.get(algebraic);

            if (this.selectedSquare) {
                const from = this.selectedSquare;
                if (from.row === row && from.col === col) {
                    this.ui.clearSelection();
                    this.selectedSquare = null;
                    return;
                }
                if (piece && piece.color === playerTurnColor) {
                    this.ui.clearSelection();
                    this._selectPiece(row, col);
                    return;
                }
                this._setPremove(from.row, from.col, row, col);
                this.ui.clearSelection();
                this.selectedSquare = null;
                return;
            }
            if (piece && piece.color === playerTurnColor) {
                this._clearPremove();
                this._selectPiece(row, col);
            }
            return;
        }

        if (this._aiMoveInProgress) return;

        const currentTurn = this.chess.turn();
        if (this.gameMode === 'ai' && currentTurn !== playerTurnColor) return;

        const algebraic = this._rowColToAlgebraic(row, col);
        const piece = this.chess.get(algebraic);

        if (this.selectedSquare) {
            const from = this.selectedSquare;
            if (this._isValidMove(from.row, from.col, row, col)) {
                this.handleMove(from.row, from.col, row, col);
            } else {
                this.ui.clearSelection();
                this.selectedSquare = null;
                if (piece && piece.color === currentTurn) this._selectPiece(row, col);
            }
        } else if (piece && piece.color === currentTurn) {
            this._selectPiece(row, col);
        }
    }

    canInteract(row, col) {
        if (this.gameState !== 'playing' || this._historyViewIndex !== -1) return false;
        const playerTurnColor = this.playerColor === 'white' ? 'w' : 'b';
        if (this._aiMoveInProgress && this.gameMode === 'ai') {
            const algebraic = this._rowColToAlgebraic(row, col);
            const piece = this.chess.get(algebraic);
            return !!piece && piece.color === playerTurnColor;
        }
        if (this._aiMoveInProgress) return false;
        const algebraic = this._rowColToAlgebraic(row, col);
        const piece = this.chess.get(algebraic);
        if (!piece || piece.color !== this.chess.turn()) return false;
        if (this.gameMode === 'ai' && this.chess.turn() !== playerTurnColor) return false;
        return true;
    }

    getValidMoves(row, col) {
        return this.chess.moves({ square: this._rowColToAlgebraic(row, col), verbose: true });
    }

    async handleMove(fromRow, fromCol, toRow, toCol, opts = {}) {
        if (this._aiMoveInProgress && this.gameMode === 'ai' && !opts.isPremove) {
            this._setPremove(fromRow, fromCol, toRow, toCol);
            return false;
        }

        const from = this._rowColToAlgebraic(fromRow, fromCol);
        const to = this._rowColToAlgebraic(toRow, toCol);

        const piece = this.chess.get(from);
        let promotion = null;
        if (piece && piece.type === 'p') {
            const promoRank = piece.color === 'w' ? 0 : 7;
            if (toRow === promoRank) {
                promotion = opts.autoQueen ? 'q' : await this.ui.showPromotionDialog(piece.color);
            }
        }

        const moveOpts = { from, to };
        if (promotion) moveOpts.promotion = promotion;

        const preMoveHint = this._lastSuggestion;

        const move = this.chess.move(moveOpts);
        if (!move) return false;

        if (this.engine) this.engine.chess.load(this.chess.fen());
        this.lastMove = { from, to };
        this.gameStats.totalMoves++;
        if (move.captured) this.gameStats.captures++;
        if (ChessCompat.inCheck(this.chess)) this.gameStats.checks++;
        this._updateAccuracy(from, to, preMoveHint);
        this.playMoveSound(move);
        this.ui.announce(`${move.color === 'w' ? 'White' : 'Black'} played ${move.san}`);

        this.ui.clearSelection();
        this.ui.clearArrows();
        this.selectedSquare = null;
        await this.ui.animateMove(from, to);
        this._refreshBoard();
        this._deferAnalysis();

        if (this._checkGameEnd()) return true;
        if (this.clock) this.clock.start(this.chess.turn());
        if (this.gameMode === 'ai' && this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b')) {
            this._scheduleAIMove();
        }
        this._autoSave();
        return true;
    }

    _scheduleAIMove() {
        clearTimeout(this._aiMoveTimer);
        this._aiMoveTimer = setTimeout(() => this._executeAIMove(), 300);
    }

    async _executeAIMove() {
        if (this._aiMoveInProgress || this.gameState !== 'playing') return;
        if (ChessCompat.isGameOver(this.chess)) return;

        this._aiMoveInProgress = true;
        this.ui.showThinking();

        try {
            this.engine.chess.load(this.chess.fen());
            const move = await this.engine.getBestMove();
            if (!move || this.gameState !== 'playing') return;

            let result = this.chess.move(move);
            if (!result) {
                const legal = this.chess.moves({ verbose: true });
                if (legal.length === 0) return;
                result = this.chess.move(legal[0]);
            }

            this.engine.chess.load(this.chess.fen());
            this.lastMove = { from: result.from, to: result.to };
            this.gameStats.totalMoves++;
            if (result.captured) this.gameStats.captures++;
            if (ChessCompat.inCheck(this.chess)) this.gameStats.checks++;
            this.playMoveSound(result);
            this.ui.announce(`AI played ${result.san}`);

            await this.ui.animateMove(result.from, result.to);
            this._refreshBoard();
            this._deferAnalysis();
            this._checkGameEnd();
            this._autoSave();
            if (this.clock) this.clock.start(this.chess.turn());
        } catch (error) {
            console.error('AI error:', error);
        } finally {
            this._aiMoveInProgress = false;
            this.ui.hideThinking();
        }

        if (this._premove && this.gameState === 'playing') {
            await this._tryPremove();
        }
    }

    _setPremove(fromRow, fromCol, toRow, toCol) {
        this._premove = {
            from: this._rowColToAlgebraic(fromRow, fromCol),
            to: this._rowColToAlgebraic(toRow, toCol),
            fromRow, fromCol, toRow, toCol
        };
        this.ui.highlightPremove(this._premove.from, this._premove.to);
    }

    _clearPremove() {
        if (!this._premove) return;
        this._premove = null;
        this.ui.clearPremove();
    }

    async _tryPremove() {
        if (!this._premove || this.gameState !== 'playing') return;
        const pm = this._premove;
        this._premove = null;
        this.ui.clearPremove();

        if (this._isValidMove(pm.fromRow, pm.fromCol, pm.toRow, pm.toCol)) {
            await this.handleMove(pm.fromRow, pm.fromCol, pm.toRow, pm.toCol, { isPremove: true, autoQueen: true });
        } else {
            this.ui.showNotification('Premove cancelled — illegal', 'warning', 2000);
        }
    }

    _checkGameEnd() {
        if (!ChessCompat.isGameOver(this.chess)) {
            if (ChessCompat.inCheck(this.chess)) this._highlightCheck();
            return false;
        }

        this.gameState = 'ended';
        clearTimeout(this._aiMoveTimer);
        this._clearPremove();
        if (this.clock) this.clock.stop();
        this._clearAutoSave();

        let winner = 'Draw', reason = 'draw';
        if (ChessCompat.isCheckmate(this.chess)) {
            winner = this.chess.turn() === 'w' ? 'Black' : 'White';
            reason = 'checkmate';
        } else if (ChessCompat.isStalemate(this.chess)) {
            reason = 'stalemate';
        }

        setTimeout(() => {
            this.ui.showGameOver({ winner, reason, stats: this._getFinalStats() });
        }, 800);
        return true;
    }

    newGame() {
        clearTimeout(this._aiMoveTimer);
        this._aiMoveInProgress = false;
        this._clearPremove();
        if (this.chess) this.chess.reset();
        if (this.engine) this.engine.reset();

        this.selectedSquare = null;
        this.gameState = 'playing';
        this.lastMove = null;
        this._historyViewIndex = -1;
        this._playerMoveScores = [];
        this.gameStats = {
            totalMoves: 0, captures: 0, checks: 0,
            startTime: Date.now(), accuracy: 0
        };

        this._setupClock();
        this._lastSuggestion = null;
        this._clearAutoSave();
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        this.ui.clearSelection();
        this.ui.clearHighlights();
        this.ui.clearArrows();
        this._refreshBoard();
        this._deferAnalysis();

        if (this.gameMode === 'ai' && this.playerColor === 'black') {
            if (this.clock) this.clock.start('w');
            this._scheduleAIMove();
        } else if (this.clock) {
            this.clock.start('w');
        }
    }

    undoMove() {
        if (this.gameState === 'viewing') return;
        if (!this.chess || this.gameStats.totalMoves === 0) return;
        clearTimeout(this._aiMoveTimer);
        this._aiMoveInProgress = false;
        this._clearPremove();

        const undone = this.chess.undo();
        if (!undone) return;
        this.gameStats.totalMoves = Math.max(0, this.gameStats.totalMoves - 1);

        if (this.gameMode === 'ai') {
            const aiUndo = this.chess.undo();
            if (aiUndo) this.gameStats.totalMoves = Math.max(0, this.gameStats.totalMoves - 1);
        }

        if (this.engine) this.engine.chess.load(this.chess.fen());
        this.gameState = 'playing';
        this._historyViewIndex = -1;
        this.lastMove = null;

        const history = this.chess.history({ verbose: true });
        if (history.length > 0) {
            const last = history[history.length - 1];
            this.lastMove = { from: last.from, to: last.to };
        }

        this.ui.clearSelection();
        this.selectedSquare = null;
        this._refreshBoard();
        this._deferAnalysis();
        this._autoSave();
    }

    resign() {
        if (this.gameState !== 'playing') return;
        if (!confirm('Are you sure you want to resign?')) return;
        this.gameState = 'ended';
        if (this.clock) this.clock.stop();
        this._clearAutoSave();
        const winner = this.gameMode === 'ai' ? 'AI' : (this.chess.turn() === 'w' ? 'Black' : 'White');
        this.ui.showGameOver({ winner, reason: 'resignation', stats: this._getFinalStats() });
    }

    offerDraw() {
        if (this.gameState !== 'playing') return;
        if (this.gameMode === 'ai') {
            const eval_ = this.engine.getCurrentEvaluation();
            const aiColor = this.playerColor === 'white' ? -1 : 1;
            if (eval_ * aiColor < 1.0) {
                this.gameState = 'ended';
                if (this.clock) this.clock.stop();
                this._clearAutoSave();
                this.ui.showGameOver({ winner: 'Draw', reason: 'agreement', stats: this._getFinalStats() });
            } else {
                this.ui.showNotification('Draw offer declined', 'warning');
            }
        } else {
            this.ui.showDrawOfferDialog().then(accepted => {
                if (accepted) {
                    this.gameState = 'ended';
                    if (this.clock) this.clock.stop();
                    this._clearAutoSave();
                    this.ui.showGameOver({ winner: 'Draw', reason: 'agreement', stats: this._getFinalStats() });
                }
            });
        }
    }

    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.ui.flipBoard(this.isFlipped);
        this._updatePlayerPanels();
    }

    navigateHistory(direction) {
        const history = this.chess.history({ verbose: true });
        if (history.length === 0) return;
        if (this._historyViewIndex === -1 && direction === 1) return;

        let newIndex;
        if (this._historyViewIndex === -1) {
            newIndex = history.length - 1;
        } else {
            newIndex = this._historyViewIndex + direction;
        }

        if (newIndex < 0) { this.goToMove(0); return; }
        if (newIndex >= history.length) { this.goToLive(); return; }
        this.goToMove(newIndex);
    }

    goToMove(index) {
        const history = this.chess.history({ verbose: true });
        if (index < 0 || index >= history.length) return;

        this._historyViewIndex = index;
        const tempChess = new Chess();
        for (let i = 0; i <= index; i++) tempChess.move(history[i].san);

        this.ui.renderPosition(tempChess.board());
        if (index >= 0) this.ui.highlightLastMove(history[index].from, history[index].to);
        this.ui.updateMoveHistory(this.chess.history(), this._historyViewIndex);
        this.ui.updateEngineAnalysis({ score: null, bestMove: null });
    }

    goToLive() {
        this._historyViewIndex = -1;
        this._refreshBoard();
        this._deferAnalysis();
    }

    _setupClock() {
        const timeControls = {
            'none': null,
            'bullet1': { time: 60000, increment: 0 },
            'bullet2': { time: 120000, increment: 1000 },
            'blitz3': { time: 180000, increment: 0 },
            'blitz5': { time: 300000, increment: 0 },
            'rapid10': { time: 600000, increment: 0 },
            'rapid15': { time: 900000, increment: 10000 },
            'classical30': { time: 1800000, increment: 0 }
        };

        const tc = timeControls[this.gameSettings.timeControl];
        if (!tc) {
            this.clock = null;
            this.ui.updateClocks(null, null, null);
            return;
        }

        this.clock = new ChessClock(tc.time, tc.time, tc.increment);
        this.clock.onTick = (activeColor, times) => {
            const topColor = this.isFlipped ? 'w' : 'b';
            const botColor = this.isFlipped ? 'b' : 'w';
            this.ui.updateClocks(
                times[topColor], times[botColor],
                activeColor === topColor ? 'top' : 'bottom'
            );
        };
        this.clock.onTimeout = (loser) => {
            this.gameState = 'ended';
            this._clearAutoSave();
            const winner = loser === 'w' ? 'Black' : 'White';
            this.ui.showGameOver({ winner, reason: 'timeout', stats: this._getFinalStats() });
        };
        this.ui.updateClocks(tc.time, tc.time, null);
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('chess-settings');
            if (saved) this.gameSettings = { ...this.gameSettings, ...JSON.parse(saved) };
        } catch (e) { /* localStorage may be unavailable */ }
    }

    saveSettings() {
        try { localStorage.setItem('chess-settings', JSON.stringify(this.gameSettings)); }
        catch (e) { /* localStorage may be unavailable */ }
    }

    applySettings() {
        if (this.engine) this.engine.setDifficulty(this.gameSettings.difficulty);
        this.ui.applyTheme(this.gameSettings.boardTheme);

        document.querySelectorAll('.coordinates').forEach(c => {
            c.style.display = this.gameSettings.showCoordinates ? 'flex' : 'none';
        });

        const diffNames = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
        const diffEl = document.getElementById('difficulty');
        if (diffEl) diffEl.textContent = diffNames[this.gameSettings.difficulty] || 'Medium';
        const modeEl = document.getElementById('gameMode');
        if (modeEl) modeEl.textContent = this.gameMode === 'ai' ? 'vs AI' : 'Local';
        const drawBtn = document.getElementById('drawBtn');
        if (drawBtn) drawBtn.style.display = this.gameMode === 'ai' ? 'none' : '';

        this.playerColor = this.gameSettings.playerColor === 'random' ?
            (Math.random() > 0.5 ? 'white' : 'black') : this.gameSettings.playerColor;

        this._updatePlayerPanels();
    }

    _updatePlayerPanels() {
        const bottomColor = this.isFlipped ? 'black' : 'white';
        const ratings = { easy: '900', medium: '1400', hard: '1800', expert: '2200' };
        const aiRating = ratings[this.gameSettings.difficulty] || '1400';

        let topName, bottomName, topRating, bottomRating;
        if (this.gameMode === 'ai') {
            const playerOnBottom = this.playerColor === bottomColor;
            topName = playerOnBottom ? 'AI Opponent' : 'You';
            bottomName = playerOnBottom ? 'You' : 'AI Opponent';
            topRating = playerOnBottom ? aiRating : '';
            bottomRating = playerOnBottom ? '' : aiRating;
        } else {
            topName = this.isFlipped ? 'White' : 'Black';
            bottomName = this.isFlipped ? 'Black' : 'White';
            topRating = '';
            bottomRating = '';
        }

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('topPlayerName', topName);
        set('bottomPlayerName', bottomName);
        set('topRating', topRating);
        set('bottomRating', bottomRating);
    }

    showSettings() {
        for (const s of SETTINGS_MAP) {
            const el = document.getElementById(s.id);
            if (el) el[s.prop] = this.gameSettings[s.key];
        }
        const volVal = document.getElementById('volumeValue');
        if (volVal) volVal.textContent = this.gameSettings.volume + '%';
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'flex';
    }

    saveSettingsFromForm() {
        for (const s of SETTINGS_MAP) {
            const el = document.getElementById(s.id);
            if (!el) continue;
            this.gameSettings[s.key] = s.parse ? s.parse(el[s.prop]) : el[s.prop];
        }
        this.saveSettings();
        this.applySettings();
    }

    resetSettings() {
        this.gameSettings = {
            difficulty: 'medium', playerColor: 'white', gameMode: 'ai',
            timeControl: 'none', showCoordinates: true, highlightLastMove: true,
            showPossibleMoves: true, enableAnimations: true, enableSounds: true,
            volume: 50, boardTheme: 'classic'
        };
        this.saveSettings();
        this.applySettings();
        this.showSettings();
    }

    exportPGN() {
        if (!this.chess) return;
        const pgn = this.chess.pgn();
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importPGN(pgnText) {
        if (!pgnText || !pgnText.trim()) {
            this.ui.showNotification('Please enter a PGN', 'warning');
            return false;
        }
        const temp = new Chess();
        if (!temp.load_pgn(pgnText)) {
            this.ui.showNotification('Invalid PGN format', 'error');
            return false;
        }
        this.chess.reset();
        this.chess.load_pgn(pgnText);
        if (this.engine) this.engine.chess.load(this.chess.fen());

        this.gameState = 'viewing';
        this._historyViewIndex = -1;
        this.lastMove = null;
        this._clearAutoSave();
        if (this.clock) this.clock.stop();

        const history = this.chess.history({ verbose: true });
        if (history.length > 0) {
            const last = history[history.length - 1];
            this.lastMove = { from: last.from, to: last.to };
        }

        this._refreshBoard();
        this.ui.showNotification(`Loaded game: ${history.length} moves`, 'success');
        return true;
    }

    _autoSave() {
        if (this.gameState !== 'playing' || !this.chess) return;
        try {
            localStorage.setItem('chess-autosave', JSON.stringify({
                pgn: this.chess.pgn(),
                playerColor: this.playerColor,
                stats: this.gameStats,
                ts: Date.now()
            }));
        } catch (e) { /* localStorage may be unavailable */ }
    }

    _loadAutoSave() {
        try {
            const raw = localStorage.getItem('chess-autosave');
            if (!raw) return false;
            const save = JSON.parse(raw);
            if (Date.now() - save.ts > 86400000) { this._clearAutoSave(); return false; }
            if (save.pgn == null) return false;
            if (save.pgn !== '' && !this.chess.load_pgn(save.pgn)) return false;

            if (this.engine) this.engine.chess.load(this.chess.fen());
            if (save.playerColor) this.playerColor = save.playerColor;
            if (save.stats) this.gameStats = { ...this.gameStats, ...save.stats, startTime: Date.now() };

            const history = this.chess.history({ verbose: true });
            if (history.length > 0) {
                const last = history[history.length - 1];
                this.lastMove = { from: last.from, to: last.to };
            }

            this.ui.showNotification('Game restored', 'info');
            if (this.gameMode === 'ai' &&
                this.chess.turn() !== (this.playerColor === 'white' ? 'w' : 'b') &&
                !ChessCompat.isGameOver(this.chess)) {
                this._scheduleAIMove();
            }
            return true;
        } catch (e) {
            this._clearAutoSave();
            return false;
        }
    }

    _clearAutoSave() {
        try { localStorage.removeItem('chess-autosave'); } catch (e) {}
    }

    _getOpeningName() {
        const history = this.chess.history();
        for (let len = Math.min(history.length, 15); len >= 1; len--) {
            const key = history.slice(0, len).join(' ');
            if (OPENINGS[key]) return OPENINGS[key];
        }
        return null;
    }

    _rowColToAlgebraic(row, col) {
        return 'abcdefgh'[col] + (8 - row);
    }

    _algebraicToRowCol(sq) {
        return { row: 8 - parseInt(sq[1]), col: 'abcdefgh'.indexOf(sq[0]) };
    }

    _selectPiece(row, col) {
        this.selectedSquare = { row, col };
        this.ui.selectSquare(row, col);
        if (this.gameSettings.showPossibleMoves) {
            const moves = this.chess.moves({ square: this._rowColToAlgebraic(row, col), verbose: true });
            this.ui.highlightValidMoves(moves);
        }
    }

    _isValidMove(fromRow, fromCol, toRow, toCol) {
        const from = this._rowColToAlgebraic(fromRow, fromCol);
        const to = this._rowColToAlgebraic(toRow, toCol);
        return this.chess.moves({ square: from, verbose: true }).some(m => m.to === to);
    }

    _highlightCheck() {
        const board = this.chess.board();
        const turn = this.chess.turn();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.type === 'k' && p.color === turn) {
                    this.ui.highlightKingInCheck(this._rowColToAlgebraic(r, c));
                    return;
                }
            }
        }
    }

    _getCapturedPieces() {
        const history = this.chess.history({ verbose: true });
        const white = [], black = [];
        history.forEach(m => {
            if (m.captured) {
                const capturedColor = m.color === 'w' ? 'b' : 'w';
                (m.color === 'w' ? white : black).push({ type: m.captured, color: capturedColor });
            }
        });
        return { white, black };
    }

    _refreshBoard() {
        if (!this.chess) return;

        this.ui.renderPosition(this.chess.board());

        if (this.lastMove && this.gameSettings.highlightLastMove) {
            this.ui.highlightLastMove(this.lastMove.from, this.lastMove.to);
        }
        if (ChessCompat.inCheck(this.chess) && this.gameState === 'playing') {
            this._highlightCheck();
        }

        const turn = this.chess.turn();
        this.ui.updateDisplay({
            turn: turn === 'w' ? 'White' : 'Black',
            mode: this.gameMode === 'ai' ? 'vs AI' : 'Local',
            difficulty: this.gameSettings.difficulty,
            gameTime: this._formatElapsed()
        });

        this.ui.updateGameStats(this.gameStats);
        this.ui.updateMoveHistory(this.chess.history(), this._historyViewIndex);

        const captured = this._getCapturedPieces();
        const topIsBlack = !this.isFlipped;
        this.ui.updateCapturedPieces(
            topIsBlack ? captured.black : captured.white,
            topIsBlack ? captured.white : captured.black
        );

        const openingEl = document.getElementById('openingName');
        if (openingEl) {
            const name = this._getOpeningName();
            openingEl.textContent = name || '';
            openingEl.style.display = name ? 'block' : 'none';
        }
    }

    _deferAnalysis() {
        if (this._analysisTimer) clearTimeout(this._analysisTimer);
        this._analysisTimer = setTimeout(() => {
            if (!this.engine || this._historyViewIndex !== -1) return;
            const score = this.engine.getCurrentEvaluation();
            const suggestion = this.engine.getBestMoveSuggestion();
            this._lastSuggestion = suggestion;
            this.ui.updateEngineAnalysis({
                score,
                bestMove: suggestion ? suggestion.san : null
            });
        }, 0);
    }

    _formatElapsed() {
        const elapsed = Math.floor((Date.now() - this.gameStats.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    _getFinalStats() {
        return {
            totalMoves: this.gameStats.totalMoves,
            captures: this.gameStats.captures,
            checks: this.gameStats.checks,
            accuracy: this.gameStats.accuracy,
            gameTime: this._formatElapsed()
        };
    }

    _updateAccuracy(from, to, suggestion) {
        if (!suggestion || this.gameMode !== 'ai') return;
        this._playerMoveScores.push(suggestion.from === from && suggestion.to === to ? 1 : 0);
        const total = this._playerMoveScores.reduce((a, b) => a + b, 0);
        this.gameStats.accuracy = Math.round((total / this._playerMoveScores.length) * 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chess === 'undefined') {
        const board = document.getElementById('chessBoard');
        if (board) board.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:20px">Chess.js failed to load. Please refresh.</div>';
        return;
    }
    window.game = new ChessGame();

    setInterval(() => {
        if (window.game && window.game.gameState === 'playing') {
            const el = document.getElementById('gameTime');
            if (el) el.textContent = window.game._formatElapsed();
        }
    }, 1000);
});
