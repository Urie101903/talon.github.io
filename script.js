const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state - MADE EASIER
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 2.5; // SLOWER START

// Player - BIGGER & BETTER JUMP
const player = {
    x: 120, // FURTHER FROM EDGE
    y: 300,
    width: 50, // BIGGER HITBOX
    height: 60,
    vy: 0,
    gravity: 0.3, // GENTLER GRAVITY
    jumpPower: -14, // STRONGER JUMP
    grounded: false
};

// Obstacles - LESS FREQUENT & SMALLER
let obstacles = [];
let obstacleTimer = 0;

// Ground decoration
let groundOffset = 0;

// Input - KEYBOARD + MOUSE + TOUCH
let keys = {};

// Keyboard
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Mouse & Touch
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

function jump() {
    if (player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }
}

// Update high score display
document.getElementById('highScore').textContent = highScore;

function update() {
    if (!gameRunning) return;

    // Player physics - MORE FORGIVING
    if (keys['Space'] && player.grounded) {
        jump();
    }

    player.vy += player.gravity;
    player.y += player.vy;

    // Ground collision - THICKER GROUND COLLISION
    if (player.y + player.height > 290) { // EXTRA FORGIVING
        player.y = 290 - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // Generate obstacles - MUCH SLOWER SPAWNING
    obstacleTimer++;
    if (obstacleTimer > 120 - Math.min(score / 20, 30)) { // SLOWER & LESS ACCELERATION
        obstacles.push({
            x: canvas.width,
            y: 300 - Math.random() * 30 - 25, // SMALLER VARIATION
            width: 25 + Math.random() * 15, // SMALLER
            height: 25 + Math.random() * 30 // SHORTER
        });
        obstacleTimer = 0;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.005; // MUCH SLOWER SPEED INCREASE
            document.getElementById('score').textContent = score;
        }
    }

    // Collision detection - MORE FORGIVING
    for (let obs of obstacles) {
        // Add buffer zone around player for easier collision avoidance
        const buffer = 5;
        if (player.x + buffer < obs.x + obs.width &&
            player.x + player.width - buffer > obs.x &&
            player.y + buffer < obs.y + obs.height &&
            player.y + player.height - buffer > obs.y) {
            gameOver();
            return;
        }
    }

    // Ground animation
    groundOffset -= gameSpeed;
    if (groundOffset < -50) groundOffset = 0;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clouds (moving background) - SLOWER
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 200 - (score * 0.3) % 200, 80 + Math.sin(i) * 20, 30, 0, Math.PI * 2);
        ctx.arc(130 + i * 200 - (score * 0.3) % 200, 80 + Math.sin(i) * 20, 40, 0, Math.PI * 2);
        ctx.arc(160 + i * 200 - (score * 0.3) % 200, 80 + Math.sin(i) * 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw ground - THICKER
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 330, canvas.width, 70); // THICKER GROUND

    // Draw ground pattern
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.fillRect(i + groundOffset, 340, 40, 20);
    }

    // Draw player - CUTER & MORE VISIBLE
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player details - HAPPY FACE
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 8, player.y + 8, player.width - 16, 22); // head
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 12, player.y + 12, 8, 8); // eye 1
    ctx.fillRect(player.x + 30, player.y + 12, 8, 8); // eye 2
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(player.x + 18, player.y + 28, 14, 6); // smile

    // Draw obstacles - MORE VISIBLE
    ctx.fillStyle = '#F44336';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Obstacle details - SPIKY LOOK
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(obs.x + 3, obs.y + 3, obs.width - 6, obs.height - 6);
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(obs.x + 8, obs.y, 4, 8); // spike
        ctx.fillRect(obs.x + obs.width - 12, obs.y, 4, 8); // spike
    }

    // Draw instructions
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('SPACEBAR or CLICK/TAP to Jump!', 10, 25);
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
    gameSpeed = 2.5; // RESET TO EASY SPEED
    player.y = 300 - player.height;
    player.vy = 0;
    player.grounded = true;
    obstacles = [];
    obstacleTimer = 0;
    groundOffset = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').style.display = 'none';
}

// Start the game
gameLoop();
