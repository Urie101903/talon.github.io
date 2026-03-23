const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state - MEDIUM DIFFICULTY
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 3.2; // MEDIUM START (Easy:2.5, Hard:3.5)

// Player - BALANCED
const player = {
    x: 110, // SLIGHTLY CLOSER
    y: 300,
    width: 45, // SLIGHTLY SMALLER
    height: 60,
    vy: 0,
    gravity: 0.7, // MEDIUM GRAVITY (Easy:0.6, Hard:0.85)
    jumpPower: -17, // MEDIUM JUMP (Easy:-18, Hard:-15)
    grounded: false
};

// Obstacles - MEDIUM FREQUENCY & SIZE
let obstacles = [];
let obstacleTimer = 0;
let groundOffset = 0;

// Input handling
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

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

document.getElementById('highScore').textContent = highScore;

function update() {
    if (!gameRunning) return;

    // Player physics
    if (keys['Space'] && player.grounded) {
        jump();
    }

    player.vy += player.gravity;
    player.y += player.vy;

    // Ground collision
    if (player.y + player.height > 295) { // MEDIUM FORGIVING
        player.y = 295 - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    // Generate obstacles - MEDIUM SPAWNING RATE
    obstacleTimer++;
    if (obstacleTimer > 100 - Math.min(score / 15, 40)) { // MEDIUM RATE
        // 50% regular obstacle, 50% double obstacle
        if (Math.random() < 0.3) {
            // DOUBLE OBSTACLE (new challenge!)
            obstacles.push({
                x: canvas.width,
                y: 300 - Math.random() * 25 - 20,
                width: 22,
                height: 25 + Math.random() * 25
            });
            obstacles.push({
                x: canvas.width + 35,
                y: 300 - Math.random() * 25 - 20,
                width: 22,
                height: 25 + Math.random() * 25
            });
        } else {
            // Regular obstacle
            obstacles.push({
                x: canvas.width,
                y: 300 - Math.random() * 35 - 20,
                width: 28 + Math.random() * 12,
                height: 28 + Math.random() * 35
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
            gameSpeed += 0.007; // MEDIUM SPEED INCREASE
            document.getElementById('score').textContent = score;
        }
    }

    // Collision detection - MEDIUM TIGHTNESS
    for (let obs of obstacles) {
        const buffer = 3; // MEDIUM BUFFER (Easy:5, Hard:0)
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillRect(0, 330, canvas.width, 70);

    // Ground pattern
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.fillRect(i + groundOffset, 340, 40, 20);
    }

    // Player
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player details - HAPPY FACE
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 8, player.y + 8, player.width - 16, 22);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 12, player.y + 12, 8, 8);
    ctx.fillRect(player.x + 30, player.y + 12, 8, 8);
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(player.x + 18, player.y + 28, 14, 6);

    // Obstacles - SPIKY & SCARY
    ctx.fillStyle = '#F44336';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(obs.x + 3, obs.y + 3, obs.width - 6, obs.height - 6);
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(obs.x + 8, obs.y, 4, 10); // spike
        ctx.fillRect(obs.x + obs.width - 12, obs.y, 4, 10); // spike
    }

    // Instructions
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
    gameSpeed = 3.2; // RESET TO MEDIUM
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
