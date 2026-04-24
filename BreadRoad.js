/* eslint-env browser */
const player = document.getElementById('player');
const obstacle = document.getElementById('obstacle');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');

let score = 0;
let playerY = 115; 
let obstacleX = 800;
let obstacleY = 115;
let isGameOver = false;
let gameSpeed = 5;
let animationId;

// KONTROL KEYBOARD (PC) 
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    
    if (key === 'arrowup' || key === 'w') {
        if (playerY > 15) playerY -= 100;
    }
    if (key === 'arrowdown' || key === 's') {
        if (playerY < 215) playerY += 100;
    }
    player.style.top = playerY + 'px';
}); // Penutup keydown di sini

//  KONTROL SENTUH (MOBILE) 
document.addEventListener('touchstart', (e) => {
    if (isGameOver) return;

    const touchY = e.touches[0].clientY;
    const screenHeight = window.innerHeight;

    if (touchY < screenHeight / 2) {
        if (playerY > 15) playerY -= 100;
    } else {
        if (playerY < 215) playerY += 100;
    }

    player.style.top = playerY + 'px';
    e.preventDefault(); 
}, { passive: false });

// LOGIKA UTAMA GAME
function gameLoop() {
    if (isGameOver) return;

    score += 0.1;
    scoreElement.innerText = `Skor: ${Math.floor(score)}`;

    obstacleX -= gameSpeed;
    
    if (obstacleX < -80) {
        obstacleX = 800;
        const positions = [15, 115, 215]; 
        obstacleY = positions[Math.floor(Math.random() * positions.length)];
        obstacle.style.top = obstacleY + 'px';
        
        if (Math.floor(score) > 0 && Math.floor(score) % 100 === 0) {
            gameSpeed += 0.5;
        }
    }
    obstacle.style.left = obstacleX + 'px';

    if (
        obstacleX < 110 && obstacleX > 40 && 
        Math.abs(playerY - obstacleY) < 50
    ) {
        endGame();
        return;
    }

    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacleX = 800;
    playerY = 115;
    isGameOver = false;
    
    scoreElement.innerText = `Skor: 0`;
    gameOverScreen.classList.add('hidden');
    
    player.style.top = playerY + 'px';
    obstacle.style.left = obstacleX + 'px';
    
    cancelAnimationFrame(animationId);
    gameLoop();
}

gameLoop();