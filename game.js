// Game State
const gameState = {
    money: 50000,
    currentCar: {
        name: '1997 Honda Civic',
        engineType: '4-Cylinder',
        baseHP: 200,
        totalHP: 200,
        speed: 0,
        maxSpeed: 120,
        rpm: 0,
        maxRPM: 7000,
        upgrades: [],
        acceleration: 0.5
    },
    gameRunning: false,
    cameraX: 400,
    cameraY: 300
};

// Canvas and rendering
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Car drawing position
let carX = canvas.width / 2;
let carY = canvas.height / 2;
let carAngle = 0;
let carSpeed = 0;
let carRPM = 0;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Game loop
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    updateCarPhysics();
    renderGame();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

function updateCarPhysics() {
    const car = gameState.currentCar;
    const maxSpeed = car.maxSpeed;
    const acceleration = (car.totalHP / 200) * car.acceleration; // Scale with HP
    const friction = 0.98;
    const turnSpeed = 0.1;
    
    // Handle acceleration
    if (keys['w'] || keys['arrowup']) {
        carSpeed = Math.min(carSpeed + acceleration, maxSpeed);
        carRPM = Math.min(carRPM + 200, car.maxRPM);
    } else if (keys['s'] || keys['arrowdown']) {
        carSpeed = Math.max(carSpeed - acceleration * 0.7, -maxSpeed * 0.5);
        carRPM = Math.max(carRPM - 150, 0);
    } else {
        carSpeed *= friction;
        carRPM = Math.max(carRPM - 100, 0);
    }
    
    // Handle steering
    if ((keys['a'] || keys['arrowleft']) && Math.abs(carSpeed) > 0.5) {
        carAngle -= turnSpeed * (Math.abs(carSpeed) / maxSpeed);
    }
    if ((keys['d'] || keys['arrowright']) && Math.abs(carSpeed) > 0.5) {
        carAngle += turnSpeed * (Math.abs(carSpeed) / maxSpeed);
    }
    
    // Update position
    carX += Math.cos(carAngle) * carSpeed;
    carY += Math.sin(carAngle) * carSpeed;
    
    // Boundary checking
    carX = Math.max(50, Math.min(canvas.width - 50, carX));
    carY = Math.max(50, Math.min(canvas.height - 50, carY));
    
    // Update game state
    car.speed = Math.round(Math.abs(carSpeed));
    car.rpm = Math.round(carRPM);
}

function renderGame() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw trees
    drawTree(100, 100);
    drawTree(canvas.width - 100, 100);
    drawTree(100, canvas.height - 100);
    drawTree(canvas.width - 100, canvas.height - 100);
    
    // Draw car
    drawCar(carX, carY, carAngle);
    
    // Draw speed indicator
    drawSpeedometer();
}

function drawCar(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Car body
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-25, -12, 50, 24);
    
    // Windows
    ctx.fillStyle = '#4dd0e1';
    ctx.fillRect(-20, -8, 15, 8);
    ctx.fillRect(5, -8, 15, 8);
    
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-15, -13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Headlights
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-22, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-22, 6, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawTree(x, y) {
    // Trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 10, y, 20, 40);
    
    // Foliage
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, y - 15, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawSpeedometer() {
    const x = canvas.width - 120;
    const y = 50;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 40, y - 40, 80, 80);
    
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffd700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPEED', x, y - 20);
    ctx.fillText(Math.round(gameState.currentCar.speed) + ' mph', x, y);
    ctx.fillText('HP: ' + gameState.currentCar.totalHP, x, y + 20);
}

function updateHUD() {
    const car = gameState.currentCar;
    document.getElementById('speedDisplay').textContent = car.speed;
    document.getElementById('rpmDisplay').textContent = car.rpm;
    document.getElementById('hpDisplay').textContent = car.totalHP;
    document.getElementById('moneyDisplay').textContent = gameState.money.toLocaleString();
}

// UI Functions
function startGame() {
    gameState.gameRunning = true;
    switchScreen('gameScreen');
    gameLoop();
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showGameScreen() {
    switchScreen('gameScreen');
}

function mainMenu() {
    gameState.gameRunning = false;
    switchScreen('mainMenu');
}

function showTuneMenu() {
    gameState.gameRunning = false;
    switchScreen('tuneMenu');
}

function showEngineSwap() {
    gameState.gameRunning = false;
    switchScreen('engineSwapMenu');
}

function showGarage() {
    gameState.gameRunning = false;
    updateGarageDisplay();
    switchScreen('garageScreen');
}

function purchaseUpgrade(upgradeName, hpBoost, cost) {
    const car = gameState.currentCar;
    
    if (gameState.money < cost) {
        alert('Not enough money! You need $' + (cost - gameState.money));
        return;
    }
    
    // Check if already installed
    if (car.upgrades.includes(upgradeName)) {
        alert('Upgrade already installed!');
        return;
    }
    
    gameState.money -= cost;
    car.upgrades.push(upgradeName);
    car.totalHP += hpBoost;
    car.maxSpeed += hpBoost / 10; // Slight speed increase
    
    alert(`✓ ${upgradeName.toUpperCase()} installed! +${hpBoost} HP!`);
    updateGarageDisplay();
}

function swapEngine(engineType, baseHP, cost) {
    if (gameState.money < cost) {
        alert('Not enough money! You need $' + (cost - gameState.money));
        return;
    }
    
    const engineNames = {
        '4cyl': '4-Cylinder Stock Engine',
        '6cyl': '6-Cylinder Performance',
        'v8': 'V8 Beast',
        'v12tt': 'Twin-Turbo V12',
        'v16': 'Legendary V16'
    };
    
    gameState.money -= cost;
    gameState.currentCar.engineType = engineNames[engineType];
    gameState.currentCar.baseHP = baseHP;
    gameState.currentCar.totalHP = baseHP; // Reset to base
    gameState.currentCar.upgrades = []; // Clear upgrades
    gameState.currentCar.maxSpeed = 120 + (baseHP / 10);
    gameState.currentCar.maxRPM = 5000 + (baseHP / 50);
    
    alert(`✓ Engine swapped! New base power: ${baseHP} HP!`);
    updateGarageDisplay();
}

function updateGarageDisplay() {
    const car = gameState.currentCar;
    document.getElementById('carName').textContent = car.name;
    document.getElementById('engineType').textContent = car.engineType;
    document.getElementById('totalHP').textContent = car.totalHP;
    document.getElementById('topSpeed').textContent = Math.round(car.maxSpeed);
    
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';
    if (car.upgrades.length === 0) {
        upgradesList.innerHTML = '<li>None yet</li>';
    } else {
        car.upgrades.forEach(upgrade => {
            const li = document.createElement('li');
            li.textContent = '✓ ' + upgrade.toUpperCase();
            upgradesList.appendChild(li);
        });
    }
}

// Start with menu
switchScreen('mainMenu');