/* eslint-env browser */
const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacle-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');

let score = 0;
let playerX = 125;
let isGameOver = false;
let gameSpeed = 7; // Mulai lebih cepat
let animationId;
let obstacles = []; 
let spawnTimer = 0;
const lanes = [25, 125, 225];

// 1. KONTROL (PC)
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    if ((key === 'arrowleft' || key === 'a') && playerX > 25) playerX -= 100;
    if ((key === 'arrowright' || key === 'd') && playerX < 225) playerX += 100;
    player.style.left = playerX + 'px';
});

// 2. KONTROL (MOBILE)
document.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2 && playerX > 25) playerX -= 100;
    else if (touchX >= window.innerWidth / 2 && playerX < 225) playerX += 100;
    player.style.left = playerX + 'px';
    e.preventDefault();
}, { passive: false });

// Fungsi Membuat Api
function createObstacle() {
    const obsDiv = document.createElement('div');
    obsDiv.classList.add('obstacle');
    const laneX = lanes[Math.floor(Math.random() * lanes.length)];
    
    obsDiv.style.left = laneX + 'px';
    obsDiv.style.top = '-120px';
    obsDiv.innerHTML = `<img src="Fire.png" alt="Fire">`;
    
    obstacleContainer.appendChild(obsDiv);
    return { element: obsDiv, y: -120, x: laneX };
}

function gameLoop() {
    if (isGameOver) return;

    // Skor & Difficulty Scaling
    score += 0.2; // Skor naik lebih cepat
    scoreElement.innerText = `Score: ${Math.floor(score)}`;
    
    // Kecepatan bertambah setiap 50 poin secara progresif
    if (Math.floor(score) % 50 === 0) {
        gameSpeed += 0.005; 
    }

    // Sistem Muncul Api (Phase makin cepat)
    spawnTimer++;
    // Interval spawn mengecil seiring skor (makin tinggi skor, makin rapat apinya)
    let currentSpawnInterval = Math.max(25, 80 - Math.floor(score / 15));
    
    if (spawnTimer > currentSpawnInterval) {
        obstacles.push(createObstacle());
        spawnTimer = 0;
    }

    // Pergerakan & Tabrakan
    obstacles.forEach((obs, index) => {
        obs.y += gameSpeed;
        obs.element.style.top = obs.y + 'px';

        // Deteksi Tabrakan (Hitbox disesuaikan)
        if (
            obs.y > 430 && obs.y < 540 && 
            Math.abs(playerX - obs.x) < 70
        ) {
            endGame();
        }

        // Hapus api yang lolos
        if (obs.y > 650) {
            obs.element.remove();
            obstacles.splice(index, 1);
        }
    });

    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScoreText.innerText = `Skor Akhir Kamu: ${Math.floor(score)}`;
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    score = 0;
    gameSpeed = 7;
    playerX = 125;
    isGameOver = false;
    spawnTimer = 0;
    
    // Hapus semua api lama
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    
    scoreElement.innerText = `Score: 0`;
    gameOverScreen.classList.add('hidden');
    player.style.left = playerX + 'px';
    gameLoop();
}

// Start
gameLoop();