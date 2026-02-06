class ChessUI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('chessBoard');
        this.dragState = null;
        this.touchDragState = null;
        this.isFlipped = false;
        this._lastDragHoverSquare = null;
        this._touchRafId = null;
        this._arrows = [];
        this._arrowDrag = null;
        this._arrowSvg = null;

        this.pieceSymbols = {
            p: { w: '♙', b: '♟' },
            r: { w: '♖', b: '♜' },
            n: { w: '♘', b: '♞' },
            b: { w: '♗', b: '♝' },
            q: { w: '♕', b: '♛' },
            k: { w: '♔', b: '♚' }
        };
    }

    init() {
        this.createBoard();
        this._createArrowOverlay();
        this._bindEvents();
    }

    createBoard() {
        if (!this.boardElement) {
            console.error('Board element not found');
            return;
        }

        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = this._rowColToAlgebraic(row, col);

                if ((row + col) % 2 === 0) {
                    square.classList.add('light-square');
                } else {
                    square.classList.add('dark-square');
                }

                this.boardElement.appendChild(square);
            }
        }
    }

    renderPosition(board) {
        if (!board || board.length !== 8) {
            console.error('Invalid board array');
            return;
        }

        this.boardElement.querySelectorAll('.piece').forEach(piece => piece.remove());

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const square = this._getSquareElement(row, col);
                    if (square) {
                        const pieceElement = this._createPieceElement(piece, row, col);
                        square.appendChild(pieceElement);
                    }
                }
            }
        }
    }

    _createPieceElement(piece, row, col) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.draggable = true;
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        pieceElement.dataset.color = piece.color;
        pieceElement.dataset.type = piece.type;

        pieceElement.innerHTML = this._pieceHtml(piece.type, piece.color);

        const pieceName = this._getPieceName(piece.type);
        const colorName = piece.color === 'w' ? 'white' : 'black';
        pieceElement.setAttribute('aria-label', `${colorName} ${pieceName} on ${this._rowColToAlgebraic(row, col)}`);
        pieceElement.setAttribute('role', 'button');
        pieceElement.setAttribute('tabindex', '0');

        return pieceElement;
    }

    _pieceHtml(type, color) {
        if (typeof PIECE_SVG !== 'undefined' && PIECE_SVG[type]?.[color]) {
            return PIECE_SVG[type][color];
        }
        return this.pieceSymbols[type]?.[color] || '';
    }

    _getPieceName(type) {
        const names = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
        return names[type] || type;
    }

    animateMove(fromAlg, toAlg) {
        if (!this.game.gameSettings.enableAnimations) return Promise.resolve();
        const fromPos = this._algebraicToRowCol(fromAlg);
        const toPos = this._algebraicToRowCol(toAlg);
        const fromSquare = this._getSquareElement(fromPos.row, fromPos.col);
        const toSquare = this._getSquareElement(toPos.row, toPos.col);
        if (!fromSquare || !toSquare) return Promise.resolve();

        const piece = fromSquare.querySelector('.piece');
        if (!piece) return Promise.resolve();

        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        const dx = fromRect.left - toRect.left;
        const dy = fromRect.top - toRect.top;

        const existingPiece = toSquare.querySelector('.piece');
        if (existingPiece) existingPiece.remove();
        toSquare.appendChild(piece);
        piece.style.transform = `translate(${dx}px, ${dy}px)`;
        piece.classList.add('animating');

        return new Promise(resolve => {
            requestAnimationFrame(() => {
                piece.style.transform = 'translate(0, 0)';
                let fired = false;
                const done = () => {
                    if (fired) return;
                    fired = true;
                    piece.classList.remove('animating');
                    piece.style.transform = '';
                    resolve();
                };
                piece.addEventListener('transitionend', done, { once: true });
                setTimeout(done, 300);
            });
        });
    }

    selectSquare(row, col) {
        this.clearSelection();
        const square = this._getSquareElement(row, col);
        if (square) {
            square.classList.add('selected');
        }
    }

    clearSelection() {
        this.boardElement.querySelectorAll('.selected, .valid-move, .capture-move').forEach(el => {
            el.classList.remove('selected', 'valid-move', 'capture-move');
        });
    }

    highlightValidMoves(moves) {
        if (!moves || !Array.isArray(moves)) return;

        moves.forEach(move => {
            const { row, col } = this._algebraicToRowCol(move.to);
            const square = this._getSquareElement(row, col);
            if (square) {
                if (move.captured) {
                    square.classList.add('capture-move');
                } else {
                    square.classList.add('valid-move');
                }
            }
        });
    }

    highlightLastMove(from, to) {
        this.boardElement.querySelectorAll('.last-move').forEach(el => {
            el.classList.remove('last-move');
        });

        if (from) {
            const fromPos = this._algebraicToRowCol(from);
            const fromSquare = this._getSquareElement(fromPos.row, fromPos.col);
            if (fromSquare) fromSquare.classList.add('last-move');
        }

        if (to) {
            const toPos = this._algebraicToRowCol(to);
            const toSquare = this._getSquareElement(toPos.row, toPos.col);
            if (toSquare) toSquare.classList.add('last-move');
        }
    }

    highlightKingInCheck(square) {
        this.boardElement.querySelectorAll('.in-check').forEach(el => {
            el.classList.remove('in-check');
        });

        if (square) {
            const { row, col } = this._algebraicToRowCol(square);
            const squareElement = this._getSquareElement(row, col);
            if (squareElement) {
                squareElement.classList.add('in-check');
            }
        }
    }

    highlightPremove(from, to) {
        this.clearPremove();
        const fromPos = this._algebraicToRowCol(from);
        const toPos = this._algebraicToRowCol(to);
        const fromSq = this._getSquareElement(fromPos.row, fromPos.col);
        const toSq = this._getSquareElement(toPos.row, toPos.col);
        if (fromSq) fromSq.classList.add('premove');
        if (toSq) toSq.classList.add('premove');
    }

    clearPremove() {
        this.boardElement.querySelectorAll('.premove').forEach(el => el.classList.remove('premove'));
    }

    clearHighlights() {
        this.boardElement.querySelectorAll('.selected, .valid-move, .capture-move, .last-move, .in-check, .drop-target, .drag-hover, .premove').forEach(el => {
            el.classList.remove('selected', 'valid-move', 'capture-move', 'last-move', 'in-check', 'drop-target', 'drag-hover', 'premove');
        });
    }

    _setText(id, val) {
        if (val == null) return;
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    updateDisplay(state) {
        if (!state) return;
        this._setText('currentTurn', state.turn);
        this._setText('gameMode', state.mode);
        this._setText('difficulty', state.difficulty ? state.difficulty[0].toUpperCase() + state.difficulty.slice(1) : null);
        this._setText('gameTime', state.gameTime);
        const turnEl = document.getElementById('currentTurn');
        if (turnEl) turnEl.className = 'status-value ' + (state.turn === 'White' ? 'white-turn' : 'black-turn');
    }

    updateGameStats(stats) {
        if (!stats) return;
        this._setText('totalMoves', stats.totalMoves);
        this._setText('captures', stats.captures);
        this._setText('checks', stats.checks);
        this._setText('accuracy', stats.accuracy > 0 ? Math.round(stats.accuracy) + '%' : '--');
    }

    updateMoveHistory(history, activeIndex = -1) {
        const historyEl = document.getElementById('moveList');
        if (!historyEl) return;

        historyEl.innerHTML = '';

        if (!history || history.length === 0) {
            historyEl.innerHTML = '<div class="no-moves">No moves yet</div>';
            return;
        }

        for (let i = 0; i < history.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const moveRow = document.createElement('div');
            moveRow.className = 'move-row';

            const numberEl = document.createElement('span');
            numberEl.className = 'move-number';
            numberEl.textContent = moveNumber + '.';
            moveRow.appendChild(numberEl);

            const whiteMove = document.createElement('span');
            whiteMove.className = 'move-item';
            whiteMove.textContent = history[i];
            whiteMove.dataset.index = i;
            if (i === activeIndex) {
                whiteMove.classList.add('active');
            }
            whiteMove.addEventListener('click', () => this.game.goToMove(i));
            moveRow.appendChild(whiteMove);

            if (i + 1 < history.length) {
                const blackMove = document.createElement('span');
                blackMove.className = 'move-item';
                blackMove.textContent = history[i + 1];
                blackMove.dataset.index = i + 1;
                if (i + 1 === activeIndex) {
                    blackMove.classList.add('active');
                }
                blackMove.addEventListener('click', () => this.game.goToMove(i + 1));
                moveRow.appendChild(blackMove);
            }

            historyEl.appendChild(moveRow);
        }

        const activeMove = historyEl.querySelector('.active');
        if (activeMove) {
            activeMove.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            historyEl.scrollTop = historyEl.scrollHeight;
        }
    }

    updateEngineAnalysis(evaluation) {
        if (evaluation === undefined || evaluation === null) return;

        const score = typeof evaluation === 'number' ? evaluation : evaluation.score;
        const bestMove = typeof evaluation === 'object' ? evaluation.bestMove : null;

        const evalEl = document.getElementById('evalText');
        if (evalEl) {
            if (score == null) {
                evalEl.textContent = '--';
            } else if (score === Infinity || score > 900) {
                evalEl.textContent = 'White wins';
            } else if (score === -Infinity || score < -900) {
                evalEl.textContent = 'Black wins';
            } else {
                evalEl.textContent = (score > 0 ? '+' : '') + score.toFixed(1);
            }
        }

        const evalBar = document.getElementById('evalBar');
        if (evalBar) {
            if (score == null) {
                evalBar.style.width = '50%';
            } else {
                const clampedScore = Math.max(-10, Math.min(10, score));
                const percentage = 50 + (clampedScore / 20) * 100;
                evalBar.style.width = Math.max(0, Math.min(100, percentage)) + '%';
            }
        }

        const bestMoveEl = document.getElementById('bestMove');
        if (bestMoveEl) {
            bestMoveEl.textContent = bestMove || '--';
        }
    }

    updateCapturedPieces(topCaptures, bottomCaptures) {
        const topCapturedEl = document.getElementById('topCaptured');
        if (topCapturedEl && topCaptures) {
            topCapturedEl.innerHTML = topCaptures.map(p =>
                `<span class="captured-piece">${this._pieceHtml(p.type, p.color)}</span>`
            ).join('');
        }

        const bottomCapturedEl = document.getElementById('bottomCaptured');
        if (bottomCapturedEl && bottomCaptures) {
            bottomCapturedEl.innerHTML = bottomCaptures.map(p =>
                `<span class="captured-piece">${this._pieceHtml(p.type, p.color)}</span>`
            ).join('');
        }
    }

    updateClocks(topTimeMs, bottomTimeMs, activePosition = null) {
        const topTimeEl = document.getElementById('topTime');
        const bottomTimeEl = document.getElementById('bottomTime');

        if (topTimeEl) {
            if (topTimeMs == null) {
                topTimeEl.textContent = '--:--';
                topTimeEl.classList.remove('active', 'low');
            } else {
                topTimeEl.textContent = this._formatClockMs(topTimeMs);
                topTimeEl.classList.toggle('active', activePosition === 'top');
                topTimeEl.classList.toggle('low', topTimeMs < 30000);
            }
        }

        if (bottomTimeEl) {
            if (bottomTimeMs == null) {
                bottomTimeEl.textContent = '--:--';
                bottomTimeEl.classList.remove('active', 'low');
            } else {
                bottomTimeEl.textContent = this._formatClockMs(bottomTimeMs);
                bottomTimeEl.classList.toggle('active', activePosition === 'bottom');
                bottomTimeEl.classList.toggle('low', bottomTimeMs < 30000);
            }
        }
    }

    showGameOver(result) {
        const modal = document.getElementById('gameOverModal');
        if (!modal) return;

        const resultEl = document.getElementById('gameResult');
        const messageEl = document.getElementById('gameOverMessage');

        if (resultEl) {
            if (result.winner === 'Draw') {
                resultEl.textContent = 'Draw';
            } else {
                resultEl.textContent = `${result.winner} Wins!`;
            }
        }

        const reasons = {
            checkmate: 'by checkmate',
            stalemate: 'by stalemate',
            timeout: 'on time',
            resignation: 'by resignation',
            agreement: 'by mutual agreement',
            draw: 'by draw'
        };

        if (messageEl) {
            messageEl.textContent = reasons[result.reason] || result.reason || '';
        }

        if (result.stats) {
            const el = (id) => document.getElementById(id);
            if (el('finalMoves')) el('finalMoves').textContent = result.stats.totalMoves || 0;
            if (el('finalTime')) el('finalTime').textContent = result.stats.gameTime || '0:00';
            if (el('finalCaptures')) el('finalCaptures').textContent = result.stats.captures || 0;
            if (el('finalAccuracy')) el('finalAccuracy').textContent = result.stats.accuracy > 0 ? result.stats.accuracy + '%' : '--';
        }

        modal.style.display = 'flex';
        this.announce(`Game over. ${result.winner} ${reasons[result.reason] || result.reason || ''}`);
    }

    showPromotionDialog(color) {
        return new Promise((resolve) => {
            const modal = document.getElementById('promotionModal');
            if (!modal) {
                resolve('q');
                return;
            }

            const pieces = modal.querySelectorAll('.promotion-piece');
            const controller = new AbortController();
            const { signal } = controller;

            pieces.forEach(p => {
                const pieceType = p.dataset.piece;
                if (pieceType) {
                    p.innerHTML = this._pieceHtml(pieceType, color);
                }
            });

            modal.style.display = 'flex';

            const cleanup = (piece) => {
                controller.abort();
                modal.style.display = 'none';
                resolve(piece);
            };

            pieces.forEach(p => {
                p.addEventListener('click', () => cleanup(p.dataset.piece || 'q'), { signal });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') cleanup('q');
                if (e.key === 'q') cleanup('q');
                if (e.key === 'r') cleanup('r');
                if (e.key === 'b') cleanup('b');
                if (e.key === 'n') cleanup('n');
            }, { signal });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup('q');
            }, { signal });
        });
    }

    showDrawOfferDialog() {
        return new Promise((resolve) => {
            const accept = confirm('Your opponent offers a draw. Do you accept?');
            resolve(accept);
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        container.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('visible'));

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 200);
        }, duration);
    }

    flipBoard(isFlipped) {
        this.isFlipped = isFlipped;
        if (this.boardElement) {
            this.boardElement.classList.toggle('flipped', isFlipped);
        }
        this._renderArrows();
    }

    _createArrowOverlay() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 800 800');
        svg.classList.add('arrow-overlay');
        this.boardElement.after(svg);
        this._arrowSvg = svg;
    }

    clearArrows() {
        if (this._arrows.length === 0) return;
        this._arrows = [];
        this._renderArrows();
    }

    _bindArrowEvents() {
        if (!this.boardElement) return;
        this.boardElement.addEventListener('contextmenu', e => e.preventDefault());

        this.boardElement.addEventListener('mousedown', e => {
            if (e.button !== 2) return;
            const square = e.target.closest('.square');
            if (!square) return;
            this._arrowDrag = {
                fromRow: parseInt(square.dataset.row),
                fromCol: parseInt(square.dataset.col)
            };
        });

        this.boardElement.addEventListener('mouseup', e => {
            if (e.button !== 2 || !this._arrowDrag) return;
            const square = e.target.closest('.square');
            if (!square) { this._arrowDrag = null; return; }

            const toRow = parseInt(square.dataset.row);
            const toCol = parseInt(square.dataset.col);
            const { fromRow, fromCol } = this._arrowDrag;
            this._arrowDrag = null;

            const idx = this._arrows.findIndex(a =>
                a.fr === fromRow && a.fc === fromCol && a.tr === toRow && a.tc === toCol
            );
            if (idx !== -1) {
                this._arrows.splice(idx, 1);
            } else {
                this._arrows.push({ fr: fromRow, fc: fromCol, tr: toRow, tc: toCol });
            }
            this._renderArrows();
        });
    }

    _renderArrows() {
        if (!this._arrowSvg) return;
        this._arrowSvg.innerHTML = '';
        for (const a of this._arrows) {
            if (a.fr === a.tr && a.fc === a.tc) {
                this._drawCircle(a.fr, a.fc);
            } else {
                this._drawArrow(a.fr, a.fc, a.tr, a.tc);
            }
        }
    }

    _sqCenter(row, col) {
        const r = this.isFlipped ? 7 - row : row;
        const c = this.isFlipped ? 7 - col : col;
        return { x: (c + 0.5) * 100, y: (r + 0.5) * 100 };
    }

    _drawArrow(fr, fc, tr, tc) {
        const from = this._sqCenter(fr, fc);
        const to = this._sqCenter(tr, tc);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len, uy = dy / len;
        const px = -uy, py = ux;

        const headLen = 28, headW = 24, shaftW = 12;
        const hb = { x: to.x - ux * headLen, y: to.y - uy * headLen };

        const pts = [
            `${from.x + px * shaftW / 2},${from.y + py * shaftW / 2}`,
            `${hb.x + px * shaftW / 2},${hb.y + py * shaftW / 2}`,
            `${hb.x + px * headW / 2},${hb.y + py * headW / 2}`,
            `${to.x},${to.y}`,
            `${hb.x - px * headW / 2},${hb.y - py * headW / 2}`,
            `${hb.x - px * shaftW / 2},${hb.y - py * shaftW / 2}`,
            `${from.x - px * shaftW / 2},${from.y - py * shaftW / 2}`,
        ];

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', pts.join(' '));
        poly.setAttribute('fill', 'rgba(214, 143, 0, 0.8)');
        this._arrowSvg.appendChild(poly);
    }

    _drawCircle(row, col) {
        const { x, y } = this._sqCenter(row, col);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 42);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'rgba(214, 143, 0, 0.8)');
        circle.setAttribute('stroke-width', '6');
        this._arrowSvg.appendChild(circle);
    }

    applyTheme(theme) {
        if (!this.boardElement) return;

        const toRemove = [...this.boardElement.classList].filter(c => c.startsWith('board-theme-'));
        toRemove.forEach(c => this.boardElement.classList.remove(c));

        if (theme) {
            this.boardElement.classList.add(`board-theme-${theme}`);
        }
    }

    hideLoading() {
        const loadingEl = document.getElementById('loadingScreen');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showThinking() {
        const bestMoveEl = document.getElementById('bestMove');
        if (bestMoveEl) {
            bestMoveEl.dataset.prevText = bestMoveEl.textContent;
            bestMoveEl.textContent = 'Thinking...';
            bestMoveEl.classList.add('thinking');
        }
    }

    hideThinking() {
        const bestMoveEl = document.getElementById('bestMove');
        if (bestMoveEl) {
            bestMoveEl.classList.remove('thinking');
            if (bestMoveEl.dataset.prevText) {
                bestMoveEl.textContent = bestMoveEl.dataset.prevText;
                delete bestMoveEl.dataset.prevText;
            }
        }
    }

    announce(message) {
        const el = document.getElementById('screenReaderAnnouncer');
        if (el) {
            el.textContent = message;
        }
    }

    _bindEvents() {
        this._bindBoardEvents();
        this._bindArrowEvents();
        this._bindKeyboardShortcuts();
        this._bindTouchSupport();
        this._bindButtonEvents();
        this._bindModalEvents();
        this._bindSettingsEvents();
        this._bindDragCleanup();
    }

    _bindBoardEvents() {
        if (!this.boardElement) return;

        this.boardElement.addEventListener('click', (e) => {
            this.clearArrows();
            const square = e.target.closest('.square');
            if (!square) return;
            this._handleSquareClick(square);
        });

        this.boardElement.addEventListener('dragstart', (e) => {
            const piece = e.target.closest('.piece');
            if (!piece) return;
            this._handleDragStart(e, piece);
        });

        this.boardElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            const square = e.target.closest('.square');
            if (square && this.dragState) {
                e.dataTransfer.dropEffect = 'move';

                if (square !== this._lastDragHoverSquare) {
                    if (this._lastDragHoverSquare) {
                        this._lastDragHoverSquare.classList.remove('drag-hover');
                    }
                    square.classList.add('drop-target', 'drag-hover');
                    this._lastDragHoverSquare = square;
                }
            }
        });

        this.boardElement.addEventListener('dragleave', (e) => {
            const square = e.target.closest('.square');
            if (square) {
                square.classList.remove('drop-target', 'drag-hover');
            }
        });

        this.boardElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const square = e.target.closest('.square');
            if (!square || !this.dragState) return;
            this._handleDrop(square);
        });

        this.boardElement.addEventListener('dragend', () => {
            this._cleanupDragState();
        });
    }

    _bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 'Escape') {
                this.clearSelection();
                this._cleanupDragState();
                document.querySelectorAll('.modal').forEach(m => {
                    if (m.id !== 'promotionModal') {
                        m.style.display = 'none';
                    }
                });
            }

            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.game.newGame();
            }

            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.game.undoMove();
            }

            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.game.flipBoard();
            }

            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.game.showSettings();
            }

            if (e.key === 'h' || e.key === '?') {
                this._showModal('helpModal');
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.game.navigateHistory(-1);
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.game.navigateHistory(1);
            }

            if (e.key === 'Home') {
                e.preventDefault();
                this.game.goToMove(0);
            }

            if (e.key === 'End') {
                e.preventDefault();
                this.game.goToLive();
            }
        });
    }

    _bindTouchSupport() {
        if (!this.boardElement) return;

        this.boardElement.addEventListener('touchstart', (e) => {
            const piece = e.target.closest('.piece');
            if (!piece) return;

            const row = parseInt(piece.dataset.row);
            const col = parseInt(piece.dataset.col);

            if (!this.game.canInteract(row, col)) {
                return;
            }

            e.preventDefault();

            const touch = e.touches[0];
            const rect = piece.getBoundingClientRect();

            this.touchDragState = {
                piece,
                fromRow: row,
                fromCol: col,
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
                clone: null
            };

            const clone = piece.cloneNode(true);
            clone.className = piece.className + ' touch-dragging';
            clone.style.position = 'fixed';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = '10000';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.left = '0px';
            clone.style.top = '0px';
            clone.style.transform = `translate3d(${touch.clientX - this.touchDragState.offsetX}px, ${touch.clientY - this.touchDragState.offsetY}px, 0)`;
            document.body.appendChild(clone);

            this.touchDragState.clone = clone;
            piece.classList.add('dragging');

            this.selectSquare(row, col);
            const moves = this.game.getValidMoves(row, col);
            if (moves) {
                this.highlightValidMoves(moves);
            }
        }, { passive: false });

        this.boardElement.addEventListener('touchmove', (e) => {
            if (!this.touchDragState || !this.touchDragState.clone) return;

            e.preventDefault();

            const touch = e.touches[0];

            if (!this._touchRafId) {
                this._touchRafId = requestAnimationFrame(() => {
                    if (this.touchDragState && this.touchDragState.clone) {
                        const clone = this.touchDragState.clone;
                        clone.style.transform = `translate3d(${touch.clientX - this.touchDragState.offsetX}px, ${touch.clientY - this.touchDragState.offsetY}px, 0)`;
                    }
                    this._touchRafId = null;
                });
            }


            const clone = this.touchDragState.clone;
            clone.style.pointerEvents = 'none';
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            clone.style.pointerEvents = '';

            const square = elementBelow ? elementBelow.closest('.square') : null;

            this.boardElement.querySelectorAll('.drag-hover').forEach(el => {
                el.classList.remove('drag-hover');
            });

            if (square) {
                square.classList.add('drag-hover');
            }
        }, { passive: false });

        this.boardElement.addEventListener('touchend', (e) => {
            if (!this.touchDragState) return;

            e.preventDefault();

            const touch = e.changedTouches[0];


            if (this.touchDragState.clone) {
                this.touchDragState.clone.style.pointerEvents = 'none';
            }
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const square = elementBelow ? elementBelow.closest('.square') : null;

            if (square) {
                const toRow = parseInt(square.dataset.row);
                const toCol = parseInt(square.dataset.col);
                this.game.handleMove(
                    this.touchDragState.fromRow,
                    this.touchDragState.fromCol,
                    toRow,
                    toCol
                );
            }

            if (this.touchDragState.clone) {
                this.touchDragState.clone.remove();
            }
            if (this.touchDragState.piece) {
                this.touchDragState.piece.classList.remove('dragging');
            }

            this.touchDragState = null;
            this.clearSelection();
        }, { passive: false });

        this.boardElement.addEventListener('touchcancel', () => {
            if (!this.touchDragState) return;

            if (this.touchDragState.clone) {
                this.touchDragState.clone.remove();
            }
            if (this.touchDragState.piece) {
                this.touchDragState.piece.classList.remove('dragging');
            }

            this.touchDragState = null;
            this.clearSelection();
        });
    }

    _bindButtonEvents() {
        const bindings = {
            newGameBtn: () => this.game.newGame(),
            flipBoardBtn: () => this.game.flipBoard(),
            undoBtn: () => this.game.undoMove(),
            settingsBtn: () => this.game.showSettings(),
            helpBtn: () => this._showModal('helpModal'),
            resignBtn: () => this.game.resign(),
            drawBtn: () => this.game.offerDraw(),
            moveFirst: () => this.game.goToMove(0),
            movePrev: () => this.game.navigateHistory(-1),
            moveNext: () => this.game.navigateHistory(1),
            moveLast: () => this.game.goToLive(),
            playAgainBtn: () => this.game.newGame(),
            exportGameBtn: () => this.game.exportPGN(),
            importPgnBtn: () => this._showModal('pgnImportModal'),
            loadPgnBtn: () => {
                const input = document.getElementById('pgnInput');
                if (input && this.game.importPGN(input.value)) {
                    input.value = '';
                    this._hideModal('pgnImportModal');
                }
            },
        };
        for (const [id, handler] of Object.entries(bindings)) {
            document.getElementById(id)?.addEventListener('click', handler);
        }
    }

    _bindModalEvents() {
        const closers = { closeSettings: 'settingsModal', closeGameOver: 'gameOverModal', closeHelp: 'helpModal', closeHelpBtn: 'helpModal', closePgnImport: 'pgnImportModal', cancelPgnImport: 'pgnImportModal' };
        for (const [btnId, modalId] of Object.entries(closers)) {
            document.getElementById(btnId)?.addEventListener('click', () => this._hideModal(modalId));
        }
        document.addEventListener('click', e => {
            if (e.target.classList.contains('modal') && e.target.id !== 'promotionModal') {
                e.target.style.display = 'none';
            }
        });
    }

    _showModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
    _hideModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }

    _bindSettingsEvents() {
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.game.saveSettingsFromForm();
                this._hideModal('settingsModal');
            });
        }

        const resetSettings = document.getElementById('resetSettings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => this.game.resetSettings());
        }

        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volumeValue = document.getElementById('volumeValue');
                if (volumeValue) {
                    volumeValue.textContent = e.target.value + '%';
                }
            });
        }
    }

    _bindDragCleanup() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._cleanupDragState();
            }
        });

        window.addEventListener('blur', () => {
            this._cleanupDragState();
        });
    }

    _handleSquareClick(squareElement) {
        const row = parseInt(squareElement.dataset.row);
        const col = parseInt(squareElement.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        this.game.handleSquareClick(row, col);
    }

    _handleDragStart(e, pieceElement) {
        const row = parseInt(pieceElement.dataset.row);
        const col = parseInt(pieceElement.dataset.col);

        if (isNaN(row) || isNaN(col)) {
            e.preventDefault();
            return;
        }

        if (!this.game.canInteract(row, col)) {
            e.preventDefault();
            return;
        }

        this.dragState = {
            fromRow: row,
            fromCol: col
        };

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this._rowColToAlgebraic(row, col));

        pieceElement.classList.add('dragging');

        this.selectSquare(row, col);
        const moves = this.game.getValidMoves(row, col);
        if (moves) {
            this.highlightValidMoves(moves);
        }
    }

    _handleDrop(squareElement) {
        if (!this.dragState) return;

        const toRow = parseInt(squareElement.dataset.row);
        const toCol = parseInt(squareElement.dataset.col);

        if (isNaN(toRow) || isNaN(toCol)) {
            this._cleanupDragState();
            return;
        }

        this.game.handleMove(
            this.dragState.fromRow,
            this.dragState.fromCol,
            toRow,
            toCol
        );

        this._cleanupDragState();
    }

    _cleanupDragState() {
        this.dragState = null;

        if (this._lastDragHoverSquare) {
            this._lastDragHoverSquare.classList.remove('drag-hover', 'drop-target');
            this._lastDragHoverSquare = null;
        }

        if (this.boardElement) {
            this.boardElement.querySelectorAll('.dragging').forEach(el => {
                el.classList.remove('dragging');
            });

            this.boardElement.querySelectorAll('.drop-target, .drag-hover').forEach(el => {
                el.classList.remove('drop-target', 'drag-hover');
            });
        }
    }

    _rowColToAlgebraic(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return '';
        return 'abcdefgh'[col] + (8 - row);
    }

    _algebraicToRowCol(square) {
        if (!square || square.length < 2) return { row: -1, col: -1 };
        const col = 'abcdefgh'.indexOf(square[0]);
        const row = 8 - parseInt(square[1]);
        return { row, col };
    }

    _getSquareElement(row, col) {
        if (!this.boardElement) return null;
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    _formatClockMs(ms) {
        if (ms === null || ms === undefined || isNaN(ms)) return '--:--';
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

if (typeof window !== 'undefined') {
    window.ChessUI = ChessUI;
}
