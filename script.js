const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RESPONSIVE CANVAS (unchanged)
let GAME_WIDTH = 800;
let GAME_HEIGHT = 400;
let scaleX = 1;
let scaleY = 1;

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.7;
    
    const targetWidth = Math.min(GAME_WIDTH, maxWidth);
    const targetHeight = Math.min(GAME_HEIGHT, maxHeight);
    
    const aspectRatio = GAME_WIDTH / GAME_HEIGHT;
    
    if (targetWidth / targetHeight > aspectRatio) {
        canvas.height = targetHeight;
        canvas.width = targetHeight * aspectRatio;
    } else {
        canvas.width = targetWidth;
        canvas.height = targetWidth / aspectRatio;
    }
    
    scaleX = canvas.width / GAME_WIDTH;
    scaleY = canvas.height / GAME_HEIGHT;
    
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));
resizeCanvas();

// 😈 IMPOSSIBLE MODE - PURE HELL
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('impossibleHighScore') || 0;
let gameSpeed = 5.5; // INSANE STARTING SPEED

// Player - TINY & DOOMED
const player = {
    x: 90, // WAY TOO CLOSE
    y: 300,
    width: 32, // MICROSCOPIC
    height: 48, // TINY
    vy: 0,
    gravity: 1.2, // ANVIL GRAVITY
    jumpPower: -12, // PATHETIC JUMP
    grounded: false
};

let obstacles = [];
let obstacleTimer = 0;
let groundOffset = 0;

// IMPOSSIBLE PATTERNS
let apocalypseMode = false;
let obstacleDensity = 0.9; // 90% OBSTACLE SCREEN COVERAGE

let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('click', handleTouch);

function handleTouch(e) {
    e.preventDefault();
    jump();
}

function jump() {
    if (player.grounded && gameRunning) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }
}

document.getElementById('highScore').textContent = highScore;

function update() {
    if (!gameRunning) return;

    if (keys['Space'] && player.grounded) {
        jump();
    }

    player.vy += player.gravity;
    player.y += player.vy;

    // NO MERCY GROUND
    if (player.y + player.height > 305) {
        player.y = 305 - player.height;
        player.vy *= 0.3; // BOUNCE DAMPENING
        player.grounded = true;
    }

    // OBSTACLE APOCALYPSE
    obstacleTimer++;
    const spawnRate = 40 - Math.min(score / 8, 30); // SPAWN EVERY 10-40 FRAMES
    if (obstacleTimer > spawnRate) {
        
        // RANDOM DOOM PATTERNS
        const pattern = Math.random();
        
        if (pattern < 0.4) {
            // WALL OF DEATH (4 obstacles)
            for (let i = 0; i < 4; i++) {
                obstacles.push({
                    x: GAME_WIDTH + i * 22,
                    y: 300 - Math.random() * 10 - 15,
                    width: 18,
                    height: 50 + Math.random() * 40
                });
            }
        } else if (pattern < 0.7) {
            // VERTICAL WALL
            obstacles.push({
                x: GAME_WIDTH,
                y: 150,
                width: 25,
                height: 190 // FULL HEIGHT!
            });
        } else if (pattern < 0.85) {
            // LOW SKINNY FAST ONES
            for (let i = 0; i < 3; i++) {
                obstacles.push({
                    x: GAME_WIDTH + i * 28,
                    y: 280,
                    width: 15,
                    height: 35
                });
            }
        } else {
            // RANDOM HELL
            obstacles.push({
                x: GAME_WIDTH,
                y: 300 - Math.random() * 50 - 10,
                width: 20 + Math.random() * 15,
                height: 45 + Math.random() * 60
            });
        }
        obstacleTimer = Math.max(5, spawnRate * 0.6); // EVEN FASTER
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            // EXPONENTIAL SPEED HELL
            gameSpeed += 0.025 + (score * 0.0003);
            gameSpeed = Math.min(gameSpeed, 12); // SPEED CAP (still insane)
            document.getElementById('score').textContent = score;
            
            // APOCALYPSE AFTER 50
            if (score > 50) apocalypseMode = true;
        }
    }

    // DEATH ON CONTACT
    for (let obs of obstacles) {
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            gameOver();
            return;
        }
    }

    // AUTO-KILL AFTER 100 (TRULY IMPOSSIBLE)
    if (score > 100) {
        gameOver();
        return;
    }

    groundOffset -= gameSpeed * 1.5;
    if (groundOffset < -50) groundOffset = 0;
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // BLOOD RED CLOUDS
    ctx.fillStyle = 'rgba(220, 50, 50, 0.6)';
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 160 - (score * 1.2) % 160, 70 + Math.sin(score * 0.02 + i) * 12, 25, 0, Math.PI * 2);
        ctx.arc(130 + i * 160 - (score * 1.2) % 160, 70 + Math.sin(score * 0.02 + i) * 12, 35, 0, Math.PI * 2);
        ctx.arc(160 + i * 160 - (score * 1.2) % 160, 70 + Math.sin(score * 0.02 + i) * 12, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    // CRACKED GROUND
    ctx.fillStyle = '#5D2E0A';
    ctx.fillRect(0, 330, GAME_WIDTH, 70);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 335, GAME_WIDTH, 60);

    // CHAOTIC GROUND PATTERN
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < GAME_WIDTH; i += 35) {
        ctx.fillRect(i + groundOffset, 345, 30, 15);
    }

    // DOOMED PLAYER - TERRIFIED
    ctx.fillStyle = '#1B5E20'; // DARK GREEN
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // PANIC FACE
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 6, player.y + 6, player.width - 12, 18);
    ctx.fillStyle = '#FFEB3B'; // YELLOW EYES OF FEAR
    ctx.fillRect(player.x + 10, player.y + 10, 6, 6);
    ctx.fillRect(player.x + 25, player.y + 10, 6, 6);
    ctx.fillStyle = '#8B0000'; // BLOOD MOUTH
    ctx.fillRect(player.x + 14, player.y + 25, 12, 4);
    
    // TEARS OF DESPAIR
    ctx.fillStyle = 'rgba(0,150,255,0.8)';
    ctx.fillRect(player.x + 4, player.y + 8, 3, 5);
    ctx.fillRect(player.x + player.width - 7, player.y + 8, 3, 5);

    // DEMONIC OBSTACLES
    ctx.fillStyle = '#8B0000';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(obs.x + 1, obs.y + 1, obs.width - 2, obs.height - 2);
        ctx.fillStyle = '#FF0000';
        // HELL SPIKES
        ctx.fillRect(obs.x + 4, obs.y, 6, 15);
        ctx.fillRect(obs.x + obs.width - 10, obs.y, 6, 15);
        if (obs.width > 25) {
            ctx.fillRect(obs.x + obs.width/2 - 3, obs.y, 6, 12);
        }
        // GLOW EFFECT
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 8;
        ctx.fillRect(obs.x + obs.width/2 - 2, obs.y + obs.height - 8, 4, 8);
    }
    ctx.shadowBlur = 0;

    // SPEED HELL BAR
    ctx.fillStyle = 'rgba(255,0,0,0.6)';
    ctx.fillRect(0, 0, Math.min(gameSpeed * 15, GAME_WIDTH), 25);

    // APOCALYPSE WARNING
    if (apocalypseMode) {
        ctx.fillStyle = 'rgba(255,0,0,0.9)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('APOCALYPSE MODE', GAME_WIDTH/2, 40);
    }

    // IMPOSSIBLE WARNING
    ctx.save();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255,0,0,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('IMPOSSIBLE MODE', 10, GAME_HEIGHT - 20);
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('impossibleHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    
    // TAUNT PLAYER
    if (score < 20) {
        document.querySelector('.game-over h2').textContent = '😂 TOO EASY FOR IMPOSSIBLE!';
    } else if (score < 50) {
        document.querySelector('.game-over h2').textContent = '💀 NOT BAD... FOR A HUMAN';
    } else {
        document.querySelector('.game-over h2').textContent = '🔥 LEGEND! (' + score + ' pts)';
    }
}

function restartGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 5.5;
    apocalypseMode = false;
    player.y = 300 - player.height;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    obstacleTimer = 0;
    groundOffset = 0;
    document.getElementById('score').textContent = score;
    document.querySelector('.game-over h2').textContent = 'Game Over!';
    document.getElementById('gameOver').style.display = 'none';
}

gameLoop();
