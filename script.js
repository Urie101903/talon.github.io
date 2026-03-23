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

// 🔥 HARD MODE - EXTREME SETTINGS
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 3.8; // FAST START

// Player - SMALLER & FASTER FALL
const player = {
    x: 100, // CLOSER TO EDGE
    y: 300,
    width: 40, // SMALLER TARGET
    height: 55, // SHORTER
    vy: 0,
    gravity: 0.9, // HEAVY GRAVITY
    jumpPower: -15, // WEAKER JUMP
    grounded: false
};

let obstacles = [];
let obstacleTimer = 0;
let groundOffset = 0;
let doubleJumpChance = 0.5; // 50% DOUBLE OBSTACLES
let tripleJumpChance = 0.2; // 20% TRIPLE JUMPS

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

    // TIGHTER GROUND COLLISION
    if (player.y + player.height > 302) {
        player.y = 302 - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // FASTER OBSTACLE SPAWNING
    obstacleTimer++;
    const spawnRate = 75 - Math.min(score / 12, 45);
    if (obstacleTimer > spawnRate) {
        
        // INCREASED DIFFICULTY PATTERNS
        const rand = Math.random();
        if (rand < tripleJumpChance) {
            // TRIPLE OBSTACLE - INSANE!
            obstacles.push({ x: GAME_WIDTH, y: 300 - 15 - 20, width: 20, height: 35 });
            obstacles.push({ x: GAME_WIDTH + 28, y: 300 - 15 - 20, width: 20, height: 35 });
            obstacles.push({ x: GAME_WIDTH + 56, y: 300 - 15 - 20, width: 20, height: 35 });
        } else if (rand < doubleJumpChance) {
            // DOUBLE OBSTACLE
            obstacles.push({ x: GAME_WIDTH, y: 300 - Math.random() * 20 - 25, width: 24, height: 30 + Math.random() * 30 });
            obstacles.push({ x: GAME_WIDTH + 32, y: 300 - Math.random() * 20 - 25, width: 24, height: 30 + Math.random() * 30 });
        } else {
            // FAST/SKINNY obstacles
            obstacles.push({
                x: GAME_WIDTH,
                y: 300 - Math.random() * 40 - 15,
                width: 22 + Math.random() * 18, // NARROWER
                height: 35 + Math.random() * 45 // TALLER
            });
        }
        obstacleTimer = 0;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            // ACCELERATING SPEED CURVE
            gameSpeed += 0.012 + (score * 0.0001);
            doubleJumpChance = Math.min(0.65, 0.4 + score * 0.0008);
            tripleJumpChance = Math.min(0.35, 0.15 + score * 0.0005);
            document.getElementById('score').textContent = score;
        }
    }

    // PRECISE COLLISION - NO BUFFER
    for (let obs of obstacles) {
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            gameOver();
            return;
        }
    }

    groundOffset -= gameSpeed;
    if (groundOffset < -50) groundOffset = 0;
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // FASTER CLOUDS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 200 - (score * 0.6) % 200, 80 + Math.sin(score * 0.01 + i) * 15, 28, 0, Math.PI * 2);
        ctx.arc(130 + i * 200 - (score * 0.6) % 200, 80 + Math.sin(score * 0.01 + i) * 15, 38, 0, Math.PI * 2);
        ctx.arc(160 + i * 200 - (score * 0.6) % 200, 80 + Math.sin(score * 0.01 + i) * 15, 28, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 330, GAME_WIDTH, 70);

    // Ground pattern - FASTER
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < GAME_WIDTH; i += 45) {
        ctx.fillRect(i + groundOffset, 340, 38, 18);
    }

    // Player - TENSE EXPRESSION
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player details - SWEATY & FOCUSED
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 7, player.y + 7, player.width - 14, 20);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 11, player.y + 11, 7, 7); // eye 1 - SMALLER
    ctx.fillRect(player.x + 27, player.y + 11, 7, 7); // eye 2
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(player.x + 16, player.y + 27, 13, 5); // tense mouth
    // SWEAT DROPS
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(player.x + 5, player.y + 5, 3, 6);
    ctx.fillRect(player.x + player.width - 8, player.y + 5, 3, 6);

    // Obstacles - MENACING
    ctx.fillStyle = '#D32F2F';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
        ctx.fillStyle = '#7F0000';
        // MULTIPLE SPIKES
        ctx.fillRect(obs.x + 6, obs.y, 5, 12);
        ctx.fillRect(obs.x + obs.width - 11, obs.y, 5, 12);
        if (obs.width > 30) {
            ctx.fillRect(obs.x + obs.width/2 - 2, obs.y, 4, 10);
        }
    }

    // SPEED INDICATOR
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(0, 0, gameSpeed * 20, 20);

    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText('HARD MODE - TAP to Jump!', 10, 22);
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
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 3.8;
    doubleJumpChance = 0.5;
    tripleJumpChance = 0.2;
    player.y = 300 - player.height;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    obstacleTimer = 0;
    groundOffset = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').style.display = 'none';
}

gameLoop();
