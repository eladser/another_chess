// Board coordinate fix and final optimizations
// This ensures proper square coloring and coordinate alignment

// Add this CSS to fix the board square coloring
const style = document.createElement('style');
style.textContent = `
/* Fix board square coloring - ensure proper alternating pattern */
.square {
    background-color: var(--light-square) !important;
}

.square:nth-child(2n) {
    background-color: var(--dark-square) !important;
}

/* Fix for each row to ensure proper checkerboard pattern */
.square:nth-child(8n+1),
.square:nth-child(8n+2),
.square:nth-child(8n+3),
.square:nth-child(8n+4),
.square:nth-child(8n+5),
.square:nth-child(8n+6),
.square:nth-child(8n+7),
.square:nth-child(8n+8) {
    background-color: var(--light-square) !important;
}

/* Odd rows (1,3,5,7) */
.square:nth-child(n+1):nth-child(-n+8):nth-child(2n),
.square:nth-child(n+17):nth-child(-n+24):nth-child(2n),
.square:nth-child(n+33):nth-child(-n+40):nth-child(2n),
.square:nth-child(n+49):nth-child(-n+56):nth-child(2n) {
    background-color: var(--dark-square) !important;
}

/* Even rows (2,4,6,8) */
.square:nth-child(n+9):nth-child(-n+16):nth-child(2n+1),
.square:nth-child(n+25):nth-child(-n+32):nth-child(2n+1),
.square:nth-child(n+41):nth-child(-n+48):nth-child(2n+1),
.square:nth-child(n+57):nth-child(-n+64):nth-child(2n+1) {
    background-color: var(--dark-square) !important;
}

/* Ensure coordinates are visible */
.coordinates {
    display: flex !important;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.coordinates:hover {
    opacity: 1;
}

.coord {
    font-weight: 600;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    user-select: none;
}

/* Mobile responsiveness for coordinates */
@media (max-width: 520px) {
    .coordinates-left {
        display: none !important;
    }
    
    .coordinates-bottom {
        display: none !important;
    }
}
`;

document.head.appendChild(style);

// Function to properly color the board squares
function fixBoardSquares() {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        // Remove existing color classes
        square.classList.remove('light-square', 'dark-square');
        
        // Apply correct coloring based on checkerboard pattern
        if ((row + col) % 2 === 0) {
            square.style.backgroundColor = 'var(--light-square)';
        } else {
            square.style.backgroundColor = 'var(--dark-square)';
        }
    });
}

// Function to ensure coordinates are correctly displayed
function fixCoordinates() {
    const leftCoords = document.getElementById('leftCoords');
    const bottomCoords = document.getElementById('bottomCoords');
    
    if (leftCoords && bottomCoords) {
        // Ensure coordinates are properly aligned
        leftCoords.style.display = 'flex';
        leftCoords.style.flexDirection = 'column';
        leftCoords.style.justifyContent = 'space-around';
        leftCoords.style.alignItems = 'center';
        
        bottomCoords.style.display = 'flex';
        bottomCoords.style.justifyContent = 'space-around';
        bottomCoords.style.alignItems = 'center';
    }
}

// Apply fixes when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fixBoardSquares();
        fixCoordinates();
    }, 100);
});

// Export functions for use in main game
window.chessFixes = {
    fixBoardSquares,
    fixCoordinates
};