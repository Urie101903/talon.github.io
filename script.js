const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// RESPONSIVE CANVAS SIZING
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
    
    // Scale context for crisp rendering
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});
resizeCanvas();

// Game state - MEDIUM DIFFICULTY
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 3.2;

// Player - SCALED FOR MOBILE
const player = {
    x: 110,
    y: 300,
    width: 45,
    height: 60,
    vy: 0,
    gravity: 0.7,
    jumpPower: -17,
    grounded: false
};

let obstacles = [];
let obstacleTimer = 0;
let groundOffset = 0;

let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// MOBILE TOUCH - FULL SCREEN DETECTION
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

    if (player.y + player.height > 295) {
        player.y = 295 - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    obstacleTimer++;
    if (obstacleTimer > 100 - Math.min(score / 15, 40)) {
        if (Math.random() < 0.3) {
            // DOUBLE OBSTACLE
            obstacles.push({
                x: GAME_WIDTH,
                y: 300 - Math.random() * 25 - 20,
                width: 22,
                height: 25 + Math.random() * 25
            });
            obstacles.push({
                x: GAME_WIDTH + 35,
                y: 300 - Math.random() * 25 - 20,
                width: 22,
                height: 25 + Math.random() * 25
            });
        } else {
            obstacles.push({
                x: GAME_WIDTH,
                y: 300 - Math.random() * 35 - 20,
                width: 28 + Math.random() * 12,
                height: 28 + Math.random() * 35
            });
        }
        obstacleTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.007;
            document.getElementById('score').textContent = score;
        }
    }

    const buffer = 3;
    for (let obs of obstacles) {
        if (player.x + buffer < obs.x + obs.width &&
            player.x + player.width - buffer > obs.x &&
            player.y + buffer < obs.y + obs.height &&
            player.y + player.height - buffer > obs.y) {
            gameOver();
            return;
        }
    }

    groundOffset -= gameSpeed;
    if (groundOffset < -50) groundOffset = 0;
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 200 - (score * 0.4) % 200, 80 + Math.sin(i) * 20, 30, 0, Math.PI * 2);
        ctx.arc(130 + i * 200 - (score * 0.4) % 200, 80 + Math.sin(i) * 20, 40, 0, Math.PI * 2);
        ctx.arc(160 + i * 200 - (score * 0.4) % 200, 80 + Math.sin(i) * 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 330, GAME_WIDTH, 70);

    // Ground pattern
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < GAME_WIDTH; i += 50) {
        ctx.fillRect(i + groundOffset, 340, 40, 20);
    }

    // Player
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player details
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 8, player.y + 8, player.width - 16, 22);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 12, player.y + 12, 8, 8);
    ctx.fillRect(player.x + 30, player.y + 12, 8, 8);
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(player.x + 18, player.y + 28, 14, 6);

    // Obstacles
    ctx.fillStyle = '#F44336';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(obs.x + 3, obs.y + 3, obs.width - 6, obs.height - 6);
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(obs.x + 8, obs.y, 4, 10);
        ctx.fillRect(obs.x + obs.width - 12, obs.y, 4, 10);
    }

    // Instructions (scaled)
    ctx.save();
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText('SPACEBAR or TAP to Jump!', 10, 25);
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
    gameSpeed = 3.2;
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
