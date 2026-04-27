import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIREBASE CONFIG 
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

// GLOBAL STATE 
let score = 0;
let playerX = 110; 
let isGameOver = false;
let hasSubmitted = false; 
let gameSpeed = 7; 
let animationId;
let obstacles = []; 
let spawnTimer = 0;
const lanes = [10, 110, 210]; 

const player = document.getElementById('player');
const obstacleContainer = document.getElementById('obstacle-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');

// DATABASE LOGIC 
function getWeeklyId() {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    return `leaderboard_week_${weekNumber}_${now.getFullYear()}`;
}

window.submitScore = async function() {
    const nameInput = document.getElementById('nickname');
    const submitBtn = document.querySelector('button[onclick="submitScore()"]');
    const inputArea = document.getElementById('input-area');
    const name = nameInput.value.trim() || "anonym";
    const finalScore = Math.floor(score);

    if (hasSubmitted) return; 
    if (finalScore <= 0) return alert("Please try again!");

    try {
        hasSubmitted = true; 
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "Sending..."; }

        await addDoc(collection(db, getWeeklyId()), {
            name: name.substring(0, 10),
            score: finalScore,
            timestamp: new Date()
        });

        if (inputArea) inputArea.innerHTML = "<p style='color:#2ecc71; font-weight:bold;'>Score Submitted! ✅</p>";
        loadLeaderboard(); 
    } catch (e) {
        hasSubmitted = false; 
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Send Score"; }
    }
};

async function loadLeaderboard() {
    const display = document.getElementById('leaderboard-display');
    if (!display) return; 

    try {
        const q = query(collection(db, getWeeklyId()), orderBy("score", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        let html = `<h4 style="color: #f39c12; text-align: center; margin: 10px 0;">🏆 TOP 10 MASTERS</h4><ul style="list-style:none; padding:0;">`;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            html += `<li style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee; font-size:14px; color:#333;">
                        <span><b>${data.name}</b></span><span>${data.score} pts</span>
                    </li>`;
        });
        html += "</ul>";
        display.innerHTML = html;
    } catch (e) { display.innerHTML = "<p>Gagal memuat skor.</p>"; }
}

// GAME CONTROLS (OFFSET -10 SYNC) 
function updatePlayerPosition() {
    player.style.left = (playerX - 10) + 'px'; 
}

document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toLowerCase();
    if ((key === 'arrowleft' || key === 'a') && playerX > 10) playerX -= 100;
    if ((key === 'arrowright' || key === 'd') && playerX < 210) playerX += 100;
    updatePlayerPosition();
});

document.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2 && playerX > 10) playerX -= 100;
    else if (touchX >= window.innerWidth / 2 && playerX < 210) playerX += 100;
    
    player.style.left = (playerX - 10) + 'px'; 
    e.preventDefault();
}, { passive: false });

// GAME ENGINE 
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
    
    score += 0.15;
    scoreElement.innerText = `Score: ${Math.floor(score)}`;
    
    if (Math.floor(score) > 0 && Math.floor(score) % 150 === 0 && gameSpeed < 18) {
        gameSpeed += 0.1;
    }

    spawnTimer++;
    let currentSpawnInterval = Math.max(40, 85 - Math.floor(score / 30));
    
    if (spawnTimer > currentSpawnInterval) {
        obstacles.push(createObstacle());
        spawnTimer = 0;
    }

    obstacles.forEach((obs, index) => {
        obs.y += gameSpeed;
        obs.element.style.top = obs.y + 'px';
        
        // PERBAIKAN HITBOX DISINI
        // turunkan ambang batas 'y' (dimulai dari 380) agar 
        // tabrakan terdeteksi saat moncong api baru menyentuh roti.
        // Range: 380 sampai 480.
        if (obs.y > 380 && obs.y < 480 && Math.abs(playerX - obs.x) < 35) {
            endGame();
        }
        
        if (obs.y > 700) { obs.element.remove(); obstacles.splice(index, 1); }
    });
    
    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScoreText.innerText = `Final Score: ${Math.floor(score)}`;
    gameOverScreen.classList.remove('hidden');
    loadLeaderboard(); 
}

window.resetGame = function() {
    location.reload(); 
};

// START 
player.style.left = (playerX - 10) + 'px'; 
loadLeaderboard();
gameLoop();