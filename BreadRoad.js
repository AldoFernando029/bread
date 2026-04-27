/* eslint-env browser */

const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacle-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');

let score = 0;
// playerX disesuaikan dengan posisi tengah baru (110px)
let playerX = 110; 
let isGameOver = false;
let gameSpeed = 7; 
let animationId;
let obstacles = []; 
let spawnTimer = 0;

// Jalur jalan baru disesuaikan untuk objek ukuran 130px
// [Kiri, Tengah, Kanan] agar muat di container 350px
const lanes = [10, 110, 210]; 

// 1. KONTROL (PC)
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    // Gunakan boundary (batas) jalur baru: 10 dan 210
    if ((key === 'arrowleft' || key === 'a') && playerX > 10) playerX -= 100;
    if ((key === 'arrowright' || key === 'd') && playerX < 210) playerX += 100;
    player.style.left = playerX + 'px';
});

// 2. KONTROL (MOBILE)
document.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    const touchX = e.touches[0].clientX;
    // Gunakan boundary baru
    if (touchX < window.innerWidth / 2 && playerX > 10) playerX -= 100;
    else if (touchX >= window.innerWidth / 2 && playerX < 210) playerX += 100;
    player.style.left = playerX + 'px';
    e.preventDefault();
}, { passive: false });

// Fungsi Membuat Api
function createObstacle() {
    const obsDiv = document.createElement('div');
    obsDiv.classList.add('obstacle');
    const laneX = lanes[Math.floor(Math.random() * lanes.length)];
    
    obsDiv.style.left = laneX + 'px';
    // Mulai dari lebih tinggi karena ukuran objek lebih besar (-150px)
    obsDiv.style.top = '-150px';
    obsDiv.innerHTML = `<img src="Fire.png" alt="Fire">`;
    
    obstacleContainer.appendChild(obsDiv);
    return { element: obsDiv, y: -150, x: laneX };
}

function gameLoop() {
    if (isGameOver) return;

    // Skor bertambah
    score += 0.2; 
    scoreElement.innerText = `Score: ${Math.floor(score)}`;
    
    // Difficulty scaling (Phase makin cepat)
    if (Math.floor(score) > 0 && Math.floor(score) % 100 === 0 && gameSpeed < 15) {
        gameSpeed += 0.2; // Tambah 0.2 setiap 100 poin
    }

    spawnTimer++;
    let currentSpawnInterval = Math.max(45, 90 - Math.floor(score / 20));
    
    if (spawnTimer > currentSpawnInterval) {
        obstacles.push(createObstacle());
        spawnTimer = 0;
    }

    // Pergerakan & Tabrakan
    obstacles.forEach((obs, index) => {
        obs.y += gameSpeed;
        obs.element.style.top = obs.y + 'px';

    const hitboxPadding = 25; // Memberi ruang aman 25px
    if (
        obs.y > 450 && obs.y < 560 && // Menyesuaikan area kontak vertikal
        Math.abs(playerX - obs.x) < 65 // Dipersempit agar tidak gampang senggolan
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
    // Reset playerX ke posisi tengah baru (110px)
    playerX = 110; 
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

// Start Game
gameLoop();