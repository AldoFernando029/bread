import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvQCFDvSnx7PGQG3KrHBpvooB_VGHbN1Q",
  authDomain: "breadroad-1357.firebaseapp.com",
  projectId: "breadroad-1357",
  storageBucket: "breadroad-1357.firebasestorage.app",
  messagingSenderId: "702639811777",
  appId: "1:702639811777:web:62432ab7e4b6dc554b7840",
  measurementId: "G-SD7NQY6ZG3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LOGIKA FIREBASE 

function getWeeklyId() {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    return `leaderboard_week_${weekNumber}_${now.getFullYear()}`;
}

window.submitScore = async function() {
    const nameInput = document.getElementById('nickname');
    const name = nameInput.value.trim() || "Roti Misterius";
    const finalScore = Math.floor(score);

    if (finalScore <= 0) return alert("Main dulu baru kirim skor, Do! wkwk");

    try {
        await addDoc(collection(db, getWeeklyId()), {
            name: name.substring(0, 10),
            score: finalScore,
            timestamp: new Date()
        });
        alert("Skor Berhasil Dikirim!");
        nameInput.value = ""; 
        loadLeaderboard(); 
    } catch (e) {
        console.error("Gagal kirim skor: ", e);
    }
};

async function loadLeaderboard() {
    const display = document.getElementById('leaderboard-display');
    if (!display) return; 

    try {
        const q = query(collection(db, getWeeklyId()), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        // Styling Judul Leaderboard
        let html = `<h4 style="color: #f1c40f; text-align: center; margin-top: 20px; text-transform: uppercase;">🏆 Top 10 Bread Masters</h4>`;
        html += `<ul style="list-style: none; padding: 0; margin: 10px auto; max-width: 250px;">`;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Styling tiap baris: Nama Putih, Skor Emas, Ada garis bawah tipis
            html += `
                <li style="
                    display: flex; 
                    justify-content: space-between; 
                    padding: 8px 0; 
                    border-bottom: 1px solid rgba(255,255,255,0.1); 
                    color: white; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <span style="font-weight: bold;">${data.name}</span>
                    <span style="color: #f1c40f; font-weight: bold;">${data.score} pts</span>
                </li>`;
        });
        
        html += "</ul>";
        display.innerHTML = html;
    } catch (e) {
        display.innerHTML = "<p style='color: white;'>Gagal memuat skor.</p>";
        console.error(e);
    }
}

// LOGIKA GAME 

const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacle-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');

let score = 0;
let playerX = 110; 
let isGameOver = false;
let gameSpeed = 7; 
let animationId;
let obstacles = []; 
let spawnTimer = 0;
const lanes = [10, 110, 210]; 

document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    if ((key === 'arrowleft' || key === 'a') && playerX > 10) playerX -= 100;
    if ((key === 'arrowright' || key === 'd') && playerX < 210) playerX += 100;
    player.style.left = (playerX - 15) + 'px';
});

document.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2 && playerX > 10) playerX -= 100;
    else if (touchX >= window.innerWidth / 2 && playerX < 210) playerX += 100;
    player.style.left = (playerX - 15) + 'px'; 
    e.preventDefault();
}, { passive: false });

function createObstacle() {
    const obsDiv = document.createElement('div');
    obsDiv.classList.add('obstacle');
    const laneX = lanes[Math.floor(Math.random() * lanes.length)];
    obsDiv.style.left = laneX + 'px';
    obsDiv.style.top = '-150px';
    obsDiv.innerHTML = `<img src="Fire.png" alt="Fire">`;
    obstacleContainer.appendChild(obsDiv);
    return { element: obsDiv, y: -150, x: laneX };
}

function gameLoop() {
    if (isGameOver) return;
    score += 0.2; 
    scoreElement.innerText = `Score: ${Math.floor(score)}`;
    
    if (Math.floor(score) > 0 && Math.floor(score) % 100 === 0 && gameSpeed < 15) {
        gameSpeed += 0.2;
    }

    spawnTimer++;
    let currentSpawnInterval = Math.max(45, 90 - Math.floor(score / 20));
    
    if (spawnTimer > currentSpawnInterval) {
        obstacles.push(createObstacle());
        spawnTimer = 0;
    }

    obstacles.forEach((obs, index) => {
        obs.y += gameSpeed;
        obs.element.style.top = obs.y + 'px';

        if (obs.y > 440 && obs.y < 560 && Math.abs(playerX - obs.x) < 50) {
            endGame();
        }

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
    finalScoreText.innerText = `Your Final Score: ${Math.floor(score)}`;
    gameOverScreen.classList.remove('hidden');
    loadLeaderboard(); 
}

window.resetGame = function() {
    score = 0;
    gameSpeed = 7;
    playerX = 110; 
    isGameOver = false;
    spawnTimer = 0;
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    scoreElement.innerText = `Score: 0`;
    gameOverScreen.classList.add('hidden');
    player.style.left = (playerX - 15) + 'px'; 
    gameLoop();
};

// Start 
loadLeaderboard();
gameLoop();